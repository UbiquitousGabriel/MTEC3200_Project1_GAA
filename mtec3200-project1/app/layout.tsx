import type { Metadata, Viewport } from "next";
// Fonts are bundled from npm (Fontsource) so they load from our own site.
import "@fontsource-variable/literata";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource/opendyslexic/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chalice Reader — UU readings, made readable",
  description:
    "A calm, distraction-free library of the Unitarian Universalist Association's WorshipWeb readings, with highlighting, notes, and adjustable type.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#16140f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
