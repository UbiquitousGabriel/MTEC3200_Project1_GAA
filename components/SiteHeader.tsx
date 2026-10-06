import Link from "next/link";

export function ChaliceMark({ className = "h-6 w-6" }: { className?: string }) {
  // A simple flaming-chalice mark, drawn for this project.
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d="M16 3c3 4 5 6.5 5 9.5a5 5 0 0 1-10 0C11 9.5 13 7 16 3z" fill="var(--accent)" />
      <path d="M6 15h20c0 5.5-4.5 9-10 9s-10-3.5-10-9z" fill="currentColor" />
      <rect x="14.5" y="23" width="3" height="4" fill="currentColor" />
      <rect x="10" y="27" width="12" height="2.5" rx="1" fill="currentColor" />
    </svg>
  );
}

export default function SiteHeader({ active }: { active?: "library" | "topics" | "notes" }) {
  const link = (href: string, label: string, key: typeof active) => (
    <Link
      href={href}
      aria-current={active === key ? "page" : undefined}
      className={`px-3 py-2 rounded-full text-[15px] font-bold transition-colors ${
        active === key ? "bg-ink text-paper" : "text-muted hover:text-ink hover:bg-line/60"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur sticky top-0 z-20 no-print">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 text-ink">
          <ChaliceMark />
          <span className="font-serif text-xl font-bold tracking-tight">Chalice Reader</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          {link("/", "Library", "library")}
          {link("/topics", "Topics", "topics")}
          {link("/notes", "My notes", "notes")}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line no-print">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 text-sm text-muted leading-relaxed">
        Texts are collected from the{" "}
        <a className="underline" href="https://www.uua.org/worship/words/readings">
          UUA WorshipWeb library
        </a>{" "}
        and remain © their authors. Each reading links back to its original page. Chalice Reader is a
        student prototype (MTEC3200, CUNY City Tech) and is not affiliated with the Unitarian Universalist
        Association.
      </div>
    </footer>
  );
}
