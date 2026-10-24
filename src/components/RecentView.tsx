"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ProductCard";
import { History, Sparkles, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function RecentView() {
  const { recentlyViewed } = useCart();

  return (
    <div className="space-y-6">
      <title>Recent Explored • LocalLoop Hubballi</title>
      <meta
        name="description"
        content="Pick up right where you left off — items and stores you recently viewed across Hubballi."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-300">
        <div>
          <p
            data-testid="recent-explored-overline"
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-terracotta-600 mb-1"
          >
            Browsing History
          </p>
          <h1
            data-testid="recent-explored-title"
            className="font-serif font-extrabold text-2xl sm:text-3xl text-forest-950"
          >
            Recent Explored
          </h1>
          <p className="text-xs text-forest-600 mt-0.5">
            Pick up right where you left off — items and stores you recently viewed in Hubballi
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-200 hover:bg-cream-300 text-forest-800 rounded-xl text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Shop More</span>
          </Link>
        </div>
      </div>

      {/* Grid or Empty State */}
      {recentlyViewed.length === 0 ? (
        <motion.div
          data-testid="recent-explored-empty-state"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 text-center bg-cream-50 rounded-3xl border border-cream-300 space-y-4 shadow-warm"
        >
          <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mx-auto text-forest-500">
            <History className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-forest-900">
              No recently viewed items
            </h3>
            <p className="text-xs text-forest-600 max-w-sm mx-auto mt-1">
              Start browsing through artisanal sweets, filter coffee, or handloom crafts in your neighborhood!
            </p>
          </div>
          <Link
            href="/categories"
            data-testid="recent-explored-cta"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl text-xs font-bold shadow-warm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Browse Categories</span>
          </Link>
          <p
            data-testid="recent-explored-privacy-note"
            className="text-[11px] text-forest-500 mt-3"
          >
            Your browsing history is kept locally on this device.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-forest-600 font-medium">
            <span>Showing {recentlyViewed.length} recently viewed items</span>
            <span className="text-[11px] text-terracotta-600">Saved to device</span>
          </div>

          {/* Responsive Grid: 1 col on mobile, 2 col sm, 3-4 col on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {recentlyViewed.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
