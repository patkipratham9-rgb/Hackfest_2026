"use client";

import React, { useState } from "react";
import { Store } from "@/types";
import {
  MapPin,
  Star,
  Heart,
  CheckCircle,
  ArrowRight,
  Clock,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";

interface StoreCardProps {
  store: Store;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function StoreCard({ store, onSelect, isSelected }: StoreCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const defaultStoreBanner =
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80";
  const storeImageSrc =
    (store.bannerUrl && store.bannerUrl.trim()) ||
    (store.imageUrl && store.imageUrl.trim()) ||
    defaultStoreBanner;

  return (
    <motion.div
      layout
      data-testid="store-card"
      data-store-id={store.id}
      data-store-area={store.area}
      data-store-category={store.category}
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={onSelect}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-cream-50 border transition-all cursor-pointer shadow-warm ${
        isSelected
          ? "border-terracotta-500 ring-2 ring-terracotta-400/40 shadow-warm-lg"
          : "border-cream-300 hover:border-terracotta-400"
      }`}
    >
      <div>
        {/* Banner / Store Image */}
        <div className="relative h-44 w-full bg-cream-200 overflow-hidden">
          <motion.img
            src={storeImageSrc}
            alt={store.name || "Local store"}
            data-testid="store-image"
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.5 }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/30 to-transparent" />

          {/* Top Row: Distance Badge & Availability Status */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            {/* Distance Tag */}
            <div
              data-testid="store-distance"
              className="bg-cream-50/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-forest-800 flex items-center gap-1 shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5 text-terracotta-600" />
              <span>{store.distance}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Availability Badge */}
              <div
                data-testid="store-availability"
                className={`backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-xs ${
                  store.isOpen
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-950/80 text-rose-300 border border-rose-500/30"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    store.isOpen
                      ? "bg-emerald-400 animate-pulse"
                      : "bg-rose-400"
                  }`}
                />
                <span>{store.isOpen ? "Open Now" : "Closed"}</span>
              </div>

              {/* Favorite Heart Button */}
              <motion.button
                whileTap={{ scale: 0.75 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFavorite(!isFavorite);
                }}
                className="w-8 h-8 rounded-full bg-cream-50/90 backdrop-blur-md flex items-center justify-center text-forest-800 shadow-xs"
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
            </div>
          </div>

          {/* Store Name & Location inside banner bottom */}
          <div className="absolute bottom-3 left-3.5 right-3.5 text-cream-50 z-10">
            <div className="flex items-center gap-1.5">
              <h3
                data-testid="store-name"
                className="font-serif font-bold text-base leading-snug drop-shadow-sm text-white line-clamp-1 group-hover:text-terracotta-200 transition-colors"
              >
                {store.name}
              </h3>
              {store.verified && (
                <span title="Verified Vendor" className="inline-flex">
                  <CheckCircle className="w-4 h-4 text-terracotta-400 flex-shrink-0" />
                </span>
              )}
            </div>
            <p className="text-xs text-cream-200/95 line-clamp-1 mt-0.5 flex items-center gap-1">
              <span>{store.lane} • </span>
              <span
                data-testid="store-area-tag"
                className="font-semibold text-cream-100"
              >
                {store.area}
              </span>
            </p>
          </div>
        </div>

        {/* Tagline / Subtitle */}
        <div className="px-3.5 pt-3 pb-1">
          <p className="text-xs text-forest-600 line-clamp-1">
            {store.tagline}
          </p>
        </div>
      </div>

      {/* Body details & action */}
      <div className="p-3.5 pt-2 flex items-center justify-between gap-2 border-t border-cream-200/60 mt-1">
        <div className="flex items-center gap-2">
          {/* Category Tag */}
          <span
            data-testid="store-category"
            className="text-[11px] font-bold text-terracotta-700 bg-terracotta-50 border border-terracotta-200/70 px-2.5 py-0.5 rounded-lg"
          >
            {store.category}
          </span>

          {/* Rating */}
          <div className="flex items-center gap-1 bg-cream-200 px-2 py-0.5 rounded-lg text-xs font-bold text-forest-900">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{store.rating}</span>
            <span className="text-[10px] text-forest-500 font-normal">
              ({store.reviewCount})
            </span>
          </div>
        </div>

        {/* Actions: Direct Call & Browse CTA */}
        <div className="flex items-center gap-2">
          {store.phone && (
            <a
              href={`tel:${store.phone.replace(/\s+/g, "")}`}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-full bg-cream-200 hover:bg-cream-300 text-forest-700 hover:text-terracotta-600 transition-colors"
              title={`Call store at ${store.phone}`}
              aria-label={`Call ${store.name}`}
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}

          <motion.div
            className="text-xs font-bold text-terracotta-600 flex items-center gap-1"
            animate={{ x: isSelected ? 3 : 0 }}
          >
            <span>{isSelected ? "Browsing" : "Browse"}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
