// scripts/word-stats.mjs
// ---------------------------------------------------------------------------
// Word Atlas: data/uua-readings-raw.json → docs/word-atlas/
//
// Run with:  npm run stats
//
// Counts the words and phrases in every reading and writes:
//   docs/word-atlas/stats.json   the numbers
//   docs/word-atlas/index.html   a one-page visual (open it in a browser)
//
// This is a side project, not part of the website. It reads the same raw
// JSON as build-content.mjs and changes nothing the app uses.
//
// How counting works:
//   • Words are lowercased. Filler words (STOP below) and words under three
//     letters are skipped so the real vocabulary shows through.
//   • Word totals count every use. Phrases count once per reading, so one
//     litany that repeats a line 20 times can't take over the list.
//   • PHRASE_SKIP removes a few "phrases" that are really book titles or
//     citation text, not language the readings use. They're listed below
//     so anyone can see exactly what was dropped.
// ---------------------------------------------------------------------------
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const INPUT = path.join(ROOT, "data", "uua-readings-raw.json");
const TEMPLATE = path.join(ROOT, "scripts", "word-atlas.template.html");
const OUT = path.join(ROOT, "docs", "word-atlas");

const STOP = new Set(
  `a about above after again against all am an and any are aren't as at be because been before being below between
  both but by can can't cannot could couldn't did didn't do does doesn't doing don't down during each few for from
  further had hadn't has hasn't have haven't having he he'd he'll he's her here here's hers herself him himself his
  how how's i i'd i'll i'm i've if in into is isn't it it's its itself let's me more most mustn't my myself no nor
  not of off on once only or other ought our ours ourselves out over own same shan't she she'd she'll she's should
  shouldn't so some such than that that's the their theirs them themselves then there there's these they they'd
  they'll they're they've this those through to too under until up very was wasn't we we'd we'll we're we've were
  weren't what what's when when's where where's which while who who's whom why why's with won't would wouldn't you
  you'd you'll you're you've your yours yourself yourselves also just like may might must one ones us will can even
  much many every upon yet still now way ever s t re ve ll d m let get got make made thing things something someone
  another said says say shall within without around back know see come came go going really two three`.split(/\s+/)
);

// Book titles and citation text that look like phrases but aren't.
const PHRASE_SKIP = new Set([
  "resistance a manifesto", // book title: Rest Is Resistance: A Manifesto
  "revision to article", // UUA bylaws citation
  "prud'homme s theological", // citation line
  "demanding a blessing", // book subtitle
  "illness and demanding", // book subtitle
  "singing the living", // hymnal title: Singing the Living Tradition
]);

// Opposite pairs for the "word duels" panel.
const DUELS = [
  [["love"], ["fear"]],
  [["life"], ["death"]],
  [["together"], ["alone"]],
  [["hope"], ["despair"]],
  [["light"], ["dark", "darkness"]],
  [["joy"], ["grief", "sorrow"]],
];

// ---------- read ----------

const items = JSON.parse(fs.readFileSync(INPUT, "utf8")).filter((x) => x.html && x.status === 200);

const words = new Map(); // word → total uses
const docFreq = new Map(); // word → number of readings that use it
const bigrams = new Map(); // phrase → number of readings
const trigrams = new Map();
const spiritOf = new Map();
const mayWe = new Map();
const types = new Map();
const typeWords = new Map(); // type → Map(word → uses)
const typeDocFreq = new Map(); // type → Map(word → readings)
const authors = new Map();
const tags = new Map();
const pron = { i: 0, me: 0, my: 0, we: 0, us: 0, our: 0, you: 0, your: 0 };
let total = 0;
let amen = 0;
const lengths = [];

