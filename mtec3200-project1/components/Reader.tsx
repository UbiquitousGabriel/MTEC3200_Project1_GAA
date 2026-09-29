"use client";
// components/Reader.tsx — the reading view.
// Features: adjustable type (font/size/spacing/width/theme), highlighter,
// notes, pop-out window, and a toolbar that hides itself while you read.
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReadingMeta } from "@/lib/readings";
import { DEFAULT_SETTINGS, storage, type Highlight, type ReaderSettings } from "@/lib/storage";
import { paintHighlights, selectionToOffsets } from "@/lib/highlight";

const FONTS = {
  serif: { label: "Serif", css: "var(--font-serif)" },
  sans: { label: "Sans", css: "var(--font-sans)" },
  dyslexic: { label: "Dyslexic", css: "var(--font-dyslexic)" },
} as const;
const WIDTHS = { narrow: "32rem", medium: "38rem", wide: "46rem" } as const;
const SPACING = [
  { label: "Snug", value: 1.45 },
  { label: "Comfy", value: 1.7 },
  { label: "Airy", value: 2.0 },
];
const THEMES = [
  { id: "paper", label: "Paper", swatch: "#f7f3ea", ink: "#1e1b16" },
  { id: "light", label: "White", swatch: "#ffffff", ink: "#111111" },
  { id: "sepia", label: "Sepia", swatch: "#efe2c6", ink: "#3b2d1b" },
  { id: "dark", label: "Night", swatch: "#121110", ink: "#e8e2d4" },
] as const;
const COLORS: Highlight["color"][] = ["yellow", "green", "pink", "blue"];
const SWATCH = { yellow: "#ffd54f", green: "#81c784", pink: "#f48fb1", blue: "#64b5f6" };

const HIDE_AFTER_MS = 2500;

type Panel = null | "type" | "notes";

