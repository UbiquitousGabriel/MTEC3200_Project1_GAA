# PRD — Chalice Reader (MVP)

MTEC3200 · Project 1: Everyday Tools · Gabriel A. Aguilar

## Project Overview

Chalice Reader is a calm, distraction-free web library of the Unitarian Universalist Association's (UUA) WorshipWeb readings: poems, prayers, affirmations, quotes and reflections. It lets someone practice their faith between Sundays, on their own schedule, instead of only at services.

**The problem.** I want to embrace my religion, but most Sundays I drag myself to church exhausted after working or being out late on Saturday night. More broadly, I don't feel like I practice my spirituality enough during the week. My interviews pointed the same way: people get spiritual refreshment from gathering together, but they struggle to keep up solo habits like daily reading without the group's momentum. Neither participant saw the church building as necessary for real practice.

**The gap.** The UUA already publishes a large library of approved readings (about 1,251), but it's built as a website catalog rather than a place to sit and read. The pages are dense, with images and sidebars, and there's no way to keep track of what spoke to you. Many people also don't know which readings the UUA recognizes in the first place.

**How Might We:** support young Unitarian Universalists in practicing between gatherings, on their own schedule?

**Goal of the MVP:** someone can open the site, find a reading by category or topic (or at random), read it with nothing else on screen, mark the lines that matter, and leave with a note they can come back to. A **daily reading** gives them a reason to come back each day, and **narration** lets them listen with their eyes closed when they're too tired to read.

## Target users

- **Primary:** young Unitarian Universalists (and spiritually curious "freethinkers") who already care about UU practice but can't always make it to a service, whether because of night jobs, late Saturdays, or irregular schedules.
- **What they want:** a few quiet minutes with a reading, then one line to carry into the week.
- **Habits and context (from interviews):**
  - They don't see a building as required for faith; practice can happen at home, at a home church, or anywhere.
  - They feel "refreshed" or "reset" after a service, and want some of that feeling mid-week.
  - They admit they read on their own less than they think they should ("I read the Bible far less than I believe I should").
  - They reflect out loud after a reading, such as talking it over on the drive home, so taking notes and pulling out quotes should feel natural.
- **Devices:** phone and laptop, at odd hours (late night after a shift, slow mornings). The app needs to work well on touch screens and be easy to read when tired.
- **Accessibility:** people reading late at night or with reading differences need control over font, size, spacing and page color, including a dyslexia-friendly option.

## Skills Required

- NextJs (required): App Router, static pre-rendering of every reading page (`generateStaticParams`)
- Vercel (required): hosting and deploys from GitHub
- React 19 and TypeScript
- Tailwind CSS v4
- **DaisyUI 5** component library, with a custom "chalice" theme (light and dark) that matches the app's colors
- Content pipeline:
  - A browser-console scraping script for uua.org listing and reading pages
  - Node script using **Turndown** to convert HTML to Markdown, with a YAML header on every file
  - **gray-matter** (reading the YAML headers) and **marked** (rendering Markdown)
- Browser `localStorage` for settings, notes, highlights and the chosen narration voice (no database, no accounts)
- A neural text-to-speech (TTS) service for natural-sounding narration (provider still to be chosen), called from a Next.js API route
- Storage for generated audio so each reading is only voiced once per voice (for example, Vercel Blob)
- Vercel environment variables for the TTS API key (never committed to GitHub)
- A Node version of the scraper that runs during the Vercel build
- Text selection and character-offset math for the highlighter
- Web fonts: Literata (serif), Atkinson Hyperlegible (sans), OpenDyslexic
- ESLint, Git and GitHub, and prompting an AI coding assistant (Claude) with a prompting log
- UX design principles (Norman): signifiers, feedback, mapping, constraints, error recovery, conceptual model

## User flows

Wireframes for every screen are in `docs/wireframes/` (one PNG per page, plus the full PDF).

### Screens

| Screen | Route | Wireframe |
|---|---|---|
| Library (home) | `/` (filters in the URL: `?q=`, `?type=`, `?topic=`) | `02-library.png` |
| Topics | `/topics` | `03-topics.png` |
| My notes | `/notes` | `04-notes.png` |
| Reader | `/read/[slug]` | `05-reader.png`, `06-reader-highlights-settings.png`, `07-reader-notes-panel.png` |
| Pop-out reader | `/read/[slug]?popout=1` | `05-reader.png` |
| Not found | any unknown slug | `08-empty-error-states.png` |

The site header (Library · Topics · My notes) is on every page except the Reader. The sitemap is in `01-sitemap.png`.

### Flow 1: Find something to read

1. Open the **Library** (`/`).
2. Search, tap a **category** chip, or pick a **topic**. The result count updates as you go.
3. Or tap **Surprise me** to open a random reading from the current results.
4. Or go to **Topics** (`/topics`), pick a topic, and land back on the Library filtered to it.
5. Tap a result card to open it in the **Reader**.
6. If nothing matches: an empty state explains why and offers **Clear filters**.

