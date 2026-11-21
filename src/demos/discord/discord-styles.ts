/**
 * Discord Style Library — channel and category naming styles shown on /portfolio/discord-styles.
 *
 * Each style has a permanent code: two digits for the family, a letter for the design (02F).
 * Codes are references in quotes and inquiries, so never renumber or reuse one. Retire a style
 * by leaving its code out, and add new ones at the end of a family (02K, 02L, …).
 *
 * Previews use generic example channels so the formatting is what stands out.
 * Keep this file dependency-free so Node can import it directly.
 */

export type DiscordStyle = {
  id: string;
  name: string;
  category: string;
  channels: string[];
};

export type DiscordStyleFamily = {
  number: string;
  title: string;
  blurb: string;
  styles: DiscordStyle[];
};

type Row = [letter: string, name: string, category: string, channels: string[]];

const family = (number: string, title: string, blurb: string, rows: Row[]): DiscordStyleFamily => ({
  number, title, blurb,
  styles: rows.map(([letter, name, category, channels]) => ({ id: `${number}${letter}`, name, category, channels })),
});

export const styleFamilies: DiscordStyleFamily[] = [
  family("01", "Cute & Kawaii", "Bows, hearts, tiny decorations, sweet emoji combinations, and soft typography.", [
    ["A", "Ribbon Notes", "୨୧ 🎀 LITTLE NOTES ୨୧", ["୨🍓୧﹒welcome", "꒰🧸꒱﹒general", "୨💌୧﹒mailbox"]],
    ["B", "Candy Hearts", "♡₊˚ CANDY CLUB ˚₊♡", ["♡﹒🍬﹒welcome", "♡﹒🍭﹒chat", "♡﹒🍰﹒gallery"]],
    ["C", "Dango Charm", "˚₊ 🍡 SWEET SHOP ₊˚", ["ε🍡з ┊ welcome", "ε🍮з ┊ general", "ε🍥з ┊ media"]],
    ["D", "Tiny Plushies", "꒰ 🧸 PLUSH ROOM ꒱", ["ʕ•ᴥ•ʔ﹒welcome", "ʕ·ᴥ·ʔ﹒general", "ʕっ•ᴥ•ʔっ﹒gallery"]],
    ["E", "Strawberry Milk", "꒰ 🍓 MILK BAR ♡ ꒱", ["♡_ : welcome . 🍓", "♡_ : chatter . 🥛", "♡_ : media . 🍰"]],
    ["F", "Pastel Sticker", "✿ 🧃 STICKER BOOK ✿", ["✦・🧁・welcome・♡", "✿・🎨・creations・✧", "✧・🧃・general・✿"]],
    ["G", "Little Bunny", "૮꒰ ˶• ༝ •˶꒱ა BUNNY", ["꒰ 🐰 ꒱﹒welcome", "꒰ 🥕 ꒱﹒chat", "꒰ 🌷 ꒱﹒garden"]],
    ["H", "Peach Café", "˚₊ʚ 🍑 PEACH PARLOR ɞ₊˚", ["╭・🥐︰welcome꒱꒱", "┊୨🍰୧︰sweet-talk", "╰・🍓︰treats꒱꒱"]],
    ["I", "Bakery Labels", "︰꒰₊˚⊹🥞﹕BAKERY", ["︰꒰₊˚⊹🥐﹕welcome", "︰꒰₊˚⊹🧇﹕chat", "︰꒰₊˚⊹🥯﹕gallery"]],
    ["J", "Kawaii Collage", "┊ : - 🎀 CUTIE CLUB !", ["・◡・welcome・🍒", "﹏・chat・⇆・🧃", "◎・selfies・✶・🍓"]],
  ]),
  family("02", "Connected & Branching", "Continuous trees, nested channels, corner pieces, stems, and visually connected groups.", [
    ["A", "Honey Branch", ": 🍯 ｡ SALON CAFÉ ✧", ["╭──・🌱﹒welcome", "├──・🍵﹒general", "├──・🌿﹒gallery", "╰──・🍮﹒lounge"]],
    ["B", "Cottage Tree", "🌿﹒THE LITTLE COTTAGE", ["╭・🏡﹒front-porch", "├・🍄﹒mushroom-patch", "╰・🌷﹒wildflowers"]],
    ["C", "Café Corners", "☕ ｡ COFFEE CORNER", ["╭┈・☕︰welcome", "┊・🍪︰chat", "╰┈・🍰︰gallery"]],
    ["D", "Growing Vines", "❀ 🌱 VINEYARD ❀", ["╭🌱・welcome", "│🌿・general", "╰🌸・gallery"]],
    ["E", "Curved Branches", "⌁ 🌼 FLOWER PATCH ⌁", ["╭─ ❀﹒welcome", "├─ ✿﹒general", "╰─ ❃﹒media"]],
    ["F", "Double Line", "╔═ 🗝️ GRAND HALL ═╗", ["╠═ 🚪・entrance", "║  🪞・parlor", "╚═ 🕯️・lounge"]],
    ["G", "Hanging Threads", "🧵﹒THREAD HOUSE", ["┬・🪡﹒welcome", "│・🧶﹒general", "┴・🎨﹒gallery"]],
    ["H", "Garden Columns", "ꕤ 🍃 GREENHOUSE ꕤ", ["┌🌿┐welcome", "│🌱│general", "└🌸┘gallery"]],
    ["I", "Café Garland", "☕ ✦ SALON CAFÉ ✦", ["╭┈ 🍵 : chat", "┊ ୨🍪୧ : media", "╰┈ 🍮 : lounge"]],
    ["J", "Open Brackets", "⌜ 🌷 THE MEADOW ⌟", ["⌜🐝・welcome", "│🪻・general", "⌞🦋・gallery"]],
  ]),
  family("03", "Ornate & Framed", "Decorative borders, elaborate headings, matching brackets, and elegant ornamentation.", [
    ["A", "Gilded Gallery", "╔═ 🖼️ THE GALLERY ═╗", ["╭ 🏛️・grand-entrance", "│ 🖼️・exhibitions ❖", "╰ 🗝️・archives"]],
    ["B", "Angelcore", "꒰ঌ 𓆩 ♡ 𓆪 ໒꒱ HEAVENLY", ["୨୧﹒🪽﹒pearly-gates﹒✧", "꒰ა ☁️ ໒꒱﹒cloud-nine", "ʚ ♡ ɞ﹒angelic-voices"]],
    ["C", "Fortune Teller", "✦ ╔══ 🔮 DIVINATION ══╗ ✦", ["┌ 🃏 THE FOOL ┐", "│ ☽ the-reading │", "└ ✨ THE WORLD ┘"]],
    ["D", "Pearl Borders", "╭══ 🦪 PEARL ROOM ══╮", ["〔◇〕 welcome 〔◇〕", "〔❖〕 general 〔❖〕", "〔♡〕 gallery 〔♡〕"]],
    ["E", "Royal Crest", "♛ ❖ THE COURT ❖ ♛", ["♕〔🏰〕 grand-hall", "♜〔📜〕 decrees", "♝〔🗝️〕 chambers"]],
    ["F", "Diamond Panels", "◇◆◇ 💎 JEWELRY BOX ◇◆◇", ["◈〔💍〕 welcome", "◇〔🪞〕 general", "◆〔✨〕 gallery"]],
    ["G", "Velvet Frame", "╔══ 🥀 VELVET ══╗", ["║ 🥀﹒welcome ║", "║ 🕯️﹒general ║", "╚ 🦇﹒midnight ╝"]],
    ["H", "Lace Corners", "❦༺ 🎀 PARLOR ༻❦", ["༺♡༻﹒welcome", "❧✿☙﹒general", "༺❀༻﹒gallery"]],
    ["I", "Stained Glass", "◇◆◇ 🪟 GLASS CHAPEL ◇◆◇", ["◈〔🌹〕 rose-window", "◇〔☀️〕 sunlit-hall", "◆〔🦋〕 blue-glass"]],
    ["J", "Mirror Frame", "✧༺ 🪞 MIRROR REALM ༻✧", ["༺ ✦ welcome ✦ ༻", "⟡ 🦢 reflections ⟡", "༺ 🌙 moonlight ༻"]],
  ]),
  family("04", "Botanical & Nature", "Flowers, vines, ocean creatures, seasonal symbols, and organic arrangements.", [
    ["A", "Aquarium Glass", "﹏﹏﹏ 🫧 AQUARIUM ﹏﹏﹏", ["°。𓆝﹒open-water", "𓆟　𓆞　reef", "𓇼　⋆　shells"]],
    ["B", "Tropical Paradise", "༄ 🌴 ISLAND HOURS ༄", ["𓇼・🌺・welcome・☼", "☀︎ 🥥﹒coconut-cove", "🐚﹒sea-breeze﹒𓆉"]],
    ["C", "Pressed Flowers", "❀ 🌱 HERBARIUM / VOL.I ❀", ["⌁ 01 / 🌼 daisy", "⌁ 02 / 🪻 lavender", "⌁ 03 / 🍀 clover"]],
    ["D", "Forest Spirits", "ꕤ 🌲 WOODLAND ꕤ", ["𖤣𖥧・🍄・welcome", "𖥧𖤣・🌿・general", "𖤣𖥧・🦌・gallery"]],
    ["E", "Cherry Blossom", "【🌸】花見 HANAMI", ["「⛩️」・entrance", "『🍵』・tea-room", "【🎐】・summer-wind"]],
    ["F", "Mossy Stones", "༄ 🌱 MOSS GARDEN", ["◌🌿﹒welcome", "⌁🍄﹒general", "◌🪨﹒gallery"]],
    ["G", "Butterfly Meadow", "ʚ 🦋 ɞ BUTTERFLY FIELD", ["ʚ🌼ɞ﹒welcome", "ʚ🪻ɞ﹒general", "ʚ🌷ɞ﹒gallery"]],
    ["H", "Seafoam", "𓇼 🐚 SEAFOAM 𓇼", ["﹏🫧・welcome", "°𓆝・general", "⋆🐚・gallery"]],
    ["I", "Autumn Leaves", "🍂 ❧ AUTUMN GROVE ☙", ["❧🍁﹒welcome", "☙🫖﹒general", "❧🦊﹒gallery"]],
    ["J", "Moon Garden", "☾ 🌿 MOON GARDEN ☽", ["☽・🌙・welcome", "✿・🦋・general", "☾・🪷・gallery"]],
  ]),
  family("05", "Celestial & Magical", "Stars, moons, crystals, divination, sparkles, and fantasy ornamentation.", [
    ["A", "Floating Starfield", "⋆ . ✧ . NIGHT SKY ⋆", ["✦ . . welcome", ". ⋆ . . general", ". . ✧ . gallery"]],
    ["B", "Constellation Thread", "✧ 🌌 THE STAR THREAD ✧", ["✦ · · · · origin", "· ✦ · · · orbit", "· · ✦ · · nebula"]],
    ["C", "Magical Girl", "✧₊⁺ 🌙 MAGIC CLUB ⁺₊✧", ["✦ 🎀﹒transformation ✦", "☆ 💖﹒heart-to-heart ☆", "✧ 🪄﹒spellbook ✧"]],
    ["D", "Moon Phases", "☽ ◐ ● ◑ ☾ LUNAR", ["☾〔🌙〕welcome", "◐〔🔮〕general", "●〔✨〕gallery"]],
    ["E", "Star Charms", "✦ ⋆ CHARM SHOP ⋆ ✦", ["₊˚⊹〔⭐〕﹒welcome", "₊˚⊹〔🌙〕﹒general", "₊˚⊹〔💫〕﹒gallery"]],
    ["F", "Witching Hour", "༺ ☾ WITCHING HOUR ☽ ༻", ["☽ ✧ spellbook ✧", "☾ 🔮 crystal-ball", "✦ 🕯️ coven-chat"]],
    ["G", "Crystal Ball", "⟡ 🔮 CRYSTAL ROOM ⟡", ["◇💎◇ welcome", "◆🪄◆ general", "◇✨◇ gallery"]],
    ["H", "Celestial Clock", "◷ ⚙️ CLOCK TOWER ◶", ["◴ 🕰️ dawn", "◷ ☀️ midday", "◵ 🌙 midnight"]],
    ["I", "Spell Circle", "⊹ ✧ ARCANE CIRCLE ✧ ⊹", ["⟡〔📜〕 incantations", "⊕〔🪄〕 spellcraft", "⊹〔🌙〕 moonlight"]],
    ["J", "Starlit Crown", "♕ ✦ STAR COURT ✦ ♕", ["♔・🌟・welcome", "♕・🌙・general", "♛・✨・gallery"]],
  ]),
  family("06", "Retro, Tech & Gaming", "Terminal commands, analog TV, arcade menus, pixel aesthetics, and nostalgic interfaces.", [
    ["A", "Cyberpunk", "// NEON_NET : CONNECTED", ["> auth/login", "$ ./general_chat", "/usr/share/media"]],
    ["B", "Lost Broadcast", "▤ 📺 CHANNEL GUIDE ▤", ["▌01▐ ON AIR", "▌02▐ STATIC", "▌99▐ OFF AIR"]],
    ["C", "Vaporwave", "▰ ＤＲＥＡＭ ＦＭ ▰", ["░ ＷＥＬＣＯＭＥ ░", "▒ ＣＨＡＴ ▒", "▓ ＧＡＬＬＥＲＹ ▓"]],
    ["D", "Arcade Cabinet", "▣ 🕹️ INSERT COIN ▣", ["▶ START : welcome", "◆ STAGE 01 : chat", "◇ BONUS : gallery"]],
    ["E", "Pixel Hearts", "♥ ░ PIXEL CLUB ░ ♥", ["[♥] welcome", "[♦] general", "[★] gallery"]],
    ["F", "System Files", "C:\\SERVER\\ROOT", ["[DIR] welcome", "[TXT] rules", "[EXE] general"]],
    ["G", "CRT Monitor", "▣ 📟 TERMINAL_01", ["█ welcome.sys", "▓ general.log", "▒ gallery.dat"]],
    ["H", "Game Boy", "▣ 🎮 POCKET WORLD", ["▶ 01 / welcome", "▶ 02 / general", "▶ 03 / gallery"]],
    ["I", "Neon Signs", "✦ ⚡ NIGHT CITY ✦", ["⚡ // welcome", "💿 // general", "🌃 // after-dark"]],
    ["J", "Radio Frequencies", "◉ 📻 RADIO MOTH", ["FM 88.1 / welcome", "FM 90.3 / general", "FM 99.9 / music"]],
  ]),
  family("07", "Simple & Minimal", "Clean typography, controlled punctuation, subtle symbols, and understated organization.", [
    ["A", "Classic Dot", "GENERAL  ·  01", ["・welcome", "・general", "・gallery"]],
    ["B", "Tiny Star", "✦ INFORMATION", ["✧ welcome", "✧ general", "✧ gallery"]],
    ["C", "Fine Lines", "── INFORMATION ──", ["│ welcome", "│ general", "└ gallery"]],
    ["D", "Numbered", "01 / INFORMATION", ["01. welcome", "02. general", "03. gallery"]],
    ["E", "Soft Brackets", "[ INFORMATION ]", ["( welcome )", "( general )", "( gallery )"]],
    ["F", "Centered Mark", "◇ GENERAL ◇", ["◇ welcome", "◇ general", "◇ gallery"]],
    ["G", "Japanese Minimal", "【 INFORMATION 】", ["「welcome」", "「general」", "「gallery」"]],
    ["H", "Small Caps", "✦ ɪɴғᴏʀᴍᴀᴛɪᴏɴ", ["› ᴡᴇʟᴄᴏᴍᴇ", "› ɢᴇɴᴇʀᴀʟ", "› ɢᴀʟʟᴇʀʏ"]],
    ["I", "Tiny Hearts", "♡ THE LOUNGE ♡", ["♡﹒welcome", "♡﹒general", "♡﹒gallery"]],
    ["J", "Negative Space", "[ A B S E N C E ]", ["[      ] entrance", "[  •   ] presence", "[ • •  ] conversation"]],
  ]),
  family("08", "Emoji-Rich & Playful", "Multiple emoji, decorative emoji brackets, visual storytelling, and bold combinations.", [
    ["A", "Emoji Explosion", "🎉 ✨ PARTY HOUSE ✨ 🎉", ["🎈・🎉・welcome・🥳", "🍕・🎮・general・💬", "📸・🌈・gallery・✨"]],
    ["B", "Rainbow Rooms", "🌈 🎨 COLOR CLUB 🌈", ["❤️🧡・welcome", "💛💚・general", "💙💜・gallery"]],
    ["C", "Fruit Basket", "🍓 🍒 FRUIT MARKET 🍑", ["🍓︰welcome︰🍒", "🍋︰general︰🍊", "🍇︰gallery︰🫐"]],
    ["D", "Dessert Bar", "🍰 🍩 SWEET TREATS 🍪", ["🍪 ♡ welcome ♡ 🧁", "🍮 ♡ general ♡ 🍓", "🍡 ♡ gallery ♡ 🍰"]],
    ["E", "Emoji Frames", "🎀〔🧸〕PLUSH SHOP〔🎀〕", ["〔🍓〕welcome〔🍓〕", "〔🧁〕general〔🧁〕", "〔💌〕gallery〔💌〕"]],
    ["F", "Pet Parade", "🐶 🐱 PET PARADE 🐰", ["🐾・🐶・welcome", "🐾・🐱・general", "🐾・🐹・gallery"]],
    ["G", "Snack Attack", "🍟 🍔 SNACK CLUB 🍕", ["🍔 × 🍟 welcome", "🍕 × 🥤 general", "🍩 × 🍪 gallery"]],
    ["H", "Festival Lights", "🎪 🎟️ FUNFAIR 🎠", ["🎈 ✦ welcome ✦ 🎉", "🎡 ✦ general ✦ 🎠", "🎟️ ✦ events ✦ 🎆"]],
    ["I", "Toybox", "🪀 🧸 TOYBOX 🎲", ["🎲﹒🧸﹒welcome", "🪀﹒🎮﹒general", "🎨﹒🧩﹒gallery"]],
    ["J", "Mixed Sticker Sheet", "✂️ 🧃 STICKER SHEET", ["・↣・welcome・🍒", "﹏・main-chat・✿・🧃", "▧・photo-dump・⌲"]],
  ]),
  family("09", "Artistic & Experimental", "Pattern-based naming, symbols that move across channels, unusual structures, and graphic typography.", [
    ["A", "Cross-Stitch", "✕ ✕ ✕ 🧵 STITCH CLUB ✕ ✕ ✕", ["✕□✕□﹒welcome", "□✕□✕﹒general", "✕✕□□﹒gallery"]],
    ["B", "Petri Dish", "SPECIMEN 〔 🧫 : LIVE 〕", ["(+) colony_001", "(÷) culture_002", "(∴) observation"]],
    ["C", "Geometric Tiles", "◇◆◇ TILE ROOM ◇◆◇", ["◇◆◇ welcome", "◆◇◆ general", "◇◇◆ gallery"]],
    ["D", "Moving Dots", "● ○ ○ ○ DOT MATRIX", ["● ○ ○ welcome", "○ ● ○ general", "○ ○ ● gallery"]],
    ["E", "ASCII Wings", "ʚ ɞ WING STUDY ʚ ɞ", ["ʚ✦ɞ welcome", "ʚ♡ɞ general", "ʚ❀ɞ gallery"]],
    ["F", "Typewriter", "¶ MANUSCRIPT / 01", ["[sic] welcome", "§ general", "¶ gallery"]],
    ["G", "Optical Rhythm", "▏▎▍▌ RHYTHM", ["▏▎ welcome", "▎▍ general", "▍▌ gallery"]],
    ["H", "Mirror Sequence", "〈 〉 REFLECTIONS 〈 〉", ["〈welcome〉", "《general》", "〈〈gallery〉〉"]],
    ["I", "Barcode Stripes", "▌│▏▌▏ STRIPE CLUB", ["▌▏│ welcome", "│▌▏ general", "▏│▌ gallery"]],
    ["J", "Glyph Mix", "⌁ ✣ GLYPH LAB ✣ ⌁", ["⌁⟡﹒welcome", "✣⊹﹒general", "⌘✧﹒gallery"]],
  ]),
  family("10", "Fantasy, Academia & Themed", "Distinctive environments and fictional worlds, with formatting that reinforces each concept.", [
    ["A", "Potion Cabinet", "╔══ ⚗️ APOTHECARY ══╗", ["〔🧪〕 elixir-no-01", "〔🌿〕 dried-herbs", "〔🔮〕 bottled-magic"]],
    ["B", "Dark Academia", "❦ THE ARCHIVES ❦", ["Ⅰ. 📜﹒the-preface", "Ⅱ. 🕯️﹒reading-room", "Ⅲ. 🖋️﹒marginalia"]],
    ["C", "Royal Playing Cards", "♠ ♥ ♣ ♦ THE CARD TABLE", ["♠〔🖤〕 spade-hall", "♥〔❤️〕 heart-room", "♦〔💎〕 diamond-den"]],
    ["D", "Celestial Post", "✉︎ POST OFFICE ✦ 001", ["⌜📮⌟ incoming-mail", "⌜💌⌟ love-letters", "⌜🌙⌟ midnight-post"]],
    ["E", "Fairy Tale Keys", "⚿ 🗝️ THE KEYRING ⚿", ["⚿〔🚪〕 front-gate", "⚷〔🌹〕 rose-room", "⚿〔📜〕 old-secrets"]],
    ["F", "Library Index", "📚 INDEX / VOLUME I", ["Ⅰ : prologue", "Ⅱ : reading-room", "Ⅲ : manuscripts"]],
    ["G", "Circus Marquee", "★☆★ 🎪 THE BIG TOP ★☆★", ["★ 01 ★ ticket-booth", "☆ 02 ☆ center-ring", "★ 03 ★ sideshow"]],
    ["H", "Cloud Weather", "☁︎ 🌦️ SKY WATCH ☁︎", ["☀︎ / 🌻 sunny-side", "☁︎ / ☕ cloudy-corner", "☂ / 🌧️ rainy-days"]],
    ["I", "Music Box", "╔══ 🎼 MUSIC BOX ══╗", ["♫〔🎹〕 ivory-keys", "♪〔🎻〕 strings", "♬〔🩰〕 ballerina"]],
    ["J", "Tea Ceremony", "【🍵】茶室 TEA HOUSE", ["「🍡」welcome", "『🫖』general", "【🌸】gallery"]],
  ]),
  family("11", "Soft Separators", "Tiny dividers between words and a sparkle at the end, like the café servers people love.", [
    ["A", "Koma Café", "—˚.ɞ KOMA CAFÉ ɞ˚. ᐟ", ["꒰🏷️꒱﹕guild﹒tags﹒˚⊹", "꒰🎁꒱﹕giveaways﹒˚⊹", "꒰🦋꒱﹕emotes﹒server﹒˚⊹"]],
    ["B", "Collab Corner", "—୨ COLLABORATIONS ୧—", ["꒰🤍꒱﹕cuties﹒＄100﹒˚⊹", "꒰😭꒱﹕rehab﹒giveaway﹒˚⊹", "꒰🫶꒱﹕partners﹒˚⊹"]],
    ["C", "Booster Perks", "₊˚ʚ BOOSTER PERKS ɞ˚₊", ["🌹﹕perks﹒info﹒⊹", "🌹﹕boosts﹒⊹", "🌹﹕vanity﹒⊹"]],
    ["D", "Bot Corner", "⌗ BOT STUFF ⌗", ["👾﹕bot﹒bait﹒⊹", "🤖﹕commands﹒⊹", "🎲﹕mini﹒games﹒⊹"]],
    ["E", "Little Nest", "◟ ✿ THE NEST ◞", ["◟🪺◞﹒welcome", "◟🐣◞﹒chirp﹒chat", "◟🪶◞﹒media"]],
    ["F", "Dotted Trail", "⋆ ˚｡⋆ LOUNGE ⋆｡˚ ⋆", ["⋆˚🍵﹒lounge﹒˚⋆", "⋆˚🎧﹒music﹒˚⋆", "⋆˚📷﹒selfies﹒˚⋆"]],
    ["G", "Soft Pipes", "┊ ┊ ✧ HANGOUT ✧", ["┊🍥┊chat", "┊🎮┊games", "┊🎨┊art"]],
    ["H", "Sparkle Tail", "✦ ₊ ANNOUNCEMENTS ₊ ✦", ["📢﹒news﹒✦", "🎉﹒events﹒✦", "📌﹒updates﹒✦"]],
    ["I", "Hearts Between", "♡ EXTRAS ♡", ["💌﹒♡﹒suggestions", "🎀﹒♡﹒polls", "🧸﹒♡﹒confessions"]],
    ["J", "Ribbon Shop", "୨୧ ┈ SHOP ┈ ୨୧", ["୨🛍️୧┈shop", "୨💳୧┈prices", "୨📦୧┈orders"]],
  ]),
  family("12", "Seasonal & Holiday", "Themed categories for events and seasons. Swap them in for a month, then switch back.", [
    ["A", "Spring Picnic", "🌷 ┊ SPRING PICNIC ┊ 🌷", ["🧺﹒picnic-chat", "🐝﹒garden", "🌦️﹒april-showers"]],
    ["B", "Summer Days", "☀︎ ≋ SUMMER DAYS ≋ ☀︎", ["🏖️≋beach", "🍉≋snacks", "🌊≋waves"]],
    ["C", "Spooky Season", "🎃 ⋆ SPOOKY SEASON ⋆ 🎃", ["👻﹒boo﹒🕸️", "🕯️﹒haunted-house", "🍬﹒trick-or-treat"]],
    ["D", "Winter Cabin", "❄︎ ˚ WINTER CABIN ˚ ❄︎", ["☕❄︎cocoa", "🧣❄︎fireside", "⛄❄︎snow-day"]],
    ["E", "Love Letters", "💘 ⊹ LOVE LETTERS ⊹ 💘", ["💌﹒valentines﹒♡", "🌹﹒roses﹒♡", "🍫﹒chocolates﹒♡"]],
    ["F", "New Year", "✨ 〔 NEW YEAR 〕 ✨", ["〔🎆〕countdown", "〔🥂〕toasts", "〔📅〕resolutions"]],
    ["G", "Lantern Festival", "🏮 ═ LANTERN FESTIVAL ═ 🏮", ["🏮﹒red-envelopes", "🥟﹒dumplings", "🐉﹒parade"]],
    ["H", "Harvest Moon", "🍂 ☾ HARVEST MOON ☽ 🍂", ["🥧☾pie-table", "🍁☾leaf-pile", "🌾☾hayride"]],
    ["I", "Holiday Lodge", "🎄 ❆ HOLIDAY LODGE ❆ 🎄", ["❆🎁﹒gift-swap", "❆🍪﹒cookies", "❆🦌﹒sleigh-ride"]],
    ["J", "Party Room", "🎂 ✦ PARTY ROOM ✦ 🎂", ["🎈﹒birthdays﹒🎈", "🎊﹒celebrations", "🍰﹒cake﹒time"]],
  ]),
];

