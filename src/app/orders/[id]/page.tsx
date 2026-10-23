"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { OrderStatus } from "@/types";
import {
  CheckCircle2,
  Package,
  Store,
  Clock,
  MapPin,
  Phone,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  QrCode,
  ShieldCheck,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderTrackingStep {
  key: OrderStatus;
  title: string;
  desc: string;
  icon: React.ElementType;
}

const STEPS: OrderTrackingStep[] = [
  {
    key: "placed",
    title: "Order Placed",
    desc: "Sent to shop counter",
    icon: Store,
  },
  {
    key: "packed",
    title: "Packed Fresh",
    desc: "Stock reserved & bagged",
    icon: Package,
  },
  {
    key: "ready",
    title: "Ready for Pickup",
    desc: "Counter pickup ready",
    icon: Clock,
  },
  {
    key: "completed",
    title: "Order Collected",
    desc: "Picked up & verified",
    icon: CheckCircle2,
  },
];

const ORDER_FLOW: OrderStatus[] = ["placed", "packed", "ready", "completed"];

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { orders, updateOrderStatus } = useCart();
  const orderId = resolvedParams.id;

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-cream-300 flex items-center justify-center mx-auto text-forest-700">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-forest-950">
          Order Not Found
        </h2>
        <p className="text-xs text-forest-600">
          We could not find an order with ID <span className="font-mono">{orderId}</span>.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-terracotta-500 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const currentStepIndex = ORDER_FLOW.indexOf(order.status);

  const advanceStatus = () => {
    if (currentStepIndex < ORDER_FLOW.length - 1) {
      const nextStatus = ORDER_FLOW[currentStepIndex + 1];
      updateOrderStatus(order.id, nextStatus);
    }
  };

  const resetStatus = () => {
    updateOrderStatus(order.id, "placed");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-xs font-bold text-forest-700 hover:text-terracotta-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Orders</span>
        </Link>
        <span className="text-[11px] font-semibold text-forest-500">
          ID: <span className="font-mono text-forest-800">{order.id}</span>
        </span>
      </div>

      {/* Main Status Header Card */}
      <div className="p-6 rounded-3xl bg-cream-50 border border-cream-300 shadow-warm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-forest-800 text-cream-100">
                {order.status === "completed" ? "Completed" : "In Progress"}
              </span>
              <span className="text-xs text-forest-500">
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.h1
                key={order.status}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="font-serif font-extrabold text-2xl sm:text-3xl text-forest-950 mt-1"
              >
                {order.status === "ready"
                  ? "Your order is ready at the counter!"
                  : order.status === "packed"
                  ? "Meena is packing your items fresh"
                  : order.status === "completed"
                  ? "Order successfully picked up 🎉"
                  : "Order received by merchant"}
              </motion.h1>
            </AnimatePresence>

            <p className="text-xs text-forest-600 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Pickup: {order.pickupTime}</span>
            </p>
          </div>

          {/* Pickup Verification Token Code */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="bg-cream-200/90 border border-cream-300 rounded-2xl p-3 text-center sm:text-right flex-shrink-0 shadow-xs"
          >
            <span className="text-[10px] font-bold text-forest-600 uppercase tracking-widest block">
              Pickup Token Code
            </span>
            <span className="font-mono font-extrabold text-2xl text-terracotta-600 block mt-0.5">
              {order.pickupCode}
            </span>
            <span className="text-[10px] text-forest-500 block">
              Show this code at counter
            </span>
          </motion.div>
        </div>

        {/* 4-Step Visual Progress Bar */}
        <div className="pt-6">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-6 right-6 h-1 bg-cream-200 -z-0">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="h-full bg-terracotta-500"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 relative z-10">
              {STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center">
                    <motion.div
                      animate={
                        isCurrent
                          ? {
                              scale: [1, 1.15, 1],
                            }
                          : { scale: 1 }
                      }
                      transition={{
                        repeat: isCurrent ? Infinity : 0,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isPassed
                          ? "bg-terracotta-500 text-white shadow-warm"
                          : "bg-cream-200 text-forest-400 border border-cream-300"
                      }`}
                    >
                      <StepIcon className="w-4 h-4" />
                      {isPassed && idx < currentStepIndex && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-forest-800 text-cream-100 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </motion.div>
                    <span
                      className={`text-[11px] font-bold mt-2 ${
                        isPassed ? "text-forest-950" : "text-forest-400"
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[9px] text-forest-500 hidden sm:block mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Hackathon Simulation Bar */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="p-4 rounded-2xl bg-forest-900 text-cream-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-warm"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-terracotta-400 animate-pulse" />
          <span className="text-xs font-semibold">
            Demo Simulator: Advance merchant order state in real time
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={advanceStatus}
            disabled={currentStepIndex >= STEPS.length - 1}
            className="flex-1 sm:flex-none px-3.5 py-1.5 bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Advance to Next Step →
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={resetStatus}
            className="px-2.5 py-1.5 bg-forest-800 hover:bg-forest-700 text-cream-200 rounded-xl text-xs font-medium"
          >
            Reset
          </motion.button>
        </div>
      </motion.div>

      {/* Pickup Store Details Card */}
      <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-3">
        <h3 className="font-serif font-bold text-base text-forest-950 flex items-center gap-2">
          <Store className="w-4 h-4 text-terracotta-600" />
          <span>Pickup Location & Directions</span>
        </h3>

        <div className="p-3.5 rounded-2xl bg-cream-100 border border-cream-200 flex flex-col sm:flex-row justify-between gap-3">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-forest-900">{order.storeName}</h4>
            <p className="text-xs text-forest-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-terracotta-500 flex-shrink-0" />
              <span>{order.storeLane}, {order.storeArea} (Hubballi)</span>
            </p>
          </div>

          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            href="tel:+919845012345"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-700 text-cream-100 text-xs font-bold hover:bg-forest-800 transition-colors flex-shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Merchant</span>
          </motion.a>
        </div>
      </div>

      {/* Order Itemized Receipt */}
      <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-3">
        <h3 className="font-serif font-bold text-base text-forest-950">
          Itemized Receipt
        </h3>

        <div className="divide-y divide-cream-200">
          {order.items.map(({ product, quantity }) => (
            <div key={product.id} className="py-2.5 flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded-lg bg-cream-200"
                />
                <div>
                  <span className="font-bold text-forest-900 block">{product.name}</span>
                  <span className="text-[11px] text-forest-500">
                    Qty: {quantity} • ₹{product.price} each
                  </span>
                </div>
              </div>
              <span className="font-bold text-forest-950 font-serif">
                ₹{product.price * quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-cream-200 space-y-1.5 text-xs">
          <div className="flex justify-between text-forest-600">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-forest-600">
            <span>Local platform fair fee</span>
            <span>₹{order.platformFee}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-forest-950 pt-2 border-t border-cream-300">
            <span>Total Amount Paid</span>
            <span className="font-serif text-base text-terracotta-700 font-extrabold">
              ₹{order.total}
            </span>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-between text-xs text-forest-600">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
            <span>Method: {order.paymentMethod === "upi" ? "UPI Paid Online" : "Cash at Counter"}</span>
          </span>
          <span className="font-semibold text-forest-800">
            Status: {order.paymentStatus === "paid" ? "Verified" : "Due on pickup"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
