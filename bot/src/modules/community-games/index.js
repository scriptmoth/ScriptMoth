const { SlashCommandBuilder } = require('discord.js');
const { randomInt } = require('node:crypto');

const careActions = {
  feed: { message: 'You gave Luna a moonberry.', need: 'hunger' },
  play: { message: 'You played hide and seek with Luna.', need: 'boredom' },
};
const dayMs = 24 * 60 * 60_000;
const petStart = { hunger: 50, boredom: 50, lastCare: 0, caretakers: {} };

function needs(pet, now) {
  const elapsed = pet.lastCare ? Math.floor((now - pet.lastCare) / 3_600_000) : 0;
  return { hunger: Math.min(100, pet.hunger + elapsed * 4), boredom: Math.min(100, pet.boredom + elapsed * 4) };
}

module.exports = {
  id: 'community-games',
  name: 'Minigames & Server Pet',
  tier: 'L2',
  category: 'fun',
  description: 'Flip a coin, consult a magic 8-ball, play rock-paper-scissors, or care for Luna the moth.',
  commands: [
    {
      data: new SlashCommandBuilder().setName('game').setDescription('Play a quick minigame')
        .addSubcommand((s) => s.setName('coin').setDescription('Flip a coin'))
        .addSubcommand((s) => s.setName('eightball').setDescription('Ask a yes-or-no question')
          .addStringOption((o) => o.setName('question').setDescription('Your question').setRequired(true).setMaxLength(150)))
        .addSubcommand((s) => s.setName('rps').setDescription('Play rock-paper-scissors against the moth')
          .addStringOption((o) => o.setName('hand').setDescription('Your move').setRequired(true)
            .addChoices(...['rock', 'paper', 'scissors'].map((hand) => ({ name: hand, value: hand }))))),
      async execute(i, ctx) {
        const action = i.options.getSubcommand();
        if (action === 'coin') return ctx.ui.ephemeral(i, randomInt(2) ? 'Heads!' : 'Tails!');
        if (action === 'eightball') return ctx.ui.ephemeral(i, ctx.ui.pick(['The signs say yes.', 'Probably not.', 'Ask again later.', 'The moth sees good odds.']));
        const hands = ['rock', 'paper', 'scissors'];
        const player = hands.indexOf(i.options.getString('hand'));
        const bot = randomInt(3);
        const score = (player - bot + 3) % 3;
        return ctx.ui.ephemeral(i, `You picked **${hands[player]}**. The moth picked **${hands[bot]}**. ${['Tie!', 'You win!', 'The moth wins!'][score]}`);
      },
    },
    {
      data: new SlashCommandBuilder().setName('pet').setDescription('Care for Luna, the server moth')
        .addSubcommand((s) => s.setName('status').setDescription('See how Luna is feeling'))
        .addSubcommand((s) => s.setName('feed').setDescription('Give Luna a moonberry'))
        .addSubcommand((s) => s.setName('play').setDescription('Play with Luna')),
      async execute(i, ctx) {
        if (!i.guildId) return ctx.ui.ephemeral(i, 'Luna lives in a Discord server.');
        const action = i.options.getSubcommand();
        const now = Date.now();
        let pet;
        let message;
        if (action === 'status') {
          pet = await ctx.store.get(i.guildId, 'pet', petStart);
        } else {
          pet = await ctx.store.update(i.guildId, 'pet', (current) => {
            const last = current.caretakers[i.user.id] ?? 0;
            if (now - last < 30_000) {
              message = 'Give Luna 30 seconds between visits.';
              return current;
            }
            const care = careActions[action];
            const updated = needs(current, now);
            updated[care.need] = Math.max(0, updated[care.need] - 25);
            const caretakers = Object.fromEntries(Object.entries(current.caretakers).filter(([, time]) => now - time < dayMs));
            message = care.message;
            return { ...updated, lastCare: now, caretakers: { ...caretakers, [i.user.id]: now } };
          }, petStart);
        }
        const { hunger, boredom } = needs(pet, now);
        const mood = hunger > 65 ? 'Hungry' : boredom > 65 ? 'Restless' : 'Content';
        const visitors = Object.values(pet.caretakers).filter((time) => now - time < dayMs).length;
        return ctx.ui.ephemeral(i, { embeds: [ctx.ui.embed({
          title: 'Luna the moth',
          description: [message, `**${mood}** · Hunger ${hunger}/100 · Boredom ${boredom}/100`, `Caretakers in the last 24 hours: **${visitors}**`].filter(Boolean).join('\n'),
        })] });
      },
    },
  ],
};
