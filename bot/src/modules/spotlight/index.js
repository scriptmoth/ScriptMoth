// Character of the week: features a random character on a schedule, avoiding recent repeats.

const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const DAY_MS = 86_400_000;
const HISTORY = 20;

/** Pick a character that hasn't been featured recently; falls back to anyone. */
function pickFresh(characters, recentIds, random = Math.random) {
  const recent = new Set(recentIds);
  const fresh = characters.filter((c) => !recent.has(c.id));
  const pool = fresh.length ? fresh : characters;
  return pool.length ? pool[Math.floor(random() * pool.length)] : null;
}

async function feature(ctx, guildId) {
  const config = await ctx.store.get(guildId, 'settings', { channelId: null, days: 7 });
  if (!config.channelId) return { error: 'Set a channel first with `/spotlight setup`.' };
  const characters = ctx.use('characters');
  const history = await ctx.store.get(guildId, 'history', []);
  const chosen = pickFresh(await characters.all(guildId), history.map((h) => h.characterId));
  if (!chosen) return { error: 'There are no characters to feature yet.' };

  const channel = await ctx.client.channels.fetch(config.channelId).catch(() => null);
  if (!channel?.isTextBased()) return { error: 'I can\'t post in the spotlight channel anymore.' };
  await channel.send(await ctx.ui.withArtwork({
    content: `🌙 **Character Spotlight**: this ${config.days === 7 ? 'week' : 'round'}'s featured character is **${chosen.name}**, by <@${chosen.ownerId}>!`,
    embeds: [characters.card(chosen, { footer: 'Character spotlight' })],
    allowedMentions: { users: [chosen.ownerId] },
  }));
  await ctx.store.set(guildId, 'history', [{ characterId: chosen.id, at: Date.now() }, ...history].slice(0, HISTORY));
  return { chosen };
}

module.exports = {
  id: 'spotlight',
  name: 'Character Spotlight',
  tier: 'L2',
  category: 'characters',
  description: 'Automatically features a "character of the week" without repeating recent picks.',
  requires: ['characters'],

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName('spotlight')
        .setDescription('Character of the week')
        .addSubcommand((s) => s.setName('current').setDescription('Who is in the spotlight right now'))
        .addSubcommand((s) => s.setName('now').setDescription('Feature a new character right away (Manage Server)'))
        .addSubcommand((s) =>
          s
            .setName('setup')
            .setDescription('Spotlight settings (Manage Server)')
            .addChannelOption((o) => o.setName('channel').setDescription('Where to post').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
            .addIntegerOption((o) => o.setName('days').setDescription('Days between spotlights (default 7)').setMinValue(1).setMaxValue(60)),
        ),

      async execute(interaction, ctx) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (sub === 'current') {
          const [latest] = await ctx.store.get(guildId, 'history', []);
          const character = latest && (await ctx.use('characters').get(guildId, latest.characterId));
          if (!character) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.empty('Nobody is in the spotlight yet.')] });
          return interaction.reply({
            embeds: [ctx.use('characters').card(character, { footer: `In the spotlight since ${new Date(latest.at).toDateString()}` })],
            allowedMentions: { parse: [] },
          });
        }

        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
          return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('You need **Manage Server** for that.')] });
        }

        if (sub === 'setup') {
          const channel = interaction.options.getChannel('channel');
          const days = interaction.options.getInteger('days');
          const next = await ctx.store.update(
            guildId,
            'settings',
            (s) => ({ ...s, ...(channel && { channelId: channel.id }), ...(days && { days }) }),
            { channelId: null, days: 7 },
          );
          return ctx.ui.ephemeral(interaction, {
            embeds: [ctx.ui.ok(`Spotlighting a character every **${next.days} day${next.days === 1 ? '' : 's'}** in ${next.channelId ? `<#${next.channelId}>` : '*no channel yet*'}.`)],
          });
        }

        await interaction.deferReply({ flags: ctx.runtime.ephemeralFlag });
        const result = await feature(ctx, guildId);
        return interaction.editReply({ embeds: [result.error ? ctx.ui.fail(result.error) : ctx.ui.ok(`Featured **${result.chosen.name}**.`)] });
      },
    },
  ],

  tick: {
    everyMs: 60 * 60 * 1000,
    async run(ctx) {
      for (const guildId of await ctx.store.guilds()) {
        if (!ctx.client.guilds.cache.has(guildId) || !(await ctx.runtime.isEnabled(guildId, 'spotlight'))) continue;
        const config = await ctx.store.get(guildId, 'settings', { channelId: null, days: 7 });
        if (!config.channelId) continue;
        const [latest] = await ctx.store.get(guildId, 'history', []);
        if (latest && Date.now() - latest.at < config.days * DAY_MS) continue;
        const result = await feature(ctx, guildId);
        if (result.error) ctx.log.info(`guild ${guildId}: ${result.error}`);
      }
    },
  },

  pickFresh,
};
