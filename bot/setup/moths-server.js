// Layout for Moth's server: the moth.exe showcase server.
// Applied by `npm run setup-server -- setup/moths-server.js`. Safe to re-run: anything that
// already exists (matched by name) is kept, and posted embeds are edited in place.
//
// Channel `access`: 'readonly' (everyone reads, only staff post), 'staff' (hidden except staff),
// or omitted (normal chat). `posts` are message keys from the `messages` section below.

const { BUILD_A_BOT_URL, BOT_PACKAGES_URL } = require('../src/links');

module.exports = {
  name: "Moth's server",

  roles: {
    // Created if missing. `above` places staff roles just under the bot's own role.
    create: [
      { name: '‿︵ staff ︵‿', color: 0x2e2747, separator: true, above: true },
      { name: '✦﹒moth keeper', color: 0x8e7cc3, hoist: true, above: true, permissions: ['Administrator'] },
      { name: '✦﹒moderator', color: 0xb39ddb, hoist: true, above: true, permissions: ['ManageMessages', 'KickMembers', 'ModerateMembers', 'ManageThreads', 'ManageNicknames'] },
      { name: '‿︵ pings ︵‿', color: 0x2e2747, separator: true },
      { name: '◌ announcements ⋆˚', color: 0xc9ad86, mentionable: true },
      { name: '◌ events ⋆˚', color: 0xc9ad86, mentionable: true },
      { name: '◌ spotlight ⋆˚', color: 0xc9ad86, mentionable: true },
      { name: '◌ rp pings ⋆˚', color: 0xc9ad86, mentionable: true },
    ],
    staff: ['✦﹒moth keeper', '✦﹒moderator'],
  },

  categories: [
    {
      name: '˚₊‧ʚ welcome ɞ‧₊˚',
      was: ['‿︵ welcome ︵‿'],
      channels: [
        { name: 'ʚ🌙ɞ﹒welcome', was: ['ノ✧﹒welcome'], access: 'readonly', topic: 'Welcome to moth.exe’s home. Start here.', posts: ['welcome'] },
        { name: 'ʚ📜ɞ﹒rules', was: ['ノ✧﹒rules'], access: 'readonly', topic: 'Be kind. Read these before chatting.', posts: ['rules'] },
        { name: 'ʚ🏷️ɞ﹒roles', was: ['ノ✧﹒roles'], access: 'readonly', topic: 'Click buttons to pick colors, pronouns, interests, and pings.', posts: ['roles'] },
        { name: 'ʚ📢ɞ﹒announcements', was: ['ノ✧﹒announcements'], access: 'readonly', topic: 'News about moth.exe and Scriptmoth.', posts: ['announcement'] },
      ],
    },
    {
      name: '˚₊‧ʚ moth.exe ɞ‧₊˚',
      was: ['‿︵ moth.exe ︵‿'],
      channels: [
        { name: 'ʚ✨ɞ﹒features', was: ['ノ✧﹒features'], access: 'readonly', topic: 'Everything moth.exe can do. Every feature can go in your bot.', posts: ['features'] },
        { name: 'ʚ🧪ɞ﹒try-commands', was: ['ノ✧﹒try-commands'], topic: 'Play with any moth.exe command here. Type / to see them all.', posts: ['tryCommands'] },
        { name: 'ʚ🛠️ɞ﹒build-your-bot', was: ['ノ✧﹒build-your-bot'], access: 'readonly', topic: `Want a bot like this? ${BUILD_A_BOT_URL}`, posts: ['buildYourBot'] },
      ],
    },
    {
      name: '˚₊‧ʚ hangout ɞ‧₊˚',
      was: ['‿︵ hangout ︵‿'],
      channels: [
        { name: 'ʚ☕ɞ﹒general', was: ['ノ✧﹒general'], topic: 'Chat about anything.' },
        { name: 'ʚ👋ɞ﹒introductions', was: ['ノ✧﹒introductions'], topic: 'Say hi! Who are you, and what do you make?' },
        { name: 'ʚ📷ɞ﹒media', was: ['ノ✧﹒media'], topic: 'Pictures, videos, and links.' },
      ],
    },
    {
      name: '˚₊‧ʚ characters ɞ‧₊˚',
      was: ['‿︵ characters ︵‿'],
      channels: [
        { name: 'ʚ🦋ɞ﹒oc-chat', was: ['ノ✧﹒oc-chat'], topic: 'Talk about your characters. Make a profile with /character create.', posts: ['characters'] },
        { name: 'ʚ🌟ɞ﹒spotlight', was: ['ノ✧﹒spotlight'], access: 'readonly', topic: 'A new character in the spotlight every week.', setting: 'spotlight' },
        { name: 'ʚ🎂ɞ﹒birthdays', was: ['ノ✧﹒birthdays'], access: 'readonly', topic: 'Character birthday announcements. Set one with /charbday set.', setting: 'birthdays' },
      ],
    },
    {
      name: '˚₊‧ʚ roleplay ɞ‧₊˚',
      was: ['‿︵ roleplay ︵‿'],
      channels: [
        { name: 'ʚ🎲ɞ﹒roleplay', was: ['ノ✧﹒roleplay'], topic: 'In-character roleplay. Use /roll and /encounter roll.', posts: ['roleplay'] },
        { name: 'ʚ💬ɞ﹒ooc', was: ['ノ✧﹒ooc'], topic: 'Out of character chat and planning.' },
        { name: 'ʚ🕯️ɞ﹒prompts', was: ['ノ✧﹒prompts'], topic: 'Get prompts with /rpprompt get. Suggest your own with /rpprompt submit.' },
      ],
    },
    {
      name: '˚₊‧ʚ creative ɞ‧₊˚',
      was: ['‿︵ creative ︵‿'],
      channels: [
        { name: 'ʚ🎨ɞ﹒art-share', was: ['ノ✧﹒art-share'], topic: 'Show off your art. Need an idea? /artprompt', posts: ['creative'] },
        { name: 'ʚ✍️ɞ﹒writing', was: ['ノ✧﹒writing'], topic: 'Stories, poems, and worldbuilding.' },
        { name: 'ʚ🧵ɞ﹒wips', was: ['ノ✧﹒wips'], topic: 'Works in progress and feedback.' },
      ],
    },
    {
      name: '˚₊‧ʚ events ɞ‧₊˚',
      was: ['‿︵ events ︵‿'],
      channels: [
        { name: 'ʚ🎉ɞ﹒events', was: ['ノ✧﹒events'], topic: 'Server events and game nights.' },
        { name: 'ʚ🎁ɞ﹒secret-santa', was: ['ノ✧﹒secret-santa'], topic: 'The winter gift exchange. Join with the button on the panel.', posts: ['secretSanta'] },
      ],
    },
    {
      name: '˚₊‧ʚ voice ɞ‧₊˚',
      was: ['‿︵ voice ︵‿'],
      channels: [
        { name: 'ʚ🎧ɞ lounge', was: ['◌ lounge ⋆˚'], type: 'voice' },
        { name: 'ʚ🖌️ɞ art stream', was: ['◌ art stream ⋆˚'], type: 'voice' },
      ],
    },
    {
      name: '˚₊‧ʚ staff ɞ‧₊˚',
      was: ['‿︵ staff ︵‿'],
      access: 'staff',
      channels: [
        { name: 'ʚ🔒ɞ﹒staff-chat', was: ['ノ✧﹒staff-chat'], access: 'staff', topic: 'Staff only.' },
        { name: 'ʚ📋ɞ﹒mod-log', was: ['ノ✧﹒mod-log'], access: 'staff', topic: 'Moderation notes and bot logs.' },
      ],
    },
  ],

  // Role panels posted in the `roles` message. Roles are matched by name.
  rolePanels: [
    {
      key: 'colors',
      title: '🎨 Name colors',
      description: 'Pick a color for your name.',
      exclusive: true,
      roles: [
        ['Cherry ★⋆', 'Cherry', '🍒'],
        ['Mango ★⋆', 'Mango', '🥭'],
        ['Lemon ★⋆', 'Lemon', '🍋'],
        ['Mint ★⋆', 'Mint', '🌿'],
        ['Baby Blue ★⋆', 'Baby Blue', '🫧'],
        ['Lilac ★⋆', 'Lilac', '🪻'],
        ['Taffy ★⋆', 'Taffy', '🍬'],
      ],
    },
    {
      key: 'pronouns',
      title: '💬 Pronouns',
      exclusive: false,
      roles: [
        ['◌ she/her ⋆˚', 'she/her'],
        ['◌ he/him ⋆˚', 'he/him'],
        ['◌ they/them ⋆˚', 'they/them'],
        ['◌ any/ask ⋆˚', 'any/ask'],
      ],
    },
    {
      key: 'interests',
      title: '✨ Interests',
      exclusive: false,
      roles: [
        ['ノ✧﹒artist', 'artist', '🎨'],
        ['ノ✧﹒writer', 'writer', '✍️'],
        ['ノ✧﹒gamer', 'gamer', '🎮'],
        ['ノ✧﹒crafter', 'crafter', '🧶'],
      ],
    },
    {
      key: 'pings',
      title: '🔔 Pings',
      description: 'Choose what you want to be pinged for.',
      exclusive: false,
      roles: [
        ['◌ announcements ⋆˚', 'announcements', '📢'],
        ['◌ events ⋆˚', 'events', '🎉'],
        ['◌ spotlight ⋆˚', 'spotlight', '🌙'],
        ['◌ rp pings ⋆˚', 'rp pings', '📜'],
      ],
    },
  ],

  // Message content. Each entry returns { embeds } (and may use the helpers passed in).
  messages: {
    welcome: ({ ui, ch }) => ({
      embeds: [
        ui.embed({
          title: '🌙 welcome to moth’s server',
          description: [
            'Home of **moth.exe**, the handmade bot by **Scriptmoth**. Poke at anything here: every feature can go into a bot for **your** server.',
            '',
            `✦ Read the ${ch('ʚ📜ɞ﹒rules')}`,
            `✦ Grab some roles in ${ch('ʚ🏷️ɞ﹒roles')}`,
            `✦ See what the bot can do in ${ch('ʚ✨ɞ﹒features')}`,
            `✦ Play with commands in ${ch('ʚ🧪ɞ﹒try-commands')}`,
          ].join('\n'),
          color: ui.COLORS.night,
          footer: 'moth.exe · made by hand',
        }),
      ],
    }),

    rules: ({ ui }) => ({
      embeds: [
        ui.embed({
          title: '📜 server rules',
          description: [
            '**1. Be kind.** No harassment, hate speech, or bullying.',
            '**2. Keep it safe for everyone.** No NSFW or gore.',
            '**3. Respect creators.** Credit art and never repost or trace without permission.',
            '**4. No spam or self-promo** outside the channels made for it.',
            '**5. Use the right channels.** Keep roleplay in roleplay and bot spam in try-commands.',
            '**6. Listen to staff.** If something feels off, message a moderator.',
            '',
            '*Breaking rules can lead to a warning, a timeout, or a ban, depending on how serious it is.*',
          ].join('\n'),
        }),
      ],
    }),

    announcement: ({ ui }) => ({
      embeds: [
        ui.embed({
          title: '📢 moth.exe is awake',
          description: [
            'The bot is online with its first set of features: character profiles, birthdays, spotlights, RP dice, encounters, prompts, role panels, and a Secret Santa exchange.',
            '',
            'More are on the way. Grab the **announcements** ping in roles to hear about them first.',
          ].join('\n'),
          color: ui.COLORS.night,
        }),
      ],
    }),

    features: ({ ui, catalog, categories }) => {
      const badge = ui.TIER_BADGES;
      const groups = Object.keys(categories).filter((c) => c !== 'core' && catalog.some((m) => m.category === c));
      return {
        embeds: [
          ui.embed({
            title: '✨ what moth.exe can do',
            description: [
              'Each feature is its own **module**. Pick the ones your community would actually use.',
              '',
              '🟢 **L1** small feature · 🔵 **L2** moderate feature · 🟣 **L3** complex module · 🟠 **L4** custom system',
              '',
              'Type `/moth features` anywhere to browse these in Discord.',
            ].join('\n'),
            color: ui.COLORS.night,
          }),
          ...groups.map((c) =>
            ui.embed({
              title: categories[c],
              fields: catalog
                .filter((m) => m.category === c)
                .map((m) => ({ name: `${badge[m.tier]} · ${m.name}`, value: `${m.description}\n${m.commands.slice(0, 4).map((x) => `\`${x}\``).join(' ')}${m.commands.length > 4 ? ' …' : ''}` })),
            }),
          ),
        ],
      };
    },

    tryCommands: ({ ui }) => ({
      embeds: [
        ui.embed({
          title: '🧪 try these',
          description: [
            '`/roll 4d6kh3` · roll dice the RPG way',
            '`/encounter roll` · see what you meet on the road',
            '`/artprompt` · get something to draw',
            '`/rpprompt get` · get a roleplay starter',
            '`/character create` · make an OC profile card',
            '`/character random` · let the moth pick a character',
            '`/charbday upcoming` · see whose birthday is next',
            '`/moth features` · browse every module',
          ].join('\n'),
        }),
      ],
    }),

    buildYourBot: ({ ui }) => ({
      embeds: [
        ui.embed({
          title: '🛠️ want a bot like this?',
          description: [
            'Your bot can use any module here, plus whatever your server needs on top: welcome flows, reaction roles, tickets, character inventories, quests, and crafting.',
            '',
            '**1.** Pick features in the builder',
            '**2.** Tell Moth about your community',
            '**3.** Get a quote, then your bot',
            '',
            `📦 Packages and prices: ${BOT_PACKAGES_URL}`,
            `🛠️ Start here: ${BUILD_A_BOT_URL}`,
          ].join('\n'),
          color: ui.COLORS.night,
        }),
      ],
    }),

    characters: ({ ui, ch }) => ({
      embeds: [
        ui.embed({
          title: '🦋 characters',
          description: [
            '`/character create` · make a profile card for your OC',
            '`/character list` · browse everyone’s characters',
            '`/charbday set` · give a character a birthday',
            '',
            `Birthdays are announced in ${ch('ʚ🎂ɞ﹒birthdays')}, and a character is featured in ${ch('ʚ🌟ɞ﹒spotlight')} every week.`,
          ].join('\n'),
        }),
      ],
    }),

    roleplay: ({ ui }) => ({
      embeds: [
        ui.embed({
          title: '📜 roleplay tools',
          description: [
            '`/roll 1d20+5` · dice with modifiers, `adv` and `dis` work too',
            '`/encounter roll biome:forest danger:risky` · a random encounter',
            '`/rpprompt get` · need a starter?',
            '',
            'Keep out-of-character talk in ooc 💬',
          ].join('\n'),
        }),
      ],
    }),

    creative: ({ ui }) => ({
      embeds: [
        ui.embed({
          title: '🎨 creative corner',
          description: 'Share your art here, and please credit others if you post theirs. Stuck? Try `/artprompt` for a subject, mood, palette, and twist.',
        }),
      ],
    }),

    secretSanta: ({ ui }) => ({
      embeds: [
        ui.embed({
          title: '🎁 secret santa',
          description: [
            'When the exchange opens, a sign-up panel will appear here.',
            '',
            '`/secretsanta wishlist` · tell your Santa what you like',
            '`/secretsanta mymatch` · see who you’re getting a gift for',
            '`/secretsanta sent` · mark your gift as sent',
          ].join('\n'),
          color: ui.COLORS.danger,
        }),
      ],
    }),
  },
};
