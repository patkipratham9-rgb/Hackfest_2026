import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shopper Sign In",
  description:
    "Sign in or create a LocalLoop shopper account to place orders with neighbourhood shops in Hubballi-Dharwad.",
  path: "/login/user",
  noindex: true,
});

export default function LoginUserLayout({ children }: { children: React.ReactNode }) {
  return children;
}
