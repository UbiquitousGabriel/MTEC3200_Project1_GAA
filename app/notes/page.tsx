// app/notes/page.tsx — every note and highlight saved on this device.
import SiteHeader, { SiteFooter } from "@/components/SiteHeader";
import NotesList from "@/components/NotesList";
import { getAllReadings } from "@/lib/readings";

export const metadata = { title: "My notes — Chalice Reader" };

export default function NotesPage() {
  // Titles/authors so the client can label each saved reading.
  const index = Object.fromEntries(
    getAllReadings().map((r) => [r.slug, { title: r.title, authors: r.authors, type: r.type }])
  );
  return (
    <>
      <SiteHeader active="notes" />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 pb-16">
        <NotesList index={index} />
      </main>
      <SiteFooter />
    </>
  );
}
