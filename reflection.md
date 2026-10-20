# Reflection

**Live link:** https://mtec-3200-project1-gaa.vercel.app

## How I built it

Walk through the main steps in your own words.

1. **Found the problem.** I started with a routine audit and a What / How / Why exercise. The thing that kept coming up was that I don't feel like I practice my spirituality enough; by Sunday morning I'm usually running on no sleep after working or being out Saturday night. I interviewed two people, wrote a synthesis, and landed on a How Might We: how might we support young Unitarian Universalists in practicing between gatherings, on their own schedule? From nine brainstormed ideas I committed to one: a calm library of UU readings that is easy to scroll through.
2. **Scoped the MVP and wrote the spec.** In `docs/mvp.md` I listed the must-haves: a clean, legible reader with a hefty font; notes that save; a highlighter; a pop-out view; clear categories and topics; text settings; and toolbars that hide while you read. I made wireframes for every screen (library, topics, notes, reader, empty and error states) and turned them into a functional spec.
3. **Built the content pipeline.** I scraped all 1,251 readings from the UUA WorshipWeb library with a script that runs in the browser console on uua.org, then converted every reading from HTML to Markdown with a YAML header (title, type, authors, date, source, tags, url). That conversion runs automatically before every dev and build, both on my machine and on Vercel.
4. **Built the app in Next.js.** Library page with search, category chips and a topic filter; a Topics page; the Reader with font, size, spacing, width and page color settings, a four-color highlighter, notes that autosave, a pop-out window and a toolbar that slides away after a few seconds; and a My notes page. Everything saves to the browser's localStorage. All 1,251 reading pages are pre-built.
5. **Wrote the PRD and context files, then restyled with DaisyUI.** For Class 6 I wrote `PRD.md` from my research, added `AGENTS.md`, `PROGRESS.md`, `docs/components.md` and a set of skills so a fresh AI session knows the project. I moved the app to the repo root, installed DaisyUI with my own `chalice` themes, and restyled every screen with DaisyUI components. Deployed through GitHub and Vercel.

## Working with AI

Give two or three examples.

**Example 1**
- **What I asked:** "Start building the MVP. Sort through uua.org/worship/words/readings, download everything, convert to MD, do the MVP. Use Vercel as the class says."
- **What came back:** A scraper, a Markdown converter and the four main screens. The first scraping pass only found 1,205 of the 1,251 readings, because the site's default sort order shuffles between pages, so some readings showed up twice and others never showed up at all. The fix was to read the listing a second time sorted by title and merge the two by ID.
- **What I changed:** Poems came out as one long paragraph because their line breaks collapsed, so a rule was added that turns every `<br>` into a Markdown hard break. I also checked the output by hand; 4 links on UUA's side are broken or blocked, so those readings show the listing summary instead of the full text.

**Example 2**
- **What I asked:** "Help me make a PRD for an MVP app I want to build with AI. Look through all the files in the research folder and use the PRD-template.md to create the document in the root folder of my project."
- **What came back:** A full PRD in the template's sections, with "Done when" checks for every milestone and a list of open questions for me to answer.
- **What I changed:** I answered the open questions myself, and those answers changed the plan: keep the "practice between Sundays" framing; notes stay on one device; add a daily reading and narration with two calm, natural voices; re-scrape on every deploy. Those became Milestones 5 through 7. I also had it check the PRD against the Class 6 board, which said a PRD needs user flows that connect screens, so a User flows section was added.

**Example 3** *(optional)*
- **What I asked:** To install DaisyUI as my component library and restyle every screen with it.
- **What came back:** DaisyUI installed with custom themes, but it clashed with my Reader: the Reader already used `data-theme` for its page colors (Paper, White, Sepia, Night), and DaisyUI uses `data-theme` for its own themes too.
- **What I changed:** We turned off DaisyUI's built-in themes and gave mine different names (`chalice` and `chalice-dark`), then made the Reader's page colors feed into DaisyUI so its buttons and panels match the page. Before and after screenshots of every page were compared to make sure nothing broke.

## Issues/problems I encountered

- **What happened:** The first deploy to Vercel failed. The reading pages are built from Markdown files that are generated from the scraped JSON, and those files are not committed to GitHub, so Vercel had nothing to build from. Later, during Class 6, my updated PRD reverted to its first version, because VS Code still had the old copy open and saved over the AI's changes.
- **What got me unstuck:** For Vercel, making the Markdown conversion script run automatically before every `dev` and `build`, so the content is regenerated wherever the app builds. For the PRD, figuring out that the editor was the problem; now I close or reload a file in VS Code before an AI edits it.

## Improvements for the future

- **What took longer than I expected:** Finding the problem. I went through a few ideas (one was dropped because it already existed) and honestly felt confused about what my real problem was before it clicked that it was about spirituality and practice. Getting all 1,251 readings scraped cleanly also took more back and forth than I thought it would.
- **What I would do differently in my first two weeks:** Commit to an idea sooner and test the riskiest assumption first; for me that was whether I could even pull the readings off uua.org. I would also set up `AGENTS.md` and `PROGRESS.md` from day one instead of in Class 6, since they make every new AI session start on the right foot.
- **What skills/knowledge I wish I had to fully flesh out my project:** A deeper understanding of React and Next.js so I can read and change the code myself without always going through the AI; how text-to-speech services work, so I can build the narration; and how to run a scraper on a server so the library stays fresh on every deploy.
- **Would I consider my project successful? Why or why not?**: Yes, as an MVP. Every must-have from my MVP list is built and live: the library, categories and topics, the reader settings, the highlighter, notes, pop-out and the auto-hiding toolbar. It actually solves my problem; I can sit down with a reading during the week instead of only on Sunday. It is not finished, though. The daily reading, narration and automatic re-scraping are still on the list, and notes only live on one device. The biggest success for me was learning the pipeline itself: prompting, VS Code, GitHub, Next.js and Vercel working together.
