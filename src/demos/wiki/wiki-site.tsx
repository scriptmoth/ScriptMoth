"use client";

import type { WikiTemplate } from "@/demos/wiki/wiki-templates";
import type { CSSProperties } from "react";
import { showcaseArt } from "@/demos/showcase-art";
import { assets } from "@/lib/assets";
import { CodexWiki } from "./wiki-codex";
import { useWikiRouter } from "./wiki-core";
import { EncyclopediaWiki } from "./wiki-encyclopedia";
import { ScrapbookWiki } from "./wiki-scrapbook";

/**
 * OC wiki demo. Each template picks its own layout component; they share routing and data.
 * `interactive={false}` renders the home page, inert, for gallery thumbnails.
 */

const skins = { encyclopedia: EncyclopediaWiki, codex: CodexWiki, scrapbook: ScrapbookWiki };
const covers = {
  encyclopedia: showcaseArt.gardenRoom,
  codex: assets.toyhouseMood.aurora.src,
  scrapbook: showcaseArt.blossomRiver,
};

export function WikiSite({ template, interactive = true }: { template: WikiTemplate; interactive?: boolean }) {
  const { route, go, random, root } = useWikiRouter(interactive);
  const Skin = skins[template.layout];
  return (
    <div ref={root} inert={!interactive || undefined} style={{ scrollMarginTop: 16, "--wiki-cover": `url(${covers[template.layout]})` } as CSSProperties}>
      <Skin template={template} route={route} go={go} random={random} />
    </div>
  );
}
