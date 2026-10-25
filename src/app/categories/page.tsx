"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types";
import { ShoppingBag, ArrowLeft, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const syncProducts = async () => {
      try {
        const productList: Product[] = [];
        const rawProducts = typeof window !== "undefined" ? localStorage.getItem("localloop_seller_products_v1") : null;
        if (rawProducts) {
          const parsed = JSON.parse(rawProducts);
          if (Array.isArray(parsed)) {
            productList.push(...parsed);
          }
        }

        try {
          const res = await fetch("/api/products");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.products)) {
              data.products.forEach((p: Product) => {
                if (p && p.id && !productList.some((item) => item.id === p.id)) {
                  productList.push(p);
                }
              });
            }
          }
        } catch {
          // Graceful fallback
        }

        setProducts(productList);
      } catch {}
      setIsLoaded(true);
    };

    syncProducts();

    const handleUpdate = () => syncProducts();
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("localloop_catalog_updated", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("localloop_catalog_updated", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [products, searchQuery]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <title>Product Catalog • LocalLoop Hubballi</title>
      <meta
        name="description"
        content="Browse authentic locally crafted products and neighborhood store goods in Hubballi."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cream-300">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs font-semibold text-terracotta-600 hover:text-terracotta-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
            </Link>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950">
            Catalog &amp; Store Items
          </h1>
          <p className="text-xs text-forest-600">
            Direct inventory added by verified local Hubballi merchants
          </p>
        </div>

      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-forest-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items by name, description, tags..."
          className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-cream-300 focus:outline-none focus:border-terracotta-500 bg-cream-50 text-forest-950 shadow-xs placeholder:text-forest-400"
        />
      </div>

      {/* Products Grid or Empty State */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-10 text-center bg-cream-50 rounded-3xl border border-cream-300 space-y-3 shadow-warm"
        >
          <div className="w-14 h-14 rounded-2xl bg-cream-200 flex items-center justify-center mx-auto text-forest-600 shadow-xs">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-serif font-bold text-lg text-forest-950">
              {searchQuery ? `No items found matching "${searchQuery}"` : "No Products in Catalog Yet"}
            </h3>
            <p className="text-xs sm:text-sm text-forest-600 leading-relaxed">
              {searchQuery
                ? "Try checking your spelling or clear your search to see all goods."
                : "Products from verified local neighborhood stores will appear here."}
            </p>
          </div>
          {searchQuery && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 bg-forest-900 text-cream-100 text-xs font-bold rounded-xl hover:bg-forest-950 transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product.id || `cat-prod-${idx}`} product={product} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
