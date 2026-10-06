// app/topics/page.tsx — every topic, grouped A–Z, with how many readings each has.
import Link from "next/link";
import SiteHeader, { SiteFooter } from "@/components/SiteHeader";
import { getTopics, getTypes } from "@/lib/readings";

export const metadata = { title: "Topics — Chalice Reader" };

export default function TopicsPage() {
  const topics = [...getTopics()].sort((a, b) => a.name.localeCompare(b.name));
  const types = getTypes();

  // Group by first letter (numbers like "7th Principle" go under "#").
  const groups = new Map<string, typeof topics>();
  for (const t of topics) {
    const letter = /[a-z]/i.test(t.name[0]) ? t.name[0].toUpperCase() : "#";
    groups.set(letter, [...(groups.get(letter) ?? []), t]);
  }

  return (
    <>
      <SiteHeader active="topics" />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 pb-16">
        <h1 className="pt-10 font-serif text-4xl font-bold tracking-tight">Topics</h1>
        <p className="mt-3 text-lg text-muted max-w-2xl">
          Every theme the UUA uses to tag its readings. Pick one to see all the readings on it.
        </p>

        <h2 className="mt-10 text-sm font-bold uppercase tracking-wider text-muted">Categories</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {types.map((t) => (
            <Link
              key={t.name}
              href={`/?type=${encodeURIComponent(t.name)}`}
              className="rounded-2xl border-2 border-line bg-surface p-4 hover:border-ink"
            >
              <span className="block font-serif text-xl font-bold">{t.name}</span>
              <span className="text-muted">{t.count} readings</span>
            </Link>
          ))}
        </div>

        <nav className="mt-12 flex flex-wrap gap-1 sticky top-16 bg-paper py-2 z-10" aria-label="Jump to letter">
          {[...groups.keys()].map((l) => (
            <a key={l} href={`#letter-${l}`} className="h-9 w-9 grid place-items-center rounded-lg font-bold hover:bg-line">
              {l}
            </a>
          ))}
        </nav>

        {[...groups.entries()].map(([letter, list]) => (
          <section key={letter} id={`letter-${letter}`} className="mt-8 scroll-mt-32">
            <h2 className="font-serif text-2xl font-bold border-b border-line pb-2">{letter}</h2>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
              {list.map((t) => (
                <li key={t.name}>
                  <Link href={`/?topic=${encodeURIComponent(t.name)}`} className="flex justify-between gap-3 py-1.5 hover:text-accent">
                    <span className="font-bold">{t.name}</span>
                    <span className="text-muted tabular-nums">{t.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
