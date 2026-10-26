import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Your Account",
  description:
    "Manage your LocalLoop profile, saved delivery addresses and sign-in details.",
  path: "/account",
  noindex: true,
});

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
