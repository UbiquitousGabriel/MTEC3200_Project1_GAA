// lib/readings.ts
// Loads the Markdown files in /content/readings at build time.
// Each file = YAML frontmatter (title, type, authors, tags…) + Markdown body.
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

export type ReadingMeta = {
  slug: string;
  title: string;
  type: string; // category, e.g. "Poetry", "Reading", "Quote"
  authors: string[];
  date: string; // as written on UUA.org, e.g. "August 19, 2026"
  source: string; // e.g. "WorshipWeb", "Braver/Wiser"
  tags: string[]; // topics / themes
  summary: string;
  url: string; // original page on uua.org
};

const DIR = path.join(process.cwd(), "content", "readings");

// Cache so we only read the ~1,250 files once per build/server process.
let cache: ReadingMeta[] | null = null;

export function getAllReadings(): ReadingMeta[] {
  if (cache) return cache;
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".md"));
  cache = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(DIR, file), "utf8");
      const { data } = matter(raw);
      return toMeta(file.replace(/\.md$/, ""), data);
    })
    // newest first; fall back to title order
    .sort((a, b) => dateValue(b.date) - dateValue(a.date) || a.title.localeCompare(b.title));
  return cache;
}

export function getReading(slug: string): { meta: ReadingMeta; html: string } | null {
  const file = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const html = marked.parse(content, { async: false, breaks: false }) as string;
  return { meta: toMeta(slug, data), html };
}

/** Categories with counts, biggest first. */
export function getTypes(all = getAllReadings()) {
  return countBy(all.map((r) => r.type));
}

/** Topics (tags) with counts, biggest first. */
export function getTopics(all = getAllReadings()) {
  return countBy(all.flatMap((r) => r.tags));
}

// ---------- helpers ----------

function toMeta(slug: string, d: Record<string, unknown>): ReadingMeta {
  return {
    slug,
    title: String(d.title ?? slug),
    type: String(d.type ?? "Reading"),
    authors: Array.isArray(d.authors) ? d.authors.map(String) : [],
    date: String(d.date ?? ""),
    source: String(d.source ?? ""),
    tags: Array.isArray(d.tags) ? d.tags.map(String) : [],
    summary: String(d.summary ?? ""),
    url: String(d.url ?? ""),
  };
}

function dateValue(s: string) {
  const t = Date.parse(s);
  return Number.isNaN(t) ? 0 : t;
}

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