### Flow 2: Today's reading (Milestone 5)

1. Open the **Library**. The **Today's reading** card is at the top.
2. Tap it to open the **Reader**, which shows a small "Today's reading" label.
3. Come back tomorrow for a new one.

### Flow 3: Read

1. The Reader opens with only the text. The toolbar slides away after about 2.5 seconds.
2. Scroll up, move to the top, or tap **⋯** to bring the toolbar back.
3. Tap **Aa** to change font, size, spacing, line width or page color. The choice is saved.
4. Tap **⧉ Pop out** to open the reading alone in its own small window.

### Flow 4: Mark it and reflect

1. Select words in the reading, then pick a highlight color, or tap **+ Note** to quote them into the note.
2. Open the **Notes** panel at the side and write. It saves itself ("Saved on this device ✓").
3. Click a highlight (or ✕ in the panel) to remove it.
4. Later, open **My notes** (`/notes`) to see every note and highlight, and tap a title to go back to that reading.

### Flow 5: Listen (Milestone 6)

1. In the Reader, tap **Listen** and pick one of two voices the first time.
2. Narration plays. A small play/pause control stays on screen after the toolbar hides.
3. Pause, go back 10 seconds, or keep reading along.

### Flow 6: Dead ends

- Unknown reading link → **Not found** page with "Back to the library".
- No notes yet → My notes explains how to add one and links to the Library.

## Key Features

Each milestone ends with checks I can test by hand before moving on.

### Milestone 1: Content pipeline (get the library)

Get every UUA reading into clean, consistent Markdown files.

- Scrape the full WorshipWeb readings listing and each reading's body text.
- Convert every reading to Markdown, one file per reading, keeping poem line breaks.
- Give every file the same YAML header: title, type, authors, date, source, tags, url.
- Every reading links back to its original UUA page (credit and attribution).

**Done when:**
- [ ] The number of readings matches the UUA listing count (about 1,251), with no duplicates.
- [ ] Poems keep their line breaks.
- [ ] Any reading whose UUA page is broken still has text (the listing summary) and is flagged.
- [ ] `npm run build` regenerates the content and pre-builds every reading page with no errors.

### Milestone 2: Library (find a reading)

A home screen where you can browse and find something to read quickly.

- Search by title, author or text.
- Category chips with counts (Poetry, Reflection, Quote, Prayer, and so on), based on UUA's own genre labels.
- Topic filter (Grief, Hope, Justice, and so on) plus an A–Z Topics page.
- **Surprise me** button that opens a random reading.
- "Clear filters" whenever filters hide results, and helpful empty states.

**Done when:**
- [ ] I can find a specific reading by searching part of its title in under 10 seconds.
- [ ] Choosing a category or topic updates the result count right away.
- [ ] Every topic on the Topics page leads to at least one reading.
- [ ] The library is usable on a phone screen.

### Milestone 3: Reader (just the text)

A clean reading view: "a book open on the table."

- Clean, legible, hefty type by default (Literata serif, about 21px, generous spacing, warm paper background).
- Toolbar auto-hides about 2.5 seconds after a reading loads. It comes back when you scroll up, move to the top, or tap the ⋯ button.
- **Aa** settings: font (serif, sans, dyslexia-friendly), size (clamped to 14–34px), line spacing, line width, and page color. Settings are saved for next time.
- **Pop out**: open the reading in its own small window with nothing else on screen.
- A friendly 404 page for a missing reading.

**Done when:**
- [ ] After opening a reading, only the text is on screen within about 3 seconds.
- [ ] There is always a visible way to get the tools back, including on touch screens.
- [ ] Text settings are still applied after a refresh and on another reading.
- [ ] The pop-out window shows only the reading.

### Milestone 4: Make it yours (highlights and notes)

Mark what spoke to you and reflect on it.

- Highlighter: select words and pick one of 4 colors. Click a highlight to remove it. Highlights only work inside the reading text, not the header or tags.
- **+ Note** quotes the selected text into that reading's note.
- Notes panel ("in the margin") that autosaves about 0.5 seconds after typing stops, with "Saving… / Saved on this device ✓" feedback.
- The Notes button shows a dot when a reading already has notes or highlights.
- **My notes** page that collects every note and highlight across readings.

**Done when:**
- [ ] Highlights and notes are still there after closing and reopening the browser.
- [ ] Removing a highlight works from the text and from the panel.
- [ ] My notes lists every reading I've marked and links back to it.

### Milestone 5: Today's reading

A daily reading that gives people a reason to open the app each day.

