import type { ReactNode } from "react";
import styles from "./discord-setup.module.css";

/** Lightweight Discord-flavored markdown for portfolio embeds (not a full parser). */
export function DiscordMarkdown({ text }: { text: string }) {
  return <span className={styles.md}>{renderBlocks(text)}</span>;
}

function renderBlocks(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const fence = /```(?:\w*\n)?([\s\S]*?)```/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = fence.exec(text))) {
    if (match.index > last) parts.push(...renderInlineBlocks(text.slice(last, match.index), key));
    parts.push(
      <pre key={`code-${key++}`} className={styles.mdCodeBlock}>
        <code>{match[1].replace(/\n$/, "")}</code>
      </pre>,
    );
    last = match.index + match[0].length;
    key += 10;
  }
  if (last < text.length) parts.push(...renderInlineBlocks(text.slice(last), key));
  return parts;
}

function renderInlineBlocks(text: string, keyBase: number): ReactNode[] {
  return text.split("\n").flatMap((line, lineIndex, lines) => {
    const nodes = line.startsWith("> ")
      ? [<span key={`${keyBase}-q-${lineIndex}`} className={styles.mdQuote}>{renderInline(line.slice(2), `${keyBase}-${lineIndex}`)}</span>]
      : renderInline(line, `${keyBase}-${lineIndex}`);
    if (lineIndex < lines.length - 1) return [...(Array.isArray(nodes) ? nodes : [nodes]), <br key={`${keyBase}-br-${lineIndex}`} />];
    return Array.isArray(nodes) ? nodes : [nodes];
  });
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const pattern =
    /(\|\|[\s\S]+?\|\||`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*]+\*|_[^_]+_|\[([^\]]+)\]\(([^)]+)\)|<#[^>]+>)/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;

    if (token.startsWith("||") && token.endsWith("||")) {
      nodes.push(<span key={key} className={styles.mdSpoiler}>{token.slice(2, -2)}</span>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={key} className={styles.mdInlineCode}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("***")) {
      nodes.push(<strong key={key}><em>{token.slice(3, -3)}</em></strong>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("__")) {
      nodes.push(<span key={key} className={styles.mdUnderline}>{token.slice(2, -2)}</span>);
    } else if (token.startsWith("~~")) {
      nodes.push(<s key={key}>{token.slice(2, -2)}</s>);
    } else if (token.startsWith("*") || token.startsWith("_")) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("[")) {
      nodes.push(
        <a key={key} className={styles.mdLink} href={match[3]} onClick={(event) => event.preventDefault()}>
          {match[2]}
        </a>,
      );
    } else if (token.startsWith("<#")) {
      nodes.push(<span key={key} className={styles.mdChannel}>{token.slice(2, -1)}</span>);
    } else {
      nodes.push(token);
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
