import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shipping, Returns and Refund Policies",
  description:
    "Read LocalLoop's shipping and delivery, cancellation, return and refund policies for orders placed with shops in Hubballi-Dharwad.",
  path: "/policies",
});

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
