import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Payment Status",
  description:
    "Confirmation of your LocalLoop payment and the status of the order you just placed.",
  path: "/payment-result",
  noindex: true,
});

export default function PaymentResultLayout({ children }: { children: React.ReactNode }) {
  return children;
}
