// Character birthdays: set birthdays on characters, view a calendar, and get daily announcements.

const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { MONTHS, isValidTimeZone, localNow, isValidDate, isBirthdayOn, formatDate, daysUntil } = require('./dates');

const DEFAULT_TZ = process.env.MOTH_TIMEZONE || 'UTC';
const DEFAULT_HOUR = 9;
const CAKES = ['🎂', '🧁', '🎉', '🎈', '🍰'];

async function settings(ctx, guildId) {
  return ctx.store.get(guildId, 'settings', { channelId: null, timeZone: DEFAULT_TZ, hour: DEFAULT_HOUR });
}

async function withBirthdays(ctx, guildId) {
  const characters = await ctx.use('characters').all(guildId);
  const birthdays = await ctx.store.get(guildId, 'birthdays', {});
  return characters.filter((c) => birthdays[c.id]).map((c) => ({ character: c, birthday: birthdays[c.id] }));
}

async function announce(ctx, guildId, { force = false } = {}) {
  const config = await settings(ctx, guildId);
  if (!config.channelId) return 'no-channel';
  const now = localNow(config.timeZone);
  if (!force && now.hour < config.hour) return 'too-early';
  const last = await ctx.store.get(guildId, 'lastAnnounced', null);
  if (!force && last === now.key) return 'done';

  const today = (await withBirthdays(ctx, guildId)).filter((e) => isBirthdayOn(e.birthday, now));
  await ctx.store.set(guildId, 'lastAnnounced', now.key);
  if (!today.length) return 'none';

  const channel = await ctx.client.channels.fetch(config.channelId).catch(() => null);
  if (!channel?.isTextBased()) return 'no-channel';
  const characters = ctx.use('characters');
  await channel.send(ctx.ui.withDivider({
    content: `${ctx.ui.pick(CAKES)} **Happy birthday** to ${today.map((e) => `**${e.character.name}**`).join(', ')}!`,
    embeds: today.slice(0, 10).map((e) => characters.card(e.character, { footer: `Birthday: ${formatDate(e.birthday)}` })),
    allowedMentions: { parse: [] },
  }));
  return 'sent';
}

