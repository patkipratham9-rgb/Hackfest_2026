"use client";

import React, { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, Check, AlertCircle, Heart, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, updateQuantity, isLoaded } = useCart();
  const [isSaved, setIsSaved] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const cartItem = cart.find((i) => i.product.id === product.id);
  const qtyInCart = cartItem?.quantity || 0;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isCritical = product.stock === 1;

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
              className="absolute top-2.5 left-2.5 bg-forest-800 text-cream-100 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1"
            >
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>Popular</span>
            </motion.div>
          )}

          {/* Out of Stock & Low Stock Warnings (Checkpoint CP-PI05) */}
          {isOutOfStock && (
            <div
              data-testid="out-of-stock-badge"
              data-stock={product.stock}
              className="absolute bottom-2.5 left-2.5 bg-rose-700/95 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs"
            >
              <AlertCircle className="w-3 h-3" />
              <span>Out of Stock</span>
            </div>
          )}

          {isLowStock && (
            <motion.div
              data-testid="low-stock-badge"
              data-stock={product.stock}
              animate={{ scale: isCritical ? [1, 1.05, 1] : [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: isCritical ? 1.2 : 2 }}
              className={`absolute bottom-2.5 left-2.5 ${
                isCritical ? "bg-rose-600/95 ring-2 ring-amber-300" : "bg-amber-600/90"
              } backdrop-blur-xs text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>{isCritical ? "Only 1 left in stock!" : `Only ${product.stock} left`}</span>
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
          {(product.availableSizes || product.availableFormats) && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              <span className="text-[10px] bg-cream-200/80 text-forest-700 px-2 py-0.5 rounded-md font-medium truncate max-w-full" title={product.availableSizes || product.availableFormats}>
                {product.availableSizes ? `Sizes: ${product.availableSizes}` : `Formats: ${product.availableFormats}`}
              </span>
            </div>
          )}
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

        {/* Add / Stepper / Out-of-Stock Button */}
        {isOutOfStock ? (
          <span
            data-testid={`out-of-stock-btn-${product.id}`}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cream-200 text-forest-400 border border-cream-300 cursor-not-allowed select-none"
          >
            Out of Stock
          </span>
        ) : isLoaded && qtyInCart > 0 ? (
          <div
            data-testid={`cart-stepper-${product.id}`}
            className="flex items-center gap-2 bg-forest-800 text-cream-100 rounded-xl px-2.5 py-1.5 shadow-xs border border-forest-900"
          >
            <motion.button
              whileTap={{ scale: 0.8 }}
              data-testid={`qty-minus-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                updateQuantity(product.id, -1);
              }}
              className="text-cream-200 hover:text-terracotta-400 p-0.5 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </motion.button>
            <motion.span
              key={`qty-count-${product.id}-${qtyInCart}`}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              data-testid={`qty-count-${product.id}`}
              className="text-xs font-bold text-cream-100 min-w-[14px] text-center"
            >
              {qtyInCart}
            </motion.span>
            <motion.button
              whileTap={{ scale: 0.8 }}
              data-testid={`qty-plus-${product.id}`}
              disabled={qtyInCart >= product.stock}
              onClick={(e) => {
                e.stopPropagation();
                if (qtyInCart < product.stock) {
                  updateQuantity(product.id, 1);
                }
              }}
              className="text-cream-200 hover:text-terracotta-400 disabled:opacity-40 disabled:cursor-not-allowed p-0.5 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </motion.button>
          </div>
        ) : (
          <motion.button
            data-testid={`add-to-cart-${product.id}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
              setJustAdded(true);
              setTimeout(() => setJustAdded(false), 1200);
            }}
            className={`relative overflow-hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-warm ${
              justAdded
                ? "bg-forest-800 text-cream-50"
                : "bg-terracotta-500 hover:bg-terracotta-600 text-white"
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-400" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add</span>
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
