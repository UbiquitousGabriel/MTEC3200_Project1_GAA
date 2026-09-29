// app/read/[slug]/page.tsx — one reading.
// generateStaticParams tells Next.js to pre-build a page for every Markdown
// file at build time, so readings load instantly on Vercel.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Reader from "@/components/Reader";
import { getAllReadings, getReading } from "@/lib/readings";

export function generateStaticParams() {
  return getAllReadings().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/read/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = getReading(slug);
  if (!r) return { title: "Not found — Chalice Reader" };
  const by = r.meta.authors.length ? ` by ${r.meta.authors.join(", ")}` : "";
  return { title: `${r.meta.title}${by} — Chalice Reader`, description: r.meta.summary };
}

export default async function ReadPage({ params }: PageProps<"/read/[slug]">) {
  const { slug } = await params;
  const reading = getReading(slug);
  if (!reading) notFound();
  return <Reader meta={reading.meta} html={reading.html} />;
}
