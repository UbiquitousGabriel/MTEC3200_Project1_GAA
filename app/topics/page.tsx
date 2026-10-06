// app/topics/page.tsx — every topic, grouped A–Z, with how many readings each has.
// DaisyUI: stats, join + btn (letter jump bar), list, badge
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
        <p className="mt-3 text-lg text-base-content/70 max-w-2xl">
          Every theme the UUA uses to tag its readings. Pick one to see all the readings on it.
        </p>

        <h2 className="mt-10 text-sm font-bold uppercase tracking-wider text-base-content/70">Categories</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {types.map((t) => (
            <Link
              key={t.name}
              href={`/?type=${encodeURIComponent(t.name)}`}
              className="stats card-border bg-base-200 hover:border-primary hover:bg-base-100 transition-colors"
            >
              <div className="stat px-4 py-3">
                <div className="stat-title font-bold text-base-content/70">{t.name}</div>
                <div className="stat-value font-serif text-3xl">{t.count}</div>
                <div className="stat-desc">readings</div>
              </div>
            </Link>
          ))}
        </div>

        <nav
          className="mt-12 sticky top-16 z-10 bg-base-100 py-2 overflow-x-auto"
          aria-label="Jump to letter"
        >
          <div className="join">
            {[...groups.keys()].map((l) => (
              <a key={l} href={`#letter-${l}`} className="join-item btn btn-sm btn-square btn-soft">
                {l}
              </a>
            ))}
          </div>
        </nav>

        {[...groups.entries()].map(([letter, list]) => (
          <section key={letter} id={`letter-${letter}`} className="mt-8 scroll-mt-32">
            <div className="divider divider-start font-serif text-2xl font-bold">{letter}</div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
              {list.map((t) => (
                <li key={t.name}>
                  <Link
                    href={`/?topic=${encodeURIComponent(t.name)}`}
                    className="flex items-center justify-between gap-3 rounded-field px-3 py-2 hover:bg-base-200 hover:text-primary"
                  >
                    <span className="font-bold">{t.name}</span>
                    <span className="badge badge-ghost tabular-nums">{t.count}</span>
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
