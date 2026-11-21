const { SlashCommandBuilder } = require('discord.js');

const locations = {
  meadow: { material: 'Silk', foe: 'Bramble sprite', faction: 'Meadow Weavers' },
  woods: { material: 'Moonleaf', foe: 'Lantern wisp', faction: 'Lantern Keepers' },
  shore: { material: 'Shell', foe: 'Tide crab', faction: 'Tide Watch' },
};
const recipes = {
  lantern: { name: 'Moon lantern', cost: { Silk: 1, Moonleaf: 2 } },
  charm: { name: 'Tide charm', cost: { Moonleaf: 1, Shell: 2 } },
};
const start = {
  location: 'meadow',
  faction: null,
  coins: 5,
  items: {},
  equipment: null,
  battles: 0,
  quest: false,
  gathered: 0,
  lastGather: 0,
  lastBattle: 0,
};
const locationOption = (o) => o.setName('location').setDescription('Destination').setRequired(true)
  .addChoices(...Object.keys(locations).map((value) => ({ name: value, value })));
const recipeOption = (o) => o.setName('item').setDescription('Which item').setRequired(true)
  .addChoices(...Object.entries(recipes).map(([value, { name }]) => ({ name, value })));
const inventory = (p) => Object.entries(p.items).filter(([, amount]) => amount > 0)
  .map(([name, amount]) => `${name} ×${amount}`).join(' · ') || 'Your bag is empty.';
const addItem = (p, item, amount) => { p.items[item] = (p.items[item] ?? 0) + amount; };

function play(action, choice, p, now, pick) {
  const area = locations[p.location];
  switch (action) {
    case 'travel':
      p.location = choice;
      return `You arrive at the **${choice}**. Try gathering **${locations[choice].material}** here.`;
    case 'gather':
      if (now - p.lastGather < 5_000) return 'Give the area a few seconds to recover.';
      addItem(p, area.material, 1);
      p.lastGather = now;
      if (p.quest) p.gathered += 1;
      return `You gather **1 ${area.material}**. See your bag with \`/adventure inventory\`.`;
    case 'craft': {
      const { name, cost } = recipes[choice];
      const materials = Object.entries(cost);
      if (materials.some(([item, amount]) => (p.items[item] ?? 0) < amount)) {
        return `Crafting **${name}** needs ${materials.map(([item, amount]) => `${amount} ${item}`).join(' and ')}.`;
      }
      for (const [item, amount] of materials) addItem(p, item, -amount);
      addItem(p, name, 1);
      return `You crafted **${name}**. Try equipping it for battles.`;
    }
    case 'equip': {
      const name = recipes[choice].name;
      if (!p.items[name]) return `Craft **${name}** first.`;
      p.equipment = name;
      return `You equip **${name}**, giving you +3 on battle rolls.`;
    }
    case 'battle': {
      if (now - p.lastBattle < 15_000) return 'Catch your breath for a few seconds before another battle.';
      p.lastBattle = now;
      const die = pick(Array.from({ length: 20 }, (_, n) => n + 1));
      const total = die + (p.equipment ? 3 : 0);
      if (total < 10) return `A **${area.foe}** slipped away. You rolled **${total}** against 10.`;
      p.battles += 1;
      p.coins += 3;
      return `You defeated a **${area.foe}** with a roll of **${total}** and earned **3 coins**.`;
    }
    case 'quest':
      if (!p.quest) {
        p.quest = true;
        return 'Quest accepted. Gather three materials, then run `/adventure quest` again for 10 coins.';
      }
      if (p.gathered < 3) return `Gathering quest · **${p.gathered}/3** materials.`;
      p.quest = false;
      p.gathered = 0;
      p.coins += 10;
      return 'Quest complete. You earned **10 coins**.';
    case 'buy': {
      const material = locations[choice].material;
      if (p.coins < 2) return 'You need **2 coins** to buy a material.';
      p.coins -= 2;
      addItem(p, material, 1);
      return `You bought **1 ${material}** for 2 coins. You have **${p.coins}** left.`;
    }
    case 'faction':
      p.faction = area.faction;
      return `You joined the **${p.faction}** in the ${p.location}.`;
    default:
      throw new Error(`Unknown adventure action: ${action}`);
  }
}

module.exports = {
  id: 'adventure',
  name: 'Moonwing Adventure',
  tier: 'L4',
  category: 'roleplay',
  description: 'Travel, gather materials, craft gear, battle, complete quests, and shop with earned coins.',
  commands: [{
    data: new SlashCommandBuilder().setName('adventure').setDescription('Play the Moonwing Adventure')
      .addSubcommand((s) => s.setName('status').setDescription('See your location, coins, and equipment'))
      .addSubcommand((s) => s.setName('inventory').setDescription('See your items'))
      .addSubcommand((s) => s.setName('travel').setDescription('Travel to a new area').addStringOption(locationOption))
      .addSubcommand((s) => s.setName('gather').setDescription('Gather a material in your area'))
      .addSubcommand((s) => s.setName('craft').setDescription('Craft a piece of gear').addStringOption(recipeOption))
      .addSubcommand((s) => s.setName('equip').setDescription('Equip crafted gear').addStringOption(recipeOption))
      .addSubcommand((s) => s.setName('battle').setDescription('Challenge a creature in your area'))
      .addSubcommand((s) => s.setName('quest').setDescription('Accept, check, or turn in a gathering quest'))
      .addSubcommand((s) => s.setName('buy').setDescription('Buy a material for two coins').addStringOption(locationOption))
      .addSubcommand((s) => s.setName('faction').setDescription('Join the faction in your current area')),
    async execute(i, ctx) {
      if (!i.guildId) return ctx.ui.ephemeral(i, 'Play Moonwing Adventure in a server.');
      const action = i.options.getSubcommand();
      const key = `player:${i.user.id}`;
      const fresh = structuredClone(start);
      if (action === 'status' || action === 'inventory') {
        const p = await ctx.store.get(i.guildId, key, fresh);
        const description = action === 'inventory' ? inventory(p) : [
          `Location **${p.location}** · Coins **${p.coins}** · Victories **${p.battles}**`,
          `Faction **${p.faction ?? 'None'}** · Equipment **${p.equipment ?? 'None'}**`,
          'Start with `/adventure quest` and `/adventure gather`.',
        ].join('\n');
        return ctx.ui.ephemeral(i, { embeds: [ctx.ui.embed({ title: 'Moonwing adventure', tone: 'bot', description })] });
      }
      const choice = i.options.getString('location') ?? i.options.getString('item');
      let description;
      await ctx.store.update(i.guildId, key, (player) => {
        description = play(action, choice, player, Date.now(), ctx.ui.pick);
        return player;
      }, fresh);
      return ctx.ui.ephemeral(i, { embeds: [ctx.ui.embed({ title: 'Moonwing adventure', tone: 'bot', description })] });
    },
  }],
};
