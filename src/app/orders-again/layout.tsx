import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Order Again",
  description:
    "Reorder items you have bought before from shops in Hubballi-Dharwad.",
  path: "/orders-again",
  noindex: true,
});

export default function OrdersAgainLayout({ children }: { children: React.ReactNode }) {
  return children;
}
