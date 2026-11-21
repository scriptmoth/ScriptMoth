// Layout for Moth's server: the moth.exe showcase server.
// Applied by `npm run setup-server -- setup/moths-server.js`. Safe to re-run: anything that
// already exists (matched by name) is kept, and posted embeds are edited in place.
//
// Channel `access`: 'readonly' (everyone reads, only staff post), 'staff' (hidden except staff),
// or omitted (normal chat). `posts` are message keys from the `messages` section below.

const { BUILD_A_BOT_URL, BOT_PACKAGES_URL, FEATURE_CATALOGUE_URL, PORTFOLIO_URL } = require('../src/links');
const { showcaseEntries, catalogueView } = require('../src/core/showcase');

const { COLORS } = require('../src/core/ui');
const rolePalette = { gold: 0xb58a52, mulberry: 0x82516a, violet: 0x796391, moss: 0x73805f };
const field = (name, value, inline = false) => ({ name, value, inline });

const nameColors = [
  { name: 'Cherry ★⋆', label: 'Cherry', color: 0xe1848a, emoji: '🍒' },
  { name: 'Mango ★⋆', label: 'Mango', color: 0xdf9c78, emoji: '🥭' },
  { name: 'Lemon ★⋆', label: 'Lemon', color: 0xe5ce91, emoji: '🍋' },
  { name: 'Mint ★⋆', label: 'Mint', color: 0x91c6ad, emoji: '🌿' },
  { name: 'Baby Blue ★⋆', label: 'Baby Blue', color: 0xa1c7df, emoji: '🫧' },
  { name: 'Lilac ★⋆', label: 'Lilac', color: 0xcbb5e2, emoji: '🪻' },
  { name: 'Taffy ★⋆', label: 'Taffy', color: 0xe6adc8, emoji: '🍬' },
  { name: '☾﹒Moon Linen', label: 'Moon Linen', color: 0xebdcc1, emoji: '🌙' },
  { name: '☾﹒Lantern Honey', label: 'Lantern Honey', color: 0xd7ab63, emoji: '🏮' },
  { name: '☾﹒Velvet Plum', label: 'Velvet Plum', color: 0xb992d0, emoji: '🍇' },
  { name: '☾﹒Mosswing', label: 'Mosswing', color: 0xa5b77e, emoji: '🌿' },
  { name: '☾﹒Inkwing', label: 'Inkwing', color: 0x9aaddb, emoji: '🖋️' },
  { name: '☾﹒Rosewing', label: 'Rosewing', color: 0xcb91a9, emoji: '🥀' },
];

const optionalPanels = [
  {
    key: 'dm-preferences',
    title: '☾  ·  DM preferences  ·  ✧',
    description: 'Share how you’d like others to approach you. These labels are preferences. Your Discord privacy settings control who can send you DMs.',
    color: rolePalette.mulberry,
    roleMarker: '❀',
    exclusive: true,
    roles: [
      ['☾﹒DMs open', 'DMs open', '✉️'],
      ['☾﹒ask before DMing', 'Ask first', '💬'],
      ['☾﹒DMs closed', 'DMs closed', '🔒'],
    ],
  },
  {
    key: 'region',
    title: '◇  ·  Region  ·  ☾',
    description: 'Share a broad region to help others plan hangouts and events. You can leave this blank.',
    color: rolePalette.violet,
    roleMarker: '✦',
    exclusive: true,
    roles: [
      ['◇﹒Africa', 'Africa'],
      ['◇﹒Asia', 'Asia'],
      ['◇﹒Europe', 'Europe'],
      ['◇﹒North America', 'North America'],
      ['◇﹒Central America & Caribbean', 'Central America & Caribbean'],
      ['◇﹒South America', 'South America'],
      ['◇﹒Oceania', 'Oceania'],
    ],
  },
  {
    key: 'testing',
    title: '✦  ·  Testing & feedback  ·  ✧',
    description: 'Opt in to invitations to try moth.exe features, test event flows, or give accessibility feedback. You can send feedback any time with `/feedback send`.',
    color: rolePalette.gold,
    roleMarker: '✧',
    exclusive: false,
    roles: [
      ['✦﹒feature tester', 'Feature tester', '🧪'],
      ['✦﹒event playtester', 'Event playtester', '🎲'],
      ['✦﹒accessibility feedback', 'Accessibility feedback', '💬'],
    ],
  },
  {
    key: 'collaboration',
    title: '❀  ·  Open to collaborate  ·  ✧',
    description: 'Let others know what you’re open to. Ask before starting a trade or giving critique.',
    color: rolePalette.moss,
    roleMarker: '◇',
    exclusive: false,
    roles: [
      ['❀﹒art trades', 'Art trades', '🎨'],
      ['❀﹒creative collabs', 'Creative collabs', '🧵'],
      ['❀﹒roleplay partners', 'Roleplay interests', '📖'],
      ['❀﹒critique welcome', 'Critique welcome', '🖋️'],
    ],
  },
];

