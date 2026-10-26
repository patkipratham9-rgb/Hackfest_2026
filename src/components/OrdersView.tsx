"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  Clock,
  Store,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

export function OrdersView() {
  const { orders, reorderOrder, recentlyOrderedItems, addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [reorderedId, setReorderedId] = useState<string | null>(null);

  const handleReorder = (e: React.MouseEvent, orderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const success = reorderOrder(orderId);
    if (success) {
      setReorderedId(orderId);
      setTimeout(() => setReorderedId(null), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <title>Past Orders &amp; Instant Reorder • LocalLoop Hubballi</title>
      <meta
        name="description"
        content="Repeat your favorite neighborhood essentials in one tap, or track live pickup progress from local shops in Hubballi."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-300">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p
              data-testid="orders-again-overline"
              className="text-[11px] font-bold uppercase tracking-[0.2em] text-terracotta-600"
            >
              Orders Again &amp; History
            </p>
            {isAuthenticated && user && (
              <span className="px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 text-[10px] font-bold border border-forest-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-forest-600" />
                <span>Account: {user.name}</span>
              </span>
            )}
          </div>
          <h1
            data-testid="orders-again-title"
            className="font-serif font-extrabold text-2xl sm:text-3xl text-forest-950"
          >
            Past Orders &amp; Instant Reorder
          </h1>
          <p className="text-xs text-forest-600 mt-0.5">
            {isAuthenticated && user
              ? `Personalized reorder history for ${user.name} (${user.number}). No data is shared with other accounts.`
              : "Repeat your favorite neighborhood essentials in one tap, or track live pickup progress."}
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cream-200 hover:bg-cream-300 text-forest-800 rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Shop More Local</span>
        </Link>
      </div>

      {/* Recently Ordered Items Shelf for this Specific User */}
      {recentlyOrderedItems && recentlyOrderedItems.length > 0 && (
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 shadow-warm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-base text-forest-950 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-terracotta-600" />
                <span>Recently Ordered Items</span>
              </h2>
              <p className="text-xs text-forest-600">
                Your past favorites ready for fast 1-tap reordering.
              </p>
            </div>
            <span className="text-[11px] font-bold text-forest-500 font-mono">
              {recentlyOrderedItems.length} item{recentlyOrderedItems.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentlyOrderedItems.slice(0, 6).map((item, idx) => (
              <div
                key={`recent-ordered-${item.product.id || idx}`}
                className="p-3 rounded-2xl bg-white border border-cream-200 hover:border-terracotta-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-forest-950 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-[10px] text-forest-500">
                    ₹{item.product.price} • {item.product.category}
                  </p>
                  <p className="text-[10px] text-terracotta-600 truncate">
                    {item.product.storeName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => addToCart(item.product)}
                  className="px-2.5 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-cream-100 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-terracotta-400" />
                  <span>Reorder</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders List or Empty State */}
      {orders.length === 0 ? (
        <motion.div
          data-testid="orders-again-empty-state"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 text-center bg-cream-50 rounded-3xl border border-cream-300 space-y-4 shadow-warm"
        >
          <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mx-auto text-forest-500">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-forest-900">
              No previous orders found
            </h3>
            <p className="text-xs text-forest-600 max-w-sm mx-auto mt-1">
              Once you complete a local pickup order in Hubballi, it will appear here for fast one-tap reordering anytime!
            </p>
          </div>
          <Link
            href="/categories"
            data-testid="orders-again-empty-cta"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl text-xs font-bold shadow-warm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Discover Local Stores</span>
          </Link>

          {/* Quick steps explainer */}
          <ol
            data-testid="orders-again-steps"
            className="space-y-3 rounded-2xl bg-cream-100 p-4 text-left max-w-md mx-auto mt-4"
          >
            <li className="flex items-start gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-forest-800 text-[11px] font-bold text-cream-100">
                1
              </span>
              <p className="text-xs text-forest-700">
                <span className="font-bold text-forest-900">Order once:</span> Pick up your fresh coffee, sweets or pantry items.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-forest-800 text-[11px] font-bold text-cream-100">
                2
              </span>
              <p className="text-xs text-forest-700">
                <span className="font-bold text-forest-900">Tap to repeat:</span> Hit Reorder in 1-Tap anytime to refill your cart.
              </p>
            </li>
          </ol>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => {
            const isJustReordered = reorderedId === order.id;
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <motion.div
                key={order.id || `orders-view-${idx}`}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="p-5 rounded-3xl bg-cream-50 border border-cream-300 hover:border-terracotta-300 shadow-warm transition-all"
              >
                {/* Store Header & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-forest-800 text-cream-100 flex-shrink-0">
                      <Store className="w-5 h-5 text-terracotta-400" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-forest-950">
                        {order.storeName}
                      </h3>
                      <p className="text-[11px] text-forest-500">
                        Order #{order.id} • {order.storeArea} • {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        order.status === "completed"
                          ? "bg-forest-100 text-forest-800 border border-forest-300"
                          : order.status === "ready"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse"
                          : "bg-terracotta-100 text-terracotta-800 border border-terracotta-300"
                      }`}
                    >
                      {order.deliveryOption === "delivery"
                        ? order.status === "placed"
                          ? "Order Placed"
                          : order.status === "packed"
                          ? "Out for Delivery"
                          : order.status === "ready"
                          ? "Arriving Shortly"
                          : "Delivered"
                        : order.status === "placed"
                        ? "Order Placed"
                        : order.status === "packed"
                        ? "Being Packed"
                        : order.status === "ready"
                        ? "Ready for Pickup"
                        : "Pickup Completed"}
                    </span>
                    {order.pickupCode && (
                      <span className="px-2.5 py-1 bg-cream-200 text-forest-900 border border-cream-400 rounded-full text-[11px] font-mono font-bold">
                        {order.deliveryOption === "delivery" ? "OTP:" : "PIN:"} {order.pickupCode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items preview */}
                <div className="py-3.5 space-y-2 border-b border-cream-200">
                  <div className="text-xs font-semibold text-forest-700">
                    Order Items ({itemCount}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-cream-100/70 border border-cream-200"
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          loading="lazy"
                          className="w-10 h-10 rounded-lg object-cover bg-cream-200 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-forest-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-[11px] text-forest-500">
                            Qty: {item.quantity} × ₹{item.product.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Timing, Total & Action Buttons */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-forest-600 flex items-center gap-1.5">
                      {order.deliveryOption === "delivery" ? (
                        <Truck className="w-3.5 h-3.5 text-terracotta-500" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-terracotta-500" />
                      )}
                      <span>
                        {order.deliveryOption === "delivery"
                          ? order.pickupTime || "Doorstep Delivery"
                          : order.pickupTime}
                      </span>
                    </span>
                    <span className="text-forest-300">•</span>
                    <span className="font-serif font-extrabold text-lg text-forest-950">
                      ₹{order.total}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Tracker / Details Link */}
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cream-200 hover:bg-cream-300 text-forest-800 transition-colors"
                    >
                      <span>Track Status</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* One-Tap Reorder Button */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => handleReorder(e, order.id)}
                      className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-warm transition-all ${
                        isJustReordered
                          ? "bg-forest-800 text-cream-100"
                          : "bg-terracotta-500 hover:bg-terracotta-600 text-white"
                      }`}
                    >
                      {isJustReordered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reorder in 1-Tap</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
