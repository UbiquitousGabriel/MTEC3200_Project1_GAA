# Components

The component library is **DaisyUI 5** (https://daisyui.com), a Tailwind plugin. It adds class names like `btn`, `card`, `badge` and `modal`. There's nothing to import in React: just use the classes.

## Setup

- Installed with `npm install -D daisyui` and turned on in `app/globals.css` with `@plugin "daisyui"`.
- Built-in themes are off. Two custom themes match the app's design tokens:
  - `chalice` (default): paper background `#f7f3ea`, ink `#1e1b16`, primary = chalice flame `#b4462b`
  - `chalice-dark` (used automatically when the device is in dark mode)
- Use theme colors through DaisyUI's names (`btn-primary`, `bg-base-100`, `text-base-content`) or the app's tokens (`bg-paper`, `text-ink`, `text-accent`).
- The Reader's `data-theme="light | paper | sepia | dark"` values are the reader's own page colors, not DaisyUI themes.

## DaisyUI components in use

None yet. Add a row the first time a DaisyUI component is used.

| Component | Classes | Used in | Notes |
|---|---|---|---|

## Custom components (built before DaisyUI)

| Component | File | What it does |
|---|---|---|
| SiteHeader | `components/SiteHeader.tsx` | Logo and Library / Topics / My notes navigation (every page except the Reader) |
| Library | `components/Library.tsx` | Search, category chips, topic filter, result cards, Surprise me, Show more |
| Reader | `components/Reader.tsx` | Reading view: auto-hiding toolbar, Aa text settings, highlighter, notes panel, pop out |
| NotesList | `components/NotesList.tsx` | Everything on the My notes page |
