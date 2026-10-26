"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockData";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { SearchBar } from "@/components/SearchBar";
import { StoreCard } from "@/components/StoreCard";
import { ProductCard } from "@/components/ProductCard";
import { Store, Product } from "@/types";
import { MovingAdsBanner, AdSlide, DEFAULT_ADS } from "@/components/MovingAdsBanner";
import {
  computePersonalizedRecommendations,
  recordUserSearchQuery,
} from "@/lib/userRecommendations";
import {
  Sparkles,
  MapPin,
  Store as StoreIcon,
  Heart,
  Navigation,
  ShoppingBag,
  AlertCircle,
  Check,
  Compass,
  ArrowRight,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const {
    userLocation,
    setUserLocation,
    isLocating,
    requestCurrentLocation,
    setIsLocationModalOpen,
    recentlyViewed,
  } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Personalized user recommendations
  const { recommendations, recentSearches, primaryInterestCategory } = useMemo(() => {
    if (!isMounted) {
      return {
        recommendations: products.slice(0, 4),
        recentSearches: [],
        primaryInterestCategory: "Local",
      };
    }
    return computePersonalizedRecommendations(products, recentlyViewed || []);
  }, [products, recentlyViewed, isMounted]);

  // Record user searches for ML recommendations
  useEffect(() => {
    if (searchQuery.trim().length >= 3) {
      const timer = setTimeout(() => {
        recordUserSearchQuery(searchQuery.trim());
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Guard: User must log in before loading the front page
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Sync dynamic stores & products added manually via merchant portal & database
  useEffect(() => {
    const syncStoresAndProducts = async () => {
      try {
        const storeMap = new Map<string, Store>();
        const productList: Product[] = [];

        // 1. Registered stores collection from localStorage
        const rawRegistered = typeof window !== "undefined" ? localStorage.getItem("localloop_registered_stores_v1") : null;
        if (rawRegistered) {
          const parsed = JSON.parse(rawRegistered);
          if (Array.isArray(parsed)) {
            parsed.forEach((s) => {
              if (s && s.id) storeMap.set(s.id, s);
            });
          }
        }

        // 2. Active seller store (if created or updated)
        const rawSellerStore = typeof window !== "undefined" ? localStorage.getItem("localloop_seller_store_v1") : null;
        if (rawSellerStore) {
          const parsedStore: Store = JSON.parse(rawSellerStore);
          if (parsedStore && parsedStore.name && parsedStore.name.trim() !== "") {
            storeMap.set(parsedStore.id || "store-manual-01", parsedStore);
          }
        }

        // 3. Products added manually via merchant portal
        const rawProducts = typeof window !== "undefined" ? localStorage.getItem("localloop_seller_products_v1") : null;
        if (rawProducts) {
          const parsedProducts = JSON.parse(rawProducts);
          if (Array.isArray(parsedProducts)) {
            productList.push(...parsedProducts);
          }
        }

        // 4. Fetch any additional stores and products from API / database
        try {
          const [storesRes, prodsRes] = await Promise.all([
            fetch("/api/stores").catch(() => null),
            fetch("/api/products").catch(() => null),
          ]);

          if (storesRes && storesRes.ok) {
            const apiStoresData = await storesRes.json();
            if (Array.isArray(apiStoresData.stores)) {
              apiStoresData.stores.forEach((s: Store) => {
                if (s && s.id && !storeMap.has(s.id)) {
                  storeMap.set(s.id, s);
                }
              });
            }
          }

          if (prodsRes && prodsRes.ok) {
            const apiProdsData = await prodsRes.json();
            if (Array.isArray(apiProdsData.products)) {
              apiProdsData.products.forEach((p: Product) => {
                if (p && p.id && !productList.some((item) => item.id === p.id)) {
                  productList.push(p);
                }
              });
            }
          }
        } catch {
          // Graceful fallback to client storage
        }

        // 5. Ensure any merchant product without an explicit store has a visible store card
        productList.forEach((prod) => {
          const targetStoreId = prod.storeId || "store-manual-01";
          if (!storeMap.has(targetStoreId)) {
            const synthesizedStore: Store = {
              id: targetStoreId,
              name: prod.storeName || "Authentic Corner Shop",
              tagline: "Local handcrafted goods & daily essentials",
              category: prod.category || "Household",
              area: "Vidyanagar",
              lane: "Market Road",
              distance: "0.4 km",
              rating: 5.0,
              reviewCount: 1,
              isOpen: true,
              openingHours: "8:00 AM - 9:00 PM",
              imageUrl: prod.imageUrl || "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80",
              bannerUrl: prod.imageUrl || "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80",
              phone: "+91 98450 12345",
              verified: true,
            };
            storeMap.set(targetStoreId, synthesizedStore);
          }
        });

        setStores(Array.from(storeMap.values()));
        setProducts(productList);
      } catch (e) {
        console.warn("Storage sync note:", e);
      }
    };

    // Initial sync
    syncStoresAndProducts();

    // Event listeners for cross-tab, navigation & merchant catalog updates
    const handleCatalogUpdate = () => syncStoresAndProducts();
    window.addEventListener("storage", handleCatalogUpdate);
    window.addEventListener("localloop_catalog_updated", handleCatalogUpdate);
    window.addEventListener("focus", handleCatalogUpdate);

    return () => {
      window.removeEventListener("storage", handleCatalogUpdate);
      window.removeEventListener("localloop_catalog_updated", handleCatalogUpdate);
      window.removeEventListener("focus", handleCatalogUpdate);
    };
  }, []);

  const handleShareGps = async () => {
    setLocationFeedback(null);
    const res = await requestCurrentLocation();
    if (res.success && res.location) {
      setLocationFeedback(`Location shared: ${res.location}`);
      setTimeout(() => setLocationFeedback(null), 3000);
    } else {
      setLocationFeedback(res.error || "Location access denied. Please enter manually.");
    }
  };

  // Filter stores matching live search query
  const filteredStores = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return stores.filter((store) => {
      if (!store.name || store.name.trim() === "") return false;

      const hasMatchingProduct =
        q !== "" &&
        products.some(
          (p) =>
            p.storeId === store.id &&
            (p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.tags?.some((t) => t.toLowerCase().includes(q)))
        );

      const matchesSearch =
        q === "" ||
        store.name.toLowerCase().includes(q) ||
        (store.lane && store.lane.toLowerCase().includes(q)) ||
        (store.tagline && store.tagline.toLowerCase().includes(q)) ||
        (store.area && store.area.toLowerCase().includes(q)) ||
        hasMatchingProduct;

      return matchesSearch;
    });
  }, [stores, products, searchQuery]);

  // Filter products based on selected store and search
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesStore = !selectedStoreId || product.storeId === selectedStoreId;
      const matchesSearch =
        searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStore && matchesSearch;
    });
  }, [products, selectedStoreId, searchQuery]);

  const activeStoreObj = stores.find((s) => s.id === selectedStoreId);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-forest-800 flex items-center justify-center text-cream-100 font-bold text-xl shadow-warm">
          <span className="font-serif">L</span>
          <span className="w-2 h-2 rounded-full bg-terracotta-500 -ml-0.5 mt-2" />
        </div>
        <div className="w-6 h-6 rounded-full border-2 border-terracotta-500 border-t-transparent animate-spin" />
        <span className="text-xs text-forest-600 font-medium">Redirecting to login...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Dynamic Moving Advertisements Hero Section */}
      <MovingAdsBanner
        userLocation={userLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        slides={[
          {
            id: "ad-hubballi-hyperlocal",
            badge: "Official City Marketplace • Hubli-Dharwad",
            badgeIcon: "sparkles",
            taglineSmall: "Hyperlocal Marketplace • Direct Store Pickup",
            title: "Your city’s hyperlocal digital marketplace.",
            titleHighlight:
              "Connecting authentic corner shops across Hubli-Dharwad with citywide shoppers.",
            description:
              "Support independent local vendors in Hubli-Dharwad. Choose Home Delivery or express Counter Pick-up with zero markups.",
            offerPill: "FLAT 20% OFF FIRST 3 ORDERS • CODE: LOCAL20",
            bgGradient: "from-forest-900 via-forest-800 to-forest-950",
            accentColor: "text-terracotta-400",
            primaryCtaText: "Change Location",
            primaryCtaAction: "location",
            secondaryCtaText: "Explore Catalog",
            secondaryCtaHref: "/categories",
          },
          ...DEFAULT_ADS.slice(1),
        ]}
      />


      {/* Prominent Location Prompt Section: Asks user to add / share location */}
      <section data-testid="location-prompt-card" className="space-y-3">
        {!userLocation ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 sm:p-6 bg-cream-50 rounded-3xl border-2 border-terracotta-200 shadow-warm flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center flex-shrink-0 shadow-xs">
                <MapPin className="w-5 h-5 text-terracotta-600" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-forest-950 text-base">
                  Where should we deliver?
                </h3>
                <p className="text-xs text-forest-600 max-w-lg leading-relaxed">
                  Share your location or enter your address manually to discover corner shops and fresh local goods nearby.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                data-testid="btn-share-location"
                onClick={handleShareGps}
                disabled={isLocating}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 disabled:opacity-60 text-white font-bold text-xs shadow-warm flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
                <span>{isLocating ? "Detecting GPS..." : "Share Location"}</span>
              </button>
              <button
                type="button"
                data-testid="btn-manual-location"
                onClick={() => setIsLocationModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-900 font-bold text-xs border border-cream-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-forest-700" />
                <span>Add Manually</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <div
            data-testid="active-location-card"
            className="p-3.5 sm:p-4 bg-terracotta-50/80 rounded-2xl border border-terracotta-200 flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-terracotta-500 text-white flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="truncate text-xs">
                <span className="text-forest-600 font-medium">Delivering to: </span>
                <span className="font-bold text-forest-950">{userLocation}</span>
              </div>
            </div>
            <button
              type="button"
              data-testid="btn-change-location"
              onClick={() => setIsLocationModalOpen(true)}
              className="text-xs font-bold text-terracotta-700 hover:text-terracotta-900 bg-white border border-terracotta-300 hover:border-terracotta-400 px-3 py-1.5 rounded-xl transition-colors flex-shrink-0"
            >
              Change
            </button>
          </div>
        )}

        {locationFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 bg-forest-50 border border-forest-200 rounded-xl text-xs text-forest-800 font-semibold flex items-center gap-2"
          >
            <Check className="w-3.5 h-3.5 text-forest-600" />
            <span>{locationFeedback}</span>
          </motion.div>
        )}
      </section>

      {/* Live Search Section */}
      <section className="space-y-4 bg-cream-50/90 p-4 sm:p-5 rounded-3xl border border-cream-300 shadow-warm">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
            <span className="text-xs font-bold text-forest-900 uppercase tracking-wider">
              Search Local Marketplace
            </span>
          </div>
          {searchQuery && (
            <button
              data-testid="reset-filters-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedStoreId(null);
              }}
              className="text-xs font-bold text-terracotta-600 hover:text-terracotta-800 transition-colors underline"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Live Search input */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by shop name, item, lane, or landmark..."
        />
      </section>

      {/* Store Filter Reset notice if store is selected */}
      <AnimatePresence>
        {selectedStoreId && activeStoreObj && (
          <motion.div
            key="store-filter-notice"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between p-3.5 bg-terracotta-50 border border-terracotta-200 rounded-2xl"
          >
            <div className="flex items-center gap-2">
              <StoreIcon className="w-4 h-4 text-terracotta-600" />
              <span className="text-xs font-bold text-forest-950">
                Viewing only items from:{" "}
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

      {/* Local Corner Shops Section */}
      {(!searchQuery || filteredStores.length > 0) && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">
                Local Corner Shops
              </h2>
              <span
                data-testid="store-count-badge"
                className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cream-300 text-forest-800"
              >
                {filteredStores.length}
              </span>
            </div>
            {userLocation && (
              <span className="text-xs font-medium text-forest-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
                <span className="truncate max-w-[150px]">{userLocation}</span>
              </span>
            )}
          </div>

          {/* Empty State when no stores are registered */}
          {filteredStores.length === 0 ? (
            <motion.div
              data-testid="stores-empty-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 sm:p-10 text-center bg-cream-50 rounded-3xl border border-cream-300 space-y-3 shadow-warm"
            >
              <div className="w-14 h-14 rounded-2xl bg-terracotta-100 flex items-center justify-center mx-auto text-terracotta-600 shadow-xs">
                <StoreIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-serif font-bold text-base sm:text-lg text-forest-950">
                  No Shops Registered Yet
                </h3>
                <p className="text-xs sm:text-sm text-forest-600 leading-relaxed">
                  Local neighborhood shops will appear here once listed.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              layout
              data-testid="stores-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredStores.map((store, idx) => (
                <StoreCard
                  key={store.id || `store-${idx}`}
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
      )}

      {/* Personalized Recommendations Section (User Interest & Recent Searches) */}
      {recommendations.length > 0 && products.length > 0 && (
        <section data-testid="user-recommendations-section" className="space-y-3.5 p-5 sm:p-6 rounded-3xl bg-forest-900 text-cream-50 shadow-warm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-cream-50">
                  Recommended For You
                </h2>
                <p className="text-[11px] text-cream-200">
                  Personalized based on your {primaryInterestCategory} interest &amp; recent views
                </p>
              </div>
            </div>

            {isMounted && recentSearches.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-cream-300">Searched:</span>
                {recentSearches.slice(0, 3).map((term, idx) => (
                  <button
                    key={`search-${term || idx}-${idx}`}
                    type="button"
                    onClick={() => setSearchQuery(term)}
                    className="text-[10px] bg-forest-800 hover:bg-forest-700 text-terracotta-300 px-2 py-0.5 rounded-full border border-forest-700 transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
            {recommendations.slice(0, 4).map((product, idx) => (
              <ProductCard key={product.id ? `rec-${product.id}` : `rec-${idx}`} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Local Goods Catalog Section */}
      <section className="space-y-4 pt-4 border-t border-cream-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest-950">
              Available Store Goods
            </h2>
            <p className="text-xs text-forest-600 mt-0.5">
              Fresh items ready for direct shop counter pickup
            </p>
          </div>
          <span className="text-xs font-bold text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-3 py-1 rounded-full">
            {filteredProducts.length} items listed
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div
            data-testid="products-empty-state"
            className="p-8 sm:p-12 text-center bg-cream-50 rounded-3xl border border-cream-300 space-y-3 shadow-warm"
          >
            <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center mx-auto text-forest-700">
              <Search className="w-6 h-6 text-forest-600" />
            </div>
            <p className="text-sm sm:text-base text-forest-950 font-semibold">
              {searchQuery
                ? `No items found matching "${searchQuery}".`
                : "No products available in the catalog yet."}
            </p>
            {searchQuery ? (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 bg-forest-900 text-cream-100 text-xs font-bold rounded-xl hover:bg-forest-950 transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <p className="text-xs text-forest-500 max-w-sm mx-auto">
                Items from local shops will appear here once listed.
              </p>
            )}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <ProductCard key={product.id || `prod-${idx}`} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Community Story Banner */}
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
            Support Local Hubballi Businesses
          </h3>
          <p className="text-xs sm:text-sm text-forest-700 max-w-2xl leading-relaxed">
            LocalLoop empowers neighborhood shops with digital storefronts, zero predatory commissions, and direct counter pickup.
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
}
