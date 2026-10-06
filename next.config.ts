import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The home page reads the Markdown files on each request (it uses the
  // ?q=&type=&topic= search params). Make sure Vercel ships /content with it.
  // Reading pages are pre-built at build time, so they don't need this.
  outputFileTracingIncludes: {
    "/": ["./content/readings/**/*"],
  },
};

export default nextConfig;
