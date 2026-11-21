const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

const categories = {
  community: 'Community engagement',
  moderation: 'Moderation and staff tools',
  roleplay: 'Roleplay server systems',
  utilities: 'Utilities',
};

const feature = (id, name, moduleId, description, use, demo) => ({ id, name, moduleId, description, use, demo });

const groups = {
  community: [
    feature('community-qotd', 'Community question of the day', null, 'Posts a conversation starter on a schedule and gathers replies.', 'Give members an easy way to join the conversation.', 'Example question: What’s something you enjoyed this week?'),
    feature('trivia', 'Trivia', 'trivia', 'Presents multiple-choice questions and tracks scores and streaks.', 'Run quiz nights or make a server lore quiz.', 'Run `/trivia play`, then choose an answer.'),
    feature('minigames', 'Minigames', 'community-games', 'Offers quick games like coin flips and rock-paper-scissors.', 'Give members something to play while waiting for an event.', 'Run `/game coin`.'),
    feature('server-pet', 'Server pet', 'community-games', 'Gives a channel a shared pet to feed and play with.', 'Give a small community a recurring activity.', 'Run `/pet status`, then `/pet feed`.'),
    feature('leveling', 'Activity levels', 'activity', 'Awards XP for participation after a member opts in.', 'Recognize regular participation with ranks and leaderboards.', 'Run `/rank opt-in`, then `/rank profile`.'),
    feature('badges', 'Badges', 'activity', 'Shows achievements earned through activity or awarded by staff.', 'Recognize milestones and contributions to your server.', 'Run `/rank profile` to see the badge section.'),
    feature('polls', 'Polls', 'polls', 'Posts a question with a button for each choice.', 'Pick a game, date, or topic with a group.', 'Run `/poll` with choices such as `Meadow | Woods | Shore`.'),
    feature('signups', 'Group sign-ups', 'signups', 'Tracks who is going, might go, or has left a signup.', 'Gauge interest before committing to an event.', 'Run `/signup` in the demo channel.'),
    feature('event-scheduling', 'Event scheduling', 'signups', 'Posts an event with a start time displayed in each member’s time zone.', 'Organize workshops or game nights across time zones.', 'Run `/event schedule` with a future time and UTC offset.'),
    feature('event-rsvps', 'Event RSVPs and check-in', 'signups', 'Tracks responses before an event and attendance once it starts.', 'See how many people are coming and who actually checked in.', 'Run `/event upcoming` in #event-demo and open a test event to see its buttons.'),
    feature('gift-exchanges', 'Gift exchanges', 'secret-santa', 'Collects wishlists, matches participants, and delivers matches privately.', 'Run a seasonal or community gift swap.', 'See the guide in #gift-exchange-demo. A host runs the exchange.'),
  ],
  moderation: [
    feature('role-panels', 'Self-assign role panels', 'role-panels', 'Lets members pick roles from a button panel.', 'Offer opt-in notifications, interests, or one name color.', 'Try a button in #roles to see how selection works.'),
    feature('warnings', 'Moderation warnings', 'warnings', 'Records staff warnings and lets members see their own history.', 'Give moderators a consistent record of rule violations.', 'Run `/warning history` for your own record. Adding warnings requires staff permissions.'),
    feature('feedback', 'Private feedback', 'feedback', 'Collects reports and gives members a way to check their status.', 'Keep bug reports or suggestions organized away from public channels.', 'Run `/feedback send` when you have a real report, then check it with `/feedback status`.'),
    feature('gallery-review', 'Submission review', 'gallery', 'Queues credited submissions for staff approval before they appear in a gallery.', 'Review contest entries or a client server’s art showcase.', 'Run `/gallery browse` in the demo channel to see the approved view. Review requires staff permissions.'),
  ],
  roleplay: [
    feature('character-qotd', 'In-character question of the day', null, 'Posts a question that members answer in a character’s voice.', 'Develop characters between scenes or run character interviews.', 'Example question: What would your character never lend to anyone?'),
    feature('rp-prompts', 'Roleplay prompts', 'rp-prompt', 'Draws a scene starter from a prompt library.', 'Give writers a starting point when planning a scene.', 'Run `/rpprompt get` for a sample scene starter.'),
    feature('characters', 'Character profiles', 'characters', 'Stores reusable profiles with a bio, image, and owner.', 'Keep a cast list or link character information in a roleplay server.', 'Run `/character list` or make a fictional test profile with `/character create` in #rp-bot-demos.'),
    feature('character-birthdays', 'Character birthdays', 'character-birthdays', 'Tracks fictional birthdays and can announce them on a schedule.', 'Build an in-world calendar for your cast.', 'Run `/charbday calendar` to see the calendar view.'),
    feature('spotlight', 'Character spotlight', 'spotlight', 'Rotates featured profiles and keeps track of recent picks.', 'Introduce characters from a client server’s roster.', 'Run `/spotlight current` to see the current pick or the empty state.'),
    feature('dice', 'Dice roller', 'dice', 'Rolls dice expressions with modifiers and keep-highest or keep-lowest rules.', 'Resolve tabletop checks, damage, or randomized scene outcomes.', 'Run `/roll` with `4d6kh3`.'),
    feature('encounter', 'Random encounters', 'encounter', 'Rolls an encounter based on terrain and danger.', 'Give game masters ideas for travel scenes.', 'Run `/encounter roll` and select terrain and a danger level.'),
    feature('gathering', 'Gathering', 'adventure', 'Collects a material based on the current location.', 'Build foraging, mining, fishing, or harvesting into your world.', 'Run `/adventure gather`. Try a different location with `/adventure travel`.'),
    feature('crafting', 'Crafting', 'adventure', 'Checks a recipe and turns collected materials into gear.', 'Give players a use for gathered materials.', 'Gather materials first, then run `/adventure craft` and choose a recipe.'),
    feature('inventory', 'Inventory', 'adventure', 'Lists the materials and gear a player has collected.', 'Track what a character can use in a quest or recipe.', 'Run `/adventure inventory`.'),
    feature('equipment', 'Equipment', 'adventure', 'Equips owned gear so it can affect play.', 'Let players specialize or prepare for a challenge.', 'Craft gear, then run `/adventure equip`.'),
    feature('quests', 'Quests', 'adventure', 'Tracks a task from acceptance to turn-in.', 'Guide players through a repeatable or story-based objective.', 'Run `/adventure quest`, gather the requested items, then use the command again.'),
    feature('travel', 'Travel', 'adventure', 'Moves a player between areas with different resources.', 'Give locations distinct rewards and purposes.', 'Run `/adventure travel` and pick a destination.'),
    feature('combat', 'Combat', 'adventure', 'Resolves a creature encounter and awards loot or coins.', 'Give exploration a risk-and-reward loop.', 'Run `/adventure battle`.'),
    feature('currency', 'Currency', 'adventure', 'Tracks a coin balance earned through tasks and encounters.', 'Reward quest completion and give players something to save or spend.', 'Run `/adventure status` to see your balance.'),
    feature('shops', 'Shops', 'adventure', 'Exchanges coins for supplies.', 'Let a player buy a material instead of gathering it.', 'Run `/adventure buy` and choose where to shop.'),
    feature('factions', 'Factions', 'adventure', 'Lets a player join the faction in their current area.', 'Track allegiance to an in-world guild or settlement.', 'Choose a location with `/adventure travel`, then run `/adventure faction`.'),
  ],
  utilities: [
    feature('reminders', 'Personal reminders', 'reminders', 'Sends a private reminder at a chosen time.', 'Remember an event, deadline, or a task you want to revisit.', 'Run `/remind set`. Allow DMs from the server to receive it.'),
    feature('bookmarks', 'Message bookmarks', 'bookmarks', 'Saves message links to a private list.', 'Keep track of useful messages without asking staff to pin them.', 'Open a message’s Apps menu, choose **Bookmark Message**, then use `/bookmarks list`.'),
    feature('game-library', 'Game library', 'game-night', 'Records which games each member owns.', 'Keep a group list of games people can play together.', 'Run `/gameclub add`, then `/gameclub list`.'),
    feature('game-picker', 'Game picker', 'game-night', 'Picks a game that the selected group members all own.', 'Settle what to play without comparing libraries by hand.', 'After adding games, run `/gameclub pick` with someone who has added theirs.'),
    feature('availability', 'Availability matching', 'game-night', 'Finds overlapping time blocks for selected members.', 'Plan a game night or meeting across time zones.', 'Add a block with `/availability add`, then try `/availability match` with another participant.'),
    feature('art-prompt', 'Art prompts', 'art-prompt', 'Generates a drawing idea with a mood, palette, and twist.', 'Give a creative community a quick challenge.', 'Run `/artprompt` and use **Another one** to reroll.'),
  ],
};

