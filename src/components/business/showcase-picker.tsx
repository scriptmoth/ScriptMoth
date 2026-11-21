"use client";

import { useState } from "react";
import Link from "next/link";
import { parseShowcaseIds, showcaseName } from "@/lib/showcase-codes";

/**
 * Optional quote-builder field for Discord style library codes (e.g. 02F) and a note about them.
 * Field names stay `showcase_ids` / `showcase_notes` so saved inquiries keep working.
 */
export function ShowcasePicker({ initialIds = [], initialNotes = "" }: { initialIds?: string[]; initialNotes?: string }) {
  const [codes, setCodes] = useState(initialIds.join(", "));
  const picked = parseShowcaseIds(codes);
  return <fieldset className="showcase-field">
    <legend>Discord style codes (optional)</legend>
    <p className="field-hint">
      Saw something you liked in the <Link className="text-link" href="/portfolio/discord-styles">channel style library</Link> or the <Link className="text-link" href="/portfolio/discord-embeds">embed library</Link>? Enter its code, like 02F or E03A.
      You don’t need to use the exact style. Tell me what to change.
    </p>
    <label className="field">Style codes
      <input name="showcase_ids" value={codes} maxLength={400} placeholder="02F, E03A" autoComplete="off"
        onChange={event => setCodes(event.target.value)} onBlur={() => picked.length && setCodes(picked.join(", "))} aria-describedby="showcase-picked" />
    </label>
    <div id="showcase-picked" aria-live="polite">
      {picked.length > 0
        ? <ul className="showcase-picks" aria-label="Recognized styles">{picked.map(id => <li key={id}><code>{id}</code> {showcaseName(id)}</li>)}</ul>
        : codes.trim() && <p className="field-hint">No matching codes yet. Check the code on the style card.</p>}
    </div>
    <label className="field">What do you like about them? (optional)
      <textarea name="showcase_notes" rows={3} maxLength={1500} defaultValue={initialNotes}
        placeholder="For example: 02F for channels, E03A for rules and welcome, with fewer symbols." />
    </label>
  </fieldset>;
}
