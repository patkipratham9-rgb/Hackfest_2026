import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Merchant Store Settings",
  description:
    "Update your LocalLoop shop profile, opening hours, banner and delivery settings.",
  path: "/seller/store",
  noindex: true,
});

export default function SellerStoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
