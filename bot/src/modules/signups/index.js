const { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { randomUUID } = require('node:crypto');
const { dayMs, discordTime, parseInstant } = require('../../core/time');

function buttons(id, event, status) {
  return new ActionRowBuilder().addComponents(
    ...(status === 'started' ? [] : [
      new ButtonBuilder().setCustomId(`signups:join:${id}`).setLabel('Join').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`signups:maybe:${id}`).setLabel('Maybe').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`signups:leave:${id}`).setLabel('Leave').setStyle(ButtonStyle.Secondary),
    ]),
    ...(event ? [new ButtonBuilder().setCustomId(`signups:checkin:${id}`).setLabel('Check in').setStyle(ButtonStyle.Success).setDisabled(status !== 'started')] : []),
    new ButtonBuilder().setCustomId(`signups:list:${id}`).setLabel('View roster').setStyle(ButtonStyle.Primary),
  );
}

const durationMs = 7 * dayMs;
const mentions = { parse: [] };
const activityOption = (o) => o.setName('activity').setDescription('What are you planning?').setMaxLength(150).setRequired(true);
const signupKey = (id) => `signup:${id}`;

function eventStatus(signup, now) {
  if (signup.cancelled) return 'cancelled';
  if (signup.expires <= now) return 'closed';
  if (signup.startsAt <= now) return 'started';
  if (signup.startsAt - now <= 15 * 60_000) return 'soon';
  return 'scheduled';
}

function eventPanel(ctx, id, signup, status) {
  const details = {
    scheduled: 'Pick your RSVP below.',
    soon: 'This event starts within 15 minutes. Pick your RSVP below.',
    started: 'This event has started. Use **Check in** to record attendance.',
    closed: 'This event has ended.',
    cancelled: 'The organizer cancelled this event.',
  };
  return {
    embeds: ctx.ui.embedLayout({
      title: signup.activity,
      description: details[status],
      fields: [{ name: 'Start time', value: discordTime(signup.startsAt) }],
      tone: ['soon', 'cancelled'].includes(status) ? 'warning' : 'general',
    }, { header: 'header.moonStars' }),
    components: ['cancelled', 'closed'].includes(status) ? [] : [buttons(id, true, status)],
    allowedMentions: mentions,
  };
}

async function schedule(i, ctx) {
  const activity = i.options.getString('activity').trim();
  if (!activity) return ctx.ui.ephemeral(i, 'Enter an activity for the event.');
  const startsAt = parseInstant(i.options.getString('starts'));
  const now = Date.now();
  if (!Number.isFinite(startsAt) || startsAt < now + 60_000 || startsAt > now + 30 * dayMs) {
    return ctx.ui.ephemeral(i, 'Choose a start at least one minute away and within 30 days. Use a Discord timestamp or a date with timezone, such as `2026-12-04T19:00-05:00`.');
  }
  const id = randomUUID();
  const key = signupKey(id);
  const signup = {
    activity, startsAt, expires: startsAt + dayMs, organizer: i.user.id,
    channelId: i.channelId, cancelled: false, members: {}, attended: [],
  };
  signup.status = eventStatus(signup, now);
  await ctx.store.set(i.guildId, key, signup);
  let response;
  try {
    response = await i.reply({ ...eventPanel(ctx, id, signup, signup.status), withResponse: true });
  } catch (error) {
    await ctx.store.delete(i.guildId, key);
    throw error;
  }
  const message = response.resource?.message ?? await i.fetchReply();
  await ctx.store.update(i.guildId, key, (current) => ({ ...current, messageId: message.id }), signup);
}

async function events(i, ctx) {
  if (!i.guildId) return ctx.ui.ephemeral(i, 'Schedule events in a server.');
  const action = i.options.getSubcommand();
  if (action === 'schedule') return schedule(i, ctx);
  if (action === 'cancel') {
    const messageId = i.options.getString('message');
    const entries = await ctx.store.all(i.guildId);
    const match = Object.entries(entries).find(([, event]) => event?.startsAt && event.messageId === messageId);
    const now = Date.now();
    if (!match || match[1].expires <= now || match[1].cancelled) return ctx.ui.ephemeral(i, 'No active event found with that message ID.');
    if (match[1].organizer !== i.user.id && !i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      return ctx.ui.ephemeral(i, 'Only the organizer or server managers can cancel this event.');
    }
    await ctx.store.update(i.guildId, match[0], (event) => event && { ...event, cancelled: true }, null);
    return ctx.ui.ephemeral(i, 'Event cancelled. The post will update shortly.');
  }
  const now = Date.now();
  const entries = Object.values(await ctx.store.all(i.guildId));
  const visible = entries.filter((event) => event?.startsAt && event.channelId === i.channelId && event.messageId && !event.cancelled && event.expires > now)
    .sort((a, b) => a.startsAt - b.startsAt).slice(0, 10);
  const fields = visible.map((event) => ({
    name: event.activity,
    value: `${discordTime(event.startsAt, 'f')} · [Event post](https://discord.com/channels/${i.guildId}/${event.channelId}/${event.messageId}) · ID \`${event.messageId}\``,
  }));
  return ctx.ui.ephemeral(i, {
    embeds: [ctx.ui.embed({
      title: 'Events in this channel',
      description: fields.length ? undefined : 'No open or upcoming events. Create one with `/event schedule`.',
      tone: fields.length ? 'general' : 'empty',
      fields,
    })],
    allowedMentions: mentions,
  });
}

