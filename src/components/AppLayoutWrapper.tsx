"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ProfilePanel } from "@/components/ProfilePanel";
import { LocalLoopAssistantBot } from "@/components/LocalLoopAssistantBot";
import { Footer } from "@/components/Footer";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith("/login") || pathname?.startsWith("/merchant/login");
  const isMerchantApp =
    pathname?.startsWith("/seller") || pathname?.startsWith("/merchant");

  // Merchant Application is completely separated from consumer shopper layout:
  // Categories, Orders Again, Cart, and Recent options are excluded from Merchant pages.
  if (isAuthPage || isMerchantApp) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <CartDrawer />
      <CheckoutModal />
      <ProfilePanel />
      <LocalLoopAssistantBot />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-24 sm:pb-12 w-full overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