function showcaseEntries(moduleIds) {
  return Object.entries(groups).flatMap(([category, entries]) => entries
    .filter(({ moduleId }) => !moduleId || moduleIds.has(moduleId))
    .map((entry) => ({ ...entry, category })));
}

function catalogueView(ui, entries, { category, demoLink, commissionLink } = {}) {
  const sections = Object.entries(categories).filter(([key]) => entries.some((entry) => entry.category === key));
  const selected = sections.some(([key]) => key === category) ? category : undefined;
  const shown = entries.filter((entry) => entry.category === selected);
  const embeds = ui.embedLayout({
    title: selected ? categories[selected] : 'Bot feature catalogue',
    description: selected
      ? 'Choose a feature below for its use cases and demo instructions.'
      : 'Browse the pieces Scriptmoth can build into a custom Discord bot. Pick a category, then open a feature.',
    fields: selected
      ? shown.map(({ name, description }) => ({ name, value: description }))
      : [
          ...sections.map(([key, name]) => ({
            name,
            value: entries.filter((entry) => entry.category === key).map((entry) => entry.name).join(' · '),
          })),
          { name: 'Try a demo or ask about a build', value: [demoLink, commissionLink].filter(Boolean).join(' ') || 'Run `/moth try` for demos or `/moth about` for commission links.' },
        ],
    tone: 'bot',
  }, { header: selected ? undefined : 'header.plumWindowAlt' });
  const menu = new StringSelectMenuBuilder().setCustomId('moth:category').setPlaceholder('Browse by category')
    .addOptions({ label: 'All categories', value: 'all', default: !selected }, ...sections.map(([value, label]) => ({ label, value, default: value === selected })));
  const components = [new ActionRowBuilder().addComponents(menu)];
  if (selected) {
    const features = new StringSelectMenuBuilder().setCustomId('moth:feature').setPlaceholder('Open a feature')
      .addOptions(shown.map(({ name, id }) => ({ label: name, value: id })));
    components.push(new ActionRowBuilder().addComponents(features));
  }
  return { embeds, components };
}

module.exports = { categories, showcaseEntries, catalogueView };
