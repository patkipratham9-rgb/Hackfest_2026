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

  React.useEffect(() => {
    // Intercept and suppress non-Error unhandled rejections and recover from chunk loading errors
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      const isEventReason =
        reason instanceof Event ||
        Object.prototype.toString.call(reason) === "[object Event]" ||
        (reason && typeof reason === "object" && !reason.message && !reason.stack);

      if (isEventReason) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      const msg = reason?.message || String(reason || "");
      if (
        msg.includes("Loading chunk") ||
        msg.includes("ChunkLoadError") ||
        reason?.name === "ChunkLoadError" ||
        msg.includes("_next/undefined")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        // Debounced self-healing reload for stale client cache
        const lastReload = sessionStorage.getItem("chunk_reload_ts");
        const now = Date.now();
        if (!lastReload || now - Number(lastReload) > 8000) {
          sessionStorage.setItem("chunk_reload_ts", String(now));
          window.location.reload();
        }
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection, true);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, true);
    };
  }, []);

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
