// DaisyUI: hero, btn
import Link from "next/link";
import SiteHeader, { SiteFooter } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="hero flex-1 py-24">
        <div className="hero-content text-center">
          <div className="max-w-xl">
            <h1 className="font-serif text-4xl font-bold">That reading isn&rsquo;t here.</h1>
            <p className="mt-3 text-lg text-base-content/70">It may have moved, or the link has a typo.</p>
            <Link href="/" className="btn btn-primary mt-6">
              Back to the library
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
