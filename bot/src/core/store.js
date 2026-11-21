// moth core: storage.
//
// Every module gets its own scoped store (`ctx.store`) holding per-guild key/value data.
// This default implementation keeps one JSON file per module in DATA_DIR. To move a module
// into a bot that uses MongoDB (or anything else), write an adapter with the same five
// methods: get, set, update, delete, all. Modules never touch files or databases directly.

const fs = require('node:fs');
const path = require('node:path');

const FLUSH_DELAY_MS = 250;

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
    const entry = { file, data, timer: null };
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
    const guild = (guildId) => (entry.data[guildId] ??= {});
    const clone = (value) => (value === undefined ? undefined : structuredClone(value));

    return {
      async get(guildId, key, fallback) {
        const value = entry.data[guildId]?.[key];
        return value === undefined ? fallback : clone(value);
      },
      async set(guildId, key, value) {
        guild(guildId)[key] = clone(value);
        schedule(entry);
        return value;
      },
      async update(guildId, key, fn, fallback) {
        const current = await this.get(guildId, key, fallback);
        const next = await fn(current);
        return this.set(guildId, key, next);
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
    };
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
  return {
    scope(moduleId) {
      const mod = (data[moduleId] ??= {});
      return {
        async get(g, k, fallback) {
          const v = mod[g]?.[k];
          return v === undefined ? fallback : structuredClone(v);
        },
        async set(g, k, v) {
          (mod[g] ??= {})[k] = structuredClone(v);
          return v;
        },
        async update(g, k, fn, fallback) {
          return this.set(g, k, await fn(await this.get(g, k, fallback)));
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
      };
    },
    flush() {},
  };
}

module.exports = { createJsonStore, createMemoryStore };
