export interface Artwork {
  src: string;
  width: number;
  height: number;
}

function artwork(path: string, width: number, height: number): Artwork {
  return { src: `/assets/${path}.png`, width, height };
}

export const assets = {
  logo: artwork("logos/scriptmoth", 1713, 687),
  mark: artwork("logos/mark", 1230, 1133),
  coding: artwork("mascot/coding", 290, 192),
  websites: artwork("illustrations/illustration-browser-code", 275, 239),
  bot: artwork("illustrations/illustration-robot", 310, 214),
  community: artwork("illustrations/illustration-discord", 248, 212),
  hosting: artwork("illustrations/illustration-cloud-servers", 265, 213),
  photoStack: artwork("illustrations/illustration-photo-stack", 300, 300),
  gallery: artwork("illustrations/illustration-browser-gallery", 250, 231),
  contact: artwork("illustrations/illustration-envelope", 305, 197),
  faq: artwork("illustrations/illustration-question-bubble", 240, 222),
  process: artwork("illustrations/illustration-checklist", 254, 222),
  sparkle: artwork("illustrations/illustration-star-heart", 217, 216),
  moon: artwork("illustrations/icon-moon", 72, 72),
  toyhouseCharacter: { src: "/assets/toyhouse/character.png", width: 820, height: 1300 },
  toyhouseBanner: { src: "/assets/toyhouse/banner.jpg", width: 1200, height: 675 },
  toyhouseDeco: { src: "/assets/toyhouse/deco.gif", width: 462, height: 260 },
  toyhouseCast: {
    pip: { src: "/assets/toyhouse/character.png", width: 820, height: 1300 },
    fuji: { src: "/assets/toyhouse/fuji.png", width: 900, height: 1300 },
    ceefore: { src: "/assets/toyhouse/ceefore.png", width: 800, height: 1300 },
    ao: { src: "/assets/toyhouse/ao.png", width: 860, height: 1260 },
    suisen: { src: "/assets/toyhouse/suisen.png", width: 900, height: 1250 },
  },
  toyhouseMood: {
    lanterns: { src: "/assets/toyhouse/deco/lanterns.jpg", width: 1400, height: 934 },
    lanternClose: { src: "/assets/toyhouse/deco/lantern-close.jpg", width: 1400, height: 933 },
    lanternBg: { src: "/assets/toyhouse/deco/lantern-bg.jpg", width: 1400, height: 933 },
    nightMarket: { src: "/assets/toyhouse/deco/night-market.jpg", width: 1400, height: 911 },
    sakura: { src: "/assets/toyhouse/deco/sakura-night.jpg", width: 1400, height: 927 },
    goldBokeh: { src: "/assets/toyhouse/deco/gold-bokeh.jpg", width: 1400, height: 933 },
    galaxy: { src: "/assets/toyhouse/deco/galaxy.jpg", width: 1400, height: 890 },
    aurora: { src: "/assets/toyhouse/deco/aurora.jpg", width: 1400, height: 933 },
    space: { src: "/assets/toyhouse/deco/space-bg.jpg", width: 1400, height: 910 },
    milkyWay: { src: "/assets/toyhouse/deco/milky-way.jpg", width: 1400, height: 933 },
    purpleNeon: { src: "/assets/toyhouse/deco/purple-neon.jpg", width: 1400, height: 933 },
    starHeart: { src: "/assets/toyhouse/deco/star-heart.png", width: 217, height: 216 },
    moonIcon: { src: "/assets/toyhouse/deco/moon-icon.png", width: 72, height: 72 },
    tileStars: { src: "/assets/toyhouse/deco/tile-stars.png", width: 64, height: 64 },
  },
  tumblr: {
    velvet: {
      header: { src: "/assets/tumblr/header-velvet.jpg", width: 1400, height: 500 },
      avatar: { src: "/assets/tumblr/avatar-velvet.jpg", width: 400, height: 400 },
      bg: { src: "/assets/tumblr/bg-stars.jpg", width: 1400, height: 900 },
      posts: [
        { src: "/assets/tumblr/post-velvet-1.jpg", width: 900, height: 1100 },
        { src: "/assets/tumblr/post-velvet-2.jpg", width: 900, height: 700 },
        { src: "/assets/tumblr/post-velvet-3.jpg", width: 900, height: 900 },
        { src: "/assets/tumblr/post-velvet-4.jpg", width: 900, height: 1200 },
      ],
    },
    garden: {
      header: { src: "/assets/tumblr/header-garden.jpg", width: 1400, height: 500 },
      avatar: { src: "/assets/tumblr/avatar-garden.jpg", width: 400, height: 400 },
      bg: { src: "/assets/tumblr/bg-garden.jpg", width: 1400, height: 900 },
      posts: [
        { src: "/assets/tumblr/post-garden-1.jpg", width: 900, height: 1100 },
        { src: "/assets/tumblr/post-garden-2.jpg", width: 900, height: 700 },
        { src: "/assets/tumblr/post-garden-3.jpg", width: 900, height: 900 },
        { src: "/assets/tumblr/post-garden-4.jpg", width: 900, height: 1200 },
      ],
    },
  },
  buttons: {
    plum: "/assets/buttons/plum.png",
    cream: "/assets/buttons/cream.png",
    lavender: "/assets/buttons/lavender.png",
  },
};
