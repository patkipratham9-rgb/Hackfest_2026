"use client";

import React from "react";
import { NeighborhoodArea } from "@/types";
import { useCart } from "@/context/CartContext";
import { MOCK_STORES } from "@/data/mockData";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

const AREAS: NeighborhoodArea[] = [
  "All",
  "Vidyanagar",
  "Gokul Road",
  "CBT",
  "Station Road",
  "Unkal Lake",
];

export function AreaPills() {
  const { activeArea, setActiveArea } = useCart();

  return (
    <div
      data-testid="area-selector"
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-forest-800">
          <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
          <span>Neighborhood Area:</span>
        </div>
        <span className="text-[11px] font-semibold text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-2 py-0.5 rounded-full">
          {activeArea === "All" ? "All Hubballi (5 stores)" : `${activeArea} selected`}
        </span>
      </div>

      <div
        data-testid="neighborhood-pills"
        role="tablist"
        aria-label="Filter stores by neighborhood"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
      >
        {AREAS.map((area, idx) => {
          const isSelected = activeArea === area;
          const slug = area.toLowerCase().replace(/\s+/g, "-");
          const storeCount =
            area === "All"
              ? MOCK_STORES.length
              : MOCK_STORES.filter((s) => s.area === area).length;

          return (
            <motion.button
              key={area || `area-${idx}`}
              role="tab"
              aria-selected={isSelected}
              data-testid={`area-pill-${slug}`}
              data-area={area}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => setActiveArea(area)}
              className={`relative px-4 py-2 rounded-2xl text-xs font-semibold flex-shrink-0 transition-all border ${
                isSelected
                  ? "text-white border-terracotta-600 shadow-warm font-bold"
                  : "bg-cream-50 text-forest-800 border-cream-300 hover:border-terracotta-300"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-area-pill"
                  className="absolute inset-0 bg-terracotta-500 rounded-2xl"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span>{area === "All" ? "📍 All Hubballi" : area}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? "bg-white/25 text-white"
                      : "bg-cream-200 text-forest-600"
                  }`}
                >
                  {storeCount}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
