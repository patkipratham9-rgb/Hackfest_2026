import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return pageMetadata({
    title: `Order ${id}`,
    description: "Live status, pickup PIN and item details for your LocalLoop order from a Hubballi-Dharwad shop.",
    path: `/orders/${encodeURIComponent(id)}`,
    noindex: true,
  });
}

export default function OrderDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
