---
name: build-screen
description: Build a new Chalice Reader screen (or redo one) from its wireframe in docs/wireframes/, using DaisyUI and the app's design tokens. Use when asked to build, add, or redo a screen.
---

# Build a screen

1. Read `PRD.md` and find the feature and user flow this screen belongs to. If it isn't in the PRD, stop and ask.
2. Read the matching wireframe in `docs/wireframes/` (for example `02-library.png`, `05-reader.png`). If the screen is new and has no wireframe, ask me for a sketch first.
3. List every element you see in the wireframe, using its numbered callouts, before writing code.
4. Map each element to a DaisyUI component listed in `docs/components.md`, an existing component in `components/`, or plain Tailwind.
5. If a DaisyUI component isn't listed yet, use it and add a row to `docs/components.md`.
6. Build the screen with placeholder data, or with the real readings from `lib/readings.ts` if it needs them. One component per file in `components/`.
7. Do not touch other screens.

## How to talk to me

- Show me the element list and wait for my OK before coding.
- I'm a student with limited coding knowledge. Keep explanations short and plain.
- Tell me which files you created or changed, and why, in one line each.

## Design approach

- Calm and minimal: a quiet library, not a busy website. Lots of space. One clear action per area.
- Legible first: hefty type, generous line spacing, nothing smaller than 14px.
- Use the app's colors (`bg-paper`, `text-ink`, `text-muted`, `border-line`, `text-accent`) or the DaisyUI `chalice` theme (`btn-primary`, `bg-base-100`). No new hex colors.
- Accessibility first: real `<button>`s and `<label>`s, visible focus, good contrast in light and dark mode, touch targets at least 44px.
- Follow Norman's principles like the rest of the app: visible signifiers, instant feedback, mapping that makes sense (small → large), constraints, and an easy way to undo.
- Works at phone width (390px) and desktop (1280px). Both are shown in each wireframe.

## When you're done

- Run `npm run lint` and fix anything it finds.
- Update `PROGRESS.md`.
- Tell me which files you changed.
- Stop so I can check the screen manually against the wireframe, at phone and desktop width.
