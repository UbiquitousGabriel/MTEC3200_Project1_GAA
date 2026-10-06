import Link from "next/link";

export function ChaliceMark({ className = "h-6 w-6" }: { className?: string }) {
  // A simple flaming-chalice mark, drawn for this project.
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d="M16 3c3 4 5 6.5 5 9.5a5 5 0 0 1-10 0C11 9.5 13 7 16 3z" fill="var(--color-primary)" />
      <path d="M6 15h20c0 5.5-4.5 9-10 9s-10-3.5-10-9z" fill="currentColor" />
      <rect x="14.5" y="23" width="3" height="4" fill="currentColor" />
      <rect x="10" y="27" width="12" height="2.5" rx="1" fill="currentColor" />
    </svg>
  );
}

// DaisyUI: navbar + menu (menu-horizontal, menu-active)
export default function SiteHeader({ active }: { active?: "library" | "topics" | "notes" }) {
  const link = (href: string, label: string, key: typeof active) => (
    <li>
      <Link
        href={href}
        aria-current={active === key ? "page" : undefined}
        className={`font-bold ${active === key ? "menu-active" : ""}`}
      >
        {label}
      </Link>
    </li>
  );
  return (
    <header className="sticky top-0 z-20 border-b border-base-300 bg-base-100/90 backdrop-blur no-print">
      <div className="navbar mx-auto max-w-5xl px-2 sm:px-4">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost px-2 gap-2" aria-label="Chalice Reader — Library">
            <ChaliceMark />
            <span className="hidden sm:inline font-serif text-xl font-bold tracking-tight">Chalice Reader</span>
          </Link>
        </div>
        <nav aria-label="Main">
          <ul className="menu menu-horizontal gap-1 bg-base-200 rounded-box p-1">
            {link("/", "Library", "library")}
            {link("/topics", "Topics", "topics")}
            {link("/notes", "My notes", "notes")}
          </ul>
        </nav>
      </div>
    </header>
  );
}

// DaisyUI: footer
export function SiteFooter() {
  return (
    <footer className="footer mt-auto border-t border-base-300 bg-base-200 text-base-content/70 no-print">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 text-sm leading-relaxed">
        <p>
          Texts are collected from the{" "}
          <a className="link" href="https://www.uua.org/worship/words/readings">
            UUA WorshipWeb library
          </a>{" "}
          and remain © their authors. Each reading links back to its original page. Chalice Reader is a
          student prototype (MTEC3200, CUNY City Tech) and is not affiliated with the Unitarian Universalist
          Association.
        </p>
      </div>
    </footer>
  );
}
