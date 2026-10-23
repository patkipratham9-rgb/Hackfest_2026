"use client";

import React, { useState, useMemo } from "react";
import { MOCK_PRODUCTS } from "@/data/mockData";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types";
import { Sparkles, Flame, Check, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type FilterSlug = "all" | "under-999" | "gi-tagged" | "gift-sets" | "new-harvest";
type CraftSlug = "all" | "ceramics" | "pantry" | "linens" | "incense";

const FILTER_CHIPS: { label: string; slug: FilterSlug }[] = [
  { label: "All", slug: "all" },
  { label: "Under ₹999", slug: "under-999" },
  { label: "GI-Tagged", slug: "gi-tagged" },
  { label: "Gift Sets", slug: "gift-sets" },
  { label: "New Harvest", slug: "new-harvest" },
];

const CRAFT_TILES = [
  {
    slug: "ceramics",
    name: "Handcrafted Ceramics",
    blurb: "Stoneware mugs, plates & red clay diyas",
    count: 18,
    image: "https://images.pexels.com/photos/13575096/pexels-photo-13575096.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    alt: "Vibrant collection of handmade pottery mugs in earthy tones",
  },
  {
    slug: "pantry",
    name: "Organic Pantry & Botanicals",
    blurb: "Cold-pressed oils, chillies & pedha",
    count: 24,
    image: "https://images.unsplash.com/photo-1580116270858-8a0d62b15426?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxvcmdhbmljJTIwcGFudHJ5JTIwYm90YW5pY2FsJTIwZ29vZHN8ZW58MHx8fHwxNzkyNzMxMzIzfDA&ixlib=rb-4.1.0&q=85",
    alt: "Shelf filled with organic spices, glass jars, and botanical infusions",
  },
  {
    slug: "linens",
    name: "Woven Home Linens",
    blurb: "Raw cotton & Ilkal handloom weaves",
    count: 12,
    image: "https://images.unsplash.com/photo-1762214785391-aeab5f8d9e47?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwzfHxoYW5kbWFkZSUyMGNyYWZ0JTIwbmF0dXJhbCUyMGxpbmVufGVufDB8fHx8MTc5MjczMTMyM3ww&ixlib=rb-4.1.0&q=85",
    alt: "Organic green handwoven linen draped over rustic wooden frame",
  },
];

export default function CategoriesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterSlug>("all");
  const [activeCraft, setActiveCraft] = useState<CraftSlug>("all");

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      // Craft filter
      if (activeCraft === "ceramics") {
        if (!product.category.includes("Crafts") && !product.name.toLowerCase().includes("diya") && !product.name.toLowerCase().includes("pottery")) {
          return false;
        }
      } else if (activeCraft === "pantry") {
        if (!product.category.includes("Pantry") && !product.category.includes("Sweets") && !product.category.includes("Coffee")) {
          return false;
        }
      } else if (activeCraft === "linens") {
        if (!product.category.includes("Handloom") && !product.name.toLowerCase().includes("saree") && !product.name.toLowerCase().includes("cotton")) {
          return false;
        }
      } else if (activeCraft === "incense") {
        if (!product.category.includes("Crafts") && !product.name.toLowerCase().includes("dhoop") && !product.name.toLowerCase().includes("brass")) {
          return false;
        }
      }

      // Chip filter
      if (activeFilter === "under-999") {
        return product.price < 999;
      }
      if (activeFilter === "gi-tagged") {
        return (
          product.tags?.some((t) => t.toLowerCase().includes("gi") || t.toLowerCase().includes("authentic") || t.toLowerCase().includes("heritage")) ||
          product.name.toLowerCase().includes("dharwad") ||
          product.name.toLowerCase().includes("byadagi") ||
          product.name.toLowerCase().includes("ilkal")
        );
      }
      if (activeFilter === "gift-sets") {
        return product.name.toLowerCase().includes("set") || product.name.toLowerCase().includes("pack") || product.price > 400;
      }
      if (activeFilter === "new-harvest") {
        return product.category.includes("Produce") || product.category.includes("Spices") || product.category.includes("Coffee");
      }

      return true;
    });
  }, [activeFilter, activeCraft]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <title>Aisles &amp; Categories • LocalLoop Hubballi</title>
      <meta
        name="description"
        content="Browse authentic goods across Handcrafted Ceramics, Organic Pantry, Byadagi Spices, and Ilkal Weaves in Hubballi."
      />

      {/* Categories Header */}
      <div className="space-y-1.5 pb-2 border-b border-cream-300">
        <p
          data-testid="categories-overline"
          className="text-[11px] font-bold uppercase tracking-[0.2em] text-terracotta-600"
        >
          Curated aisles
        </p>
        <h1
          data-testid="categories-title"
          className="font-serif font-extrabold text-2xl sm:text-3xl text-forest-950"
        >
          Shop by craft
        </h1>
        <p className="text-xs sm:text-sm text-forest-600">
          Handmade directly by certified makers — no mass runs. Tap any aisle to inspect live product shelves.
        </p>
      </div>

      {/* Filter Chips Horizontal Scroller */}
      <div
        data-testid="categories-filter-chips"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
      >
        {FILTER_CHIPS.map((chip) => {
          const isSelected = activeFilter === chip.slug;
          return (
            <motion.button
              key={chip.slug}
              data-testid={`category-filter-chip-${chip.slug}`}
              aria-pressed={isSelected}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => {
                setActiveFilter(chip.slug);
                if (chip.slug !== "all") setActiveCraft("all");
              }}
              className={`h-9 shrink-0 rounded-full border px-4 text-[13px] font-semibold transition-all ${
                isSelected
                  ? "border-terracotta-600 bg-terracotta-500 text-white shadow-md"
                  : "border-cream-300 bg-cream-50 text-forest-800 hover:border-terracotta-400"
              }`}
            >
              {chip.label}
            </motion.button>
          );
        })}
      </div>

      {/* Craft Tiles Grid */}
      <div data-testid="categories-grid" className="grid grid-cols-2 gap-3 sm:gap-4">
        {CRAFT_TILES.map((tile) => {
          const isSelected = activeCraft === tile.slug;
          return (
            <motion.button
              key={tile.slug}
              data-testid={`category-tile-${tile.slug}`}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveCraft(isSelected ? "all" : (tile.slug as CraftSlug));
                setActiveFilter("all");
              }}
              className={`text-left w-full overflow-hidden rounded-2xl border bg-cream-50 shadow-xs transition-all ${
                tile.slug === "ceramics" ? "col-span-2" : "col-span-1"
              } ${
                isSelected
                  ? "border-terracotta-500 ring-2 ring-terracotta-400"
                  : "border-cream-300 hover:border-terracotta-300"
              }`}
            >
              <img
                src={tile.image}
                alt={tile.alt}
                loading="lazy"
                className={`w-full object-cover ${
                  tile.slug === "ceramics" ? "h-40 sm:h-48" : "h-28 sm:h-36"
                }`}
              />
              <div className="p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[15px] font-bold text-forest-950 font-serif">
                    {tile.name}
                  </p>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-terracotta-500" />
                  )}
                </div>
                <p className="text-[12px] text-forest-600 mt-0.5">{tile.blurb}</p>
                <p className="mt-1 text-[12px] font-bold text-terracotta-600">
                  {tile.count} items
                </p>
              </div>
            </motion.button>
          );
        })}

        {/* Natural Incense & Clay Wide Tile */}
        <motion.button
          data-testid="category-tile-incense"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActiveCraft(activeCraft === "incense" ? "all" : "incense");
            setActiveFilter("all");
          }}
          className={`col-span-2 w-full rounded-2xl bg-forest-800 p-4 text-cream-100 shadow-md text-left transition-all ${
            activeCraft === "incense" ? "ring-2 ring-terracotta-400" : ""
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-forest-900 text-terracotta-400">
              <Flame className="size-6" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold font-serif text-cream-100">
                Natural Incense & Clay
              </p>
              <p className="text-[12px] text-cream-200">
                Diffusers, cones & hand-molded dhoop
              </p>
              <p className="mt-0.5 text-[12px] font-bold text-terracotta-300">
                15 items
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-cream-300" />
          </div>
        </motion.button>
      </div>

      {/* Story Banner Image */}
      <div className="overflow-hidden rounded-2xl border border-cream-300 shadow-xs">
        <img
          src="https://images.unsplash.com/photo-1620051730698-57645ec179fa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwxfHxhcnRpc2FuJTIwY2VyYW1pYyUyMHBvdHRlcnklMjBjb2ZmZWV8ZW58MHx8fHwxNzkyNzMxMzIzfDA&ixlib=rb-4.1.0&q=85"
          alt="Ceramic artisan espresso brew with handmade earthy mug"
          loading="lazy"
          className="h-36 sm:h-44 w-full object-cover"
          data-testid="categories-story-image"
        />
      </div>

      {/* Real Product Shelves: Photos, Prices & Add-to-Cart */}
      <section className="space-y-4 pt-4 border-t border-cream-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest-800 text-cream-100 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-terracotta-400" />
              <span>Live Shelf Catalog</span>
            </div>
            <h2 className="font-serif font-bold text-lg text-forest-950">
              {activeCraft !== "all"
                ? `${CRAFT_TILES.find((t) => t.slug === activeCraft)?.name || "Craft"} Shelf`
                : activeFilter !== "all"
                ? `${FILTER_CHIPS.find((f) => f.slug === activeFilter)?.label} Products`
                : "All Curated Shelves"}
            </h2>
            <p className="text-xs text-forest-500">
              Prices, live inventory, and one-tap pickup checkout for Hubballi shoppers
            </p>
          </div>

          <span className="text-xs font-bold text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-3 py-1 rounded-full">
            {filteredProducts.length} items available
          </span>
        </div>

        {/* Responsive Shelves Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
