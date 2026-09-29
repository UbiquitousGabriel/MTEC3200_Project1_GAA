# Chalice Reader

A calm, distraction-free library of the Unitarian Universalist Association's
[WorshipWeb readings](https://www.uua.org/worship/words/readings) — 1,251
readings, poems, prayers, affirmations and reflections — with a reader built
for practicing between Sundays: adjustable type, a highlighter, notes, and a
toolbar that gets out of the way.

MTEC3200 · Project 1: Everyday Tools · Gabriel A. Aguilar

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (pre-renders every reading)
```

## How it's put together

```
data/uua-readings-raw.json      ← STEP 1 output: everything scraped from uua.org
scripts/scrape-uua.browser.js   ← STEP 1: paste into the browser console on uua.org
scripts/build-content.mjs       ← STEP 2: JSON → one Markdown file per reading
content/readings/*.md           ← the library (YAML header + Markdown text)

lib/readings.ts      reads the Markdown files (gray-matter) and renders them (marked)
lib/storage.ts       saves settings / notes / highlights in localStorage
lib/highlight.ts     turns a text selection into offsets, and paints <mark>s back in

app/page.tsx               Library: search, categories, topic filter
app/read/[slug]/page.tsx   One reading (pre-built for all 1,251 at build time)
app/topics/page.tsx        Every topic A–Z
app/notes/page.tsx         Everything you've highlighted or written
components/Reader.tsx      The reading view (settings, highlighter, notes, pop-out, auto-hide)
components/Library.tsx     Client-side search and filters
```

### The content pipeline

1. **Scrape** — `scripts/scrape-uua.browser.js` runs in the browser console on
   uua.org. It reads the listing pages (200 per page, in two sort orders
   because the default order shuffles between pages), then fetches each
   reading and keeps just the body HTML.
2. **Convert** — `npm run content` runs `scripts/build-content.mjs`, which uses
   Turndown to convert HTML → Markdown (keeping poem line breaks) and writes a
   YAML header on every file:

```yaml
---
title: "The Waiting Time"
type: "Reflection"
authors:
  - "Megan Lloyd Joiner"
date: "December 7, 2022"
source: "Braver/Wiser"
tags:
  - "Advent"
  - "Patience"
url: "https://www.uua.org/braverwiser/waiting-time"
---
```

### Where things are saved

Nothing is sent to a server. Reading settings, notes and highlights live in
the browser's `localStorage` (keys start with `cr:`), so they stay on the
device you used. Highlights are stored as character offsets into the reading's
text, e.g. `{ start: 120, end: 184, color: "yellow" }`.

## Deploy (Vercel)

Push to GitHub, then in Vercel: **Add New → Project → import this repo**. If
the repo root isn't this folder, set **Root Directory** to `mtec3200-project1`.
Framework preset: Next.js. No environment variables are needed.

## Credit

All texts © their authors, collected from the UUA WorshipWeb library; every
reading links back to its original page. This is a student prototype and is
not affiliated with the Unitarian Universalist Association.
