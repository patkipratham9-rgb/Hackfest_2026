"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSeller } from "@/context/SellerContext";
import { MOCK_PRODUCTS } from "@/data/mockData";
import {
  Package,
  Plus,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SellerProductsPage() {
  const { activeStore } = useSeller();
  const [productsList, setProductsList] = useState(
    MOCK_PRODUCTS.filter((p) => p.storeId === activeStore.id || p.storeName === activeStore.name)
  );

  const displayProducts = productsList.length > 0 ? productsList : MOCK_PRODUCTS.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-300">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
            Catalog Management
          </span>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-forest-950">
            Store Inventory
          </h1>
          <p className="text-xs text-forest-600 mt-0.5">
            Active products listed for counter pickup at {activeStore.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("AI Listing Assistant: Ready to convert product description into formatted listing!")}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-cream-100 font-bold text-xs shadow-warm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-terracotta-400" />
          <span>Add Product with AI</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayProducts.map((product) => {
          const isLowStock = product.stock <= 10;
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-3xl bg-cream-50 border border-cream-300 space-y-3 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-cream-200 border border-cream-300">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="300px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-forest-400">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                  {isLowStock && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold shadow-xs">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>Low Stock</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-forest-950 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-forest-500 line-clamp-2 mt-0.5">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-cream-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-serif font-extrabold text-base text-terracotta-700 block">
                    ₹{product.price}
                  </span>
                  <span className="text-[10px] text-forest-500">Unit: {product.unit}</span>
                </div>

                <div className="text-right">
                  <span
                    className={`font-bold block ${
                      isLowStock ? "text-amber-700" : "text-forest-800"
                    }`}
                  >
                    {product.stock} in stock
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Live on store
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
