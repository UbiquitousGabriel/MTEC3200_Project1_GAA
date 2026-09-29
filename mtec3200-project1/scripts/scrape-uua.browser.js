// scripts/scrape-uua.browser.js
// ---------------------------------------------------------------------------
// STEP 1 of the content pipeline: collect every reading from UUA WorshipWeb.
//
// How to run: open https://www.uua.org/worship/words/readings in a browser,
// open DevTools → Console, paste this whole file, and press Enter.
// When it finishes, it downloads `uua-readings-raw.json`. Put that file in
// /data and run `npm run content` (STEP 2) to turn it into Markdown.
//
// Why in the browser? The requests come from the same site (uua.org), so we
// can use the browser's built-in DOMParser instead of installing a scraper.
// ---------------------------------------------------------------------------
(async () => {
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const parse = (html) => new DOMParser().parseFromString(html, "text/html");

  // 1. Read the listing pages (200 per page). The site's default sort isn't
  //    stable between pages, so we read it in two sort orders and merge by id.
  async function listingPage(query, n) {
    const d = parse(await fetch(`/worship/words/readings?${query}&page=${n}`).then((r) => r.text()));
    return [...d.querySelectorAll('a[id^="title-"]')].map((a) => {
      const col = a.closest(".col-9") || a.closest("li");
      const metas = [...col.querySelectorAll(".font-size-xsm")].map((x) => clean(x.textContent));
      const title = clean(a.textContent);
      const summary = clean(clean(col.textContent).replace(title, "").split(metas[0] || "@@")[0]);
      return {
        id: a.id.replace("title-", ""),
        url: new URL(a.getAttribute("href"), location.href).href,
        title,
        summary,
        meta: metas[0] || "", // "Reading | By Author | Date | From Source"
        tags: (metas.find((m) => m.startsWith("Tagged as:")) || "")
          .replace("Tagged as:", "")
          .split(",")
          .map(clean)
          .filter(Boolean),
      };
    });
  }

  const byId = new Map();
  for (const query of ["items_per_page=200", "items_per_page=200&order=title&sort=asc"]) {
    for (let n = 0; n < 10; n++) {
      const rows = await listingPage(query, n);
      if (!rows.length) break;
      rows.forEach((r) => byId.set(r.id, r));
      console.log(`listing ${query} page ${n}: ${byId.size} unique so far`);
    }
  }
  const items = [...byId.values()];

  // 2. Visit each reading and keep just the body HTML (images/figures removed).
  async function detail(item) {
    const res = await fetch(item.url);
    const d = parse(await res.text());
    const body = d.querySelector("main .node--view-mode--full");
    let html = "";
    if (body) {
      const c = body.cloneNode(true);
      c.querySelectorAll("figure,img,script,style,iframe,.embedded-entity,.visually-hidden,button").forEach((e) => e.remove());
      html = c.innerHTML
        .replace(/\s+/g, " ")
        .replace(/ (data-[a-z-]+|class|id|style|dir|lang)="[^"]*"/g, "")
        .trim();
    }
    Object.assign(item, { status: res.status, html });
  }

  const queue = [...items];
  let done = 0;
  await Promise.all(
    [...Array(8)].map(async () => {
      while (queue.length) {
        await detail(queue.shift()).catch((e) => console.warn(e));
        if (++done % 50 === 0) console.log(`details: ${done}/${items.length}`);
      }
    })
  );

  // 3. Save as a JSON file.
  const blob = new Blob([JSON.stringify(items)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "uua-readings-raw.json";
  a.click();
  console.log(`Done: ${items.length} readings`);
})();
