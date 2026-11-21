import { discordStyle, parseStyleIds } from "@/demos/discord/discord-styles";
import { embedStyle, parseEmbedIds } from "@/demos/discord/discord-embeds";

/** Channel style codes (02F) then embed codes (E03A) found in free text, deduplicated. */
export function parseShowcaseIds(text: string): string[] {
  return [...parseStyleIds(text), ...parseEmbedIds(text)];
}

/** Display name for a channel style or embed code. */
export function showcaseName(id: string) {
  return discordStyle(id)?.name ?? embedStyle(id)?.name;
}