export default function Reader({ meta, html }: { meta: ReadingMeta; html: string }) {
  const articleRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [panel, setPanel] = useState<Panel>(null);
  const [chromeHidden, setChromeHidden] = useState(false);
  const [popout, setPopout] = useState(false);
  const [selPop, setSelPop] = useState<{ x: number; y: number; start: number; end: number; text: string } | null>(null);
  const [markPop, setMarkPop] = useState<{ x: number; y: number; id: string } | null>(null);

  // ---- Load saved data for this reading (browser only) ----
  // localStorage only exists in the browser, so we read it once after the
  // first render (the server can't see it).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from localStorage */
    setSettings(storage.getSettings());
    setHighlights(storage.getHighlights(meta.slug));
    setNote(storage.getNote(meta.slug)?.text ?? "");
    setPopout(new URLSearchParams(window.location.search).has("popout"));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [meta.slug]);

  const updateSettings = (patch: Partial<ReaderSettings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      storage.setSettings(next);
      return next;
    });
  };

  // ---- Paint highlights: reset the HTML, then wrap saved ranges in <mark> ----
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    el.innerHTML = html;
    paintHighlights(el, highlights);
  }, [html, highlights]);

  const saveHighlights = (next: Highlight[]) => {
    setHighlights(next);
    storage.setHighlights(meta.slug, next);
  };

  // ---- Notes: autosave shortly after you stop typing ----
  useEffect(() => {
    if (saved !== "saving") return;
    const t = setTimeout(() => {
      storage.setNote(meta.slug, { text: note, title: meta.title, updatedAt: new Date().toISOString() });
      setSaved("saved");
    }, 500);
    return () => clearTimeout(t);
  }, [note, saved, meta.slug, meta.title]);

  // ---- Toolbar auto-hide ----
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showChrome = useCallback(() => {
    setChromeHidden(false);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setChromeHidden(true), HIDE_AFTER_MS);
  }, []);

  useEffect(() => {
    // Start the hide countdown as soon as the reading loads.
    hideTimer.current = setTimeout(() => setChromeHidden(true), HIDE_AFTER_MS);
    let lastY = window.scrollY;
    const onMove = (e: MouseEvent) => {
      if (e.clientY < 90) showChrome();
    };
    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastY - 30 || y < 40) showChrome(); // scrolling up reveals the bar
      else if (y > lastY + 10) setChromeHidden(true);
      lastY = y;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel(null);
        setSelPop(null);
        setMarkPop(null);
        showChrome();
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [showChrome]);

  // Keep the toolbar visible while a panel is open.
  const toolbarHidden = chromeHidden && panel === null;

  // ---- Selecting text shows the highlighter popover ----
  const onSelectionEnd = () => {
    // Wait a tick so the browser finishes updating the selection.
    setTimeout(() => {
      const sel = window.getSelection();
      const el = articleRef.current;
      if (!sel || sel.isCollapsed || !el || sel.rangeCount === 0) return setSelPop(null);
      const range = sel.getRangeAt(0);
      const offsets = selectionToOffsets(el, range);
      if (!offsets) return setSelPop(null);
      const rect = range.getBoundingClientRect();
      setMarkPop(null);
      setSelPop({
        x: rect.left + rect.width / 2,
        y: rect.top,
        ...offsets,
        text: range.toString().trim(),
      });
    }, 10);
  };

  const addHighlight = (color: Highlight["color"]) => {
    if (!selPop) return;
    const next = highlights.filter((h) => h.end <= selPop.start || h.start >= selPop.end); // replace overlaps
    next.push({ id: crypto.randomUUID(), start: selPop.start, end: selPop.end, color, text: selPop.text });
    saveHighlights(next);
    window.getSelection()?.removeAllRanges();
    setSelPop(null);
  };

  const quoteToNote = () => {
    if (!selPop) return;
    setNote((n) => `${n}${n && !n.endsWith("\n") ? "\n\n" : ""}> ${selPop.text}\n\n`);
    setSaved("saving");
    setPanel("notes");
    window.getSelection()?.removeAllRanges();
    setSelPop(null);
  };

  const onArticleClick = (e: React.MouseEvent) => {
    const mark = (e.target as HTMLElement).closest("mark[data-hl]") as HTMLElement | null;
    if (!mark || !window.getSelection()?.isCollapsed) return setMarkPop(null);
    const r = mark.getBoundingClientRect();
    setMarkPop({ x: r.left + r.width / 2, y: r.top, id: mark.dataset.hl! });
  };

  const removeHighlight = (id: string) => {
    saveHighlights(highlights.filter((h) => h.id !== id));
    setMarkPop(null);
  };

  // Hide popovers when the page scrolls (their position would be stale).
  useEffect(() => {
    const close = () => {
      setSelPop(null);
      setMarkPop(null);
    };
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, []);

  const openPopout = () => {
    window.open(`/read/${meta.slug}?popout=1`, `chalice-${meta.slug}`, "popup=yes,width=760,height=920");
  };

  const exportNote = () => {
    const lines = [
      `# ${meta.title}`,
      meta.authors.length ? `_${meta.authors.join(", ")}_` : "",
      "",
      "## Highlights",
      ...highlights.map((h) => `- “${h.text}”`),
      "",
      "## Notes",
      note,
      "",
      `Source: ${meta.url}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${meta.slug}-notes.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const style = {
    "--r-font": FONTS[settings.font].css,
    "--r-size": `${settings.size}px`,
    "--r-lh": String(settings.lineHeight),
    "--r-width": WIDTHS[settings.width],
  } as React.CSSProperties;

  return (
    <div className="reader min-h-screen flex-1" data-theme={settings.theme} style={style}>
      {/* ---------- Toolbar (auto-hides) ---------- */}
      <div
        className="chrome fixed inset-x-0 top-0 z-30 border-b no-print"
        data-hidden={toolbarHidden}
        style={{ background: "var(--r-bg)", borderColor: "color-mix(in srgb, var(--r-ink) 12%, transparent)" }}
        onMouseEnter={showChrome}
      >
        <div className="mx-auto max-w-5xl h-16 px-3 sm:px-6 flex items-center gap-2">
          {popout ? (
            <button onClick={() => window.close()} className="tb-btn">
              ✕ <span className="hidden sm:inline">Close</span>
            </button>
          ) : (
            <Link href="/" className="tb-btn" aria-label="Back to library">
              ← <span className="hidden sm:inline">Library</span>
            </Link>
          )}
          <p className="flex-1 min-w-0 truncate text-center font-bold opacity-70 text-[15px]">{meta.title}</p>
          <button className="tb-btn" aria-pressed={panel === "type"} onClick={() => setPanel(panel === "type" ? null : "type")}>
            <span className="font-serif text-lg leading-none">Aa</span>
            <span className="hidden sm:inline">Text</span>
          </button>
          <button className="tb-btn" aria-pressed={panel === "notes"} onClick={() => setPanel(panel === "notes" ? null : "notes")}>
            ✎ <span className="hidden sm:inline">Notes</span>
            {(note.trim() || highlights.length > 0) && <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />}
          </button>
          {!popout && (
            <button className="tb-btn" onClick={openPopout} title="Open this reading in its own window">
              ⧉ <span className="hidden sm:inline">Pop out</span>
            </button>
          )}
        </div>
      </div>

      {/* Small handle to bring the toolbar back on touch screens */}
      {toolbarHidden && (
        <button
          onClick={showChrome}
          className="fixed bottom-5 right-5 z-30 h-12 w-12 rounded-full shadow-lg text-xl no-print"
          style={{ background: "var(--r-ink)", color: "var(--r-bg)" }}
          aria-label="Show reading tools"
        >
          ⋯
        </button>
      )}

      {/* ---------- The reading ---------- */}
      <main className="px-5 sm:px-8 pt-28 pb-24">
        <header className="reading-col mb-10">
          <p className="font-sans text-[15px] font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
            {meta.type}
          </p>
          <h1 className="mt-2 text-[1.9em] leading-[1.15] font-bold tracking-tight">{meta.title}</h1>
          {meta.authors.length > 0 && <p className="mt-3 font-sans text-[0.8em] font-bold">by {meta.authors.join(", ")}</p>}
          <p className="mt-1 font-sans text-[0.7em]" style={{ color: "var(--r-muted)" }}>
            {[meta.date, meta.source && `From ${meta.source}`].filter(Boolean).join(" · ")}
          </p>
        </header>

        <div
          ref={articleRef}
          className="reading-col reading-body"
          onMouseUp={onSelectionEnd}
          onTouchEnd={onSelectionEnd}
          onKeyUp={onSelectionEnd}
          onClick={onArticleClick}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <footer className="reading-col mt-14 pt-6 border-t font-sans text-[15px] no-print" style={{ borderColor: "color-mix(in srgb, var(--r-ink) 15%, transparent)" }}>
          {meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {meta.tags.map((t) => (
                <Link
                  key={t}
                  href={`/?topic=${encodeURIComponent(t)}`}
                  className="px-3 py-1 rounded-full border font-bold hover:opacity-70"
                  style={{ borderColor: "color-mix(in srgb, var(--r-ink) 25%, transparent)" }}
                >
                  {t}
                </Link>
              ))}
            </div>
          )}
          <p className="mt-6" style={{ color: "var(--r-muted)" }}>
            © the author. Shared from the UUA WorshipWeb library —{" "}
            <a href={meta.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 font-bold" style={{ color: "var(--r-ink)" }}>
              read the original on UUA.org ↗
            </a>
          </p>
        </footer>
      </main>

      {/* ---------- Highlighter popover ---------- */}
      {selPop && (
        <Popover x={selPop.x} y={selPop.y}>
          {COLORS.map((c) => (
            <button key={c} onMouseDown={(e) => e.preventDefault()} onClick={() => addHighlight(c)} className="h-8 w-8 rounded-full border-2 border-white/70" style={{ background: SWATCH[c] }} aria-label={`Highlight ${c}`} />
          ))}
          <span className="w-px h-6 bg-white/30 mx-1" />
          <button onMouseDown={(e) => e.preventDefault()} onClick={quoteToNote} className="px-2 h-8 font-bold text-sm">
            + Note
          </button>
        </Popover>
      )}
      {markPop && (
        <Popover x={markPop.x} y={markPop.y}>
          <button onClick={() => removeHighlight(markPop.id)} className="px-3 h-8 font-bold text-sm">
            Remove highlight
          </button>
        </Popover>
      )}

      {/* ---------- Side panels ---------- */}
      {panel && (
        <aside
          className="fixed z-40 top-16 right-0 bottom-0 w-full sm:w-[24rem] border-l overflow-y-auto font-sans no-print shadow-2xl"
          style={{ background: "var(--r-bg)", borderColor: "color-mix(in srgb, var(--r-ink) 15%, transparent)" }}
          aria-label={panel === "type" ? "Text settings" : "Notes"}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{panel === "type" ? "Text settings" : "Notes & highlights"}</h2>
              <button onClick={() => setPanel(null)} className="tb-btn" aria-label="Close panel">
                ✕
              </button>
            </div>

            {panel === "type" ? (
              <div className="space-y-6">
                <Field label="Font">
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(FONTS) as ReaderSettings["font"][]).map((f) => (
                      <Option key={f} active={settings.font === f} onClick={() => updateSettings({ font: f })}>
                        <span style={{ fontFamily: FONTS[f].css }} className="text-xl block">Aa</span>
                        <span className="text-xs">{FONTS[f].label}</span>
                      </Option>
                    ))}
                  </div>
                </Field>
                <Field label={`Size · ${settings.size}px`}>
                  <div className="flex items-center gap-3">
                    <button className="tb-btn" onClick={() => updateSettings({ size: Math.max(14, settings.size - 1) })} aria-label="Smaller text">A−</button>
                    <input type="range" min={14} max={34} value={settings.size} onChange={(e) => updateSettings({ size: Number(e.target.value) })} className="flex-1 accent-[var(--accent)]" aria-label="Text size" />
                    <button className="tb-btn" onClick={() => updateSettings({ size: Math.min(34, settings.size + 1) })} aria-label="Larger text">A+</button>
                  </div>
                </Field>
                <Field label="Line spacing">
                  <div className="grid grid-cols-3 gap-2">
                    {SPACING.map((s) => (
                      <Option key={s.label} active={settings.lineHeight === s.value} onClick={() => updateSettings({ lineHeight: s.value })}>
                        {s.label}
                      </Option>
                    ))}
                  </div>
                </Field>
                <Field label="Line width">
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(WIDTHS) as ReaderSettings["width"][]).map((w) => (
                      <Option key={w} active={settings.width === w} onClick={() => updateSettings({ width: w })}>
                        <span className="capitalize">{w}</span>
                      </Option>
                    ))}
                  </div>
                </Field>
                <Field label="Page color">
                  <div className="grid grid-cols-4 gap-2">
                    {THEMES.map((t) => (
                      <Option key={t.id} active={settings.theme === t.id} onClick={() => updateSettings({ theme: t.id })}>
                        <span className="block mx-auto h-7 w-7 rounded-full border" style={{ background: t.swatch, borderColor: t.ink }} />
                        <span className="text-xs">{t.label}</span>
                      </Option>
                    ))}
                  </div>
                </Field>
                <button onClick={() => updateSettings(DEFAULT_SETTINGS)} className="underline underline-offset-4 font-bold">
                  Reset to default
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label htmlFor="note" className="text-sm font-bold uppercase tracking-wider opacity-70">
                    Your note
                  </label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      setSaved("saving");
                    }}
                    rows={10}
                    placeholder="What stayed with you? A question, a memory, a line to carry into the week…"
                    className="mt-2 w-full rounded-xl border-2 p-3 text-base leading-relaxed bg-transparent focus:outline-none focus:border-[var(--accent)]"
                    style={{ borderColor: "color-mix(in srgb, var(--r-ink) 20%, transparent)", color: "var(--r-ink)" }}
                  />
                  <p className="mt-1 text-sm opacity-70" aria-live="polite">
                    {saved === "saving" ? "Saving…" : saved === "saved" ? "Saved on this device ✓" : "Notes save automatically on this device."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider opacity-70">Highlights ({highlights.length})</h3>
                  {highlights.length === 0 ? (
                    <p className="mt-2 opacity-70 leading-relaxed">Select any words in the reading to highlight them.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {[...highlights]
                        .sort((a, b) => a.start - b.start)
                        .map((h) => (
                          <li key={h.id} className="flex gap-2 items-start">
                            <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full hl hl-${h.color}`} />
                            <button
                              className="flex-1 text-left font-serif leading-snug hover:underline"
                              onClick={() => document.querySelector(`mark[data-hl="${h.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                            >
                              “{h.text}”
                            </button>
                            <button onClick={() => removeHighlight(h.id)} className="opacity-60 hover:opacity-100 px-1" aria-label="Remove highlight">
                              ✕
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={exportNote} className="h-10 px-4 rounded-full font-bold" style={{ background: "var(--r-ink)", color: "var(--r-bg)" }}>
                    Download as Markdown
                  </button>
                  <Link href="/notes" className="h-10 px-4 inline-flex items-center rounded-full border-2 font-bold" style={{ borderColor: "var(--r-ink)" }}>
                    All my notes
                  </Link>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

// ---------- small building blocks ----------

function Popover({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  // Positioned just above the selection, clamped to the screen edges.
  const left = typeof window === "undefined" ? x : Math.min(Math.max(x, 130), window.innerWidth - 130);
  return (
    <div
      role="toolbar"
      className="fixed z-50 -translate-x-1/2 -translate-y-full flex items-center gap-1.5 rounded-full bg-neutral-900 text-white px-2 py-1.5 shadow-xl no-print"
      style={{ left, top: Math.max(y - 10, 70) }}
    >
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-wider opacity-70 mb-2">{label}</p>
      {children}
    </div>
  );
}

function Option({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="min-h-11 rounded-xl border-2 px-2 py-2 font-bold text-center"
      style={{
        borderColor: active ? "var(--accent)" : "color-mix(in srgb, var(--r-ink) 18%, transparent)",
        background: active ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
      }}
    >
      {children}
    </button>
  );
}
