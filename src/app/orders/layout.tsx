import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Your Orders",
  description:
    "Track the status of your current LocalLoop orders and view past purchases.",
  path: "/orders",
  noindex: true,
});

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
