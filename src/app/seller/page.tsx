"use client";

import React, { useState, useMemo } from "react";
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
  Brain,
  Zap,
  Tag,
  Users,
  Check,
  PlusCircle,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trainMLSalesModel, MLSuggestion } from "@/lib/mlSalesEngine";

export default function SellerDashboardPage() {
  const { seller, activeStore, products, setStock, updateProduct } = useSeller();
  const { orders } = useCart();

  // Filter products and orders belonging to this store
  const storeProducts = useMemo(() => {
    return products.filter(
      (p) => p.storeId === activeStore.id || p.storeName === activeStore.name
    );
  }, [products, activeStore.id, activeStore.name]);

  const storeOrders = useMemo(() => {
    const activeId = activeStore.id;
    const activeName = activeStore.name?.trim().toLowerCase();
    return orders.filter((o) => {
      if (o.storeId && o.storeId === activeId) return true;
      if (activeName && o.storeName && o.storeName.trim().toLowerCase() === activeName) return true;
      return false;
    });
  }, [orders, activeStore.id, activeStore.name]);

  const activeOrdersCount = storeOrders.filter(
    (o) => o.status === "placed" || o.status === "packed" || o.status === "ready"
  ).length;

  const totalStoreSales = storeOrders.reduce((sum, o) => sum + o.total, 0);

  const lowStockProducts = storeProducts.filter((p) => p.stock <= 10);

  // Self-training Machine Learning Model on Sales Data
  const { weights, suggestions: rawMlSuggestions } = useMemo(() => {
    return trainMLSalesModel(storeOrders, storeProducts);
  }, [storeOrders, storeProducts]);

  const [mlSuggestions, setMlSuggestions] = useState<MLSuggestion[]>(rawMlSuggestions);
  const [appliedAlert, setAppliedAlert] = useState<string>("");

  // Apply ML Suggestion handler
  const handleApplySuggestion = (sug: MLSuggestion) => {
    if (sug.actionPayload?.productId) {
      if (sug.actionPayload.suggestedStock !== undefined) {
        setStock(sug.actionPayload.productId, sug.actionPayload.suggestedStock);
        setAppliedAlert(`Applied ML Restock: Set stock to ${sug.actionPayload.suggestedStock} units.`);
      } else if (sug.actionPayload.suggestedPrice !== undefined) {
        updateProduct(sug.actionPayload.productId, {
          price: sug.actionPayload.suggestedPrice,
        });
        setAppliedAlert(`Applied ML Price Optimization: Set price to ₹${sug.actionPayload.suggestedPrice}.`);
      }
    } else {
      setAppliedAlert(`Noted suggestion: "${sug.title}" scheduled.`);
    }

    setMlSuggestions((prev) =>
      prev.map((item) => (item.id === sug.id ? { ...item, applied: true } : item))
    );

    setTimeout(() => setAppliedAlert(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Applied Feedback Banner */}
      <AnimatePresence>
        {appliedAlert && (
          <motion.div
            key="seller-applied-alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-forest-900 text-cream-100 flex items-center justify-between shadow-warm text-xs font-semibold"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>{appliedAlert}</span>
            </div>
            <button
              onClick={() => setAppliedAlert("")}
              className="text-cream-300 hover:text-white font-bold"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-forest-800 text-cream-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-warm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-400">
              Merchant Cockpit • {activeStore.area || "Hubballi"}
            </span>
            <span className="text-[10px] bg-forest-700 text-cream-200 px-2 py-0.5 rounded-full font-bold">
              Market Mode Active
            </span>
          </div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-cream-50">
            {activeStore.name || "My Merchant Store"}
          </h1>
          <p className="text-xs text-cream-200/90">
            Store counter is{" "}
            <strong className={activeStore.isOpen ? "text-emerald-300" : "text-amber-300"}>
              {activeStore.isOpen ? "Open & Accepting Customer Orders" : "Temporarily Paused"}
            </strong>{" "}
            • Managed by {seller.fullName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/seller/products"
            className="px-4 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-600 text-cream-100 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Products</span>
          </Link>

          <Link
            href="/seller/orders"
            className="px-4 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-warm transition-all flex items-center gap-1.5"
          >
            <span>Order Board ({activeOrdersCount})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* High-Contrast Easy-Reading Market Data KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 shadow-xs hover:shadow-warm transition-shadow">
          <div className="flex items-center justify-between text-forest-600 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[11px]">Gross Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="font-serif font-black text-3xl text-forest-950 block mt-1">
            ₹{totalStoreSales}
          </span>
          <span className="text-[11px] text-forest-500 font-semibold mt-0.5 block">
            {storeOrders.length} total orders completed
          </span>
        </div>

        {/* Active Pickups */}
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 shadow-xs hover:shadow-warm transition-shadow">
          <div className="flex items-center justify-between text-forest-600 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[11px]">Active Orders</span>
            <Clock className="w-4 h-4 text-terracotta-500" />
          </div>
          <span className="font-serif font-black text-3xl text-forest-950 block mt-1">
            {activeOrdersCount}
          </span>
          <span className="text-[11px] text-forest-500 font-semibold mt-0.5 block">
            {activeOrdersCount > 0 ? "Awaiting counter pickup" : "All orders fulfilled"}
          </span>
        </div>

        {/* Catalog SKUs */}
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 shadow-xs hover:shadow-warm transition-shadow">
          <div className="flex items-center justify-between text-forest-600 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[11px]">Listed Products</span>
            <Package className="w-4 h-4 text-forest-600" />
          </div>
          <span className="font-serif font-black text-3xl text-forest-950 block mt-1">
            {storeProducts.length}
          </span>
          <span className="text-[11px] text-forest-500 font-semibold mt-0.5 block">
            {storeProducts.reduce((sum, p) => sum + p.stock, 0)} total stock units
          </span>
        </div>

        {/* Low Stock Watch */}
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 shadow-xs hover:shadow-warm transition-shadow">
          <div className="flex items-center justify-between text-forest-600 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider text-[11px]">Inventory Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span
            className={`font-serif font-black text-3xl block mt-1 ${
              lowStockProducts.length > 0 ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {lowStockProducts.length}
          </span>
          <span className="text-[11px] text-forest-500 font-semibold mt-0.5 block">
            {lowStockProducts.length > 0 ? "SKUs running low (≤ 10)" : "Stock levels healthy"}
          </span>
        </div>
      </div>

      {/* MACHINE LEARNING SALES INTELLIGENCE & SUGGESTIONS */}
      <div className="p-6 rounded-3xl bg-forest-900 text-cream-50 shadow-warm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-cream-50">
                Self-Trained Machine Learning Sales Intelligence
              </h2>
              <p className="text-[11px] text-cream-200">
                Continuous ML model training on merchant order velocity, basket affinity, and peak footfall
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-forest-800 border border-forest-700 px-2.5 py-1 rounded-full text-emerald-400 font-bold">
              ● ML Model: Online Adaptive v2.1
            </span>
          </div>
        </div>

        {/* ML Suggestions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {mlSuggestions.slice(0, 4).map((sug, idx) => (
            <div
              key={sug.id || `ml-sug-${idx}`}
              className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                sug.applied
                  ? "bg-forest-800/50 border-forest-700 opacity-60"
                  : "bg-forest-800/90 border-forest-700 hover:border-terracotta-400"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-terracotta-400 animate-pulse" />
                  <h3 className="font-bold text-xs text-cream-50">{sug.title}</h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-forest-950 text-terracotta-300">
                  {Math.round(sug.confidence * 100)}% Confidence
                </span>
              </div>

              <p className="text-xs text-cream-200 font-medium leading-relaxed">
                {sug.recommendation}
              </p>

              <p className="text-[11px] text-cream-300/80 leading-normal bg-forest-950/60 p-2.5 rounded-xl border border-forest-800">
                {sug.rationale}
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-forest-400">
                  Impact Score: <strong className="text-emerald-400">{sug.impactScore}/100</strong>
                </span>

                {sug.applied ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Applied</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleApplySuggestion(sug)}
                    className="px-3 py-1.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Apply Suggestion</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MARKET TRENDS & HUBBALLI REGION DEMAND */}
      <div className="p-6 rounded-3xl bg-cream-50 border border-cream-300 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-terracotta-600" />
            <h2 className="font-serif font-bold text-base text-forest-950">
              Hubballi Market Trends &amp; Footfall Demand
            </h2>
          </div>
          <Link
            href="/seller/growth"
            className="text-xs font-bold text-terracotta-700 hover:text-terracotta-900 flex items-center gap-1"
          >
            <span>Full Analytics Report</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-cream-100 border border-cream-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-forest-500 block">
              Top Trending Category
            </span>
            <span className="font-serif font-bold text-sm text-forest-950 block">
              Sweets &amp; Filter Coffee
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              +38% surge in Vidyanagar &amp; CBT
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-cream-100 border border-cream-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-forest-500 block">
              Shopper Ordering Rush
            </span>
            <span className="font-serif font-bold text-sm text-forest-950 block">
              5:30 PM - 8:30 PM
            </span>
            <span className="text-[11px] text-terracotta-700 font-semibold">
              Peak evening counter pickups
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-cream-100 border border-cream-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-forest-500 block">
              Customer Retention Rate
            </span>
            <span className="font-serif font-bold text-sm text-forest-950 block">
              78% Repeat Visits
            </span>
            <span className="text-[11px] text-forest-700 font-semibold">
              Shoppers reordering within 7 days
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders Pipeline Section */}
      <div className="p-6 rounded-3xl bg-cream-50 border border-cream-300 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-cream-200 pb-3">
          <h2 className="font-serif font-bold text-base text-forest-950 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-terracotta-600" />
            <span>Live Counter Orders Pipeline</span>
          </h2>
          <Link
            href="/seller/orders"
            className="text-xs font-bold text-terracotta-600 hover:text-terracotta-700 inline-flex items-center gap-1"
          >
            <span>Manage Order Board</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {storeOrders.length === 0 ? (
          <div className="p-8 text-center bg-cream-100/60 rounded-2xl border border-dashed border-cream-300 space-y-2">
            <Store className="w-8 h-8 text-forest-400 mx-auto" />
            <p className="font-bold text-xs text-forest-900">
              No orders placed at this store counter yet
            </p>
            <p className="text-[11px] text-forest-500">
              When shoppers order items from your catalog, they will appear here live with pickup tokens.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-cream-200">
            {storeOrders.slice(0, 5).map((order, idx) => (
              <div
                key={order.id || `seller-dash-order-${idx}`}
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
                  href="/seller/orders"
                  className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-cream-100 font-bold text-[11px] transition-colors"
                >
                  Fulfill Order →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
