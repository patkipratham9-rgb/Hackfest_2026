"use client";

import React from "react";
import { ProductCategory } from "@/types";
import { MOCK_STORES } from "@/data/mockData";
import { motion } from "framer-motion";
import { Layers, Sparkles, Wheat, UtensilsCrossed, Apple, Home } from "lucide-react";

export interface CategoryItem {
  label: ProductCategory;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CATEGORIES: CategoryItem[] = [
  { label: "All", icon: Sparkles, desc: "All stores" },
  { label: "Grocery", icon: Wheat, desc: "Spices & pantry" },
  { label: "Bakery", icon: UtensilsCrossed, desc: "Pedha & savories" },
  { label: "Produce", icon: Apple, desc: "Fresh dairy & fruit" },
  { label: "Household", icon: Home, desc: "Diyas & handlooms" },
];

interface CategoryTabsProps {
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
}

export function CategoryTabs({
  activeCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div
      data-testid="category-tabs"
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-forest-800">
          <Layers className="w-3.5 h-3.5 text-terracotta-500" />
          <span>Store Category:</span>
        </div>
        <span className="text-[11px] font-semibold text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-2 py-0.5 rounded-full">
          {activeCategory === "All" ? "All Categories" : `${activeCategory} selected`}
        </span>
      </div>

      <div
        role="tablist"
        aria-label="Filter stores by category"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
      >
        {CATEGORIES.map(({ label, icon: Icon }, idx) => {
          const isSelected = activeCategory === label;
          const slug = label.toLowerCase().replace(/\s+/g, "-");
          const storeCount =
            label === "All"
              ? MOCK_STORES.length
              : MOCK_STORES.filter((s) => s.category === label).length;

          return (
            <motion.button
              key={label || `category-tab-${idx}`}
              role="tab"
              aria-selected={isSelected}
              data-testid={`category-tab-${slug}`}
              data-category={label}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectCategory(label)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold flex-shrink-0 transition-all border ${
                isSelected
                  ? "text-white border-terracotta-600 shadow-warm font-bold"
                  : "bg-cream-50 text-forest-800 border-cream-300 hover:border-terracotta-300 hover:bg-cream-100"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-category-pill"
                  className="absolute inset-0 bg-terracotta-500 rounded-2xl"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <Icon className="relative z-10 w-3.5 h-3.5" />
              <span className="relative z-10">{label}</span>
              <span
                className={`relative z-10 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected
                    ? "bg-white/25 text-white"
                    : "bg-cream-200 text-forest-600"
                }`}
              >
                {storeCount}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
