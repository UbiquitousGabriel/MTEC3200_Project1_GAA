// app/page.tsx — the Library (home page).
// Runs on the server: loads every reading's metadata from /content and hands
// a trimmed-down list to the <Library> client component, which does the
// searching and filtering in the browser.
import SiteHeader, { SiteFooter } from "@/components/SiteHeader";
import Library, { type LibraryItem } from "@/components/Library";
import { getAllReadings, getTopics, getTypes } from "@/lib/readings";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const all = getAllReadings();

  const items: LibraryItem[] = all.map((r) => ({
    slug: r.slug,
    title: r.title,
    type: r.type,
    authors: r.authors,
    tags: r.tags,
    summary: r.summary.length > 220 ? r.summary.slice(0, 217) + "…" : r.summary,
  }));

  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

  return (
    <>
      <SiteHeader active="library" />
      <main className="flex-1">
        <Library
          items={items}
          types={getTypes(all)}
          topics={getTopics(all)}
          initial={{ q: first(params.q), type: first(params.type), topic: first(params.topic) }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
