// Character profiles: members create OC profile cards, browse them, and pick one at random.
// Other modules (birthdays, spotlight) read characters through ctx.use('characters').

const crypto = require('node:crypto');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const MAX_PER_USER = 25;
const KEY = 'characters';

function card(ui, c, { footer } = {}) {
  const subtitle = [c.pronouns, c.species].filter(Boolean).join(' · ');
  return ui.embed({
    title: c.name,
    description: [subtitle && `*${subtitle}*`, c.bio].filter(Boolean).join('\n\n') || '*No bio yet.*',
    fields: [{ name: 'Owner', value: `<@${c.ownerId}>`, inline: true }],
    author: c.image ? { name: 'Character artwork', url: c.image } : undefined,
    image: c.image,
    thumbnail: ui.art('icon.portfolio'),
    color: c.color ?? ui.COLORS.moth,
    footer: footer ?? `Character id: ${c.id}`,
  });
}

function profileModal(customId, title, c = {}) {
  const input = (id, label, style, { max, required = false, value } = {}) => {
    const field = new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(style).setRequired(required);
    if (max) field.setMaxLength(max);
    if (value) field.setValue(value);
    return new ActionRowBuilder().addComponents(field);
  };
  return new ModalBuilder()
    .setCustomId(customId)
    .setTitle(title)
    .addComponents(
      input('name', 'Name', TextInputStyle.Short, { max: 60, required: true, value: c.name }),
      input('pronouns', 'Pronouns', TextInputStyle.Short, { max: 40, value: c.pronouns }),
      input('species', 'Species / role', TextInputStyle.Short, { max: 60, value: c.species }),
      input('bio', 'Bio', TextInputStyle.Paragraph, { max: 1500, value: c.bio }),
      input('image', 'Image URL (https://…)', TextInputStyle.Short, { max: 400, value: c.image }),
    );
}

function readProfile(interaction) {
  const get = (id) => interaction.fields.getTextInputValue(id).trim();
  const image = get('image');
  return {
    name: get('name'),
    pronouns: get('pronouns') || null,
    species: get('species') || null,
    bio: get('bio') || null,
    image: /^https:\/\/\S+$/i.test(image) ? image : null,
    badImage: Boolean(image) && !/^https:\/\/\S+$/i.test(image),
  };
}

function api(ctx) {
  return {
    all: (guildId) => ctx.store.get(guildId, KEY, []),
    async get(guildId, id) {
      return (await ctx.store.get(guildId, KEY, [])).find((c) => c.id === id) ?? null;
    },
    card: (c, options) => card(ctx.ui, c, options),
  };
}

const characterOption = (o, description = 'Character') => o.setName('character').setDescription(description).setRequired(true).setAutocomplete(true);

