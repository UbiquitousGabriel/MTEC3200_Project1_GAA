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
npm run lint
```

`dev` and `build` both run `scripts/build-content.mjs` first, so `content/readings/` is always regenerated from
`data/uua-readings-raw.json` — on your machine and on Vercel.

## Project structure

```
repo/
├── .github/
│   └── skills/                     # Skills the AI agent can use
│       ├── add-educational-comments/
│       ├── build-screen/           # Build a screen from a wireframe (project-specific)
│       ├── frontend-design/
│       └── webapp-testing/
├── app/                            # Pages and routes
│   ├── globals.css                 # Tailwind, DaisyUI themes, design tokens, reader typography
│   ├── layout.tsx                  # Shared layout and fonts
│   ├── page.tsx                    # Library (/)
│   ├── not-found.tsx               # 404 page
│   ├── notes/page.tsx              # My notes (/notes)
│   ├── read/[slug]/page.tsx        # One reading (/read/...) — pre-built for all 1,251
│   └── topics/page.tsx             # Every topic A–Z (/topics)
├── components/                     # One component per file
│   ├── Library.tsx                 # Search and filters
│   ├── NotesList.tsx               # Everything on My notes
│   ├── Reader.tsx                  # Reading view: settings, highlighter, notes, pop-out, auto-hide
│   └── SiteHeader.tsx              # Top navigation
├── content/readings/               # Generated Markdown, one file per reading (not committed)
├── data/uua-readings-raw.json      # Everything scraped from uua.org
├── docs/                           # Research, templates and design docs
│   ├── wireframes/                 # 01-sitemap.png … 08-empty-error-states.png + full PDF
│   ├── components.md               # Component library notes (DaisyUI)
│   ├── prompting-log.md            # What I asked the AI and what I learned
│   ├── mvp.md, spec.md, synthesis.md, interview-*.md, …
│   └── PRD-template.md, AGENTS-template.md, SKILL.md   # Class templates
├── lib/
│   ├── highlight.ts                # Text selection → offsets, and paints <mark>s back in
│   ├── readings.ts                 # Reads the Markdown files (gray-matter) and renders them (marked)
│   └── storage.ts                  # Saves settings / notes / highlights in localStorage
├── public/                         # Static files
├── scripts/
│   ├── build-content.mjs           # JSON → one Markdown file per reading
│   └── scrape-uua.browser.js       # Paste into the browser console on uua.org
├── AGENTS.md                       # Standing instructions for the AI
├── CLAUDE.md                       # Points to AGENTS.md
├── PRD.md                          # What we're building and why: features, user flows, milestones
├── PROGRESS.md                     # What's done, what's next, what broke
└── README.md
```

## Context files for AI

| File | What it's for |
|---|---|
| `PRD.md` | What the app is, who it's for, user flows, milestones, decisions and open questions |
| `AGENTS.md` | Rules the AI follows on every task: stack, commands, code style, how to talk to me |
| `PROGRESS.md` | Running log so a fresh AI session knows where things stand |
| `.github/skills/build-screen/SKILL.md` | How to build a screen from a wireframe, step by step |
| `docs/components.md` | Which DaisyUI components are in use |

## The content pipeline

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

## Styling

Tailwind CSS v4 plus **DaisyUI 5**. DaisyUI's built-in themes are off; the
custom `chalice` and `chalice-dark` themes in `app/globals.css` use the same
colors as the app's design tokens. See `docs/components.md`.

## Where things are saved

Nothing is sent to a server. Reading settings, notes and highlights live in
the browser's `localStorage` (keys start with `cr:`), so they stay on the
device you used. Highlights are stored as character offsets into the reading's
text, e.g. `{ start: 120, end: 184, color: "yellow" }`.

## Deploy (Vercel)

Push to GitHub, then in Vercel: **Add New → Project → import this repo**.
Framework preset: Next.js. The app is at the repo root, so leave **Root
Directory** empty. No environment variables are needed yet.

## Credit

All texts © their authors, collected from the UUA WorshipWeb library; every
reading links back to its original page. This is a student prototype and is
not affiliated with the Unitarian Universalist Association.
