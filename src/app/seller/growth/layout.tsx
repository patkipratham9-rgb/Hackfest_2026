import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Merchant Growth Insights",
  description:
    "Sales trends and product demand insights for your LocalLoop shop in Hubballi-Dharwad.",
  path: "/seller/growth",
  noindex: true,
});

export default function SellerGrowthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
