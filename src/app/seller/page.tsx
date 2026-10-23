"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSeller } from "@/context/SellerContext";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Clock,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Store,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SellerDashboardPage() {
  const { seller, activeStore } = useSeller();
  const { orders } = useCart();

  // Filter orders for this merchant
  const storeOrders = orders.filter((o) => o.storeId === activeStore.id || o.storeName === activeStore.name);
  const displayOrders = storeOrders.length > 0 ? storeOrders : orders.slice(0, 3);

  const activeOrdersCount = displayOrders.filter(
    (o) => o.status === "placed" || o.status === "packed" || o.status === "ready"
  ).length;

  const totalStoreSales = displayOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-forest-800 text-cream-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-warm">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-400 block">
            Merchant Operations • {activeStore.area}
          </span>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-cream-50">
            Welcome back, {seller.fullName}
          </h1>
          <p className="text-xs text-cream-200/90">
            {activeStore.name} is currently{" "}
            <strong className="text-emerald-300">
              {activeStore.isOpen ? "Open & Accepting Pickups" : "Paused"}
            </strong>
          </p>
        </div>

        <Link
          href="/seller/orders"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-warm transition-all"
        >
          <span>Live Order Board</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 shadow-xs">
          <div className="flex items-center justify-between text-forest-500 text-xs mb-1">
            <span>Active Pickups</span>
            <Clock className="w-4 h-4 text-terracotta-500" />
          </div>
          <span className="font-serif font-extrabold text-2xl text-forest-950 block">
            {activeOrdersCount}
          </span>
          <span className="text-[10px] text-forest-600 font-medium">Awaiting counter pickup</span>
        </div>

        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 shadow-xs">
          <div className="flex items-center justify-between text-forest-500 text-xs mb-1">
            <span>Today's Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-serif font-extrabold text-2xl text-forest-950 block">
            ₹{totalStoreSales}
          </span>
          <span className="text-[10px] text-forest-600 font-medium">Direct artisan gross</span>
        </div>

        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 shadow-xs">
          <div className="flex items-center justify-between text-forest-500 text-xs mb-1">
            <span>Active SKUs</span>
            <Package className="w-4 h-4 text-forest-600" />
          </div>
          <span className="font-serif font-extrabold text-2xl text-forest-950 block">
            8 Products
          </span>
          <span className="text-[10px] text-forest-600 font-medium">Listed in store catalog</span>
        </div>

        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 shadow-xs">
          <div className="flex items-center justify-between text-forest-500 text-xs mb-1">
            <span>Low Stock Alert</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-serif font-extrabold text-2xl text-amber-700 block">
            1 Item
          </span>
          <span className="text-[10px] text-forest-600 font-medium">Brass Diya set (≤ 8 left)</span>
        </div>
      </div>

      {/* AI Growth Coach Digest */}
      <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-terracotta-500 animate-pulse" />
            <h2 className="font-serif font-bold text-base text-forest-950">
              AI Growth Coach Recommendation
            </h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-700 bg-terracotta-100 px-2 py-0.5 rounded-full">
            Local Insights
          </span>
        </div>

        <p className="text-xs text-forest-700 leading-relaxed bg-cream-100 p-3.5 rounded-2xl border border-cream-200">
          Shoppers in <strong>Vidyanagar & Station Road</strong> searched for &ldquo;fresh roasted coffee&rdquo; 42 times this week. Bundling your <em>Terracotta Diya Set</em> with <em>Chicory Filter Coffee Powder</em> at ₹399 can increase counter pickup conversion by ~24%.
        </p>
      </div>

      {/* Recent Orders Pipeline Section */}
      <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-base text-forest-950 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-terracotta-600" />
            <span>Counter Orders Pipeline</span>
          </h2>
          <Link
            href="/seller/orders"
            className="text-xs font-bold text-terracotta-600 hover:text-terracotta-700 inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-cream-200">
          {displayOrders.map((order) => (
            <div
              key={order.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-forest-950">
                    {order.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-forest-800 text-cream-100">
                    {order.status}
                  </span>
                </div>
                <p className="text-forest-600 text-[11px] mt-0.5">
                  Customer: <strong>{order.customerName}</strong> • {order.items.length} items (₹{order.total})
                </p>
                <p className="text-forest-500 text-[10px]">
                  Pickup Slot: {order.pickupTime} • Code PIN:{" "}
                  <strong className="font-mono text-terracotta-700">{order.pickupCode}</strong>
                </p>
              </div>

              <Link
                href={`/orders/${order.id}`}
                className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-800 font-bold text-[11px] transition-colors"
              >
                Track Status →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
