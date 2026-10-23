"use client";

import React from "react";
import Link from "next/link";
import { useSeller } from "@/context/SellerContext";
import { useCart } from "@/context/CartContext";
import { OrderStatus } from "@/types";
import {
  ShoppingBag,
  Clock,
  Package,
  CheckCircle2,
  ArrowRight,
  User,
  Phone,
  Store,
} from "lucide-react";
import { motion } from "framer-motion";

export default function SellerOrdersPage() {
  const { activeStore } = useSeller();
  const { orders, updateOrderStatus } = useCart();

  const storeOrders = orders.filter((o) => o.storeId === activeStore.id || o.storeName === activeStore.name);
  const displayOrders = storeOrders.length > 0 ? storeOrders : orders;

  const handleAdvance = (orderId: string, currentStatus: OrderStatus) => {
    const flow: OrderStatus[] = ["placed", "packed", "ready", "completed"];
    const idx = flow.indexOf(currentStatus);
    if (idx < flow.length - 1) {
      updateOrderStatus(orderId, flow[idx + 1]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-300">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
            Counter Fulfillment Pipeline
          </span>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-forest-950">
            Store Pickup Orders
          </h1>
          <p className="text-xs text-forest-600 mt-0.5">
            Manage incoming pickup orders for {activeStore.name} in real time
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayOrders.map((order) => {
          const isCompleted = order.status === "completed";
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-4 shadow-warm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-forest-950">
                    {order.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-800 text-cream-100">
                    {order.status}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-cream-100 border border-cream-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-forest-600 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{order.customerName}</span>
                    </span>
                    <span className="text-forest-600 flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="w-3 h-3" />
                      <span>{order.customerPhone}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-cream-200 text-forest-700">
                    <span>Pickup Window:</span>
                    <strong>{order.pickupTime}</strong>
                  </div>

                  <div className="flex items-center justify-between text-forest-700">
                    <span>Counter Code PIN:</span>
                    <span className="font-mono font-extrabold text-terracotta-700 text-sm">
                      {order.pickupCode}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-forest-500 uppercase tracking-wider block">
                    Items ({order.items.length})
                  </span>
                  {order.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="text-xs flex justify-between text-forest-800"
                    >
                      <span>
                        {item.quantity} × {item.product.name}
                      </span>
                      <span className="font-semibold">
                        ₹{item.product.price * item.quantity}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-cream-200 flex justify-between font-bold text-xs text-forest-950">
                    <span>Total Bill:</span>
                    <span className="text-terracotta-700 text-sm">₹{order.total}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-cream-200 flex items-center gap-2">
                <button
                  type="button"
                  disabled={isCompleted}
                  onClick={() => handleAdvance(order.id, order.status)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isCompleted
                      ? "bg-cream-200 text-forest-400 cursor-not-allowed"
                      : "bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-xs cursor-pointer"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {order.status === "placed"
                      ? "Mark as Packed"
                      : order.status === "packed"
                      ? "Mark Ready for Pickup"
                      : order.status === "ready"
                      ? "Mark as Completed"
                      : "Order Completed"}
                  </span>
                </button>

                <Link
                  href={`/orders/${order.id}`}
                  className="p-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-800 text-xs font-semibold"
                  title="View Customer Tracking View"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
