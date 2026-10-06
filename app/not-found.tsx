import Link from "next/link";
import SiteHeader, { SiteFooter } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl font-bold">That reading isn&rsquo;t here.</h1>
        <p className="mt-3 text-lg text-muted">It may have moved, or the link has a typo.</p>
        <Link href="/" className="mt-6 inline-flex h-11 px-5 items-center rounded-full bg-ink text-paper font-bold">
          Back to the library
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
