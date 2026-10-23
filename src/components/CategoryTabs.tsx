"use client";

import React from "react";
import { ProductCategory } from "@/types";
import { motion } from "framer-motion";

const CATEGORIES: { label: ProductCategory; emoji: string }[] = [
  { label: "All", emoji: "✨" },
  { label: "Filter Coffee & Tea", emoji: "☕" },
  { label: "Sweets & Snacks", emoji: "🍯" },
  { label: "Handloom & Crafts", emoji: "🪡" },
  { label: "Spices & Pantry", emoji: "🌶️" },
  { label: "Fresh Produce", emoji: "🥬" },
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
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {CATEGORIES.map(({ label, emoji }) => {
        const isSelected = activeCategory === label;
        return (
          <motion.button
            key={label}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(label)}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold flex-shrink-0 transition-colors border ${
              isSelected
                ? "text-white border-terracotta-600 shadow-warm"
                : "bg-cream-100 text-forest-800 border-cream-300 hover:border-terracotta-300 hover:bg-cream-200"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="active-category-pill"
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
  );
}
