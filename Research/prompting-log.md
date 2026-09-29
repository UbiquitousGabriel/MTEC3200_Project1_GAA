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