module.exports = {
  id: 'characters',
  name: 'Character Profiles',
  tier: 'L2',
  category: 'characters',
  description: 'OC profile cards members can create, browse, edit, and pick at random.',
  details: `Each member can keep up to ${MAX_PER_USER} characters per server. Includes the L1 random character picker. Birthdays and Spotlight build on this module.`,

  api,

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName('character')
        .setDescription('Character profiles')
        .addSubcommand((s) => s.setName('create').setDescription('Create a character profile'))
        .addSubcommand((s) => s.setName('view').setDescription('View a character').addStringOption((o) => characterOption(o)))
        .addSubcommand((s) => s.setName('list').setDescription('List characters').addUserOption((o) => o.setName('member').setDescription('Whose characters (default: everyone)')))
        .addSubcommand((s) => s.setName('edit').setDescription('Edit one of your characters').addStringOption((o) => characterOption(o)))
        .addSubcommand((s) => s.setName('delete').setDescription('Delete one of your characters').addStringOption((o) => characterOption(o)))
        .addSubcommand((s) => s.setName('random').setDescription('Pick a random character').addUserOption((o) => o.setName('member').setDescription('Only from this member'))),

      async execute(interaction, ctx) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        const all = await ctx.store.get(guildId, KEY, []);

        if (sub === 'create') {
          if (all.filter((c) => c.ownerId === interaction.user.id).length >= MAX_PER_USER) {
            return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn(`You already have ${MAX_PER_USER} characters here.`)] });
          }
          return interaction.showModal(profileModal('characters:save:new', 'New character'));
        }

        if (sub === 'list') {
          const member = interaction.options.getUser('member');
          const shown = member ? all.filter((c) => c.ownerId === member.id) : all;
          const lines = shown
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((c) => `**${c.name}**${c.species ? ` · ${c.species}` : ''} · <@${c.ownerId}>`);
          return interaction.reply({
            embeds: [
              ctx.ui.embed({
                title: member ? `${member.username}'s characters` : 'Character directory',
                description: ctx.ui.truncate(lines.join('\n') || 'No characters yet. Make one with `/character create`.', 4000),
                footer: `${shown.length} character${shown.length === 1 ? '' : 's'}`,
                tone: shown.length ? 'general' : 'empty',
              }),
            ],
            allowedMentions: { parse: [] },
          });
        }

        if (sub === 'random') {
          const member = interaction.options.getUser('member');
          const pool = member ? all.filter((c) => c.ownerId === member.id) : all;
          if (!pool.length) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.empty('No characters to pick from yet.')] });
          return interaction.reply({ content: '🎲 The moth picks…', embeds: [card(ctx.ui, ctx.ui.pick(pool))], allowedMentions: { parse: [] } });
        }

        const id = interaction.options.getString('character');
        const c = all.find((x) => x.id === id);
        if (!c) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('I couldn\'t find that character. Pick one from the list as you type.')] });

        if (sub === 'view') return interaction.reply({ embeds: [card(ctx.ui, c)], allowedMentions: { parse: [] } });

        const canEdit = c.ownerId === interaction.user.id || interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);
        if (!canEdit) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('That character belongs to someone else.')] });

        if (sub === 'edit') return interaction.showModal(profileModal(`characters:save:${c.id}`, `Edit ${c.name}`.slice(0, 45), c));

        return ctx.ui.ephemeral(interaction, {
          embeds: [ctx.ui.warn(`Delete **${c.name}**? This can't be undone.`)],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId(`characters:delete:${c.id}`).setLabel('Delete').setStyle(ButtonStyle.Danger),
            ),
          ],
        });
      },

      async autocomplete(interaction, ctx) {
        const sub = interaction.options.getSubcommand();
        const query = interaction.options.getFocused().toLowerCase();
        let list = await ctx.store.get(interaction.guildId, KEY, []);
        if ((sub === 'edit' || sub === 'delete') && !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
          list = list.filter((c) => c.ownerId === interaction.user.id);
        }
        return interaction.respond(
          list
            .filter((c) => c.name.toLowerCase().includes(query))
            .slice(0, 25)
            .map((c) => ({ name: `${c.name}${c.species ? ` (${c.species})` : ''}`.slice(0, 100), value: c.id })),
        );
      },
    },
  ],

  components: {
    async save(interaction, ctx, [id]) {
      const profile = readProfile(interaction);
      const { badImage, ...fields } = profile;
      let saved;
      await ctx.store.update(
        interaction.guildId,
        KEY,
        (list) => {
          if (id === 'new') {
            saved = { id: crypto.randomUUID().slice(0, 8), ownerId: interaction.user.id, createdAt: Date.now(), ...fields };
            return [...list, saved];
          }
          return list.map((c) => {
            if (c.id !== id) return c;
            const mayEdit = c.ownerId === interaction.user.id || interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);
            if (!mayEdit) return c;
            saved = { ...c, ...fields, updatedAt: Date.now() };
            return saved;
          });
        },
        [],
      );
      if (!saved) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('That character no longer exists or isn\'t yours.')] });
      const note = badImage ? '\n⚠️ The image link needs to start with `https://`, so I left it out.' : '';
      return interaction.reply({
        content: `${id === 'new' ? '✨ Character created!' : '✏️ Character updated.'}${note}`,
        embeds: [card(ctx.ui, saved)],
        allowedMentions: { parse: [] },
      });
    },

    async delete(interaction, ctx, [id]) {
      let removed;
      await ctx.store.update(
        interaction.guildId,
        KEY,
        (list) =>
          list.filter((c) => {
            const mine = c.ownerId === interaction.user.id || interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);
            if (c.id === id && mine) {
              removed = c;
              return false;
            }
            return true;
          }),
        [],
      );
      return interaction.update({
        embeds: [removed ? ctx.ui.ok(`Deleted **${removed.name}**.`) : ctx.ui.fail('That character was already gone.')],
        components: [],
      });
    },
  },
};