module.exports = {
  name: 'Scriptmoth',

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
      { name: '◌ she/they ⋆˚', color: rolePalette.violet },
      { name: '◌ he/they ⋆˚', color: rolePalette.violet },
      { name: '◌ it/its ⋆˚', color: rolePalette.violet },
      { name: 'ノ✧﹒roleplayer', color: rolePalette.moss },
      { name: 'ノ✧﹒worldbuilder', color: rolePalette.moss },
      { name: 'ノ✧﹒photographer', color: rolePalette.moss },
      { name: 'ノ✧﹒musician', color: rolePalette.moss },
      { name: 'ノ✧﹒coder', color: rolePalette.moss },
      ...nameColors.map(({ name, color }) => ({ name, color, nameColor: true })),
      ...optionalPanels.flatMap(({ roles }) => roles.map(([name]) => ({ name }))),
    ],
    staff: ['✦﹒moth keeper', '✦﹒moderator'],
  },

  categories: [
    {
      name: 'Start Here',
      was: ['☾ ── ୨୧・MOONLIT FOYER', '˚₊‧ʚ welcome ɞ‧₊˚', '‿︵ welcome ︵‿'],
      channels: [
        { name: 'welcome', key: 'welcome', was: ['☽﹒welcome', 'ʚ🌙ɞ﹒welcome', 'ノ✧﹒welcome'], access: 'readonly', topic: 'Start here to find the bot feature catalogue, demos, and custom bot enquiries.', posts: ['welcome'] },
        { name: 'rules', key: 'rules', was: ['☽﹒rules', 'ʚ📜ɞ﹒rules', 'ノ✧﹒rules'], access: 'readonly', topic: 'Read the rules before posting or trying demos. Contact a moderator privately about urgent safety or conduct concerns.', posts: ['rules'] },
        { name: 'roles', key: 'roles', was: ['☽﹒roles', 'ʚ🏷️ɞ﹒roles', 'ノ✧﹒roles'], access: 'readonly', topic: 'Choose optional roles and notifications. This channel also demonstrates self-assign role panels.', posts: ['roles'] },
        { name: 'announcements', key: 'announcements', was: ['☽﹒announcements', 'ʚ📢ɞ﹒announcements', 'ノ✧﹒announcements'], access: 'readonly', topic: 'Scriptmoth updates, new bot features, and demo notices.', posts: ['announcement'] },
      ],
    },
    {
      name: 'Bot showcase',
      was: ['✦ ── ୨୧・MOTH.EXE', '˚₊‧ʚ moth.exe ɞ‧₊˚', '‿︵ moth.exe ︵‿'],
      channels: [
        { name: 'bot-features', key: 'features', was: ['✦﹒features', 'ʚ✨ɞ﹒features', 'ノ✧﹒features'], access: 'readonly', topic: 'Browse individual bot features by purpose. Pick a category and feature to see what it does, how you might use it, and how to try a demo.', posts: ['features'] },
        { name: 'try-the-bot', key: 'try-commands', was: ['✦﹒try-commands', 'ʚ🧪ɞ﹒try-commands', 'ノ✧﹒try-commands'], topic: 'Try moth.exe here. Run /moth try for quick demos and use fictional data when testing.', posts: ['tryCommands'] },
        { name: 'commissions', key: 'build-your-bot', was: ['✦﹒build-your-bot', 'ʚ🛠️ɞ﹒build-your-bot', 'ノ✧﹒build-your-bot'], access: 'readonly', topic: 'Ask Scriptmoth about a custom Discord bot. Find package prices, the enquiry form, and the portfolio.', posts: ['buildYourBot'] },
      ],
    },
    {
      name: 'Roleplay bot demos',
      was: ['☄ ── ୨୧・ROLEPLAY', '˚₊‧ʚ roleplay ɞ‧₊˚', '‿︵ roleplay ︵‿'],
      channels: [
        { name: 'rp-bot-demos', key: 'roleplay', was: ['☄﹒roleplay', 'ʚ🎲ɞ﹒roleplay', 'ノ✧﹒roleplay'], topic: 'Try features for RP servers: dice, prompts, fictional profiles, gathering, crafting, inventory, and quests. Use this channel for bot testing.', posts: ['roleplay'], settings: ['birthdays', 'spotlight'] },
      ],
    },
    {
      name: 'Event bot demos',
      was: ['♢ ── ୨୧・EVENTS', '˚₊‧ʚ events ɞ‧₊˚', '‿︵ events ︵‿'],
      channels: [
        { name: 'event-demo', key: 'events', was: ['♢﹒events', 'ʚ🎉ɞ﹒events', 'ノ✧﹒events'], topic: 'Try a sample event with /event schedule, then test RSVPs and check-in. Use /event upcoming to find the test card.' },
        { name: 'gift-exchange-demo', key: 'secret-santa', was: ['♢﹒secret-santa', 'ʚ🎁ɞ﹒secret-santa', 'ノ✧﹒secret-santa'], topic: 'See how a bot handles gift exchange sign-ups, wishlists, and private matches.', posts: ['secretSanta'] },
      ],
    },
    {
      name: 'Community hangout',
      was: ['❀ ── ୨୧・THE PARLOR', '˚₊‧ʚ hangout ɞ‧₊˚', '‿︵ hangout ︵‿'],
      channels: [
        { name: 'general', key: 'general', was: ['❀﹒general', 'ʚ☕ɞ﹒general', 'ノ✧﹒general'], topic: 'Casual chat and introductions. Share what you’re making in #share-your-work and try bot commands in #try-the-bot.' },
      ],
    },
    {
      name: 'Creative sharing',
      was: ['✿ ── ୨୧・THE ATELIER', '˚₊‧ʚ creative ɞ‧₊˚', '‿︵ creative ︵‿'],
      channels: [
        { name: 'share-your-work', key: 'art-share', was: ['✿﹒art-share', 'ʚ🎨ɞ﹒art-share', 'ノ✧﹒art-share'], topic: 'Casually share art, screenshots, character artwork, or works in progress. Credit other creators and ask before offering critique.', posts: ['creative'] },
      ],
    },
    {
      name: 'Voice lounge',
      was: ['♪ ── ୨୧・VOICE LOUNGE', '˚₊‧ʚ voice ɞ‧₊˚', '‿︵ voice ︵‿'],
      channels: [
        { name: '♪ ﹒lounge', key: 'lounge', was: ['ʚ🎧ɞ lounge', '◌ lounge ⋆˚'], type: 'voice' },
        { name: '♪ ﹒art stream', key: 'art-stream', was: ['ʚ🖌️ɞ art stream', '◌ art stream ⋆˚'], type: 'voice' },
      ],
    },
    {
      name: 'Staff',
      was: ['✧ ── ୨୧・STAFF', '˚₊‧ʚ staff ɞ‧₊˚', '‿︵ staff ︵‿'],
      access: 'staff',
      channels: [
        { name: 'staff-chat', key: 'staff-chat', was: ['✧﹒staff-chat', 'ʚ🔒ɞ﹒staff-chat', 'ノ✧﹒staff-chat'], access: 'staff', topic: 'Coordinate moderation and showcase testing. Server managers can review reports with /feedback inbox.' },
        { name: 'mod-log', key: 'mod-log', was: ['✧﹒mod-log', 'ʚ📋ɞ﹒mod-log', 'ノ✧﹒mod-log'], access: 'staff', topic: 'Record moderation actions and follow-ups. Use /warning history for bot-recorded warnings.' },
      ],
    },
  ],

  // Role panels posted in the `roles` message. Roles are matched by name.
  rolePanels: [
    {
      key: 'colors',
      title: '✿  ·  Name colors  ·  ✧',
      color: rolePalette.mulberry,
      roleMarker: '❀',
      exclusive: true,
      roles: nameColors.map(({ name, label, emoji }) => [name, label, emoji]),
    },
    {
      key: 'pronouns',
      title: '☾  ·  Pronouns  ·  ✧',
      color: rolePalette.violet,
      roleMarker: '✦',
      exclusive: false,
      roles: [
        ['◌ she/her ⋆˚', 'she/her'],
        ['◌ he/him ⋆˚', 'he/him'],
        ['◌ they/them ⋆˚', 'they/them'],
        ['◌ she/they ⋆˚', 'she/they'],
        ['◌ he/they ⋆˚', 'he/they'],
        ['◌ it/its ⋆˚', 'it/its'],
        ['◌ any/ask ⋆˚', 'any/ask'],
      ],
    },
    {
      key: 'interests',
      title: '❀  ·  Interests  ·  ✧',
      color: rolePalette.moss,
      roleMarker: '◇',
      exclusive: false,
      roles: [
        ['ノ✧﹒artist', 'artist', '🎨'],
        ['ノ✧﹒writer', 'writer', '✍️'],
        ['ノ✧﹒gamer', 'gamer', '🎮'],
        ['ノ✧﹒crafter', 'crafter', '🧶'],
        ['ノ✧﹒roleplayer', 'roleplayer', '🎭'],
        ['ノ✧﹒worldbuilder', 'worldbuilder', '🗺️'],
        ['ノ✧﹒photographer', 'photographer', '📷'],
        ['ノ✧﹒musician', 'musician', '🎵'],
        ['ノ✧﹒coder', 'coder', '💻'],
      ],
    },
    {
      key: 'pings',
      title: '✧  ·  Notifications  ·  ☾',
      color: rolePalette.gold,
      roleMarker: '✧',
      exclusive: false,
      roles: [
        ['◌ announcements ⋆˚', 'announcements', '📢'],
        ['◌ events ⋆˚', 'events', '🎉'],
        ['◌ spotlight ⋆˚', 'spotlight', '🌙'],
        ['◌ rp pings ⋆˚', 'RP bot demos', '📜'],
      ],
    },
    ...optionalPanels,
  ],

  // Message keys stay fixed so setup can edit the original posts.
  messages: {
    welcome: ({ ui, ch }) => ({
      embeds: ui.guide({
        title: 'Welcome to Scriptmoth',
        description: 'Scriptmoth builds custom Discord bots. Start in ' + ch('features') + ' to see what moth.exe can do. Pick a category, then open a feature.',
        thumbnail: ui.art('icon.botFeatures'),
        color: COLORS.moonlight,
      }, [
        { title: '✦ Try the bot', description: 'Run `/moth try` in ' + ch('try-commands') + '. For character profiles, gathering, and crafting, visit ' + ch('roleplay') + '.' },
        { title: 'Request a custom bot', description: 'Visit ' + ch('build-your-bot') + ' for package prices, the project form, and the portfolio.' },
        { title: 'Chat and share your work', description: 'Read ' + ch('rules') + ' before posting. Say hello in ' + ch('general') + ' or share art and works in progress in ' + ch('art-share') + '.' },
      ], { header: 'header.starfield', footer: 'footer.starfield' }),
    }),

    rules: ({ ui, ch }) => ({
      embeds: ui.guide({
        title: 'Scriptmoth server rules',
        description: 'Read these rules before posting or trying a demo. Breaking a rule can lead to a warning, timeout, or ban depending on severity.',
        color: COLORS.moonlight,
        thumbnail: ui.art('icon.rules'),
      }, [
        { title: 'Community conduct', description: [
          '**1. Treat people with respect.** Harassment, hate speech, and bullying are prohibited.',
          '**2. Keep content safe for work.** Do not post NSFW content or gore.',
          '**3. Follow moderator directions.**',
        ].join('\n\n') },
        { title: 'Posting, sharing, and bot tests', description: [
          '**4. Credit creators.** Get permission before reposting or tracing someone else’s work.',
          '**5. Avoid spam.** Keep self-promotion to designated channels.',
          '**6. Use the right channel.** Try bot commands in ' + ch('try-commands') + ' or RP features in ' + ch('roleplay') + '. Chat in ' + ch('general') + ' and share art in ' + ch('art-share') + '.',
          '**7. Keep private details out of demos.** Use fictional profiles and sample content. Leave out real names, payment details, and other private information.',
        ].join('\n\n') },
        { title: 'How to report a problem', description: 'Message a moderator privately about conduct concerns. Include a message link if it helps them find the incident.' },
      ], { header: 'header.scalloped', footer: 'footer.scalloped' }),
    }),

    roles: ({ ui }) => ({
      embeds: ui.embedLayout({
        title: 'Choose your roles',
        description: 'These roles are optional. Use the buttons below each card to add a role, or click the same button again to remove it.',
        fields: [
          field('Name colors', 'Choose one color. Picking a different color replaces your current pick.'),
          field('Pronouns, interests, and notifications', 'Choose as many as you like. Notification roles let staff mention you for the updates you choose.'),
          field('If a button fails', 'Try it once more, then tell staff which button you used and what it said.'),
        ],
        color: COLORS.moonlight,
        divider: 'divider.crescent',
      }, { header: 'header.lavenderWindow' }),
    }),

    announcement: ({ ui, ch }) => ({
      embeds: ui.embedLayout({
        title: 'Scriptmoth showcase updates',
        description: 'Explore what moth.exe can do, from polls and reminders to event sign-ups and roleplay bot systems.',
        fields: [
          field('Try a feature', 'Open ' + ch('try-commands') + ' for worked examples. Use `/feedback send` if something breaks or could be clearer.'),
          field('Get future updates', 'Pick the **announcements** notification in ' + ch('roles') + '.'),
        ],
        color: COLORS.night,
        thumbnail: ui.art('icon.announcements'),
        divider: 'divider.crescent',
      }, { header: 'header.moonStars' }),
    }),

    features: ({ ui, ch, catalog }) => catalogueView(ui, showcaseEntries(new Set(catalog.map(({ id }) => id))), {
      demoLink: 'Try a demo in ' + ch('try-commands') + '.',
      commissionLink: 'Ask about a build in ' + ch('build-your-bot') + '.',
    }),

    tryCommands: ({ ui, ch }) => ({
      embeds: ui.guide({
        title: 'Try the bot',
        description: 'Run `/moth try` for a short list, or pick a demo below. Select the moth.exe command in Discord and fill in its required options. Use fictional names and sample content.',
        color: COLORS.moth,
        thumbnail: ui.art('icon.services'),
      }, [{
        title: 'Games and creative prompts',
        fields: [
          field('Quick games', '- `/trivia play` to answer a quiz question\n- `/pet feed` to feed Luna\n- `/roll` with `4d6kh3` to roll RPG dice'),
          field('Creative tools', '- `/artprompt` for something to draw\n- `/rpprompt get` for a roleplay starter\n- `/encounter roll` for an encounter. Choose a biome.'),
        ],
      }, {
        title: 'Sign-ups and game nights',
        fields: [
          field('Schedule an event', 'Use `/signup` for an interest check or `/event schedule` to set a date. Enter a future time with its UTC offset, using the format `YYYY-MM-DDTHH:MM-05:00` with your own offset. Discord displays the local time for each member. Use `/event upcoming` in the same channel to find the RSVP and check-in buttons.'),
          field('Find a game and a time', 'Each person adds games with `/gameclub add` and free time with `/availability add`. Run `/gameclub pick` or `/availability match` with the people you want to compare.'),
        ],
      }, {
        title: 'Personal tools',
        description: '- Run `/rank opt-in` to earn chat XP, then `/rank profile` to see your progress.\n- Run `/remind set` and allow server DMs to receive reminders.\n- Open a message’s **Apps** menu and choose **Bookmark Message**.',
      }, {
        title: 'More demos and help',
        description: 'Browse ' + ch('features') + ' or visit ' + ch('roleplay') + ' for profiles, quests, gathering, and crafting.\n\nIf a command fails, check its required options. Use `/feedback send` to report what you tried and what happened. Keep the ID for `/feedback status`.',
      }], { header: 'header.lavenderWindow' }),
    }),

    buildYourBot: ({ ui }) => ({
      embeds: ui.guide({
        title: 'Commission a custom Discord bot',
        description: '[Open the project builder](' + BUILD_A_BOT_URL + ') to estimate a build and submit an inquiry. Tell me who will use the bot and what they need it to do.',
        color: COLORS.moonlight,
        thumbnail: ui.art('icon.pricing') ?? ui.art('icon.commissions'),
      }, [
        { title: 'Packages and pricing', description: '[See the current package rates and inclusions](' + BOT_PACKAGES_URL + '). Add your must-have features, budget, and any hosting constraints to your inquiry.' },
        { title: 'Explore examples', description: '[Bot feature catalogue](' + FEATURE_CATALOGUE_URL + ')\n[Portfolio of bots, websites, themes, and profiles](' + PORTFOLIO_URL + ')' },
        { title: 'Commission FAQ', description: '**How do I get a confirmed price?**\nSubmit an inquiry. Your written quote confirms scope, pricing, and the schedule.\n\n**When does work begin?**\nAccept the written quote and meet any start conditions listed in it.\n\n**Where do I report an issue with the demo?**\nRun `/feedback send` and keep the report ID to check with `/feedback status`.' },
      ], { headerImage: ui.art('header.creamRibbon') ?? ui.art('header.creamSparkle') }),
    }),

    roleplay: ({ ui, ch }) => ({
      embeds: ui.guide({
        title: 'Bot demos for roleplay servers',
        description: 'Try character profiles or play a round of Moonwing Adventure. Use fictional names and sample content. Find more examples in ' + ch('features') + '.',
        tone: 'bot',
      }, [
        { title: 'Character profiles', description: 'Run `/character list` to browse profiles or `/character create` to make one with a fictional name and one-line bio.' },
        { title: 'Gathering', description: 'Run `/adventure gather` to collect one material from your current area. Wait **5 seconds** between gathers. Use `/adventure travel` to find a different material and `/adventure inventory` to check your bag.' },
        { title: 'Crafting', description: 'Run `/adventure craft` and choose **Moon lantern** or **Tide charm**. A lantern takes **1 Silk and 2 Moonleaf**. A charm takes **1 Moonleaf and 2 Shell**. Use `/adventure equip` to equip the finished item.' },
        { title: 'Quests, prompts, and dice', description: 'Use `/adventure quest` to start a gathering quest. Gather **3 materials**, then run it again for **10 coins**.\n\nFor a standalone demo, try `/rpprompt get`, `/roll`, or `/encounter roll` with a biome.' },
      ], { header: 'header.starfield' }),
    }),

    creative: ({ ui, ch }) => ({
      embeds: ui.embedLayout({
        title: 'Share your work',
        description: 'Post art, screenshots, character artwork, or works in progress whenever you feel like sharing.',
        fields: [
          field('Credit and feedback', 'Credit other creators, ask before reposting, and offer critique when someone requests it.'),
          field('Try an art prompt', 'Run `/artprompt` in ' + ch('try-commands') + ' for a drawing idea.'),
        ],
        thumbnail: ui.art('icon.portfolio'),
        divider: 'divider.twinkles',
      }, { header: 'header.creamSparkle' }),
    }),

    secretSanta: ({ ui }) => ({
      embeds: ui.embedLayout({
        title: 'Gift exchange bot demo',
        description: 'See how a custom bot can manage a gift swap, including sign-ups, wishlists, private matches, and deadlines.',
        fields: [
          field('When a demo exchange is open', 'Check its budget and deadline, then join from the sign-up panel. Add gift ideas with `/secretsanta wishlist`. After the draw, `/secretsanta mymatch` shows your match privately. Use `/secretsanta sent` once you’ve sent the gift.'),
          field('Need help?', 'Contact the exchange host privately if you need to change plans. Keep the recipient and wishlist private.'),
        ],
        color: COLORS.moth,
      }, { header: 'header.moonStars' }),
    }),
  },
};
