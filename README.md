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

You don't need to know every file, but this is where the important things live.

```
MTEC3200_Project1_GAA/
├── .github/
│   └── skills/                          # Skills the AI agent can use
│       ├── add-educational-comments/    # Adds beginner-friendly comments to a file
│       ├── build-screen/                # Build a screen from a wireframe (made for this app)
│       ├── frontend-design/             # Design guidance
│       └── webapp-testing/              # Test the app in a browser with Playwright
├── .next/                               # Build output (auto-generated, don't edit)
├── app/                                 # Pages and routes (each folder is a URL)
│   ├── favicon.ico                      # Browser tab icon
│   ├── globals.css                      # Tailwind, DaisyUI themes, Reader page colors, reading typography
│   ├── layout.tsx                       # Shared layout and fonts for every page
│   ├── not-found.tsx                    # 404 page ("That reading isn't here")
│   ├── page.tsx                         # Library — home page (/)
│   ├── notes/
│   │   └── page.tsx                     # My notes (/notes)
│   ├── read/
│   │   └── [slug]/
│   │       └── page.tsx                 # One reading (/read/...), pre-built for all 1,251
│   └── topics/
│       └── page.tsx                     # Categories and every topic A–Z (/topics)
├── components/                          # Reusable pieces, one per file, built with DaisyUI
│   ├── Library.tsx                      # Search, category chips, topic filter, result cards
│   ├── NotesList.tsx                    # Everything on the My notes page
│   ├── Reader.tsx                       # Reading view: toolbar, text settings, highlighter, notes, pop-out
│   └── SiteHeader.tsx                   # Top navigation and footer
├── content/
│   └── readings/                        # One Markdown file per reading (auto-generated, not committed)
├── data/
│   └── uua-readings-raw.json            # Everything scraped from uua.org
├── docs/                                # Research, design docs and class templates
│   ├── wireframes/                      # 01-sitemap.png … 08-empty-error-states.png + full PDF
│   ├── components.md                    # Which DaisyUI components are used where
│   ├── prompting-log.md                 # What I asked the AI and what I learned
│   ├── ideas.md                         # Brainstorm and the idea I committed to
│   ├── interview-1.md, interview-2.md   # User interviews
│   ├── synthesis.md                     # What the interviews told me
│   ├── problem-statement.md             # The problem in one paragraph
│   ├── what-how-why.md                  # What / How / Why exercise
│   ├── Routine Audit (Part 1)*.md       # Daily routine audit
│   ├── mvp.md                           # MVP features
│   ├── spec.md                          # Functional spec
│   └── PRD-template.md, AGENTS-template.md, SKILL.md   # Class templates
├── lib/                                 # Code that isn't UI
│   ├── highlight.ts                     # Text selection → offsets, and paints <mark>s back in
│   ├── readings.ts                      # Reads the Markdown files (gray-matter) and renders them (marked)
│   └── storage.ts                       # Saves settings / notes / highlights in localStorage
├── node_modules/                        # Installed packages (auto-generated, don't edit)
├── public/                              # Images and static files
├── scripts/
│   ├── build-content.mjs                # JSON → one Markdown file per reading (runs before dev/build)
│   └── scrape-uua.browser.js            # Paste into the browser console on uua.org to re-scrape
├── .gitignore                           # Files git should skip
├── AGENTS.md                            # Standing instructions for the AI
├── CLAUDE.md                            # Points to AGENTS.md
├── eslint.config.mjs                    # Lint rules
├── next-env.d.ts                        # Next.js types (auto-generated)
├── next.config.ts                       # Next.js settings
├── package.json                         # Dependencies and scripts
├── package-lock.json                    # Exact package versions (auto-generated)
├── postcss.config.mjs                   # CSS processing for Tailwind
├── PRD.md                               # What we're building and why: features, user flows, milestones
├── PROGRESS.md                          # What's done, what's next, what broke
├── README.md                            # This file
└── tsconfig.json                        # TypeScript settings
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

Tailwind CSS v4 plus **DaisyUI 5**. Every screen is built from DaisyUI
components (navbar, buttons, inputs, cards, badges, stats…). DaisyUI's built-in
themes are off; the custom `chalice` and `chalice-dark` themes in
`app/globals.css` use the app's colors, and the Reader's page colors (Paper,
White, Sepia, Night) feed into DaisyUI inside the reading view. See
`docs/components.md`.

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
