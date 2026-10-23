"use client";

import React from "react";
import { Store } from "@/types";
import { MapPin, Star, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface StoreCardProps {
  store: Store;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function StoreCard({ store, onSelect, isSelected }: StoreCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-3xl bg-cream-50 border transition-all cursor-pointer shadow-warm ${
        isSelected
          ? "border-terracotta-500 ring-2 ring-terracotta-400/40"
          : "border-cream-300 hover:border-terracotta-300"
      }`}
    >
      {/* Banner / Store Image */}
      <div className="relative h-36 w-full bg-cream-200 overflow-hidden">
        <img
          src={store.bannerUrl || store.imageUrl}
          alt={store.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-black/20" />

        {/* Distance Badge */}
        <div className="absolute top-3 left-3 bg-cream-50/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-forest-800 flex items-center gap-1 shadow-xs">
          <MapPin className="w-3 h-3 text-terracotta-600" />
          <span>{store.distance}</span>
        </div>

        {/* Open/Closed Badge */}
        <div
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs ${
            store.isOpen
              ? "bg-forest-700/90 text-white"
              : "bg-amber-800/80 text-white"
          }`}
        >
          {store.isOpen ? "Open Now" : "Opens Soon"}
        </div>

        {/* Store Title inside banner bottom */}
        <div className="absolute bottom-2.5 left-3.5 right-3.5 text-cream-50">
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-cream-200 px-2 py-0.5 rounded-lg text-xs font-bold text-forest-900">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{store.rating}</span>
            <span className="text-[10px] text-forest-500 font-normal">
              ({store.reviewCount})
            </span>
          </div>

          <span className="text-[11px] font-medium text-forest-600 bg-cream-200/80 px-2 py-0.5 rounded-md">
            {store.category}
          </span>
        </div>

        <button
          className="text-xs font-bold text-terracotta-600 group-hover:text-terracotta-700 group-hover:translate-x-0.5 transition-all flex items-center gap-0.5"
        >
          <span>Browse</span>
          <span>→</span>
        </button>
      </div>
    </motion.div>
  );
}
