# Progress

A running log of what's done, what's next, and what broke. Update after each task.

Milestones refer to `PRD.md`.

## Status

| Milestone | Status |
|---|---|
| 1. Content pipeline | Built. Not yet checked against the PRD's "Done when" list. |
| 2. Library | Built. Not yet checked against the PRD's "Done when" list. |
| 3. Reader | Built. Not yet checked against the PRD's "Done when" list. |
| 4. Highlights and notes | Built. Not yet checked against the PRD's "Done when" list. |
| 5. Today's reading | Next up |
| 6. Narration | Not started. Needs a TTS service picked first (PRD open question 1). |
| 7. Fresh content on every deploy | Not started. Test whether uua.org can be scraped from a server first (PRD open question 3). |
| 8. Ship it | Not started |

## Log

### 2026-10-06: All screens restyled with DaisyUI

- Header, Library, Topics, My notes, Reader and the 404 page now use DaisyUI components (navbar, menu, btn, input, select, card, badge, stats, join, range, textarea, list, indicator, hero…). Full list in `docs/components.md`.
- Turned on DaisyUI depth (soft shadows) in the `chalice` themes.
- The Reader's page colors (Paper / White / Sepia / Night) now feed DaisyUI's colors inside the Reader, so its buttons and panels match the page.
- Fixed: search box was squashed to half height on phones.
- Tested in light and dark mode at 1280px and 390px: search, category, topic, clear filters, show more, Surprise me, toolbar auto-hide and ⋯ handle, text settings saved, highlight, remove highlight, + Note, note autosave, My notes, Topics links, pop-out. No console errors. `npm run build` and `npm run lint` pass.

### 2026-10-06: Class 6 setup

- Wrote `PRD.md` from the research and `PRD-template.md`, then added decisions, new Milestones 5–7 (daily reading, narration, fresh content) and a User flows section.
- Moved the Next.js app from `mtec3200-project1/` to the repo root, and `Research/` to `docs/`.
- Split the wireframe PDF into one PNG per screen in `docs/wireframes/`.
- Installed DaisyUI 5 with custom `chalice` / `chalice-dark` themes that use the app's colors. Checked with before/after screenshots: no visible change on any page, in light or dark mode, at desktop and phone widths, including all four Reader page colors.
- Added `AGENTS.md` (from `AGENTS-template.md`), this file, `docs/components.md`, and an updated `README.md`.
- Added skills in `.github/skills/`: `build-screen` (filled in for this project), `frontend-design`, `webapp-testing`, `add-educational-comments`.
- `npm run build` and `npm run lint` both pass.

### 2026-09-29: MVP build

- Scraped all 1,251 UUA readings, converted them to Markdown, and built the Library, Topics, Reader and My notes pages. Details in `docs/prompting-log.md`.
- Fixed: ESLint `setState` in `useEffect`, header spacing overridden by `.reading-body`, highlight color buttons showing as dark circles.

## Known issues

- 4 readings have broken or blocked pages on uua.org, so they only show the listing summary.
- Notes and highlights stay on one device (by design for the MVP).
