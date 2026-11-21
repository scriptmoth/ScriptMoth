const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { randomUUID } = require('node:crypto');

const questions = [
  { question: 'Which part of its body does a moth use to detect scents?', options: ['Wings', 'Antennae', 'Abdomen'], correct: 1, topic: 'nature' },
  { question: 'What is the name for an animal that is most active at dawn and dusk?', options: ['Diurnal', 'Nocturnal', 'Crepuscular'], correct: 2, topic: 'nature' },
  { question: 'Which tree produces acorns?', options: ['Oak', 'Birch', 'Willow'], correct: 0, topic: 'nature' },
  { question: 'How many faces does a d12 have?', options: ['Six', 'Twelve', 'Twenty'], correct: 1, topic: 'gaming' },
  { question: 'What is the highest total you can roll on 2d6?', options: ['Six', 'Eight', 'Twelve'], correct: 2, topic: 'gaming' },
  { question: 'On a d20, how many faces show an even number?', options: ['Ten', 'Twelve', 'Twenty'], correct: 0, topic: 'gaming' },
];
const roundLifetime = 10 * 60_000;

module.exports = {
  id: 'trivia',
  name: 'Trivia & Quiz',
  tier: 'L2',
  category: 'fun',
  description: 'Play a button-based quiz and build a personal score and streak.',
  commands: [{
    data: new SlashCommandBuilder().setName('trivia').setDescription('Play a quick quiz')
      .addSubcommand((s) => s.setName('play').setDescription('Start a private trivia round')
        .addStringOption((o) => o.setName('topic').setDescription('Question bank')
          .addChoices({ name: 'Nature', value: 'nature' }, { name: 'Gaming', value: 'gaming' })))
      .addSubcommand((s) => s.setName('score').setDescription('See your score and streak'))
      .addSubcommand((s) => s.setName('leaderboard').setDescription('See the top trivia scores')),
    async execute(i, ctx) {
      if (!i.guildId) return ctx.ui.ephemeral(i, 'Play trivia in a server.');
      const action = i.options.getSubcommand();
      const key = `player:${i.user.id}`;
      const empty = { score: 0, streak: 0, best: 0 };
      if (action === 'score') {
        const { score, streak, best } = await ctx.store.get(i.guildId, key, empty);
        return ctx.ui.ephemeral(i, `Score **${score}** · Streak **${streak}** · Best streak **${best}**`);
      }
      if (action === 'leaderboard') {
        const players = await ctx.store.all(i.guildId);
        const lines = Object.entries(players).filter(([, p]) => p.score > 0)
          .sort((a, b) => b[1].score - a[1].score || b[1].best - a[1].best)
          .slice(0, 10).map(([id, p], index) => `${index + 1}. <@${id.slice(7)}> — ${p.score}`);
        return ctx.ui.ephemeral(i, { content: lines.join('\n') || 'Play a round to start the leaderboard.', allowedMentions: { parse: [] } });
      }
      const topic = i.options.getString('topic');
      const bank = questions.filter((q) => !topic || q.topic === topic);
      const id = randomUUID();
      const player = await ctx.store.update(i.guildId, key, (p) => {
        const available = bank.filter((q) => q.question !== p.lastQuestion);
        const question = ctx.ui.pick(available.length ? available : bank);
        return { ...p, lastQuestion: question.question, round: { ...question, id, expires: Date.now() + roundLifetime } };
      }, empty);
      const row = new ActionRowBuilder().addComponents(player.round.options.map((label, index) =>
        new ButtonBuilder().setCustomId(`trivia:answer:${id}:${index}`).setStyle(ButtonStyle.Primary).setLabel(label)));
      return ctx.ui.ephemeral(i, { content: player.round.question, components: [row] });
    },
  }],
  components: {
    async answer(i, ctx, [id, choice]) {
      let result;
      const player = await ctx.store.update(i.guildId, `player:${i.user.id}`, (p) => {
        const round = p.round;
        if (round?.id !== id || round.expires <= Date.now() || !Object.hasOwn(round.options, choice)) return p;
        result = round.options[round.correct];
        const correct = Number(choice) === round.correct;
        const streak = correct ? p.streak + 1 : 0;
        return { ...p, round: null, score: p.score + Number(correct), streak, best: Math.max(p.best, streak) };
      }, { score: 0, streak: 0, best: 0 });
      if (!result) return ctx.ui.ephemeral(i, 'This round has ended. Start a new one with `/trivia play`.');
      return i.update({ content: `Answer: **${result}** · Score **${player.score}** · Streak **${player.streak}**`, components: [] });
    },
  },
};
