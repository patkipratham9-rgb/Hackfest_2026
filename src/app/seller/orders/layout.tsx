import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Merchant Orders",
  description:
    "Review, pack and hand over incoming LocalLoop orders for your shop in Hubballi-Dharwad.",
  path: "/seller/orders",
  noindex: true,
});

export default function SellerOrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
