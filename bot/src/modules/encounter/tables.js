// Encounter tables. Each biome has peaceful, strange, and hostile entries.

module.exports = {
  biomes: {
    forest: {
      emoji: '🌲',
      peaceful: ['A deer watches you from the ferns, unafraid.', 'You find a ring of mushrooms glowing faintly.', 'A traveling herbalist offers to share their fire.'],
      strange: ['Every tree in this clearing has an eye carved into it.', 'A trail of moth wings leads off the path.', 'You hear your own voice calling from deeper in the woods.'],
      hostile: ['A pack of wolves circles, hungry and bold.', 'Bandits drop from the branches above.', 'A thorned vine lashes out and grabs your ankle.'],
    },
    mountain: {
      emoji: '⛰️',
      peaceful: ['A goat herder points out a safer pass.', 'You reach a ledge with a view of the whole valley.', 'An old shrine offers shelter from the wind.'],
      strange: ['Snow is falling upward here.', 'A sealed door is set into the rock face.', 'Echoes answer a beat before you speak.'],
      hostile: ['A rockslide thunders down the slope.', 'A wyvern dives from the clouds.', 'A frost troll blocks the narrow bridge.'],
    },
    coast: {
      emoji: '🌊',
      peaceful: ['Fishers invite you to share their catch.', 'A message in a bottle washes ashore.', 'Seals sun themselves on the rocks.'],
      strange: ['The tide goes out much too far, revealing a sunken road.', 'A lighthouse is lit, though no one lives there.', 'You find footprints leading into the sea.'],
      hostile: ['Smugglers mistake you for the watch.', 'A giant crab bursts from the sand.', 'Sirens begin to sing from the reef.'],
    },
    desert: {
      emoji: '🏜️',
      peaceful: ['A caravan offers water in exchange for news.', 'You find an oasis with date palms.', 'A lizard leads you to shade.'],
      strange: ['A city shimmers on the horizon, then is gone.', 'The sand here hums when you walk.', 'A statue\'s head has turned to face you.'],
      hostile: ['A sandstorm swallows the horizon.', 'Scorpions the size of dogs emerge at dusk.', 'Raiders on fast mounts close in.'],
    },
    city: {
      emoji: '🏙️',
      peaceful: ['A street performer draws a friendly crowd.', 'A shopkeeper gives you a free sample.', 'You stumble on a festival in the square.'],
      strange: ['The same cloaked stranger appears on every corner.', 'A door that wasn\'t there yesterday stands open.', 'All the clocks in the market stopped at once.'],
      hostile: ['A pickpocket grabs your coin purse and runs.', 'The city guard wants a word, now.', 'A tavern brawl spills into the street.'],
    },
    dungeon: {
      emoji: '🕯️',
      peaceful: ['A lost adventurer gladly joins you for a while.', 'You find a safe alcove to rest.', 'An old map is pinned to the wall.'],
      strange: ['A painting\'s eyes follow you down the hall.', 'A staircase leads down to the room you just left.', 'Whispers come from the empty sarcophagus.'],
      hostile: ['Skeletons rattle to their feet.', 'A pressure plate clicks under your boot.', 'A mimic snaps shut where the chest used to be.'],
    },
  },
  loot: ['a pouch of 3d6 coins', 'a healing tonic', 'a strange silver key', 'a moth-shaped brooch', 'a half-burnt letter', 'a map fragment', 'a rare herb', 'an enchanted ribbon', 'a cracked gemstone', 'rations for three days'],
};
