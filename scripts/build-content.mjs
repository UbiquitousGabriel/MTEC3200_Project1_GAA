// scripts/build-content.mjs
// ---------------------------------------------------------------------------
// STEP 2 of the content pipeline: data/uua-readings-raw.json → content/readings/*.md
//
// Run with:  npm run content
//
// Each reading becomes one Markdown file with a YAML "frontmatter" header
// (title, type, authors, tags…) followed by the text itself. This is the
// "custom style guide" from the MVP doc: every text has the same clean shape.
// ---------------------------------------------------------------------------
import fs from "node:fs";
import path from "node:path";
import TurndownService from "turndown";

const ROOT = path.resolve(import.meta.dirname, "..");
const INPUT = path.join(ROOT, "data", "uua-readings-raw.json");
const OUT = path.join(ROOT, "content", "readings");

const turndown = new TurndownService({ headingStyle: "atx", emDelimiter: "*", bulletListMarker: "-" });
// Poems depend on their line breaks — keep every <br> as a hard line break.
turndown.addRule("lineBreak", { filter: "br", replacement: () => "  \n" });
// Drop empty wrappers and stray spans (keep their text).
turndown.addRule("unwrap", { filter: ["span", "div", "section"], replacement: (content) => content });

const items = JSON.parse(fs.readFileSync(INPUT, "utf8"));
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const used = new Set();
let written = 0;
let fallbacks = 0;

for (const item of items) {
  // "Reading | By Jane Doe, John Roe | August 19, 2026 | From WorshipWeb"
  const parts = item.meta.split(" | ").map((s) => s.trim());
  const genres = (parts[0] || "Reading").split(",").map((s) => s.trim()).filter(Boolean);
  const byPart = parts.find((p) => p.startsWith("By ")) ?? "";
  const authors = byPart.replace(/^By /, "").split(/,\s*/).filter(Boolean);
  const date = parts.find((p) => /\b(19|20)\d\d$/.test(p)) ?? "";
  const source = (parts.find((p) => p.startsWith("From ")) ?? "").replace(/^From /, "");

  // Body: the page's text if we got it, otherwise the listing summary.
  let body = item.html ? turndown.turndown(item.html) : "";
  body = tidy(body);
  if (!body) {
    body = item.summary;
    fallbacks++;
  }

  const slug = uniqueSlug(slugFrom(item));
  const frontmatter = {
    title: item.title,
    type: genres[0],
    genres,
    authors,
    date,
    source,
    tags: item.tags,
    summary: item.summary,
    url: item.url,
    uua_id: item.id,
  };

  fs.writeFileSync(path.join(OUT, `${slug}.md`), `---\n${toYaml(frontmatter)}---\n\n${body}\n`);
  written++;
}

console.log(`Wrote ${written} Markdown files to content/readings (${fallbacks} used the summary as the body).`);

// ---------- helpers ----------

function slugFrom(item) {
  const last = new URL(item.url).pathname.split("/").filter(Boolean).pop() ?? "";
  const fromUrl = last.replace(/\.shtml$/, "");
  const base = /^[a-z0-9-]+$/.test(fromUrl) && /[a-z]/.test(fromUrl) ? fromUrl : item.title;
  return base
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function uniqueSlug(slug) {
  let s = slug || "reading";
  for (let i = 2; used.has(s); i++) s = `${slug}-${i}`;
  used.add(s);
  return s;
}

function tidy(md) {
  return md
    .replace(/ /g, " ")
    .replace(/[ \t]+\n/g, (m) => (m.startsWith("  ") ? "  \n" : "\n")) // keep hard breaks only
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Tiny YAML writer: every string is double-quoted so colons, quotes and
// dashes in titles can never break the file.
function toYaml(obj) {
  const q = (s) => JSON.stringify(String(s));
  return Object.entries(obj)
    .map(([k, v]) =>
      Array.isArray(v) ? (v.length ? `${k}:\n${v.map((x) => `  - ${q(x)}`).join("\n")}` : `${k}: []`) : `${k}: ${q(v)}`
    )
    .join("\n")
    .concat("\n");
}
