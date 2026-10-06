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

  // DaisyUI: btn, card (card-dash for the empty state), badge
  return (
    <>
      <div className="pt-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight">My notes</h1>
          <p className="mt-3 text-lg text-base-content/70">Saved in this browser only — nothing leaves your device.</p>
        </div>
        {entries && entries.length > 0 && (
          <button onClick={() => window.print()} className="btn btn-primary no-print">
            Save as PDF
          </button>
        )}
      </div>

      {entries === null ? null : entries.length === 0 ? (
        <div className="card card-dash bg-base-200 mt-12">
          <div className="card-body items-center text-center py-12">
            <h2 className="card-title font-serif text-2xl">No notes yet.</h2>
            <p className="text-base-content/70">Open a reading, select some words to highlight them, or tap Notes to write.</p>
            <div className="card-actions mt-3">
              <Link href="/" className="btn btn-primary">
                Find a reading
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {entries.map(({ slug, note, highlights }) => (
            <li key={slug} className="card card-border bg-base-200 break-inside-avoid">
              <div className="card-body gap-2 p-5">
                <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
                  <span className="badge badge-primary badge-soft font-bold">{index[slug].type}</span>
                  {index[slug].authors.length > 0 && <span>{index[slug].authors.join(", ")}</span>}
                </div>
                <Link href={`/read/${slug}`} className="card-title font-serif text-2xl link link-hover">
                  {index[slug].title}
                </Link>
                {highlights.length > 0 && (
                  <ul className="mt-1 space-y-1.5">
                    {[...highlights]
                      .sort((a, b) => a.start - b.start)
                      .map((h) => (
                        <li key={h.id} className="font-serif leading-snug">
                          <mark className={`hl hl-${h.color}`}>“{h.text}”</mark>
                        </li>
                      ))}
                  </ul>
                )}
                {note?.text && <p className="mt-1 whitespace-pre-wrap leading-relaxed">{note.text}</p>}
                {note?.updatedAt && (
                  <p className="text-sm text-base-content/60">Edited {new Date(note.updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
