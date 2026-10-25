"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Store, User, ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";

export function AuthHeader() {
  const pathname = usePathname();
  const isMerchant = pathname?.includes("/merchant");
  const isUser = pathname?.includes("/user");

  return (
    <header className="border-b border-cream-300 bg-cream-50/95 backdrop-blur-md sticky top-0 z-40 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 flex items-center justify-center text-white shadow-warm group-hover:scale-105 transition-transform flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-cream-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black text-xl text-forest-950 tracking-tight">
                Local<span className="text-terracotta-600">Loop</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-forest-800 text-cream-100">
                Hubballi
              </span>
            </div>
            <p className="text-[11px] text-forest-600 font-medium hidden sm:block">
              Your City’s Digital Marketplace
            </p>
          </div>
        </Link>

        {/* Portal Indicator Badge (Switch tabs removed for strict app separation) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cream-200/80 rounded-2xl border border-cream-300 text-xs font-bold text-forest-900">
          {isMerchant ? (
            <>
              <Store className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Merchant Partner Portal</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Shopper Application</span>
            </>
          )}
        </div>

        {/* Return to Store (Shopper Only) */}
        {!isMerchant ? (
          <Link
            href="/"
            className="text-xs font-semibold text-forest-700 hover:text-terracotta-700 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Browse Marketplace</span>
          </Link>
        ) : (
          <div className="w-16" />
        )}
      </div>
    </header>
  );
}
