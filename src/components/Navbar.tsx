"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, ShoppingBag, ChevronDown, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { NeighborhoodArea } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

const AREAS: NeighborhoodArea[] = [
  "All",
  "Vidyanagar",
  "Gokul Road",
  "CBT",
  "Station Road",
  "Unkal Lake",
];

export function Navbar() {
  const { totalItems, setIsCartOpen, activeArea, setActiveArea } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream-100/90 backdrop-blur-md border-b border-cream-300 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-forest-700 flex items-center justify-center text-cream-100 font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            <span className="font-serif">L</span>
            <span className="w-2 h-2 rounded-full bg-terracotta-500 -ml-0.5 mt-1.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-forest-900 leading-none">
              Localoop<span className="text-terracotta-500">.</span>
            </span>
            <span className="text-[10px] font-medium text-forest-600 tracking-wider uppercase mt-0.5">
              Hubballi City
            </span>
          </div>
        </Link>

        {/* Neighborhood Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-200 border border-cream-300 hover:border-terracotta-300 text-xs font-semibold text-forest-800 transition-colors shadow-xs"
            aria-label="Select Neighborhood"
          >
            <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
            <span className="truncate max-w-[110px] sm:max-w-none">
              {activeArea === "All" ? "Everywhere in City" : activeArea}
            </span>
            <ChevronDown className="w-3 h-3 text-forest-500" />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 bg-cream-50 rounded-2xl shadow-floating border border-cream-300 py-1.5 z-50 overflow-hidden"
              >
                <div className="px-3 py-1 text-[11px] font-semibold text-forest-500 tracking-wider uppercase">
                  Select Neighborhood
                </div>
                {AREAS.map((area) => (
                  <button
                    key={area}
                    onClick={() => {
                      setActiveArea(area);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                      activeArea === area
                        ? "bg-terracotta-100 text-terracotta-800 font-bold"
                        : "text-forest-900 hover:bg-cream-200"
                    }`}
                  >
                    <span>{area === "All" ? "All Neighborhoods" : area}</span>
                    {activeArea === area && (
                      <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Actions: AI Badge & Cart */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-100 text-forest-700 text-[11px] font-semibold border border-forest-200">
            <Sparkles className="w-3 h-3 text-terracotta-500 animate-pulse" />
            <span>Hyperlocal AI Routing</span>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-forest-700 hover:bg-forest-800 text-cream-100 transition-all tap-bounce shadow-sm"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 text-cream-100" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-terracotta-500 text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-cream-100 shadow-xs"
              >
                {totalItems}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
