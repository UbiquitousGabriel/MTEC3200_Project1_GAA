# Prompting Log

Format: what I asked → what came back → what I changed → what I understood.
(Keep adding entries as you go — the rubric looks for real iteration.)

---

## 2026-09-29 — MVP build session (Claude)

**What I asked**
> "Start building the MVP. Sort through https://www.uua.org/worship/words/readings,
> download everything, convert to MD, do the MVP. Use Vercel as the class says.
> Follow the class instructions (profdora Notion)."

Claude read `Research/mvp.md`, the Project 1 brief, and the existing Next.js
scaffold before writing code.

**What came back**

1. *Scraping.* The listing says 1,251 items. First pass only found 1,205
   unique IDs — the site's default sort isn't stable between pages, so some
   items appeared twice and others never. Fix: read the listing a second time
   sorted by title and merge by ID → all 1,251. Then fetched each reading's
   page and kept only the body HTML. 4 links on UUA's side are broken or
   blocked; those use the listing summary as their text.
2. *Convert to Markdown.* `scripts/build-content.mjs` uses Turndown. Poems
   broke at first because line breaks collapsed — added a rule that turns
   every `<br>` into a Markdown hard break (two spaces + newline). Every file
   gets the same YAML header (title, type, authors, date, source, tags, url).
3. *App.* Library (search + category chips + topic dropdown), Topics page,
   Reader, My notes page. All reading pages are pre-built with
   `generateStaticParams` (1,257 pages in ~12 s).
4. *Bugs found while testing:*
   - ESLint (React 19 rules) flagged `setState` inside `useEffect`. For
     "show more", switched to tying the page count to the current filter
     string, so changing filters resets it without an effect. For loading
     from `localStorage` (only possible in the browser, after first render)
     kept the effect and documented why.
   - Header text spacing was ignored — `.reading-body p { margin }` in
     globals.css was overriding Tailwind's `mt-3`, because the header also had
     the `reading-body` class. Split into `.reading-col` (font/width) and
     `.reading-body` (article typography).
   - Highlight color buttons rendered as dark circles: the CSS targeted
     `mark.hl-yellow` only, so the buttons (not `<mark>`s) got no color.

**What I changed / decided**
- _(fill in: anything you'd change about the look, the name "Chalice Reader",
  default font size, etc.)_

**What I understood**
- _(fill in, in your own words — e.g. how `paintHighlights` uses character
  offsets; why reading pages are static but the home page is dynamic; where
  notes are stored and why they don't sync between devices.)_

---

## 2026-10-06 — Class 6: PRD and context files (Claude)

**What I asked**
> "Help me make a PRD for an MVP app I want to build with AI. Look through all
> the files in the research folder and use the PRD-template.md to create the
> document in the root folder of my project."

Then I answered the PRD's open questions, asked Claude to check the project
against the Class 6 Miro board, picked DaisyUI as my component library, and
said "Do everything you can."

**What came back**

1. *PRD.* Claude read every research file and wrote `PRD.md` in the template's
   sections, with "Done when" checks for each milestone and a list of open
   questions.
2. *My answers → changes.* Keep the "practice between Sundays" framing; no UU
   interview; notes stay on one device; add a **daily reading** and
   **narration with two calm voices**; re-scrape on every deploy. These became
   Milestones 5–7 and a "Decisions made" section.
3. *Checking the class board.* The board said a PRD also needs **user flows
   that connect screens**, so a User flows section was added (one flow per
   task, linked to the wireframes).
4. *Context files.* `AGENTS.md` from the template, `PROGRESS.md`,
   `docs/components.md`, an updated `README.md`, and skills in
   `.github/skills/` (`build-screen` filled in for this app, plus
   `frontend-design`, `webapp-testing`, `add-educational-comments`).
5. *DaisyUI.* Installed with custom `chalice` / `chalice-dark` themes in my
   colors. Problem found: the Reader already uses `data-theme="dark"` etc. for
   its page colors, and DaisyUI uses `data-theme` for its themes too. Fix: turn
   off DaisyUI's built-in themes and name mine differently. Before/after
   screenshots of every page were identical.
6. *Refactor.* App moved to the repo root, `Research/` → `docs/`, wireframe PDF
   split into one PNG per screen.
7. *Something that went wrong.* After the PRD was updated, the file went back
   to its first version, probably because VS Code still had the old copy open
   and saved over it. Lesson: close or reload a file in the editor before an AI
   changes it.

**What I changed / decided**
- _(fill in)_

**What I understood**
- _(fill in, in your own words — e.g. what each context file is for, why
  DaisyUI's `data-theme` clashed with the Reader, what a user flow is.)_
