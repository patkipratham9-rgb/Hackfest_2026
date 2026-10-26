import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shop by Category",
  description:
    "Browse groceries, sweets, bakery items, clothing and more from independent shops across Hubballi-Dharwad, grouped by category.",
  path: "/categories",
});

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
