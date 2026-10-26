import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Merchant Sign In",
  description:
    "Sign in to the LocalLoop merchant portal to manage your shop, catalogue and incoming orders.",
  path: "/login/merchant",
  noindex: true,
});

export default function LoginMerchantLayout({ children }: { children: React.ReactNode }) {
  return children;
}
