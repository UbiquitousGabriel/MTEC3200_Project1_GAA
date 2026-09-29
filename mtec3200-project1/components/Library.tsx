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
        <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight tracking-tight max-w-2xl">
          Words for the days between Sundays.
        </h1>
        <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
          {items.length.toLocaleString()} readings, poems, prayers and reflections from the Unitarian
          Universalist Association&rsquo;s WorshipWeb library — in one quiet place to read, highlight, and
          take notes.
        </p>
      </section>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Search readings</span>
          <svg viewBox="0 0 24 24" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, author, or idea — “hope”, “Mary Oliver”, “grief”…"
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface border-2 border-line text-lg placeholder:text-muted/80 focus:border-accent focus:outline-none"
          />
        </label>
        <button
          onClick={surprise}
          className="h-14 px-5 rounded-2xl border-2 border-ink font-bold text-lg hover:bg-ink hover:text-paper transition-colors"
        >
          Surprise me
        </button>
      </div>

      {/* Categories */}
      <div className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-2">Category</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <Chip active={!type} onClick={() => setType("")}>
            All
          </Chip>
          {types.map((t) => (
            <Chip key={t.name} active={type === t.name} onClick={() => setType(type === t.name ? "" : t.name)}>
              {t.name} <span className="opacity-60 font-normal">{t.count}</span>
            </Chip>
          ))}
        </div>
      </div>

      {/* Topic */}
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-bold uppercase tracking-wider text-muted">Topic</span>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-11 min-w-64 max-w-full rounded-xl bg-surface border-2 border-line px-3 text-base focus:border-accent focus:outline-none"
          >
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name} ({t.count})
              </option>
            ))}
          </select>
        </label>
        <Link href="/topics" className="h-11 inline-flex items-center text-accent font-bold underline underline-offset-4">
          Browse all topics
        </Link>
      </div>

      {/* Results */}
      <div className="mt-8 flex items-baseline justify-between gap-4 border-b border-line pb-3">
        <p className="text-muted" aria-live="polite">
          <strong className="text-ink">{results.length.toLocaleString()}</strong>{" "}
          {results.length === 1 ? "reading" : "readings"}
          {topic && (
            <>
              {" "}
              on <strong className="text-ink">{topic}</strong>
            </>
          )}
        </p>
        {filtered && (
          <button onClick={clear} className="text-accent font-bold underline underline-offset-4">
            Clear filters
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-2xl font-bold">Nothing matches that yet.</p>
          <p className="mt-2 text-muted">Try fewer words, or clear a filter.</p>
          <button onClick={clear} className="mt-5 h-11 px-5 rounded-full bg-ink text-paper font-bold">
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {results.slice(0, shown).map((it) => (
            <li key={it.slug}>
              <Link href={`/read/${it.slug}`} className="group block py-5 -mx-3 px-3 rounded-xl hover:bg-surface">
                <p className="text-sm text-muted">
                  <span className="font-bold text-accent">{it.type}</span>
                  {it.authors.length > 0 && <> · {it.authors.join(", ")}</>}
                </p>
                <h3 className="mt-1 font-serif text-2xl font-bold leading-snug group-hover:underline underline-offset-4 decoration-2">
                  {it.title}
                </h3>
                {it.summary && <p className="mt-1.5 text-[17px] text-muted leading-relaxed line-clamp-2">{it.summary}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {shown < results.length && (
        <div className="mt-6 text-center">
          <button
            onClick={showMore}
            className="h-12 px-6 rounded-full border-2 border-line bg-surface font-bold hover:border-ink"
          >
            Show more ({(results.length - shown).toLocaleString()} left)
          </button>
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`h-10 px-4 rounded-full border-2 font-bold text-[15px] transition-colors ${
        active ? "bg-ink border-ink text-paper" : "bg-surface border-line text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
