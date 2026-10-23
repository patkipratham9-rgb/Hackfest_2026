"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, ShoppingBag, Clock, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

export function BottomNav() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();

  const navItems = [
    { label: "Explore", href: "/", icon: Compass },
    { label: "Orders", href: "/orders", icon: Clock },
    { label: "Account", href: "/account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-cream-50/95 backdrop-blur-lg border-t border-cream-300 sm:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-full py-1 text-forest-700 hover:text-terracotta-600 transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active"
                  className="absolute top-1.5 w-10 h-1 rounded-full bg-terracotta-500"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? "text-terracotta-600 scale-110 font-bold" : "text-forest-600"
                }`}
              />
              <span
                className={`text-[10px] mt-1 font-medium ${
                  isActive ? "text-terracotta-700 font-bold" : "text-forest-600"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Floating In-Nav Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center w-16 h-full py-1 text-forest-700 hover:text-terracotta-600 transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-forest-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-terracotta-500 text-white text-[9px] font-black flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium text-forest-600">Cart</span>
        </button>
      </div>
    </nav>
  );
}
