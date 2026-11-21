import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { findTumblrTemplate, type TumblrPost } from "@/demos/tumblr/tumblr-templates";

const endpoint = "/demos/velvet-midnight/theme";
const directory = join(process.cwd(), "public", "assets", "portfolio", "velvet-midnight");
const originalPortrait = "https://i.postimg.cc/TwWt8C28/5.png";
const localPortrait = "/assets/portfolio/velvet-midnight/theme-portrait.png";
const posts = findTumblrTemplate("velvet-midnight")!.posts;
const htmlEntities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => htmlEntities[character]);

type Values = Record<string, string>;
type Context = { values?: Values; blocks?: Record<string, Context[]> };
type Node = string | { variable: string } | { block: string; children: Node[] };

function parseTemplate(source: string): Node[] {
  const root: Node[] = [];
  const stack: Node[][] = [root];
  const tokens = /\{(?:(\/?block):([A-Za-z0-9]+)(?:\s+[^{}]*)?|((?:(?:color|text|image):[A-Z][A-Za-z ]+|[A-Z][A-Za-z\d-]*)))\}/g;
  let end = 0;
  for (const match of source.matchAll(tokens)) {
    const children = stack[stack.length - 1];
    children.push(source.slice(end, match.index));
    if (match[1] === "block") {
      const block = { block: match[2], children: [] as Node[] };
      children.push(block);
      stack.push(block.children);
    } else if (match[1] === "/block") {
      if (stack.length > 1) stack.pop();
    } else {
      children.push({ variable: match[3] });
    }
    end = match.index + match[0].length;
  }
  stack[stack.length - 1].push(source.slice(end));
  return root;
}

function render(nodes: Node[], context: Context): string {
  return nodes.map(node => {
    if (typeof node === "string") return node;
    if ("variable" in node) return context.values?.[node.variable] ?? "";
    return context.blocks?.[node.block]?.map(child => render(node.children, {
      values: { ...context.values, ...child.values },
      blocks: { ...context.blocks, ...child.blocks },
    })).join("") ?? "";
  }).join("");
}

function options(source: string): Context {
  const values: Values = {};
  const blocks: Record<string, Context[]> = {};
  for (const [, key, value] of source.matchAll(/<meta name="([^"]+:[^"]+)" content="([^"]*)">/g)) {
    const [type, name] = key.split(":");
    values[key] = value.replace(originalPortrait, localPortrait);
    const condition = name.replace(/\s+/g, "") + (type === "image" ? "Image" : "");
    if (value && (type === "if" || type === "image" || type === "text")) blocks["If" + condition] = [{}];
  }
  values["text:About URL"] = endpoint + "?view=about";
  return { values, blocks };
}

function postContext(post: TumblrPost, index: number): Context {
  const permalink = `${endpoint}?view=fragment&id=${index + 1}`;
  const values: Values = {
    "PostID": String(index + 1), "PostType": post.kind, "Permalink": permalink,
    "Month": "November", "DayOfMonth": String(14 - index), "Year": "2026",
    "NoteCountWithLabel": "Read fragment", "ReblogURL": permalink,
  };
  const blocks: NonNullable<Context["blocks"]> = {
    Description: [], Date: [{}], HasTags: [{}],
    Tags: post.tags.map(tag => ({ values: { Tag: escapeHtml(tag), TagURL: `${endpoint}?tag=${encodeURIComponent(tag)}#fragments` } })),
  };
  if (post.kind === "photo") {
    Object.assign(values, {
      "PhotoURL-HighRes": post.art.src, "PhotoAlt": escapeHtml(post.alt),
      "Caption": "<p>" + escapeHtml(post.caption) + "</p>",
      "LinkOpenTag": `<a href="${post.art.src}" target="_blank" rel="noopener" aria-label="View full artwork">`,
      "LinkCloseTag": "</a>",
    });
    Object.assign(blocks, { Photo: [{}], Caption: [{}] });
  } else if (post.kind === "quote") {
    Object.assign(values, { Quote: escapeHtml(post.quote), Source: escapeHtml(post.source) });
    Object.assign(blocks, { Quote: [{}], Source: [{}] });
  } else {
    Object.assign(values, { Title: escapeHtml(post.title), Body: "<p>" + escapeHtml(post.body) + "</p>" });
    Object.assign(blocks, { Text: [{}], Title: [{}] });
  }
  return { values, blocks };
}

function internalLinks(html: string) {
  return html.replace(/href="\/(|archive|ask)"/g, (_, view: string) =>
    `href="${endpoint}${view ? `?view=${view}` : ""}${view === "archive" ? "#fragments" : ""}"`,
  );
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const view = params.get("view") ?? "home";
  const isAbout = view === "about";
  const source = await readFile(join(directory, isAbout ? "tumblr-about.txt" : "tumblr-theme.txt"), "utf8");
  const query = (params.get("q") ?? "").trim().slice(0, 120);
  const tag = (params.get("tag") ?? "").slice(0, 80);
  const fragmentId = Number(params.get("id"));
  let html: string;

  if (isAbout) {
    html = source.replaceAll("{Title}", "Charlie").replaceAll("{Favicon}", localPortrait).replaceAll(originalPortrait, localPortrait);
  } else {
    const defaults = options(source);
    const selectedPosts = posts.flatMap((post, index) => {
      if (view === "ask" || (view === "fragment" && index + 1 !== fragmentId)) return [];
      if (tag && !post.tags.includes(tag)) return [];
      const text = post.kind === "quote" ? post.quote + " " + post.source : post.title + " " + (post.kind === "photo" ? post.caption : post.body);
      if (query && !`${text} ${post.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())) return [];
      return [postContext(post, index)];
    });
    html = render(parseTemplate(source), {
      values: {
        ...defaults.values, Title: "Charlie", Favicon: localPortrait,
        Description: "A cabinet of curiosities from the Golden Land.",
        MetaDescription: "A cabinet of curiosities from the Golden Land.",
      },
      blocks: { ...defaults.blocks, Description: [{}], Posts: selectedPosts },
    }).replace('action="/search"', `action="${endpoint}#fragments"`)
      .replace('name="q"', `name="q" value="${escapeHtml(query)}"`)
      .replace('<section class="posts">', '<section class="posts" id="fragments">')
      .replace(/<a class="reblog" href="[^"]+" target="_blank" aria-label="Reblog">↻<\/a>/g, "");
    if (selectedPosts.length === 0) {
      const message = view === "ask" ? "The preview’s ask box is closed." : "No fragments found.";
      html = html.replace('<section class="posts" id="fragments">', `<section class="posts" id="fragments"><p class="opening">${message}</p>`);
    }
    if (params.has("embed")) {
      html = html.replace(/<script>[\s\S]*?<\/script>/g, "");
    }
  }

  return new Response(internalLinks(html), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self'; script-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'self'; base-uri 'none'",
    },
  });
}
