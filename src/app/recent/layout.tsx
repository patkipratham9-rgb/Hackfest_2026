import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Recently Viewed",
  description:
    "Products and shops you viewed recently on LocalLoop.",
  path: "/recent",
  noindex: true,
});

export default function RecentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
