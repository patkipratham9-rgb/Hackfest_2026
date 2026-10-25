"use client";

import React, { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    gstAmount,
    platformFee,
    totalAmount,
    minBillAmount,
    isMinBillMet,
    setIsCheckoutOpen,
  } = useCart();

  const remainingForMin = Math.max(0, minBillAmount - subtotal);
  const minBillProgress = Math.min(100, Math.round((subtotal / minBillAmount) * 100));

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with Click to Close */}
          <motion.div
            data-testid="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-forest-950/45 backdrop-blur-xs transition-opacity cursor-pointer"
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              data-testid="cart-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="w-screen max-w-md bg-cream-50 border-l border-cream-300 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-cream-300 flex items-center justify-between bg-cream-100">
                <div className="flex items-center gap-2.5">
                  <motion.div
                    whileHover={{ rotate: 12, scale: 1.1 }}
                    className="p-2 rounded-xl bg-forest-800 text-cream-100 shadow-xs"
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h2 className="font-serif font-bold text-lg text-forest-950">
                      Your Local Loop
                    </h2>
                    <p className="text-xs text-forest-600 font-medium">
                      {cart.length === 0
                        ? "Basket is empty"
                        : `${cart.length} item${cart.length > 1 ? "s" : ""} from neighborhood`}
                    </p>
                  </div>
                </div>
                <motion.button
                  data-testid="cart-drawer-close-button"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full hover:bg-cream-200 text-forest-700 transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Cart Items List */}
              <div
                data-testid="cart-items-container"
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {cart.length === 0 ? (
                    <motion.div
                      key="empty-state"
                      data-testid="cart-empty-state"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center p-6 text-forest-600"
                    >
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 2.5,
                          ease: "easeInOut",
                        }}
                        className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mb-3 text-terracotta-500"
                      >
                        <ShoppingBag className="w-8 h-8" />
                      </motion.div>
                      <h3 className="font-serif font-bold text-base text-forest-900">
                        Your basket is waiting
                      </h3>
                      <p className="text-xs text-forest-600 mt-1 max-w-xs leading-relaxed">
                        Explore neighborhood favorites like Meena&apos;s Filter Coffee or Dharwad Pedha.
                      </p>
                    </motion.div>
                  ) : (
                    cart.map(({ product, quantity }, idx) => (
                      <motion.div
                        key={product.id || `cart-item-${idx}`}
                        layout
                        data-testid="cart-item"
                        data-product-id={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 bg-cream-100 p-3 rounded-2xl border border-cream-300 shadow-xs"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          data-testid="cart-item-image"
                          className="w-16 h-16 object-cover rounded-xl bg-cream-200 flex-shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <h4
                                data-testid="cart-item-name"
                                className="font-bold text-xs text-forest-950 line-clamp-1"
                              >
                                {product.name}
                              </h4>
                              <span
                                data-testid="cart-item-store"
                                className="text-[11px] text-forest-500 font-medium"
                              >
                                {product.storeName} • ₹{product.price}
                              </span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.15, color: "#DC2626" }}
                              whileTap={{ scale: 0.85 }}
                              data-testid={`cart-remove-item-${product.id}`}
                              onClick={() => removeFromCart(product.id)}
                              className="text-forest-400 hover:text-red-600 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <span
                              data-testid="cart-item-total"
                              className="font-bold text-xs text-forest-950 font-serif"
                            >
                              ₹{product.price * quantity}
                            </span>

                            {/* Quantity Stepper */}
                            <div className="flex items-center gap-2 bg-cream-200 px-2 py-0.5 rounded-lg border border-cream-300">
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                data-testid={`cart-quantity-minus-${product.id}`}
                                onClick={() => updateQuantity(product.id, -1)}
                                className="text-forest-700 hover:text-terracotta-600 p-0.5 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </motion.button>
                              <motion.span
                                key={`cart-item-qty-${product.id}-${quantity}`}
                                initial={{ scale: 1.35 }}
                                animate={{ scale: 1 }}
                                data-testid={`cart-item-quantity-${product.id}`}
                                className="text-xs font-bold text-forest-900 min-w-[14px] text-center"
                              >
                                {quantity}
                              </motion.span>
                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                data-testid={`cart-quantity-plus-${product.id}`}
                                onClick={() => updateQuantity(product.id, 1)}
                                className="text-forest-700 hover:text-terracotta-600 p-0.5 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Calculation & Checkout Trigger */}
              {cart.length > 0 && (
                <div className="p-4 sm:p-6 bg-cream-100 border-t border-cream-300 space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-forest-700">
                      <span>Items Subtotal</span>
                      <span
                        data-testid="cart-subtotal"
                        className="font-semibold text-forest-900"
                      >
                        ₹{subtotal}
                      </span>
                    </div>
                    <div className="flex justify-between text-forest-700">
                      <span className="flex items-center gap-1">
                        <span>GST (5%)</span>
                        <span className="text-[10px] text-forest-500 bg-cream-200 px-1 rounded font-medium">
                          Tax
                        </span>
                      </span>
                      <span
                        data-testid="cart-gst-amount"
                        className="font-semibold text-forest-900"
                      >
                        ₹{gstAmount}
                      </span>
                    </div>
                    <div className="flex justify-between text-forest-700">
                      <span className="flex items-center gap-1">
                        <span>Local Platform Fee</span>
                        <span className="text-[10px] text-forest-500 bg-cream-200 px-1 rounded font-medium">
                          Fair loop
                        </span>
                      </span>
                      <span
                        data-testid="cart-platform-fee"
                        className="font-semibold text-forest-900"
                      >
                        ₹{platformFee}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-sm text-forest-950 pt-2 border-t border-cream-200">
                      <span>Total Amount</span>
                      <span
                        data-testid="cart-total-amount"
                        className="font-serif text-base text-terracotta-700 font-extrabold"
                      >
                        ₹{totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Minimum Bill Notice & Progress (₹599) */}
                  <div className="pt-1">
                    {!isMinBillMet ? (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-[11px] text-amber-900">
                        <div className="flex justify-between font-bold">
                          <span>Minimum Bill: ₹599</span>
                          <span className="text-terracotta-700">Add ₹{remainingForMin} more</span>
                        </div>
                        <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-terracotta-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${minBillProgress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Minimum bill requirement met (₹599+)</span>
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: isMinBillMet ? 1.02 : 1 }}
                    whileTap={{ scale: isMinBillMet ? 0.97 : 1 }}
                    data-testid="cart-checkout-button"
                    disabled={!isMinBillMet}
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-warm tap-bounce transition-all ${
                      isMinBillMet
                        ? "bg-terracotta-500 hover:bg-terracotta-600 text-white cursor-pointer"
                        : "bg-cream-300 text-forest-400 cursor-not-allowed opacity-80"
                    }`}
                  >
                    <span>
                      {isMinBillMet
                        ? "Select Pickup & Checkout"
                        : `Add ₹${remainingForMin} More to Order`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