async function respond(i, ctx, id, status) {
  const key = signupKey(id);
  let signup;
  let feedback;
  if (status) {
    const now = Date.now();
    signup = await ctx.store.update(i.guildId, key, (current) => {
      if (!current || current.cancelled || current.expires <= now) return current;
      if (status === 'checkin') {
        if (!current.startsAt || current.startsAt > now) {
          feedback = 'Check-in opens when the event starts.';
          return current;
        }
        current.attended = [...new Set([...current.attended, i.user.id])];
        feedback = 'You’re checked in!';
      } else if (current.startsAt <= now) {
        feedback = 'RSVPs have closed. Check in to record attendance.';
      } else if (status === 'leave') {
        delete current.members[i.user.id];
        feedback = 'You left the signup.';
      } else {
        current.members[i.user.id] = status;
        feedback = status === 'join' ? 'You’re signed up!' : 'You’re marked as maybe.';
      }
      return current;
    }, null);
  } else {
    signup = await ctx.store.get(i.guildId, key, null);
  }
  if (!signup || signup.cancelled || signup.expires <= Date.now()) return ctx.ui.ephemeral(i, 'This signup has closed.');
  if (status) return ctx.ui.ephemeral(i, feedback);
  const members = Object.entries(signup.members);
  const roster = (value) => {
    const ids = members.filter(([, state]) => state === value).map(([user]) => user);
    return ids.length ? ids.slice(0, 20).map((user) => `<@${user}>`).join(', ') + (ids.length > 20 ? ` and ${ids.length - 20} more` : '') : 'Nobody yet';
  };
  const attendance = signup.attended ? `\n**Checked in** · ${signup.attended.length}` : '';
  return ctx.ui.ephemeral(i, { content: `**Going** · ${roster('join')}\n**Maybe** · ${roster('maybe')}${attendance}`, allowedMentions: mentions });
}

module.exports = {
  id: 'signups',
  name: 'Group Signups & Events',
  tier: 'L2',
  category: 'community',
  description: 'Post interest checks or schedule events with RSVPs, start updates, and attendance check-in.',
  commands: [{
    data: new SlashCommandBuilder().setName('signup').setDescription('See who is interested in a group activity')
      .addStringOption(activityOption),
    async execute(i, ctx) {
      if (!i.guildId) return ctx.ui.ephemeral(i, 'Create signups in a server.');
      const activity = i.options.getString('activity').trim();
      if (!activity) return ctx.ui.ephemeral(i, 'Enter an activity for the signup.');
      const expires = Date.now() + durationMs;
      const id = randomUUID();
      const key = signupKey(id);
      await ctx.store.set(i.guildId, key, { expires, members: {} });
      try {
        return await i.reply({
          embeds: [ctx.ui.embed({ title: activity, description: `Pick your RSVP below. This signup closes <t:${Math.floor(expires / 1000)}:R>.` })],
          components: [buttons(id)],
          allowedMentions: mentions,
        });
      } catch (error) {
        await ctx.store.delete(i.guildId, key);
        throw error;
      }
    },
  }, {
    data: new SlashCommandBuilder().setName('event').setDescription('Schedule an event and track RSVPs and check-ins')
      .addSubcommand((s) => s.setName('schedule').setDescription('Post an upcoming event in this channel')
        .addStringOption(activityOption)
        .addStringOption((o) => o.setName('starts').setDescription('Discord timestamp or ISO date with timezone').setMaxLength(32).setRequired(true)))
      .addSubcommand((s) => s.setName('upcoming').setDescription('List open and upcoming events in this channel'))
      .addSubcommand((s) => s.setName('cancel').setDescription('Cancel an event you organized')
        .addStringOption((o) => o.setName('message').setDescription('Message ID from /event upcoming').setRequired(true))),
    execute: events,
  }],
  components: {
    join: (i, ctx, [id]) => respond(i, ctx, id, 'join'),
    maybe: (i, ctx, [id]) => respond(i, ctx, id, 'maybe'),
    leave: (i, ctx, [id]) => respond(i, ctx, id, 'leave'),
    list: (i, ctx, [id]) => respond(i, ctx, id),
    checkin: (i, ctx, [id]) => respond(i, ctx, id, 'checkin'),
  },
  tick: {
    everyMs: 30_000,
    async run(ctx) {
      for (const guildId of await ctx.store.guilds()) {
        if (!(await ctx.runtime.isEnabled(guildId, 'signups'))) continue;
        for (const [key, signup] of Object.entries(await ctx.store.all(guildId))) {
          const now = Date.now();
          if (!signup?.startsAt) {
            if (!signup || signup.expires <= now) await ctx.store.delete(guildId, key);
            continue;
          }
          const status = eventStatus(signup, now);
          if (signup.messageId && status !== signup.status) {
            try {
              const channel = await ctx.client.channels.fetch(signup.channelId);
              const message = await channel.messages.fetch(signup.messageId);
              await message.edit(await ctx.ui.withArtwork(eventPanel(ctx, key.slice(7), signup, status), [...message.attachments.values()]));
            } catch (error) {
              if (error.status === 403 || error.status === 404) {
                await ctx.store.delete(guildId, key);
                continue;
              }
              ctx.log.error('Could not refresh event post.', error.code ?? error.message);
              continue;
            }
            await ctx.store.update(guildId, key, (current) => current && { ...current, status }, null);
          }
          if (signup.expires <= now) await ctx.store.delete(guildId, key);
        }
      }
    },
  },
};