module.exports = {
  id: 'character-birthdays',
  name: 'Character Birthdays',
  tier: 'L2',
  category: 'characters',
  description: 'Character birthday calendar with automatic daily announcements.',
  details: 'Set a birthday on any character, browse the calendar by month, and choose an announcement channel, time zone, and hour.',
  requires: ['characters'],

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName('charbday')
        .setDescription('Character birthdays')
        .addSubcommand((s) =>
          s
            .setName('set')
            .setDescription('Set a character\'s birthday')
            .addStringOption((o) => o.setName('character').setDescription('Character').setRequired(true).setAutocomplete(true))
            .addIntegerOption((o) => o.setName('month').setDescription('Month').setRequired(true).addChoices(...MONTHS.map((name, i) => ({ name, value: i + 1 }))))
            .addIntegerOption((o) => o.setName('day').setDescription('Day').setRequired(true).setMinValue(1).setMaxValue(31)),
        )
        .addSubcommand((s) =>
          s.setName('clear').setDescription('Remove a character\'s birthday').addStringOption((o) => o.setName('character').setDescription('Character').setRequired(true).setAutocomplete(true)),
        )
        .addSubcommand((s) =>
          s
            .setName('calendar')
            .setDescription('Birthdays by month')
            .addIntegerOption((o) => o.setName('month').setDescription('Month (default: this month)').addChoices(...MONTHS.map((name, i) => ({ name, value: i + 1 })))),
        )
        .addSubcommand((s) => s.setName('upcoming').setDescription('The next birthdays coming up'))
        .addSubcommand((s) =>
          s
            .setName('setup')
            .setDescription('Announcement settings (Manage Server)')
            .addChannelOption((o) => o.setName('channel').setDescription('Where to announce').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
            .addStringOption((o) => o.setName('timezone').setDescription('IANA time zone, e.g. America/New_York'))
            .addIntegerOption((o) => o.setName('hour').setDescription('Hour to announce (0-23)').setMinValue(0).setMaxValue(23)),
        ),

      async execute(interaction, ctx) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        const config = await settings(ctx, guildId);

        if (sub === 'setup') {
          if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
            return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('You need **Manage Server** to change birthday settings.')] });
          }
          const channel = interaction.options.getChannel('channel');
          const timeZone = interaction.options.getString('timezone');
          const hour = interaction.options.getInteger('hour');
          if (timeZone && !isValidTimeZone(timeZone)) {
            return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail(`\`${timeZone}\` isn't a time zone I know. Try one like \`Europe/London\`.`)] });
          }
          const next = { ...config, ...(channel && { channelId: channel.id }), ...(timeZone && { timeZone }), ...(hour !== null && { hour }) };
          await ctx.store.set(guildId, 'settings', next);
          return ctx.ui.ephemeral(interaction, {
            embeds: [
              ctx.ui.ok(
                `Announcing in ${next.channelId ? `<#${next.channelId}>` : '*no channel yet*'} at **${String(next.hour).padStart(2, '0')}:00** (${next.timeZone}).`,
                'Birthday settings saved',
              ),
            ],
          });
        }

        if (sub === 'calendar' || sub === 'upcoming') {
          const today = localNow(config.timeZone);
          const entries = await withBirthdays(ctx, guildId);
          if (sub === 'calendar') {
            const month = interaction.options.getInteger('month') ?? today.month;
            const lines = entries
              .filter((e) => e.birthday.month === month)
              .sort((a, b) => a.birthday.day - b.birthday.day)
              .map((e) => `\`${String(e.birthday.day).padStart(2, ' ')}\` **${e.character.name}** · <@${e.character.ownerId}>`);
            return interaction.reply({
              embeds: [ctx.ui.embed({ title: `🎂 ${MONTHS[month - 1]} birthdays`, description: ctx.ui.truncate(lines.join('\n') || 'No birthdays this month.', 4000) })],
              allowedMentions: { parse: [] },
            });
          }
          const lines = entries
            .map((e) => ({ ...e, days: daysUntil(e.birthday, today) }))
            .sort((a, b) => a.days - b.days)
            .slice(0, 10)
            .map((e) => `**${e.character.name}**, ${formatDate(e.birthday)} · ${e.days === 0 ? '**today!**' : e.days === 1 ? 'tomorrow' : `in ${e.days} days`}`);
          return interaction.reply({ embeds: [ctx.ui.embed({ title: '🎈 Upcoming birthdays', description: lines.join('\n') || 'No birthdays set yet.' })] });
        }

        const characterId = interaction.options.getString('character');
        const character = await ctx.use('characters').get(guildId, characterId);
        if (!character) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('I couldn\'t find that character.')] });
        const mayEdit = character.ownerId === interaction.user.id || interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);
        if (!mayEdit) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('That character belongs to someone else.')] });

        if (sub === 'clear') {
          await ctx.store.update(guildId, 'birthdays', (b) => { delete b[characterId]; return b; }, {});
          return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.ok(`Removed **${character.name}**'s birthday.`)] });
        }

        const month = interaction.options.getInteger('month');
        const day = interaction.options.getInteger('day');
        if (!isValidDate(month, day)) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail(`${MONTHS[month - 1]} doesn't have a day ${day}.`)] });
        await ctx.store.update(guildId, 'birthdays', (b) => ({ ...b, [characterId]: { month, day } }), {});
        return interaction.reply({ embeds: [ctx.ui.ok(`**${character.name}**'s birthday is now **${formatDate({ month, day })}**. 🎂`)] });
      },

      async autocomplete(interaction, ctx) {
        const query = interaction.options.getFocused().toLowerCase();
        const manage = interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);
        const list = (await ctx.use('characters').all(interaction.guildId)).filter((c) => manage || c.ownerId === interaction.user.id);
        return interaction.respond(list.filter((c) => c.name.toLowerCase().includes(query)).slice(0, 25).map((c) => ({ name: c.name.slice(0, 100), value: c.id })));
      },
    },
  ],

  tick: {
    everyMs: 15 * 60 * 1000,
    async run(ctx) {
      for (const guildId of await ctx.store.guilds()) {
        if (!(await ctx.runtime.isEnabled(guildId, 'character-birthdays'))) continue;
        if (!ctx.client.guilds.cache.has(guildId)) continue;
        await announce(ctx, guildId);
      }
    },
  },

  announce,
};
