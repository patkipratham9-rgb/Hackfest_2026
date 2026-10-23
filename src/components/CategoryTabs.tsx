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
          <button
            key={label}
            onClick={() => onSelectCategory(label)}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-semibold flex-shrink-0 transition-all border ${
              isSelected
                ? "bg-terracotta-500 text-white border-terracotta-600 shadow-warm"
                : "bg-cream-100 text-forest-800 border-cream-300 hover:border-terracotta-300 hover:bg-cream-200"
            }`}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
