"use client";

import React, { useState, useMemo } from "react";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockData";
import { useCart } from "@/context/CartContext";
import { AreaPills } from "@/components/AreaPills";
import { CategoryTabs } from "@/components/CategoryTabs";
import { SearchBar } from "@/components/SearchBar";
import { StoreCard } from "@/components/StoreCard";
import { ProductCard } from "@/components/ProductCard";
import { ProductCategory } from "@/types";
import { Sparkles, MapPin, Store as StoreIcon, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const { activeArea } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("All");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Filter stores based on active area and search
  const filteredStores = useMemo(() => {
    return MOCK_STORES.filter((store) => {
      const matchesArea = activeArea === "All" || store.area === activeArea;
      const matchesCategory =
        selectedCategory === "All" || store.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.lane.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.tagline.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesArea && (selectedCategory === "All" ? true : matchesCategory) && matchesSearch;
    });
  }, [activeArea, selectedCategory, searchQuery]);

  // Filter products based on active area, selected store, category, and search
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      const store = MOCK_STORES.find((s) => s.id === product.storeId);
      const matchesArea = activeArea === "All" || (store && store.area === activeArea);
      const matchesStore = !selectedStoreId || product.storeId === selectedStoreId;
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesArea && matchesStore && matchesCategory && matchesSearch;
    });
  }, [activeArea, selectedStoreId, selectedCategory, searchQuery]);

  const activeStoreObj = MOCK_STORES.find((s) => s.id === selectedStoreId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Hero Banner Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-forest-800 text-cream-100 p-6 sm:p-10 shadow-warm-lg"
      >
        {/* Animated background decorative circles */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 10, 0],
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-forest-700/50 blur-2xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, 15, 0],
          }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute right-1/4 -bottom-16 w-80 h-80 rounded-full bg-terracotta-600/20 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100/10 backdrop-blur-md border border-cream-100/20 text-cream-200 text-xs font-semibold mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
            <span>Hubballi-Dharwad Hyperlocal Beta</span>
          </motion.div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-cream-50 leading-[1.15]">
            A corner shop. <br />
            <span className="text-terracotta-400">A whole city</span> of buyers.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-cream-200/90 leading-relaxed font-normal">
            Skip algorithm-driven markups. Buy fresh filter coffee, authentic Dharwad pedha, and hand-poured diyas right from the craftsperson two lanes away.
          </p>

          {/* Search bar inside Hero */}
          <div className="mt-6 max-w-lg">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search 'diyas', 'filter coffee', 'Koppikar road'..."
            />
          </div>
        </div>
      </motion.section>

      {/* Discovery Filters: Area and Categories */}
      <section className="space-y-3">
        <AreaPills />
        <CategoryTabs
          activeCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedStoreId(null);
          }}
        />
      </section>

      {/* Store Filter Reset notice if store is selected */}
      <AnimatePresence>
        {selectedStoreId && activeStoreObj && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between p-3.5 bg-terracotta-50 border border-terracotta-200 rounded-2xl"
          >
            <div className="flex items-center gap-2">
              <StoreIcon className="w-4 h-4 text-terracotta-600" />
              <span className="text-xs font-bold text-forest-950">
                Viewing only products from:{" "}
                <span className="text-terracotta-700">{activeStoreObj.name}</span>
              </span>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedStoreId(null)}
              className="text-xs font-bold text-terracotta-600 hover:text-terracotta-800 underline"
            >
              Show All Stores
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Neighborhood Stores Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">
              Corner Shops Nearby
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cream-300 text-forest-800">
              {filteredStores.length}
            </span>
          </div>
          <span className="text-xs font-medium text-forest-600 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Within 3 km radius</span>
          </span>
        </div>

        {filteredStores.length === 0 ? (
          <div className="p-8 text-center bg-cream-50 rounded-3xl border border-cream-300">
            <p className="text-sm text-forest-600 font-medium">
              No corner shops match your filter in this neighborhood.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                isSelected={selectedStoreId === store.id}
                onSelect={() => {
                  setSelectedStoreId(
                    selectedStoreId === store.id ? null : store.id
                  );
                }}
              />
            ))}
          </motion.div>
        )}
      </section>

      {/* Local Goods Catalog Section */}
      <section className="space-y-4 pt-4 border-t border-cream-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">
              Authentic Local Goods
            </h2>
            <p className="text-xs text-forest-600 mt-0.5">
              Available for same-day store counter pickup
            </p>
          </div>
          <span className="text-xs font-bold text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-3 py-1 rounded-full">
            {filteredProducts.length} items ready
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center bg-cream-50 rounded-3xl border border-cream-300">
            <p className="text-sm text-forest-600 font-medium">
              No products found. Try picking a different category or clearing the search.
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Meena's Story Banner (deck alignment) */}
      <motion.section
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
        className="p-6 sm:p-8 rounded-3xl bg-cream-200/80 border border-cream-300 flex flex-col sm:flex-row items-center gap-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center flex-shrink-0 shadow-warm">
          <Heart className="w-8 h-8 fill-white/20" />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif font-bold text-lg text-forest-950">
            Her shop is brilliant. Now the whole city knows.
          </h3>
          <p className="text-xs sm:text-sm text-forest-700 max-w-2xl leading-relaxed">
            LocalLoop bridges the gap between artisan craft and local demand. Zero commissions that gouge sellers, zero hidden fees for customers.
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
}
