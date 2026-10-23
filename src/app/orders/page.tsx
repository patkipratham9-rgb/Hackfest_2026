"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Package, Clock, ChevronRight, Store, ArrowLeft } from "lucide-react";

export default function OrdersListPage() {
  const { orders } = useCart();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-forest-950">
            My Orders
          </h1>
          <p className="text-xs text-forest-600 mt-1">
            Track active neighborhood store pickups and review past purchases
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-200 hover:bg-cream-300 text-forest-800 rounded-xl text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Shop More</span>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center bg-cream-50 rounded-3xl border border-cream-300 space-y-3">
          <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mx-auto text-forest-500">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-lg text-forest-900">
            No orders placed yet
          </h3>
          <p className="text-xs text-forest-600 max-w-sm mx-auto">
            Support local vendors in Hubballi! Pick up filter coffee, brass diyas, or Dharwad pedha today.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-terracotta-500 text-white rounded-xl text-xs font-bold shadow-warm mt-2"
          >
            Explore Neighborhood Stores
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block p-5 rounded-3xl bg-cream-50 border border-cream-300 hover:border-terracotta-400 shadow-warm transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-forest-800 text-cream-100">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-forest-950 group-hover:text-terracotta-600 transition-colors">
                      {order.storeName}
                    </h3>
                    <p className="text-[11px] text-forest-500">
                      Order #{order.id} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      order.status === "completed"
                        ? "bg-forest-100 text-forest-800 border border-forest-300"
                        : "bg-terracotta-100 text-terracotta-800 border border-terracotta-300"
                    }`}
                  >
                    {order.status === "placed"
                      ? "Placed"
                      : order.status === "packed"
                      ? "Packing"
                      : order.status === "ready"
                      ? "Ready for Pickup"
                      : "Completed"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-forest-400 group-hover:text-terracotta-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-forest-700">
                  <span className="font-medium">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} items:
                  </span>{" "}
                  <span className="text-forest-500">
                    {order.items.map((i) => `${i.product.name} (x${i.quantity})`).join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-forest-600 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-terracotta-500" />
                    <span>{order.pickupTime}</span>
                  </span>
                  <span className="font-serif font-bold text-base text-forest-950">
                    ₹{order.total}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
