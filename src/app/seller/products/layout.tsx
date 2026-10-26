import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Merchant Products",
  description:
    "Add, edit and price the products listed in your LocalLoop shop catalogue.",
  path: "/seller/products",
  noindex: true,
});

export default function SellerProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
