import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Recently Explored",
  description:
    "Shops and products you explored recently on LocalLoop.",
  path: "/recent-explored",
  noindex: true,
});

export default function RecentExploredLayout({ children }: { children: React.ReactNode }) {
  return children;
}