- A **Today's reading** card at the top of the Library with the title, author, category and the first few lines, plus a button to open it.
- Everyone gets the same reading on the same day, and it changes at midnight in the reader's own time zone.
- The pick comes from a fixed shuffled order of all readings (no server or database needed), so nothing repeats until the whole library has been used.
- Skip readings whose UUA page was broken (the ones that only have a summary).
- The reading page shows a small "Today's reading" label when you open it from the card.

**Done when:**
- [ ] The card shows the same reading after a refresh and on a second device on the same day.
- [ ] Changing the device's date shows a different reading.
- [ ] Today's reading opens in the normal reader with all its tools (settings, highlights, notes, narration).

### Milestone 6: Narration

Listen to any reading in one of two calm, natural-sounding voices, not a robotic computer voice.

- A **Listen** button in the reader toolbar with play, pause, and back 10 seconds.
- Two voices to choose from, both slow and warm. The choice is remembered for next time.
- Narration reads the title and author, then the body. Poems pause at line breaks and stanza breaks.
- A small play/pause control stays on screen while audio is playing, even after the toolbar auto-hides.
- Works in the pop-out window and on phones, including with the screen locked.
- Audio is made the first time someone plays a reading in that voice, then saved and reused.
- If narration fails, show a friendly message and keep the reading usable.

**Done when:**
- [ ] Both voices sound natural and calm to me and to at least one tester (no "robot" comments).
- [ ] A reading that has already been voiced starts playing within about 2 seconds.
- [ ] A poem is read with its line breaks respected, not as one run-on sentence.
- [ ] The TTS API key is only stored in Vercel's environment variables and `.env.local`, never in the code.

### Milestone 7: Fresh content on every deploy

Pull the latest readings from the UUA every time the site is built and deployed, so new texts show up without a manual step.

- Port the browser scraper to a Node script that runs before `build-content.mjs` during `npm run build`.
- If the scrape fails or returns noticeably fewer readings than last time, keep the saved `data/uua-readings-raw.json` and print a warning. A UUA outage should never break the build.
- Keep a local command (`npm run content`) that builds from the saved data without scraping, so `npm run dev` stays fast.
- Today's reading order stays stable when new readings are added (new readings join the end of the order).

**Done when:**
- [ ] A Vercel deploy logs how many readings were scraped and how many are new.
- [ ] Turning off the network during a build still produces a working site from the saved data.
- [ ] `npm run dev` doesn't scrape.

### Milestone 8: Ship it

- Deploy to Vercel from the GitHub repo (the app is at the repo root, so no Root Directory setting is needed).
- Do a short test with 1–2 people from my target group.
- Update the prompting log with what I changed and what I learned.

**Done when:**
- [ ] The live Vercel URL loads the library and any reading.
- [ ] A tester can find a reading, highlight a line and write a note without help.

### Nice to have (not MVP)

- Save or export notes locally as a PDF (print to PDF from My notes), and download a reading as Markdown.
- Highlighting each line as it's narrated (read-along).
- Reminders or notifications for the daily reading.

### Out of scope for now

- Updating content between deploys (new UUA readings appear on the next deploy, not live).
- Accounts and syncing notes between devices. Notes are personal and stay on one device.
- Community features (sharing, groups, events).

## Open questions

### Decisions made

- **Framing:** "Practice between Sundays" is the answer to the problem. No reframe toward Sunday mornings.
- **Research:** no interview with a young UU. This is a known limitation of the research (both interviewees are Christian, home church). Testing in Milestone 8 is the main check that the app fits.
- **Copyright:** a class project. Every reading credits its author and links back to its UUA page, and the site says it isn't affiliated with the UUA.
- **Notes on one device:** fine for the MVP. Notes are personal and never shared.
- **Habit:** add a daily reading (Milestone 5). Reminders stay out of the MVP.
- **Narration:** in the MVP, with two calm, natural voices (Milestone 6).
- **Name:** Chalice Reader stays for the MVP. It's a bit on the nose, but it works.
- **Fresh content:** re-scrape on every deploy, with a fallback to saved data (Milestone 7).

### Still open

1. **Which TTS service?** Hosted neural voices (for example OpenAI, ElevenLabs or Google Cloud) sound natural but cost money per character and need an API key. Free browser voices sound different on every device and are often robotic. Which service, and which two voices?
2. **Narration cost cap:** 1,251 readings × 2 voices is a lot of audio. Should audio only be made when someone presses Listen (cheaper), or should Today's reading be voiced ahead of time so it's always instant?
3. **Can the UUA site be scraped from a server?** The current scraper runs in the browser on uua.org. The Vercel build may get blocked or rate-limited. This needs to be tested before Milestone 7.
4. **Deploy time:** fetching every reading on each deploy will make builds slower. Is that okay, or should the build only fetch readings that are new since last time?
5. **Late-night look:** are the default font size (about 21px) and the warm paper background right for reading late at night, or should there be a darker default page color after a certain hour?
