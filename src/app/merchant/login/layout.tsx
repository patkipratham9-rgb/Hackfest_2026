import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Merchant Partner Sign In",
  description:
    "Merchant partners sign in here to manage their LocalLoop storefront, products and orders.",
  path: "/merchant/login",
  noindex: true,
});

export default function MerchantLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
