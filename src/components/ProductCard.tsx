"use client";

import React from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Plus, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart } = useCart();
  const cartItem = cart.find((i) => i.product.id === product.id);
  const qtyInCart = cartItem?.quantity || 0;
  const isLowStock = product.stock <= 4;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-cream-50 border border-cream-300 hover:border-terracotta-300 p-3 shadow-warm transition-all">
      <div>
        {/* Product Image */}
        <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-cream-200">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Bestseller Badge */}
          {product.isBestseller && (
            <div className="absolute top-2 left-2 bg-forest-800 text-cream-100 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs">
              ★ Popular
            </div>
          )}

          {/* Low Stock Warning */}
          {isLowStock && (
            <div className="absolute bottom-2 left-2 bg-amber-600/90 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Only {product.stock} left</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="mt-3">
          <div className="text-[11px] font-semibold text-terracotta-700 tracking-wide">
            {product.storeName}
          </div>
          <h4 className="font-serif font-bold text-sm text-forest-950 line-clamp-1 mt-0.5">
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
          whileTap={{ scale: 0.92 }}
          onClick={() => addToCart(product)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
            qtyInCart > 0
              ? "bg-forest-700 text-cream-100 hover:bg-forest-800"
              : "bg-terracotta-500 text-white hover:bg-terracotta-600"
          }`}
          aria-label={`Add ${product.name} to cart`}
        >
          {qtyInCart > 0 ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added ({qtyInCart})</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
