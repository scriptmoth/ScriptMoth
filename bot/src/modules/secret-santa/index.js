// Secret Santa / gift exchange: sign-up panel, wishlists, a fair draw, DM assignments,
// a /mymatch fallback when DMs are closed, and "gift sent" tracking for the host.

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

const KEY = 'exchange';
const MIN_PLAYERS = 3;

/**
 * Shuffle everyone into one loop so each person gives to the next. Nobody draws themselves,
 * everyone gives exactly once and receives exactly once, and there are no closed pairs (A↔B).
 */
function assign(userIds, random = Math.random) {
  if (userIds.length < 2) throw new Error('Need at least two people');
  const order = [...userIds];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return Object.fromEntries(order.map((giver, i) => [giver, order[(i + 1) % order.length]]));
}

const isHost = (interaction, ex) => ex.hostId === interaction.user.id || interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild);

function panel(ctx, ex) {
  const count = Object.keys(ex.participants).length;
  const open = ex.status === 'open';
  if (ex.status === 'ended') {
    return { embeds: [ctx.ui.embed({ title: '🎁 Secret Santa has ended', description: 'Thanks for taking part!', color: ctx.ui.COLORS.danger })], components: [] };
  }
  return {
    embeds: [
      ctx.ui.embed({
        title: open ? '🎁 Secret Santa sign-ups are open!' : '🎁 Secret Santa: names have been drawn',
        description: open
          ? 'Press **Join** to take part, then add a wishlist so your Santa knows what you like.'
          : 'Check your DMs for your match, or use `/secretsanta mymatch`.',
        fields: [
          { name: 'Joined', value: String(count), inline: true },
          ...(ex.budget ? [{ name: 'Budget', value: ex.budget, inline: true }] : []),
          ...(ex.deadline ? [{ name: 'Send by', value: ex.deadline, inline: true }] : []),
          { name: 'Host', value: `<@${ex.hostId}>`, inline: true },
        ],
        color: ctx.ui.COLORS.danger,
      }),
    ],
    components: open
      ? [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('secret-santa:join').setLabel('Join').setEmoji('🎄').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('secret-santa:wishlist').setLabel('Wishlist').setEmoji('📝').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('secret-santa:leave').setLabel('Leave').setStyle(ButtonStyle.Secondary),
          ),
        ]
      : [],
  };
}

function matchEmbed(ctx, ex, receiverId, guildName) {
  const wishlist = ex.participants[receiverId]?.wishlist;
  return ctx.ui.embed({
    title: '🎅 Your Secret Santa match',
    description: `You're getting a gift for <@${receiverId}>${guildName ? ` in **${guildName}**` : ''}!`,
    fields: [
      { name: 'Their wishlist', value: wishlist ? ctx.ui.truncate(wishlist, 1000) : '*They didn\'t write one. Time to be creative!*' },
      ...(ex.budget ? [{ name: 'Budget', value: ex.budget, inline: true }] : []),
      ...(ex.deadline ? [{ name: 'Send by', value: ex.deadline, inline: true }] : []),
    ],
    footer: 'Keep it secret! Use /secretsanta sent once your gift is on its way.',
    color: ctx.ui.COLORS.danger,
  });
}

async function refreshPanel(ctx, ex) {
  if (!ex.channelId || !ex.messageId) return;
  const channel = await ctx.client.channels.fetch(ex.channelId).catch(() => null);
  const message = await channel?.messages?.fetch(ex.messageId).catch(() => null);
  await message?.edit(panel(ctx, ex)).catch(() => null);
}

