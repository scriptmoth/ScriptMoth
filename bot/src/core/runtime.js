// moth core: runtime. Wires loaded modules to a discord.js client:
// slash commands, autocomplete, buttons/selects/modals, gateway events, and scheduled ticks.
// Also enforces per-server on/off switches (set with /moth enable|disable).

const { Events, MessageFlags } = require('discord.js');
const ui = require('./ui');

const SETTINGS_SCOPE = 'moth';
const ALWAYS_ON = new Set(['moth']);

function createRuntime({ client, modules, store, log = console }) {
  const settings = store.scope(SETTINGS_SCOPE);
  const commandOwners = new Map(); // command name -> { mod, command }
  for (const mod of modules.values()) {
    for (const command of mod.commands ?? []) commandOwners.set(command.data.name, { mod, command });
  }

  async function disabledModules(guildId) {
    if (!guildId) return [];
    return settings.get(guildId, 'disabled', []);
  }

  async function isEnabled(guildId, moduleId) {
    if (ALWAYS_ON.has(moduleId) || !guildId) return true;
    return !(await disabledModules(guildId)).includes(moduleId);
  }

  async function setEnabled(guildId, moduleId, enabled) {
    if (ALWAYS_ON.has(moduleId)) return;
    await settings.update(
      guildId,
      'disabled',
      (list) => (enabled ? list.filter((id) => id !== moduleId) : [...new Set([...list, moduleId])]),
      [],
    );
  }

  const contexts = new Map();
  function contextFor(mod) {
    if (!contexts.has(mod.id)) {
      contexts.set(mod.id, {
        client,
        module: mod,
        modules,
        store: store.scope(mod.id),
        ui,
        log: {
          info: (...a) => log.log(`[${mod.id}]`, ...a),
          error: (...a) => log.error(`[${mod.id}]`, ...a),
        },
        runtime: api,
        /** Access another module's public api (declared as `api: (ctx) => ({...})` in its manifest). */
        use(id) {
          const other = modules.get(id);
          if (!other?.api) throw new Error(`${mod.id} tried to use "${id}", which is not installed or has no api`);
          return other.api(contextFor(other));
        },
      });
    }
    return contexts.get(mod.id);
  }

  // Preserve the existing artwork on component edits and attach missing files to older messages.
  function prepareInteraction(interaction) {
    if (interaction.mothArtwork) return;
    interaction.mothArtwork = true;
    for (const method of ['reply', 'followUp', 'editReply', 'update']) {
      if (typeof interaction[method] !== 'function') continue;
      const original = interaction[method].bind(interaction);
      interaction[method] = async (payload) => {
        let message;
        if (method === 'update') message = interaction.message;
        if (method === 'editReply' && payload?.embeds && interaction.fetchReply) {
          message = await interaction.fetchReply();
        }
        const existing = [...(message?.attachments?.values() ?? [])];
        return original(await ui.withArtwork(payload, existing));
      };
    }
  }

  async function guard(interaction, mod, fn) {
    prepareInteraction(interaction);
    if (!(await isEnabled(interaction.guildId, mod.id))) {
      if (interaction.isAutocomplete()) return interaction.respond([]);
      return ui.ephemeral(interaction, {
        embeds: [ui.warn(`**${mod.name}** is turned off in this server. An admin can turn it on with \`/moth enable\`.`)],
      });
    }
    try {
      await fn();
    } catch (error) {
      log.error(`[${mod.id}] interaction failed:`, error);
      if (interaction.isAutocomplete()) return;
      const payload = { embeds: [ui.fail('This command failed. If it keeps happening, use `/feedback send` to tell staff what you tried.')] };
      try {
        await ui.ephemeral(interaction, payload);
      } catch {
        // The interaction may have expired; nothing else to do.
      }
    }
  }

  async function onInteraction(interaction) {
    if (interaction.isChatInputCommand() || interaction.isAutocomplete() || interaction.isMessageContextMenuCommand?.()) {
      const owner = commandOwners.get(interaction.commandName);
      if (!owner) return;
      const ctx = contextFor(owner.mod);
      return guard(interaction, owner.mod, () =>
        interaction.isAutocomplete()
          ? owner.command.autocomplete?.(interaction, ctx) ?? interaction.respond([])
          : owner.command.execute(interaction, ctx),
      );
    }

    if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
      const [moduleId, action, ...args] = interaction.customId.split(':');
      const mod = modules.get(moduleId);
      const handler = mod?.components?.[action];
      if (!handler) return;
      return guard(interaction, mod, () => handler(interaction, contextFor(mod), args));
    }
  }

  function attach() {
    client.on(Events.InteractionCreate, onInteraction);

    for (const mod of modules.values()) {
      for (const [event, handler] of Object.entries(mod.events ?? {})) {
        client.on(event, async (...args) => {
          const guildId = args[0]?.guildId ?? args[0]?.guild?.id;
          if (guildId && !(await isEnabled(guildId, mod.id))) return;
          try {
            await handler(contextFor(mod), ...args);
          } catch (error) {
            log.error(`[${mod.id}] ${event} handler failed:`, error);
          }
        });
      }
    }

    client.once(Events.ClientReady, async () => {
      for (const mod of modules.values()) {
        try {
          await mod.setup?.(contextFor(mod));
        } catch (error) {
          log.error(`[${mod.id}] setup failed:`, error);
        }
        if (mod.tick) startTick(mod);
      }
    });
  }

  const timers = [];
  function startTick(mod) {
    let running = false;
    const run = async () => {
      if (running) return;
      running = true;
      try {
        await mod.tick.run(contextFor(mod));
      } catch (error) {
        log.error(`[${mod.id}] scheduled job failed:`, error);
      } finally {
        running = false;
      }
    };
    timers.push(setInterval(run, mod.tick.everyMs));
    if (mod.tick.runOnStart !== false) setTimeout(run, 5_000);
  }

  function stop() {
    for (const t of timers) clearInterval(t);
  }

  const api = { attach, stop, isEnabled, setEnabled, disabledModules, onInteraction, contextFor, ephemeralFlag: MessageFlags.Ephemeral };
  return api;
}

module.exports = { createRuntime, ALWAYS_ON };
