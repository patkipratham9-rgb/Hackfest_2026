"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LayoutGrid, RotateCcw, History } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

export function BottomNav() {
  const pathname = usePathname();
  const { reorderableCount, isLoaded } = useCart();

  const navTabs = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: Compass,
      isActive: pathname === "/",
    },
    {
      id: "categories",
      label: "Categories",
      href: "/categories",
      icon: LayoutGrid,
      isActive: pathname.startsWith("/categories"),
    },
    {
      id: "orders-again",
      label: "Orders Again",
      href: "/orders-again",
      icon: RotateCcw,
      isActive: pathname.startsWith("/orders"),
      badgeCount: reorderableCount,
    },
    {
      id: "recent-explored",
      label: "Recent Explored",
      href: "/recent-explored",
      icon: History,
      isActive: pathname.startsWith("/recent"),
    },
  ];

  // Hide consumer bottom navigation (Categories, Orders Again, Recent) from Merchant & Auth apps
  if (
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/merchant/login") ||
    pathname?.startsWith("/seller") ||
    pathname?.startsWith("/merchant")
  ) {
    return null;
  }

  return (
    <nav
      data-testid="bottom-tab-navigation"
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 bg-cream-50/95 backdrop-blur-lg border-t border-cream-300 pb-safe shadow-floating"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.isActive;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              data-testid={`tab-button-${tab.id}`}
              aria-current={isActive ? "page" : undefined}
              scroll={true}
              className="relative flex-1 flex flex-col items-center justify-center h-full py-1 group transition-colors tap-bounce"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-indicator"
                  className="absolute top-1 w-8 h-1 rounded-full bg-terracotta-500"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? "text-terracotta-600 scale-110"
                      : "text-forest-600 group-hover:text-forest-900"
                  }`}
                />

                {/* Terracotta Counter Badge */}
                {Boolean(isLoaded && tab.badgeCount && tab.badgeCount > 0) && (
                  <motion.span
                    suppressHydrationWarning
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-terracotta-500 text-white text-[10px] font-extrabold flex items-center justify-center border border-cream-50 shadow-xs"
                  >
                    {tab.badgeCount}
                  </motion.span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 transition-colors leading-tight ${
                  isActive
                    ? "text-terracotta-600 font-extrabold"
                    : "text-forest-600 font-medium group-hover:text-forest-900"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
