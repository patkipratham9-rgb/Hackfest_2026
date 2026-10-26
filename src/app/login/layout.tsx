import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { SellerProvider } from "@/context/SellerContext";

export const metadata: Metadata = pageMetadata({
  title: "Sign In",
  description:
    "Sign in to LocalLoop as a shopper or merchant partner to order from, or sell through, neighbourhood shops in Hubballi-Dharwad.",
  path: "/login",
  noindex: true,
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SellerProvider>
      <div className="min-h-screen flex flex-col bg-cream-100 text-forest-950">
        <AuthHeader />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <AuthFooter />
      </div>
    </SellerProvider>
  );
}
