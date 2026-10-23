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
  const { activeArea, setActiveArea, addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("All");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Combined filter: stores matching activeArea, selectedCategory, and live searchQuery
  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return MOCK_STORES.filter((store) => {
      // 1. Area filter
      const matchesArea = activeArea === "All" || store.area === activeArea;

      // 2. Category filter
      const matchesCategory =
        selectedCategory === "All" || store.category === selectedCategory;

      // 3. Search query: checks store name, lane, tagline, category, area, or products in stock
      const hasMatchingProduct =
        q !== "" &&
        MOCK_PRODUCTS.some(
          (p) =>
            p.storeId === store.id &&
            (p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.tags?.some((t) => t.toLowerCase().includes(q)))
        );

      const matchesSearch =
        q === "" ||
        store.name.toLowerCase().includes(q) ||
        store.lane.toLowerCase().includes(q) ||
        store.tagline.toLowerCase().includes(q) ||
        store.category.toLowerCase().includes(q) ||
        store.area.toLowerCase().includes(q) ||
        hasMatchingProduct;

      return matchesArea && matchesCategory && matchesSearch;
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
      <title>LocalLoop • Hubballi's Hyperlocal Digital Marketplace</title>
      <meta
        name="description"
        content="Discover, compare, and order authentic goods from neighborhood corner shops in Hubballi-Dharwad with express counter pickup."
      />

      {/* Hero Banner Section */}
      <motion.section
        data-testid="home-hero-banner"
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
            data-testid="home-overline"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-100/10 backdrop-blur-md border border-cream-100/20 text-cream-200 text-xs font-semibold mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
            <span>Hubballi-Dharwad Hyperlocal Beta</span>
          </motion.div>

          <h1
            data-testid="home-title"
            className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-cream-50 leading-[1.15]"
          >
            A corner shop. <br />
            <span className="text-terracotta-400">A whole city</span> of buyers.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-cream-200/90 leading-relaxed font-normal">
            Skip algorithm-driven markups. Buy fresh filter coffee, authentic Dharwad pedha, and hand-poured diyas right from the craftsperson two lanes away.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href="/categories"
              data-testid="hero-explore-cta"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold shadow-warm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Catalog Aisles</span>
            </a>
          </div>

          {/* Search bar inside Hero */}
          <div className="mt-5 max-w-lg">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search 'diyas', 'filter coffee', 'Koppikar road'..."
            />
          </div>
        </div>
      </motion.section>

      {/* Quick Reorder Strip */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2
            data-testid="home-reorder-heading"
            className="text-xl font-serif font-bold text-forest-950"
          >
            Order it again
          </h2>
          <span className="text-xs text-forest-600">One tap to re-add</span>
        </div>
        <div
          data-testid="home-reorder-strip"
          className="flex gap-3 overflow-x-auto no-scrollbar pb-1"
        >
          {MOCK_PRODUCTS.slice(0, 4).map((p) => (
            <button
              key={p.id}
              data-testid={`reorder-action-button-${p.id}`}
              onClick={() => addToCart(p)}
              className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-cream-50 border border-cream-300 hover:border-terracotta-400 shadow-xs shrink-0 text-left transition-all"
            >
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-10 h-10 rounded-xl object-cover bg-cream-200"
              />
              <div>
                <p className="text-xs font-bold text-forest-950 truncate max-w-[120px]">
                  {p.name}
                </p>
                <p className="text-[11px] font-semibold text-terracotta-600">
                  ₹{p.price}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Crafts */}
      <section className="space-y-3">
        <h2
          data-testid="home-trending-heading"
          className="text-xl font-serif font-bold text-forest-950"
        >
          Shop by Craft
        </h2>
        <div
          data-testid="home-trending-grid"
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
        >
          <a
            href="/categories"
            data-testid="trending-card-ceramics"
            className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 hover:border-terracotta-400 block group transition-all"
          >
            <p className="text-xs font-bold text-forest-950 group-hover:text-terracotta-600">
              Handcrafted Ceramics
            </p>
            <p className="text-[11px] text-forest-500 mt-0.5">18 items</p>
          </a>
          <a
            href="/categories"
            data-testid="trending-card-linens"
            className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 hover:border-terracotta-400 block group transition-all"
          >
            <p className="text-xs font-bold text-forest-950 group-hover:text-terracotta-600">
              Woven Home Linens
            </p>
            <p className="text-[11px] text-forest-500 mt-0.5">12 items</p>
          </a>
          <a
            href="/categories"
            data-testid="trending-card-botanicals"
            className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 hover:border-terracotta-400 block group transition-all col-span-2 sm:col-span-1"
          >
            <p className="text-xs font-bold text-forest-950 group-hover:text-terracotta-600">
              Organic Pantry & Botanicals
            </p>
            <p className="text-[11px] text-forest-500 mt-0.5">24 items</p>
          </a>
        </div>
      </section>

      {/* Discovery Filters: Live Search, Neighborhood & Categories */}
      <section className="space-y-4 bg-cream-50/90 p-4 sm:p-5 rounded-3xl border border-cream-300 shadow-warm">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
            <span className="text-xs font-bold text-forest-900 uppercase tracking-wider">
              Market Filters & Search
            </span>
          </div>
          {(searchQuery || activeArea !== "All" || selectedCategory !== "All") && (
            <button
              data-testid="reset-filters-btn"
              onClick={() => {
                setSearchQuery("");
                setActiveArea("All");
                setSelectedCategory("All");
                setSelectedStoreId(null);
              }}
              className="text-xs font-bold text-terracotta-600 hover:text-terracotta-800 transition-colors underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Live Search input */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Live search by store, pedha, coffee, diyas, groceries..."
        />

        {/* Area Pills */}
        <AreaPills />

        {/* Category Tabs */}
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
              {selectedCategory !== "All"
                ? `${selectedCategory} Stores`
                : activeArea === "All"
                ? "Corner Shops Nearby"
                : `Corner Shops in ${activeArea}`}
            </h2>
            <span
              data-testid="store-count-badge"
              className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cream-300 text-forest-800"
            >
              {filteredStores.length}
            </span>
          </div>
          <span className="text-xs font-medium text-forest-600 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
            <span>
              {selectedCategory !== "All" ? `${selectedCategory} • ` : ""}
              {activeArea === "All" ? "Across Hubballi" : activeArea}
            </span>
          </span>
        </div>

        {/* Empty-Results State for Stores */}
        {filteredStores.length === 0 ? (
          <motion.div
            data-testid="stores-empty-state"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 text-center bg-cream-50 rounded-3xl border border-cream-300 space-y-3 shadow-warm"
          >
            <div className="w-12 h-12 rounded-full bg-cream-200 flex items-center justify-center mx-auto text-forest-500">
              <StoreIcon className="w-6 h-6 text-terracotta-500" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-forest-950">
                No stores found
              </h3>
              <p className="text-xs text-forest-600 max-w-md mx-auto mt-1 leading-relaxed">
                {searchQuery
                  ? `No stores matching "${searchQuery}"`
                  : "No stores found"}
                {selectedCategory !== "All" ? ` under "${selectedCategory}"` : ""}
                {activeArea !== "All" ? ` in "${activeArea}"` : ""}.
              </p>
            </div>

            {/* Quick Action Reset Filters */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {searchQuery && (
                <button
                  data-testid="clear-search-filter"
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1.5 bg-cream-200 hover:bg-cream-300 text-forest-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  Clear search &quot;{searchQuery}&quot;
                </button>
              )}
              {selectedCategory !== "All" && (
                <button
                  data-testid="clear-category-filter"
                  onClick={() => setSelectedCategory("All")}
                  className="px-3 py-1.5 bg-cream-200 hover:bg-cream-300 text-forest-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  All Categories
                </button>
              )}
              {activeArea !== "All" && (
                <button
                  data-testid="clear-area-filter"
                  onClick={() => setActiveArea("All")}
                  className="px-3 py-1.5 bg-cream-200 hover:bg-cream-300 text-forest-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  All Hubballi
                </button>
              )}
              <button
                data-testid="reset-all-filters-btn"
                onClick={() => {
                  setSearchQuery("");
                  setActiveArea("All");
                  setSelectedCategory("All");
                  setSelectedStoreId(null);
                }}
                className="px-4 py-2 bg-terracotta-500 text-white text-xs font-bold rounded-xl shadow-warm hover:bg-terracotta-600 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            layout
            data-testid="stores-grid"
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
          <div
            data-testid="products-empty-state"
            className="p-8 text-center bg-cream-50 rounded-3xl border border-cream-300 space-y-3 shadow-warm"
          >
            <p className="text-sm text-forest-600 font-medium">
              No products found matching your current filter combination.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveArea("All");
                setSelectedCategory("All");
                setSelectedStoreId(null);
              }}
              className="px-4 py-2 bg-terracotta-500 text-white text-xs font-bold rounded-xl shadow-warm hover:bg-terracotta-600 transition-colors"
            >
              Reset Filters & Browse All Goods
            </button>
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
        data-testid="home-story-card"
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
