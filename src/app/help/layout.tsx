import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Help Centre",
  description:
    "Answers to common questions about ordering, delivery, counter pickup, payments, cancellations and refunds on LocalLoop Hubballi-Dharwad.",
  path: "/help",
});

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
