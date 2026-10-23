"use client";

import React, { useState } from "react";
import { MOCK_PRODUCTS } from "@/data/mockData";
import { ProductCard } from "@/components/ProductCard";
import { ProductCategory } from "@/types";
import { LayoutGrid, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES: { label: ProductCategory; emoji: string; desc: string }[] = [
  { label: "All", emoji: "✨", desc: "All local categories in Hubballi" },
  { label: "Filter Coffee & Tea", emoji: "☕", desc: "Fresh chicory roasts & plantation peaberry" },
  { label: "Sweets & Snacks", emoji: "🍯", desc: "Authentic Dharwad pedha & crunchy savories" },
  { label: "Handloom & Crafts", emoji: "🪡", desc: "Ilkal sarees & hand-poured red river clay diyas" },
  { label: "Spices & Pantry", emoji: "🌶️", desc: "Byadagi chillies, stone ground spices & wood-pressed oils" },
  { label: "Fresh Produce", emoji: "🥬", desc: "Farm-fresh regional fruits & dairy" },
];

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("All");

  const categoriesToShow =
    selectedCategory === "All"
      ? CATEGORIES.filter((c) => c.label !== "All")
      : CATEGORIES.filter((c) => c.label === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-cream-300">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest-800 text-cream-100 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <LayoutGrid className="w-3 h-3 text-terracotta-400" />
            <span>Store Aisles</span>
          </div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-forest-950">
            Product Catalog Shelves
          </h1>
          <p className="text-xs text-forest-600 mt-0.5">
            Browse real products organized by artisan craft and neighborhood shelves
          </p>
        </div>

        <span className="text-xs font-bold text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-3 py-1 rounded-full self-start sm:self-auto">
          {MOCK_PRODUCTS.length} Local Products
        </span>
      </div>

      {/* Category Pills Horizontal Scroller */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map(({ label, emoji }) => {
          const isSelected = selectedCategory === label;
          return (
            <motion.button
              key={label}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(label)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold flex-shrink-0 transition-colors border ${
                isSelected
                  ? "text-white border-terracotta-600 shadow-warm"
                  : "bg-cream-50 text-forest-800 border-cream-300 hover:border-terracotta-300"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="categories-page-pill"
                  className="absolute inset-0 bg-terracotta-500 rounded-2xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 text-sm">{emoji}</span>
              <span className="relative z-10">{label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Category Shelves */}
      <div className="space-y-10 pt-2">
        {categoriesToShow.map((cat) => {
          const shelfProducts = MOCK_PRODUCTS.filter(
            (p) => p.category === cat.label
          );

          if (shelfProducts.length === 0) return null;

          return (
            <motion.section
              key={cat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3.5"
            >
              {/* Shelf Header */}
              <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cat.emoji}</span>
                  <div>
                    <h2 className="font-serif font-bold text-lg text-forest-950">
                      {cat.label} Shelf
                    </h2>
                    <p className="text-xs text-forest-500">{cat.desc}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-forest-600 bg-cream-200 px-2.5 py-0.5 rounded-full">
                  {shelfProducts.length} items
                </span>
              </div>

              {/* Responsive Grid: 1 col on mobile, 2 col sm, 3-4 col on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {shelfProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
