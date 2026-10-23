"use client";

import React from "react";
import { NeighborhoodArea } from "@/types";
import { useCart } from "@/context/CartContext";
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
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-forest-700 pl-1 pr-2 flex-shrink-0">
        <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
        <span>Neighborhood:</span>
      </div>
      {AREAS.map((area) => {
        const isSelected = activeArea === area;
        return (
          <button
            key={area}
            onClick={() => setActiveArea(area)}
            className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all tap-bounce ${
              isSelected
                ? "text-cream-100 font-semibold shadow-xs"
                : "bg-cream-200 text-forest-800 hover:bg-cream-300"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="active-area-pill"
                className="absolute inset-0 bg-forest-700 rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {area === "All" ? "📍 All Hubballi" : area}
            </span>
          </button>
        );
      })}
    </div>
  );
}
