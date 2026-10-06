<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Instructions

Read this file before every task.

## About This Project

Chalice Reader is a calm, distraction-free library of the UUA's WorshipWeb readings, with a reader built for practicing between Sundays (adjustable type, highlighter, notes, a toolbar that hides itself). See `PRD.md` for full details, user flows and milestones.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4
- DaisyUI 5 (component library), with custom themes `chalice` and `chalice-dark` in `app/globals.css`
- Fonts from Fontsource: Literata (serif), Atkinson Hyperlegible (sans), OpenDyslexic
- Data: no database. The readings come from `data/uua-readings-raw.json`, which `scripts/build-content.mjs` turns into Markdown files in `content/readings/` (generated, not committed). `lib/readings.ts` reads them with gray-matter and renders them with marked.
- User data: settings, notes and highlights live in the browser's `localStorage` (keys start with `cr:`), handled in `lib/storage.ts`.
- APIs: none yet. Narration (PRD Milestone 6) will add a text-to-speech API. Its key goes in `.env.local` and Vercel's environment variables only.
- Hosting: Vercel, deployed from GitHub.

## Commands

- Run: `npm run dev` (rebuilds the readings first, then starts http://localhost:3000)
- Build: `npm run build` (rebuilds the readings, then pre-renders all ~1,257 pages)
- Lint: `npm run lint`
- Rebuild readings only: `npm run content`

## Where things live

- `app/` pages and routes: `/` Library, `/topics`, `/notes`, `/read/[slug]` Reader
- `components/` one component per file: `Library`, `Reader`, `NotesList`, `SiteHeader`
- `lib/` non-UI code: `readings.ts`, `storage.ts`, `highlight.ts`
- `scripts/` content pipeline: `scrape-uua.browser.js` (runs in the browser on uua.org), `build-content.mjs`
- `docs/` research, templates, `prompting-log.md`, `components.md`
- `docs/wireframes/` one PNG per screen (`02-library.png`, `05-reader.png`…) plus the full PDF
- `.github/skills/` task skills (start with `build-screen`)

## Code Style

- Use TypeScript.
- One component per file.
- Put reusable components in `components/`.
- Use Tailwind classes and DaisyUI component classes. No separate CSS files. Prefer Tailwind's spacing utilities over arbitrary pixel values for spacing and sizing; reserve arbitrary values for custom typography or layout geometry that has no suitable utility.
- `app/globals.css` is the one exception: it holds the design tokens, the DaisyUI themes, and the reader's typography. Add to it only when Tailwind or DaisyUI can't do the job.
- Use DaisyUI's theme colors (`bg-base-100`, `bg-base-200`, `border-base-300`, `text-base-content/70`, `btn-primary`, `badge-primary`…). Don't hard-code new hex colors.
- Use clear, descriptive names.
- Put sections into their own component, so that code is easy to read from a top-level and put them inside `components/`.

## Rules

- Don't add dependencies without asking. DaisyUI is already installed and needs no extra packages.
- Use DaisyUI components before building new ones.
- When you use a DaisyUI component for the first time, list it in `docs/components.md`.
- Every screen is built with DaisyUI components. Keep new screens consistent with them (see `docs/components.md`).
- The Reader uses `data-theme="light | paper | sepia | dark"` for its page colors. Those are not DaisyUI themes: `.reader` rules in `globals.css` feed each page color into DaisyUI's colors, so components inside the Reader match the page. Don't rename them, and don't add DaisyUI themes with those names.
- Build one screen at a time. Match the wireframe in `docs/wireframes/`.
- Read `PRD.md` before adding any feature. Don't add features that aren't in it.
- Don't change working screens unless asked.
- Never commit `.env.local` or API keys.
- Update `PROGRESS.md` after each task.

## How to Talk to Me

- I am a student with limited coding knowledge. Explain things to me knowing my level.
- Keep explanations short.
- Tell me which files you touched.
- Stop after each task so I can test it manually.
