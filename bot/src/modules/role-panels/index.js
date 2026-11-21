// Self-assign role panels: button panels members click to add or remove roles.
// Panels can be "pick one" (colors) or "pick any" (interests, pings).

const crypto = require('node:crypto');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

const MAX_ROLES = 25;
const KEY = 'panels';

/**
 * Builds a panel message. `roles` is [{ id, label, emoji? }].
 * Returns plain JSON so it works with both discord.js and raw REST calls.
 */
function buildPanel(ui, { panelId, title, description, roles, exclusive, color, divider, roleMarker }) {
  const rows = [];
  for (let i = 0; i < roles.length; i += 5) {
    rows.push(
      new ActionRowBuilder().addComponents(
        roles.slice(i, i + 5).map((role) => {
          const button = new ButtonBuilder()
            .setCustomId(`role-panels:toggle:${panelId}:${role.id}`)
            .setLabel(role.label.slice(0, 80))
            .setStyle(ButtonStyle.Secondary);
          if (role.emoji) button.setEmoji(role.emoji);
          return button;
        }),
      ),
    );
  }
  const hint = exclusive ? '*Pick one. Picking another swaps it, and clicking yours again removes it.*' : '*Pick as many as you like. Click again to remove.*';
  const roleList = roleMarker && roles.map(({ id }, index) => {
    const border = index === 0 ? '╭' : index === roles.length - 1 ? '╰' : '┊';
    return `${border}  ${roleMarker}  <@&${id}>`;
  }).join('\n');
  return {
    embeds: [ui.embed({ title, description: [description, roleList, hint].filter(Boolean).join('\n\n'), color, divider }).toJSON()],
    components: rows.map((r) => r.toJSON()),
  };
}

const newPanelId = () => crypto.randomUUID().slice(0, 8);

function api(ctx) {
  return {
    buildPanel: (options) => buildPanel(ctx.ui, options),
    newPanelId,
    async savePanel(guildId, panelId, panel) {
      await ctx.store.update(guildId, KEY, (all) => ({ ...all, [panelId]: panel }), {});
    },
  };
}

module.exports = {
  id: 'role-panels',
  name: 'Role Panels',
  tier: 'L1',
  category: 'community',
  description: 'Button panels for self-assigned roles: colors, pronouns, interests, and ping roles.',
  details: 'Panels can be "pick one" (each new pick replaces the last, good for colors) or "pick any". The bot\'s role must sit above the roles it hands out.',

  api,
  buildPanel,

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName('rolepanel')
        .setDescription('Self-assign role panels')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand((s) => {
          s.setName('post')
            .setDescription('Post a role panel in a channel')
            .addStringOption((o) => o.setName('title').setDescription('Panel title').setRequired(true).setMaxLength(100))
            .addRoleOption((o) => o.setName('role1').setDescription('Role').setRequired(true))
            .addBooleanOption((o) => o.setName('pick_one').setDescription('Members can only hold one of these roles'))
            .addStringOption((o) => o.setName('description').setDescription('Text above the buttons').setMaxLength(1000))
            .addChannelOption((o) => o.setName('channel').setDescription('Where to post (default: here)').addChannelTypes(ChannelType.GuildText));
          for (let i = 2; i <= 10; i++) s.addRoleOption((o) => o.setName(`role${i}`).setDescription('Role'));
          return s;
        }),

      async execute(interaction, ctx) {
        const roles = [];
        for (let i = 1; i <= 10; i++) {
          const role = interaction.options.getRole(`role${i}`);
          if (role && !roles.some((r) => r.id === role.id)) roles.push(role);
        }
        const me = interaction.guild?.members.me;
        const tooHigh = roles.filter((r) => r.managed || r.id === interaction.guildId || (me && r.position >= me.roles.highest.position));
        if (tooHigh.length) {
          return ctx.ui.ephemeral(interaction, {
            embeds: [ctx.ui.fail(`I can't hand out ${tooHigh.map((r) => `<@&${r.id}>`).join(', ')}. Move my role above them, and skip bot or @everyone roles.`)],
          });
        }
        const channel = interaction.options.getChannel('channel') ?? interaction.channel;
        const panelId = newPanelId();
        const exclusive = interaction.options.getBoolean('pick_one') ?? false;
        const message = await channel.send(
          await ctx.ui.withArtwork(buildPanel(ctx.ui, {
            panelId,
            title: interaction.options.getString('title'),
            description: interaction.options.getString('description'),
            roles: roles.map((r) => ({ id: r.id, label: r.name })),
            exclusive,
          })),
        );
        await api(ctx).savePanel(interaction.guildId, panelId, { roles: roles.map((r) => r.id), exclusive, channelId: channel.id, messageId: message.id });
        return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.ok(`Posted the panel in <#${channel.id}>.`)] });
      },
    },
  ],

  components: {
    async toggle(interaction, ctx, [panelId, roleId]) {
      const panels = await ctx.store.get(interaction.guildId, KEY, {});
      const panel = panels[panelId];
      if (!panel?.roles.includes(roleId)) {
        return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn('This panel is out of date. Ask an admin to post it again.')] });
      }
      const member = interaction.member;
      const has = member.roles.cache.has(roleId);
      try {
        if (has) {
          await member.roles.remove(roleId, 'Role panel');
        } else {
          const swap = panel.exclusive ? panel.roles.filter((id) => id !== roleId && member.roles.cache.has(id)) : [];
          if (swap.length) await member.roles.remove(swap, 'Role panel (pick one)');
          await member.roles.add(roleId, 'Role panel');
        }
      } catch (error) {
        ctx.log.error('role change failed:', error.message);
        return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('I couldn\'t change that role. My role may need to be higher than it.')] });
      }
      return ctx.ui.ephemeral(interaction, { content: `${has ? 'Removed' : 'Added'} <@&${roleId}>.`, allowedMentions: { parse: [] } });
    },
  },
};
