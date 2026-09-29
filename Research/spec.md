# Functional Spec — Chalice Reader (MVP)

## Problem (from research)
I want to practice my faith during the week, not only on Sunday mornings when
I'm often running on no sleep. The UUA publishes a large library of approved
readings, but it's built as a website catalog, not a place to sit and read:
dense pages, images, sidebars, and no way to keep track of what spoke to you.

**HMW** support young Unitarian Universalists in practicing between gatherings,
on their own schedule?

## Who it's for
Someone who already cares about UU practice but can't always get to a
service — and wants a few quiet minutes with a reading, then to carry one line
into the week.

## Core flow
1. **Library** → search or filter by category (Poetry, Reflection, Quote…) or
   topic (Grief, Hope, Justice…) → pick a reading, or hit **Surprise me**.
2. **Read** → the toolbar hides after 2.5 s so only the text is on screen.
   Move to the top / scroll up / tap ⋯ to bring it back.
3. **Make it yours** → *Aa* changes font (serif, sans, dyslexia-friendly),
   size, line spacing, line width, and page color. Saved for next time.
4. **Mark it** → select words → pick a highlight color, or **+ Note** to quote
   it into your note. Click a highlight to remove it.
5. **Reflect** → the Notes panel autosaves. **My notes** collects everything;
   **Save as PDF** prints it; each reading can be downloaded as Markdown.
6. **Pop out** → opens the reading in its own small window, with nothing else.

## Must-haves → where they live
| MVP requirement | Implementation |
|---|---|
| Clean, legible, hefty font | Literata serif at 21px default; generous spacing; warm paper background |
| Notes that save | `localStorage`, autosaves 0.5 s after typing stops |
| Highlighter | 4 colors, stored as text offsets, repainted on load |
| Pop out a text | `window.open(…?popout=1)` — minimal chrome |
| Clear categories | Category chips with counts (from UUA's own genre labels) |
| Sort through topics | Topic dropdown + A–Z Topics page (UUA's own tags) |
| Choose how text looks | Font / size / spacing / width / page color |
| Tools auto-hide | Toolbar slides away after 2.5 s; returns on intent |

## Design rationale (Norman)
- **Signifiers** — the ⋯ button appears only when the toolbar is hidden, so
  there's always a visible way back to the tools on touch screens.
- **Feedback** — "Saving… / Saved on this device ✓" under the note; the Notes
  button shows a dot when a reading has notes or highlights; result counts
  update live as you filter.
- **Mapping** — A− / slider / A+ are laid out small → large; page color
  swatches *are* the colors they apply.
- **Constraints** — text size is clamped to 14–34 px; highlights can only be
  made inside the reading text (not the header or tags).
- **Error recovery** — every highlight can be removed (click it, or ✕ in the
  panel); "Clear filters" appears whenever filters hide results; empty states
  explain what to do next; a missing reading shows a friendly 404.
- **Conceptual model** — "a library" (browse) → "a book open on the table"
  (read). Notes live "in the margin" (side panel).

## Out of scope (for now)
- Auto-updating when UUA publishes new texts (re-run the scrape script)
- Accounts / syncing notes across devices
- Text-to-speech narration (idea from ideation — good next step)