export const discordStyles: DiscordStyle[] = styleFamilies.flatMap(group => group.styles);
const byId = new Map(discordStyles.map(style => [style.id, style]));

export function discordStyle(id: string) {
  return byId.get(id.trim().toUpperCase());
}

/** Pulls known style codes out of free text (“02f, 4B and 09-c”), deduplicated, in catalog order. */
export function parseStyleIds(text: string): string[] {
  const found = new Set<string>();
  for (const [, number, letter] of text.toUpperCase().matchAll(/(?<![A-Z0-9-])(\d{1,2})[\s-]?([A-Z])(?![A-Z0-9])/g)) {
    const id = `${number.padStart(2, "0")}${letter}`;
    if (byId.has(id)) found.add(id);
  }
  return discordStyles.map(style => style.id).filter(id => found.has(id));
}

/** Text Discord would change: text channels are lowercased and spaces become hyphens; names cap at 100 characters. */
export function channelNotes(name: string): string[] {
  const notes: string[] = [];
  if (/[ \u3000]/.test(name)) notes.push("Has spaces. Text channels turn spaces into hyphens, so use this one for voice channels or swap the spaces for ・ or ﹒.");
  if (/[A-Z\uFF21-\uFF3A]/.test(name)) notes.push("Has capital letters. Text channels show them lowercase; voice channels keep them.");
  if ([...name].length > 100) notes.push("Longer than Discord’s 100-character limit.");
  return notes;
}

/** The decoration around the channel name, with the name replaced by {name}. Null when no plain name is found. */
export function channelTemplate(name: string): string | null {
  const words = [...name.matchAll(/[a-z][a-z0-9_-]*(?:[./][a-z0-9_-]+)*/g)];
  if (!words.length) return null;
  const longest = words.reduce((best, word) => (word[0].length > best[0].length ? word : best));
  return name.slice(0, longest.index) + "{name}" + name.slice((longest.index ?? 0) + longest[0].length);
}
