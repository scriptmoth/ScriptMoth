// moth core: storage.
//
// Every module gets its own scoped store (`ctx.store`) holding per-guild key/value data.
// This default implementation keeps one JSON file per module in DATA_DIR. To move a module
// into a bot that uses MongoDB (or anything else), write an adapter with the same five
// methods: get, set, update, delete, all. Modules never touch files or databases directly.

const fs = require('node:fs');
const path = require('node:path');

const FLUSH_DELAY_MS = 250;

function withUpdates(store) {
  const pending = new Map();
  return {
    ...store,
    async update(guildId, key, fn, fallback) {
      const id = JSON.stringify([guildId, key]);
      const next = (pending.get(id) ?? Promise.resolve()).catch(() => {}).then(async () =>
        store.set(guildId, key, await fn(await store.get(guildId, key, fallback))));
      pending.set(id, next);
      try {
        return await next;
      } finally {
        if (pending.get(id) === next) pending.delete(id);
      }
    },
  };
}

function createJsonStore(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const files = new Map(); // moduleId -> { data, timer }

  function load(moduleId) {
    if (files.has(moduleId)) return files.get(moduleId);
    const file = path.join(dir, `${moduleId}.json`);
    let data = {};
    try {
      data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') console.error(`[store] could not read ${file}:`, error.message);
    }
    const entry = { file, data, timer: null, scoped: null };
    files.set(moduleId, entry);
    return entry;
  }

  function write(entry) {
    const tmp = `${entry.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(entry.data, null, 2));
    fs.renameSync(tmp, entry.file);
  }

  function schedule(entry) {
    if (entry.timer) return;
    entry.timer = setTimeout(() => {
      entry.timer = null;
      try {
        write(entry);
      } catch (error) {
        console.error(`[store] could not write ${entry.file}:`, error.message);
      }
    }, FLUSH_DELAY_MS);
  }

  function scope(moduleId) {
    const entry = load(moduleId);
    if (entry.scoped) return entry.scoped;
    const guild = (guildId) => (entry.data[guildId] ??= {});
    const clone = (value) => (value === undefined ? undefined : structuredClone(value));

    entry.scoped = withUpdates({
      async get(guildId, key, fallback) {
        const value = entry.data[guildId]?.[key];
        return value === undefined ? fallback : clone(value);
      },
      async set(guildId, key, value) {
        guild(guildId)[key] = clone(value);
        schedule(entry);
        return value;
      },
      async delete(guildId, key) {
        if (entry.data[guildId]) delete entry.data[guildId][key];
        schedule(entry);
      },
      async all(guildId) {
        return clone(entry.data[guildId] ?? {});
      },
      async guilds() {
        return Object.keys(entry.data);
      },
    });
    return entry.scoped;
  }

  function flush() {
    for (const entry of files.values()) {
      if (!entry.timer) continue;
      clearTimeout(entry.timer);
      entry.timer = null;
      write(entry);
    }
  }

  return { scope, flush };
}

// In-memory store with the same interface, used by tests.
function createMemoryStore() {
  const data = {};
  const scopes = new Map();
  return {
    scope(moduleId) {
      if (scopes.has(moduleId)) return scopes.get(moduleId);
      const mod = (data[moduleId] ??= {});
      const scoped = withUpdates({
        async get(g, k, fallback) {
          const v = mod[g]?.[k];
          return v === undefined ? fallback : structuredClone(v);
        },
        async set(g, k, v) {
          (mod[g] ??= {})[k] = structuredClone(v);
          return v;
        },
        async delete(g, k) {
          if (mod[g]) delete mod[g][k];
        },
        async all(g) {
          return structuredClone(mod[g] ?? {});
        },
        async guilds() {
          return Object.keys(mod);
        },
      });
      scopes.set(moduleId, scoped);
      return scoped;
    },
    flush() {},
  };
}

module.exports = { createJsonStore, createMemoryStore };