for (const item of items) {
  const text = htmlToText(item.html).toLowerCase();
  const toks = text.match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
  total += toks.length;

  const parts = item.meta.split(" | ").map((s) => s.trim());
  const type = (parts[0] || "Reading").split(",")[0].trim();
  lengths.push({ words: toks.length, title: item.title, type });
  bump(types, type);

  const byPart = parts.find((p) => p.startsWith("By ")) ?? "";
  for (const a of byPart.replace(/^By /, "").split(/,\s*/)) if (a && a !== "Anonymous") bump(authors, a);
  for (const t of fixTags(item.tags ?? [])) bump(tags, t);

  for (const w of toks) if (w in pron) pron[w]++;
  if (/\bamen\b/.test(text)) amen++;
  for (const m of text.matchAll(/\bspirit of ([a-z]+)/g)) bump(spiritOf, m[1]);
  for (const m of text.matchAll(/\bmay we ([a-z]+)/g)) bump(mayWe, m[1]);

  if (!typeWords.has(type)) typeWords.set(type, new Map()), typeDocFreq.set(type, new Map());
  const seen = new Set();
  for (const w of toks) {
    if (!isContent(w)) continue;
    bump(words, w);
    bump(typeWords.get(type), w);
    seen.add(w);
  }
  for (const w of seen) bump(docFreq, w), bump(typeDocFreq.get(type), w);

  // Phrases: count each once per reading.
  const bi = new Set();
  const tri = new Set();
  for (let i = 0; i < toks.length - 1; i++) {
    const [a, b, c] = [toks[i], toks[i + 1], toks[i + 2]];
    if (isContent(a) && isContent(b)) bi.add(`${a} ${b}`);
    // Three-word refrains like "spirit of life": content word, small word, content word.
    if (c && isContent(a) && STOP.has(b) && isContent(c)) tri.add(`${a} ${b} ${c}`);
  }
  for (const p of bi) if (!PHRASE_SKIP.has(p)) bump(bigrams, p);
  for (const p of tri) if (!PHRASE_SKIP.has(p)) bump(trigrams, p);
}

// ---------- summarize ----------

lengths.sort((a, b) => a.words - b.words);
const allUses = sum(words);

const stats = {
  generated: new Date().toISOString().slice(0, 10),
  n: items.length,
  total,
  unique: words.size,
  avg: Math.round(total / items.length),
  longest: lengths.at(-1),
  amen,
  words: top(words, 160),
  bigrams: top(bigrams, 14),
  trigrams: top(trigrams, 14),
  spiritOf: top(spiritOf, 40).filter(([w]) => !STOP.has(w)).slice(0, 8),
  mayWe: top(mayWe, 40).filter(([w]) => !STOP.has(w)).slice(0, 8),
  duels: DUELS.map(([a, b]) => [a.join(" + "), count(a), b.join(" + "), count(b)]),
  pron,
  types: top(types, 7),
  distinctive: Object.fromEntries(top(types, 7).map(([t]) => [t, distinctive(t)])),
  authors: top(authors, 8),
  tags: top(tags, 14),
};

// Every word used 3+ times, for the lookup box: word → [uses, readings].
const lookup = {};
for (const [w, c] of words) if (c >= 3) lookup[w] = [c, docFreq.get(w)];

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "stats.json"), JSON.stringify(stats, null, 2));
const page = fs
  .readFileSync(TEMPLATE, "utf8")
  .replace("__STATS__", () => JSON.stringify(stats))
  .replace("__LOOKUP__", () => JSON.stringify(lookup));
fs.writeFileSync(path.join(OUT, "index.html"), page);

console.log(
  `Counted ${total.toLocaleString()} words in ${items.length} readings. Top word: "${stats.words[0][0]}". ` +
    `Wrote docs/word-atlas/stats.json and index.html.`
);

// ---------- helpers ----------

function isContent(w) {
  return w.length > 2 && !STOP.has(w);
}

function bump(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function sum(map) {
  let s = 0;
  for (const v of map.values()) s += v;
  return s;
}

function top(map, n) {
  return [...map].sort((a, b) => b[1] - a[1]).slice(0, n);
}

function count(list) {
  return list.reduce((s, w) => s + (words.get(w) ?? 0), 0);
}

// Words used far more in one type of reading than in the library overall.
// Must appear 10+ times and in 6+ readings of that type, so one long piece
// can't dominate.
function distinctive(type) {
  const tw = typeWords.get(type);
  const td = typeDocFreq.get(type);
  const typeUses = sum(tw);
  const scored = [];
  for (const [w, c] of tw) {
    if (c < 10 || td.get(w) < 6) continue;
    scored.push([w, c / typeUses / (words.get(w) / allUses)]);
  }
  return scored.sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w);
}

// Some tags contain commas, e.g. "2nd Principle (Justice, Equity, & Compassion)",
// and arrive split into pieces. Glue pieces back while a "(" is still open.
function fixTags(list) {
  const out = [];
  for (const t of list) {
    const last = out.at(-1);
    if (last && (last.match(/\(/g) ?? []).length > (last.match(/\)/g) ?? []).length) out[out.length - 1] += `, ${t}`;
    else out.push(t);
  }
  return out;
}

// Plain text from the scraped HTML. Braver/Wiser pieces have a "Prayer"
// heading above the closing prayer; drop it so it doesn't count as a word.
function htmlToText(html) {
  return html
    .replace(/<br\s*\/?>|<\/(p|div|li|h\d|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&(rsquo|lsquo|#8217|#8216|#39|apos);/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;/g, " ")
    .replace(/[‘’]/g, "'")
    .split("\n")
    .filter((line) => !/^\s*prayer:?\s*$/i.test(line))
    .join("\n");
}
