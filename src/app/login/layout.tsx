import type { Metadata } from "next";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { SellerProvider } from "@/context/SellerContext";

export const metadata: Metadata = {
  title: "Sign In • LocalLoop Hubballi",
  description: "Sign in to LocalLoop as a Shopper or Merchant Partner. Explore, buy and fulfill local handmade orders.",
};

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
