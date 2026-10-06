"use client";
// components/Library.tsx — search + category chips + topic filter + results.
// All filtering happens in the browser on the list passed in from the server.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type LibraryItem = {
  slug: string;
  title: string;
  type: string;
  authors: string[];
  tags: string[];
  summary: string;
};

type Count = { name: string; count: number };

const PAGE = 30;

export default function Library({
  items,
  types,
  topics,
  initial,
}: {
  items: LibraryItem[];
  types: Count[];
  topics: Count[];
  initial: { q: string; type: string; topic: string };
}) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q);
  const [type, setType] = useState(initial.type);
  const [topic, setTopic] = useState(initial.topic);
  // How many results are visible. Tied to the current filters, so changing a
  // filter automatically goes back to the first page of results.
  const filterKey = `${q}|${type}|${topic}`;
  const [paging, setPaging] = useState({ key: filterKey, shown: PAGE });
  const shown = paging.key === filterKey ? paging.shown : PAGE;
  const showMore = () => setPaging({ key: filterKey, shown: shown + PAGE });

  // Keep the URL in sync (so filters can be shared/bookmarked and Back works).
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (type) p.set("type", type);
    if (topic) p.set("topic", topic);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `/?${qs}` : "/");
  }, [q, type, topic]);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter((it) => {
      if (type && it.type !== type) return false;
      if (topic && !it.tags.includes(topic)) return false;
      if (!words.length) return true;
      const hay = `${it.title} ${it.authors.join(" ")} ${it.summary} ${it.tags.join(" ")}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [items, q, type, topic]);

  const surprise = () => {
    const pool = results.length ? results : items;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    router.push(`/read/${pick.slug}`);
  };

  const clear = () => {
    setQ("");
    setType("");
    setTopic("");
  };

  const filtered = q || type || topic;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
      {/* Intro */}
      <section className="pt-10 sm:pt-14 pb-8">
        <div className="badge badge-primary badge-soft font-bold">
          UUA WorshipWeb library
        </div>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-bold leading-tight tracking-tight max-w-2xl">
          Words for the days between Sundays.
        </h1>
        <p className="mt-4 text-lg text-base-content/70 max-w-2xl leading-relaxed">
          {items.length.toLocaleString()} readings, poems, prayers and reflections from the Unitarian
          Universalist Association&rsquo;s WorshipWeb library — in one quiet place to read, highlight, and
          take notes.
        </p>
      </section>

      {/* Search — DaisyUI: input (with icon) + btn */}
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="input input-lg w-full sm:flex-1">
          <span className="sr-only">Search readings</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-60" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, author, or idea — “hope”, “Mary Oliver”, “grief”…"
            className="grow"
          />
        </label>
        <button onClick={surprise} className="btn btn-lg btn-primary">
          Surprise me
        </button>
      </div>

      {/* Filters — DaisyUI: card, fieldset, btn, badge, select */}
      <div className="card card-border bg-base-200 mt-6">
        <div className="card-body gap-4 p-4 sm:p-5">
          <fieldset className="fieldset p-0">
            <legend className="fieldset-legend pt-0 text-sm uppercase tracking-wider">Category</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              <Chip active={!type} onClick={() => setType("")}>
                All
              </Chip>
              {types.map((t) => (
                <Chip key={t.name} active={type === t.name} onClick={() => setType(type === t.name ? "" : t.name)}>
                  {t.name}
                  <span className={`badge badge-sm ${type === t.name ? "badge-neutral" : "badge-ghost"}`}>{t.count}</span>
                </Chip>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-end gap-3">
            <fieldset className="fieldset p-0">
              <legend className="fieldset-legend pt-0 text-sm uppercase tracking-wider">Topic</legend>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="select min-w-64 max-w-full"
                aria-label="Filter by topic"
              >
                <option value="">All topics</option>
                {topics.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name} ({t.count})
                  </option>
                ))}
              </select>
            </fieldset>
            <Link href="/topics" className="btn btn-ghost text-primary">
              Browse all topics →
            </Link>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 mb-4 flex items-center justify-between gap-4">
        <p className="text-base-content/70" aria-live="polite">
          <strong className="text-base-content">{results.length.toLocaleString()}</strong>{" "}
          {results.length === 1 ? "reading" : "readings"}
          {topic && (
            <>
              {" "}
              on <span className="badge badge-primary badge-soft font-bold">{topic}</span>
            </>
          )}
        </p>
        {filtered && (
          <button onClick={clear} className="btn btn-sm btn-ghost text-primary">
            ✕ Clear filters
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="card card-dash bg-base-200">
          <div className="card-body items-center text-center py-14">
            <h2 className="card-title font-serif text-2xl">Nothing matches that yet.</h2>
            <p className="text-base-content/70">Try fewer words, or clear a filter.</p>
            <div className="card-actions mt-3">
              <button onClick={clear} className="btn btn-neutral">
                Clear filters
              </button>
            </div>
          </div>
        </div>
      ) : (
        <ul className="grid gap-3">
          {results.slice(0, shown).map((it) => (
            <li key={it.slug}>
              <Link
                href={`/read/${it.slug}`}
                className="card card-border bg-base-100 hover:bg-base-200 hover:border-primary/50 transition-colors group"
              >
                <div className="card-body gap-1 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
                    <span className="badge badge-primary badge-soft font-bold">{it.type}</span>
                    {it.authors.length > 0 && <span>{it.authors.join(", ")}</span>}
                  </div>
                  <h3 className="card-title font-serif text-2xl leading-snug group-hover:underline underline-offset-4 decoration-2">
                    {it.title}
                  </h3>
                  {it.summary && <p className="text-[17px] text-base-content/70 leading-relaxed line-clamp-2">{it.summary}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {shown < results.length && (
        <div className="mt-6 text-center">
          <button onClick={showMore} className="btn btn-outline btn-wide">
            Show more ({(results.length - shown).toLocaleString()} left)
          </button>
        </div>
      )}
    </div>
  );
}

// DaisyUI: btn (btn-neutral when selected, btn-outline otherwise)
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`btn btn-sm rounded-full ${active ? "btn-neutral" : "btn-outline border-base-300 bg-base-100"}`}
    >
      {children}
    </button>
  );
}
