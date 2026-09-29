"use client";
// components/NotesList.tsx — reads notes/highlights from localStorage and
// lists them. "Save as PDF" uses the browser's print dialog.
import Link from "next/link";
import { useEffect, useState } from "react";
import { storage, type Highlight, type Note } from "@/lib/storage";

type Entry = { slug: string; note: Note | null; highlights: Highlight[] };
type Index = Record<string, { title: string; authors: string[]; type: string }>;

export default function NotesList({ index }: { index: Index }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    const list = storage
      .listAnnotated()
      .filter((slug) => index[slug])
      .map((slug) => ({ slug, note: storage.getNote(slug), highlights: storage.getHighlights(slug) }))
      .sort((a, b) => (b.note?.updatedAt ?? "").localeCompare(a.note?.updatedAt ?? ""));
    setEntries(list); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read from localStorage
  }, [index]);

  return (
    <>
      <div className="pt-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight">My notes</h1>
          <p className="mt-3 text-lg text-muted">Saved in this browser only — nothing leaves your device.</p>
        </div>
        {entries && entries.length > 0 && (
          <button onClick={() => window.print()} className="h-11 px-5 rounded-full bg-ink text-paper font-bold no-print">
            Save as PDF
          </button>
        )}
      </div>

      {entries === null ? null : entries.length === 0 ? (
        <div className="mt-12 rounded-2xl border-2 border-dashed border-line p-10 text-center">
          <p className="font-serif text-2xl font-bold">No notes yet.</p>
          <p className="mt-2 text-muted">Open a reading, select some words to highlight them, or tap Notes to write.</p>
          <Link href="/" className="mt-5 inline-flex h-11 px-5 items-center rounded-full bg-ink text-paper font-bold">
            Find a reading
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {entries.map(({ slug, note, highlights }) => (
            <li key={slug} className="rounded-2xl border-2 border-line bg-surface p-5 break-inside-avoid">
              <p className="text-sm text-muted">
                <span className="font-bold text-accent">{index[slug].type}</span>
                {index[slug].authors.length > 0 && <> · {index[slug].authors.join(", ")}</>}
              </p>
              <Link href={`/read/${slug}`} className="font-serif text-2xl font-bold hover:underline underline-offset-4">
                {index[slug].title}
              </Link>
              {highlights.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {[...highlights]
                    .sort((a, b) => a.start - b.start)
                    .map((h) => (
                      <li key={h.id} className="font-serif leading-snug">
                        <mark className={`hl hl-${h.color}`}>“{h.text}”</mark>
                      </li>
                    ))}
                </ul>
              )}
              {note?.text && <p className="mt-3 whitespace-pre-wrap leading-relaxed">{note.text}</p>}
              {note?.updatedAt && (
                <p className="mt-3 text-sm text-muted">Edited {new Date(note.updatedAt).toLocaleDateString()}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
