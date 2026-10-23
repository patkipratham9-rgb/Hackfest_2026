"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Plus, Check, AlertCircle, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart } = useCart();
  const [isSaved, setIsSaved] = useState(false);
  const cartItem = cart.find((i) => i.product.id === product.id);
  const qtyInCart = cartItem?.quantity || 0;
  const isLowStock = product.stock <= 4;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{
        y: -5,
        boxShadow: "0 14px 30px -4px rgba(226, 109, 53, 0.16)",
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-cream-50 border border-cream-300 hover:border-terracotta-400 p-3 shadow-warm transition-colors"
    >
      <div>
        {/* Product Image */}
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-cream-200">
          <motion.img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.4 }}
            loading="lazy"
          />

          {/* Bookmark Heart Button */}
          <motion.button
            whileTap={{ scale: 0.75 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-cream-50/90 backdrop-blur-md flex items-center justify-center text-forest-700 hover:text-terracotta-600 shadow-xs z-10 transition-colors"
            aria-label="Save item"
          >
            <motion.div
              animate={{ scale: isSaved ? [1, 1.35, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isSaved
                    ? "fill-terracotta-500 text-terracotta-500"
                    : "text-forest-700"
                }`}
              />
            </motion.div>
          </motion.button>

          {/* Bestseller Badge */}
          {product.isBestseller && (
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute top-2.5 left-2.5 bg-forest-800 text-cream-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs"
            >
              ★ Popular
            </motion.div>
          )}

          {/* Low Stock Warning */}
          {isLowStock && (
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-2.5 left-2.5 bg-amber-600/90 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs"
            >
              <AlertCircle className="w-3 h-3" />
              <span>Only {product.stock} left</span>
            </motion.div>
          )}
        </div>

        {/* Product Details */}
        <div className="mt-3">
          <div className="text-[11px] font-semibold text-terracotta-700 tracking-wide flex items-center gap-1">
            <span>{product.storeName}</span>
          </div>
          <h4 className="font-serif font-bold text-sm text-forest-950 line-clamp-1 mt-0.5 group-hover:text-terracotta-700 transition-colors">
            {product.name}
          </h4>
          <p className="text-xs text-forest-700/80 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer: Price & Add button */}
      <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base text-forest-950 font-serif">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-forest-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>
          <span className="text-[10px] text-forest-500 font-medium">
            {product.unit}
          </span>
        </div>

        {/* Add Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => addToCart(product)}
          className={`relative overflow-hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            qtyInCart > 0
              ? "bg-forest-700 text-cream-100 hover:bg-forest-800"
              : "bg-terracotta-500 text-white hover:bg-terracotta-600 shadow-warm"
          }`}
          aria-label={`Add ${product.name} to cart`}
        >
          <AnimatePresence mode="wait">
            {qtyInCart > 0 ? (
              <motion.div
                key="added"
                initial={{ opacity: 0, y: 8, rotate: -20 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Added ({qtyInCart})</span>
              </motion.div>
            ) : (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
