# Components

The component library is **DaisyUI 5** (https://daisyui.com), a Tailwind plugin. It adds class names like `btn`, `card`, `badge` and `modal`. There's nothing to import in React: just use the classes.

## Setup

- Installed with `npm install -D daisyui` and turned on in `app/globals.css` with `@plugin "daisyui"`.
- Built-in themes are off. Two custom themes match the app's colors (with DaisyUI's `--depth: 1` for soft shadows on buttons and fields):
  - `chalice` (default): paper background `#f7f3ea`, ink `#1e1b16`, primary = chalice flame `#b4462b`
  - `chalice-dark` (used automatically when the device is in dark mode)
- Use theme colors through DaisyUI's names (`btn-primary`, `bg-base-100`, `bg-base-200`, `text-base-content/70`).

## DaisyUI components in use

| Component | Classes | Used in | Notes |
|---|---|---|---|
| Navbar | `navbar` | `SiteHeader`, Reader toolbar | |
| Menu | `menu menu-horizontal`, `menu-active` | `SiteHeader` | Library / Topics / My notes |
| Footer | `footer` | `SiteHeader` (`SiteFooter`) | |
| Button | `btn`, `btn-primary`, `btn-neutral`, `btn-ghost`, `btn-outline`, `btn-soft`, `btn-link`, `btn-circle`, `btn-square`, `btn-wide`, `btn-sm`, `btn-lg` | Every screen | Category chips are `btn btn-sm rounded-full` |
| Input | `input input-lg` | `Library` search | Icon sits inside the `label.input` |
| Select | `select` | `Library` topic filter | |
| Fieldset | `fieldset`, `fieldset-legend`, `label` | `Library` filters, Reader panels | |
| Card | `card`, `card-body`, `card-title`, `card-actions`, `card-border`, `card-dash` | `Library` results and filters, `NotesList`, empty states | |
| Badge | `badge`, `badge-primary`, `badge-soft`, `badge-outline`, `badge-ghost`, `badge-neutral`, `badge-sm`, `badge-lg` | Type labels, counts, Reader tags | |
| Stats | `stats`, `stat`, `stat-title`, `stat-value`, `stat-desc` | Topics page category tiles | |
| Join | `join`, `join-item` | Topics A–Z bar, Reader font / spacing / width pickers | |
| Divider | `divider`, `divider-start` | Topics letter headings, Reader footer | |
| Hero | `hero`, `hero-content` | 404 page | |
| Indicator + Status | `indicator`, `indicator-item`, `status status-primary` | Reader Notes button (dot when a reading has notes) | |
| Range | `range range-primary range-sm` | Reader text size | |
| Textarea | `textarea` | Reader notes panel | |
| List | `list`, `list-row` | Reader highlights list | |
| Loading | `loading loading-dots` | Reader "Saving…" | |
| Link | `link`, `link-hover` | Footer, `NotesList`, Reader | |

## How the Reader's page colors work with DaisyUI

The Reader keeps its own four page colors (Paper, White, Sepia, Night) in `data-theme`. In `app/globals.css`, the `.reader` rules set DaisyUI's color variables (`--color-base-100`, `--color-base-content`, `--color-primary`…) from the page color, so every DaisyUI component inside the Reader matches the page you picked, even when the rest of the site is in light or dark mode.

## Custom components

| Component | File | What it does |
|---|---|---|
| SiteHeader / SiteFooter | `components/SiteHeader.tsx` | Logo and navigation (every page except the Reader), footer credit |
| Library | `components/Library.tsx` | Search, category chips, topic filter, result cards, Surprise me, Show more |
| Reader | `components/Reader.tsx` | Reading view: auto-hiding toolbar, Aa text settings, highlighter, notes panel, pop out |
| NotesList | `components/NotesList.tsx` | Everything on the My notes page |
