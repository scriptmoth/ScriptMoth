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
      embeds: ui.embedLayout({
        title: 'Welcome to Scriptmoth!',
        description: 'This is where I show what my custom Discord bots can do. Browse the feature catalogue, try a demo, or ask me about building something for your server.',
        fields: [
          field('Browse the feature catalogue', 'Open ' + ch('features') + ' and choose a category to see what you could build.'),
          field('Try a demo', 'Open ' + ch('try-commands') + ' and run `/moth try`. For features made for RP servers, visit ' + ch('roleplay') + '.'),
          field('Ask about a custom bot', 'Visit ' + ch('build-your-bot') + ' for packages, the enquiry form, and my portfolio.'),
          field('Say hello or share art', 'Hang out in ' + ch('general') + ' or post your work in ' + ch('art-share') + '. Read ' + ch('rules') + ' before posting.'),
        ],
        thumbnail: ui.art('icon.botFeatures'),
        color: COLORS.moonlight,
      }, { header: 'header.starfield', footer: 'footer.starfield' }),
    }),

    rules: ({ ui, ch }) => ({
      embeds: ui.embedLayout({
        title: 'The house rules',
        description: 'Read these before posting or testing moth.exe.',
        color: COLORS.moonlight,
        author: { name: 'Scriptmoth' },
        thumbnail: ui.art('icon.rules'),
        fields: [
          field('Look after each other', 'Be kind. Harassment, hate speech, and bullying are off-limits. Keep the server free of NSFW content and gore.'),
          field('Respect creative work', 'Credit other creators. Get permission before reposting or tracing their work. Keep self-promotion to designated channels and avoid spam.'),
          field('Keep demos and sharing in the right place', 'Try general commands in ' + ch('try-commands') + ' or RP bot features in ' + ch('roleplay') + '. Use fictional profiles and sample content. Keep casual chat in ' + ch('general') + ' and share art in ' + ch('art-share') + '.'),
          field('A note from staff', 'Follow moderator directions. Report conduct concerns to a moderator privately. Share a message link if it helps them find the incident. Keep real names, payment details, and other private information out of bot tests. Breaking the rules can lead to a warning, timeout, or ban depending on severity.'),
        ],
      }, { header: 'header.scalloped', footer: 'footer.scalloped' }),
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
      embeds: ui.embedLayout({
        title: 'Try the bot',
        description: 'Type a command, choose the moth.exe result, and fill in the required options. Start with `/moth try`. Use fictional names and sample content when testing.',
        color: COLORS.moth,
        fields: [
          field('Play a little', '`/trivia play` · answer a quiz question\n`/pet feed` · feed Luna\n`/roll` with `4d6kh3` · roll RPG dice'),
          field('Try an RP bot feature', 'Open ' + ch('roleplay') + ' to see how sample profiles, quests, gathering, and crafting work.'),
          field('Find an idea', '`/artprompt` · find something to draw\n`/rpprompt get` · pick up a roleplay starter\n`/encounter roll` · see what’s on the road'),
          field('Make plans', 'Use `/signup` for a quick interest check. For `/event schedule`, enter a future date, time, and UTC offset using a format like `2026-12-04T19:00-05:00`. Discord shows each member the local time. Use `/event upcoming` in the same channel to find the event and RSVP or check in.'),
          field('Browse more features', 'Pick an individual feature in ' + ch('features') + ' for an example or command.'),
          field('Find a game and a time', 'Each person adds owned games with `/gameclub add` and free time with `/availability add`. Use `/gameclub pick` and `/availability match` to compare with the people you select.'),
          field('Try personal tools', 'Use `/rank opt-in` to earn XP from chat, then check `/rank profile`. Use `/remind set` for a personal reminder and allow server DMs to receive it. Open a message’s **Apps** menu to bookmark it.'),
          field('If something goes wrong', 'Check the required options and try in this channel. Use `/feedback send` with the command, what you expected, and what happened. Save the ID to check progress with `/feedback status`.'),
        ],
        thumbnail: ui.art('icon.services'),
      }, { header: 'header.lavenderWindow' }),
    }),

    buildYourBot: ({ ui }) => ({
      embeds: ui.embedLayout({
        title: 'Commission a custom Discord bot',
        description: 'Tell me what you’d like a bot to do for your server, and I’ll help you work out what to build.',
        color: COLORS.moonlight,
        thumbnail: ui.art('icon.pricing') ?? ui.art('icon.commissions'),
        fields: [
          field('Browse', '[See packages and pricing](' + BOT_PACKAGES_URL + ')'),
          field('Request a quote', '[Describe your project](' + BUILD_A_BOT_URL + '). Include who will use the bot, what they need it to do, and any constraints such as budget or hosting.'),
          field('See more work', '[Bot feature catalogue](' + FEATURE_CATALOGUE_URL + ') · [Portfolio of bots, websites, themes, and profiles](' + PORTFOLIO_URL + ')'),
        ],
        footer: 'Handmade by Scriptmoth',
      }, { headerImage: ui.art('header.creamRibbon') ?? ui.art('header.creamSparkle') }),
    }),

    roleplay: ({ ui, ch }) => ({
      embeds: ui.embedLayout({
        title: 'Bot demos for roleplay servers',
        description: 'Try sample systems you could commission for an RP server. Fictional profiles and inventories here are demo data.',
        fields: [
          field('Character profiles', 'Use `/character list` to browse demo records. Try `/character create` with a fictional name and one-line bio.'),
          field('Gathering', 'Run `/adventure gather` to collect a material, or travel to another area with `/adventure travel`.'),
          field('Crafting', 'Run `/adventure craft` to see a recipe. Collect its materials, then run it again to make the item.'),
          field('Inventory and quests', 'Use `/adventure inventory` to see what you collected or `/adventure quest` to accept a sample task.'),
          field('Prompts, dice, and encounters', 'Run `/rpprompt get`, `/roll`, or `/encounter roll`. Look in ' + ch('features') + ' for individual entries, including in-character Question of the Day.'),
        ],
        tone: 'bot',
      }, { header: 'header.starfield' }),
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
