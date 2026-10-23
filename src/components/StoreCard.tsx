"use client";

import React, { useState } from "react";
import { Store } from "@/types";
import { MapPin, Star, Heart, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface StoreCardProps {
  store: Store;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function StoreCard({ store, onSelect, isSelected }: StoreCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.div
      layout
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-3xl bg-cream-50 border transition-all cursor-pointer shadow-warm ${
        isSelected
          ? "border-terracotta-500 ring-2 ring-terracotta-400/40 shadow-warm-lg"
          : "border-cream-300 hover:border-terracotta-400"
      }`}
    >
      {/* Banner / Store Image */}
      <div className="relative h-40 w-full bg-cream-200 overflow-hidden">
        <motion.img
          src={store.bannerUrl || store.imageUrl}
          alt={store.name}
          className="h-full w-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.5 }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-black/20 to-transparent" />

        {/* Distance Badge */}
        <div className="absolute top-3 left-3 bg-cream-50/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-forest-800 flex items-center gap-1 shadow-xs">
          <MapPin className="w-3.5 h-3.5 text-terracotta-600" />
          <span>{store.distance}</span>
        </div>

        {/* Favorite Heart Button */}
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-cream-50/90 backdrop-blur-md flex items-center justify-center text-forest-800 shadow-xs z-10"
          aria-label="Favorite store"
        >
          <motion.div
            animate={{ scale: isFavorite ? [1, 1.4, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite
                  ? "fill-terracotta-500 text-terracotta-500"
                  : "text-forest-700"
              }`}
            />
          </motion.div>
        </motion.button>

        {/* Store Title inside banner bottom */}
        <div className="absolute bottom-3 left-3.5 right-3.5 text-cream-50">
          <div className="flex items-center gap-1.5">
            <h3 className="font-serif font-bold text-base leading-snug drop-shadow-sm text-white line-clamp-1">
              {store.name}
            </h3>
            {store.verified && (
              <CheckCircle className="w-4 h-4 text-terracotta-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-cream-200/90 line-clamp-1 mt-0.5">
            {store.lane} • {store.area}
          </p>
        </div>
      </div>

      {/* Body details */}
      <div className="p-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-cream-200 px-2 py-0.5 rounded-lg text-xs font-bold text-forest-900">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{store.rating}</span>
            <span className="text-[10px] text-forest-500 font-normal">
              ({store.reviewCount})
            </span>
          </div>

          <span className="text-[11px] font-medium text-forest-600 bg-cream-200/80 px-2.5 py-0.5 rounded-md">
            {store.category}
          </span>
        </div>

        <motion.div
          className="text-xs font-bold text-terracotta-600 flex items-center gap-1"
          animate={{ x: isSelected ? 3 : 0 }}
        >
          <span>{isSelected ? "Selected" : "Browse"}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </motion.div>
      </div>
    </motion.div>
  );
}
