"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/types";
import { Sparkles, PlusCircle, ShoppingBag, ArrowLeft, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const rawProducts = localStorage.getItem("localloop_seller_products_v1");
      if (rawProducts) {
        const parsed = JSON.parse(rawProducts);
        if (Array.isArray(parsed)) {
          setProducts(parsed);
        }
      } else {
        setProducts([]);
      }
    } catch {}
    setIsLoaded(true);
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

        <Link
          href="/seller/products"
          className="self-start sm:self-auto px-4 py-2 bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-bold rounded-xl shadow-warm flex items-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Products Manually</span>
        </Link>
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
          className="p-10 text-center bg-cream-50 rounded-3xl border border-cream-300 space-y-4 shadow-warm"
        >
          <div className="w-16 h-16 rounded-3xl bg-terracotta-100 flex items-center justify-center mx-auto text-terracotta-600 shadow-xs">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-serif font-bold text-lg text-forest-950">
              No Items in Catalog
            </h3>
            <p className="text-xs sm:text-sm text-forest-600 leading-relaxed">
              All demo items have been cleared. Merchants can create inventory items manually with custom photos, prices, descriptions, and stock counts.
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Link
              href="/seller/products"
              className="px-5 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-bold rounded-xl shadow-warm flex items-center gap-2 transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Items in Seller Portal</span>
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