module.exports = {
  id: 'secret-santa',
  name: 'Secret Santa Exchange',
  tier: 'L3',
  category: 'community',
  description: 'Gift exchange with sign-ups, wishlists, a fair draw, DM matches, and sent-gift tracking.',
  details: 'The host opens sign-ups and draws names when ready. Everyone gets their match and wishlist by DM, with `/secretsanta mymatch` as a fallback. The host can see who has sent their gift (never who they drew).',

  commands: [
    {
      data: new SlashCommandBuilder()
        .setName('secretsanta')
        .setDescription('Secret Santa gift exchange')
        .addSubcommand((s) =>
          s
            .setName('start')
            .setDescription('Open sign-ups in this channel')
            .addStringOption((o) => o.setName('budget').setDescription('e.g. $20 or "something handmade"').setMaxLength(60))
            .addStringOption((o) => o.setName('deadline').setDescription('e.g. December 20').setMaxLength(60)),
        )
        .addSubcommand((s) => s.setName('draw').setDescription('Close sign-ups and draw names (host)'))
        .addSubcommand((s) => s.setName('wishlist').setDescription('Write or update your wishlist'))
        .addSubcommand((s) => s.setName('mymatch').setDescription('See who you\'re buying for'))
        .addSubcommand((s) => s.setName('sent').setDescription('Mark your gift as sent'))
        .addSubcommand((s) => s.setName('status').setDescription('Exchange progress (host)'))
        .addSubcommand((s) => s.setName('end').setDescription('End the exchange and clear its data (host)')),

      async execute(interaction, ctx) {
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        const ex = await ctx.store.get(guildId, KEY, null);

        if (sub === 'start') {
          if (ex) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn('An exchange is already running here. The host can `/secretsanta end` it first.')] });
          const fresh = {
            status: 'open',
            hostId: interaction.user.id,
            budget: interaction.options.getString('budget'),
            deadline: interaction.options.getString('deadline'),
            channelId: interaction.channelId,
            participants: {},
            pairs: {},
            createdAt: Date.now(),
          };
          const reply = await interaction.reply({ ...panel(ctx, fresh), withResponse: true });
          fresh.messageId = reply.resource?.message?.id ?? null;
          await ctx.store.set(guildId, KEY, fresh);
          return;
        }

        if (!ex) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn('There\'s no exchange running. Start one with `/secretsanta start`.')] });
        if (sub === 'wishlist') return module.exports.components.wishlist(interaction, ctx);

        if (sub === 'mymatch' || sub === 'sent') {
          const receiverId = ex.pairs[interaction.user.id];
          if (!receiverId) {
            const why = ex.status === 'open' ? 'Names haven\'t been drawn yet.' : 'You\'re not in this exchange.';
            return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn(why)] });
          }
          if (sub === 'mymatch') return ctx.ui.ephemeral(interaction, { embeds: [matchEmbed(ctx, ex, receiverId)] });
          ex.participants[interaction.user.id].sent = true;
          await ctx.store.set(guildId, KEY, ex);
          return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.ok('Marked as sent. Thank you, Santa! 🎄')] });
        }

        if (!isHost(interaction, ex)) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.fail('Only the host or someone with **Manage Server** can do that.')] });

        if (sub === 'end') {
          await ctx.store.delete(guildId, KEY);
          await refreshPanel(ctx, { ...ex, status: 'ended' });
          return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.ok('The exchange has ended and its data was cleared.')] });
        }

        if (sub === 'status') {
          const ids = Object.keys(ex.participants);
          const lines = ids.map((id) => {
            const p = ex.participants[id];
            const marks = [p.wishlist ? '📝' : '·', ex.status === 'drawn' ? (p.sent ? '✅ sent' : '⏳') : '', p.dmFailed ? '📪 DMs closed' : ''];
            return `<@${id}> ${marks.filter(Boolean).join(' ')}`;
          });
          return ctx.ui.ephemeral(interaction, {
            embeds: [
              ctx.ui.embed({
                title: `Secret Santa · ${ex.status === 'open' ? 'sign-ups open' : 'drawn'}`,
                description: lines.join('\n') || 'Nobody has joined yet.',
                footer: '📝 has wishlist · ✅ gift sent · 📪 needs to use /secretsanta mymatch',
              }),
            ],
          });
        }

        // draw
        if (ex.status !== 'open') return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn('Names were already drawn.')] });
        const ids = Object.keys(ex.participants);
        if (ids.length < MIN_PLAYERS) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn(`You need at least ${MIN_PLAYERS} people to draw names (${ids.length} so far).`)] });

        await interaction.deferReply({ flags: ctx.runtime.ephemeralFlag });
        ex.pairs = assign(ids);
        ex.status = 'drawn';
        let failed = 0;
        for (const [giver, receiver] of Object.entries(ex.pairs)) {
          try {
            const user = await ctx.client.users.fetch(giver);
            await user.send(ctx.ui.withDivider({ embeds: [matchEmbed(ctx, ex, receiver, interaction.guild?.name)] }));
          } catch {
            ex.participants[giver].dmFailed = true;
            failed++;
          }
        }
        await ctx.store.set(guildId, KEY, ex);
        await refreshPanel(ctx, ex);
        return interaction.editReply({
          embeds: [
            ctx.ui.ok(
              `Drew names for **${ids.length}** people.${failed ? `\n📪 ${failed} couldn't get a DM. They can use \`/secretsanta mymatch\`.` : ''}`,
              'Names drawn!',
            ),
          ],
        });
      },
    },
  ],

  components: {
    async join(interaction, ctx) {
      const ex = await ctx.store.get(interaction.guildId, KEY, null);
      if (!ex || ex.status !== 'open') return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn('Sign-ups are closed.')] });
      if (ex.participants[interaction.user.id]) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn('You\'re already in! Add a wishlist with the 📝 button.')] });
      ex.participants[interaction.user.id] = { wishlist: null, joinedAt: Date.now(), sent: false };
      await ctx.store.set(interaction.guildId, KEY, ex);
      await interaction.update(panel(ctx, ex));
      return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.ok('You\'re in! 🎄 Add a wishlist so your Santa knows what you like.')] });
    },

    async leave(interaction, ctx) {
      const ex = await ctx.store.get(interaction.guildId, KEY, null);
      if (!ex || ex.status !== 'open' || !ex.participants[interaction.user.id]) {
        return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn('You\'re not signed up, or sign-ups have closed.')] });
      }
      delete ex.participants[interaction.user.id];
      await ctx.store.set(interaction.guildId, KEY, ex);
      return interaction.update(panel(ctx, ex));
    },

    async wishlist(interaction, ctx) {
      const ex = await ctx.store.get(interaction.guildId, KEY, null);
      const me = ex?.participants[interaction.user.id];
      if (!me) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn('Join the exchange first.')] });
      const input = new TextInputBuilder()
        .setCustomId('text')
        .setLabel('What would you like? Likes, sizes, no-gos')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(1000)
        .setRequired(true);
      if (me.wishlist) input.setValue(me.wishlist);
      return interaction.showModal(
        new ModalBuilder().setCustomId('secret-santa:savewish').setTitle('Your wishlist').addComponents(new ActionRowBuilder().addComponents(input)),
      );
    },

    async savewish(interaction, ctx) {
      const ex = await ctx.store.get(interaction.guildId, KEY, null);
      const me = ex?.participants[interaction.user.id];
      if (!me) return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.warn('You\'re no longer in the exchange.')] });
      me.wishlist = interaction.fields.getTextInputValue('text').trim();
      await ctx.store.set(interaction.guildId, KEY, ex);
      const note = ex.status === 'drawn' ? ' Your Santa can see the update with `/secretsanta mymatch`.' : '';
      return ctx.ui.ephemeral(interaction, { embeds: [ctx.ui.ok(`Wishlist saved.${note}`)] });
    },
  },

  assign,
};
