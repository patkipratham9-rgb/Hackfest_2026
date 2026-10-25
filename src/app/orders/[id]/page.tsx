"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { OrderStatus } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { OrderCancelCooldown } from "@/components/OrderCancelCooldown";
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
  Search,
  ExternalLink,
  Truck,
  Star,
  Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderTrackingStep {
  key: OrderStatus;
  title: string;
  desc: string;
  icon: React.ElementType;
}

// Four official order statuses with exact labels:
// Placed → Packed → Ready for Pickup → Completed
const TRACKING_STEPS: OrderTrackingStep[] = [
  {
    key: "placed",
    title: "Placed",
    desc: "Received at counter",
    icon: Store,
  },
  {
    key: "packed",
    title: "Packed",
    desc: "Reserved & bagged",
    icon: Package,
  },
  {
    key: "ready",
    title: "Ready for Pickup",
    desc: "Awaiting your arrival",
    icon: Clock,
  },
  {
    key: "completed",
    title: "Completed",
    desc: "Picked up & verified",
    icon: CheckCircle2,
  },
];

const ORDER_FLOW: OrderStatus[] = ["placed", "packed", "ready", "completed"];

const STATUS_HEADLINES: Record<OrderStatus, { headline: string; detail: string }> = {
  placed: {
    headline: "Order Placed & Confirmed",
    detail: "Order received by merchant counter • Preparing fresh",
  },
  packed: {
    headline: "Order Packed & Bagged",
    detail: "Merchant has reserved and packed your items fresh",
  },
  ready: {
    headline: "Ready for Pickup at Counter!",
    detail: "Your package is waiting at the counter • Present code to collect",
  },
  completed: {
    headline: "Order Completed 🎉",
    detail: "Items picked up and verified with artisan store",
  },
  cancelled: {
    headline: "Order Cancelled",
    detail: "This order was cancelled by customer or store",
  },
};

function OrderTrackingContent({
  initialId,
}: {
  initialId?: string;
}) {
  const routeParams = useParams();
  const rawParamId = routeParams?.id;
  const orderId =
    (typeof rawParamId === "string"
      ? rawParamId
      : Array.isArray(rawParamId)
      ? rawParamId[0]
      : initialId) || "";

  const { orders, getOrderById, updateOrderStatus, isLoaded } = useCart();
  const order = orderId ? getOrderById(orderId) : undefined;

  // If initial hydration / storage load is still occurring and order not found yet
  if (!isLoaded && !order) {
    return (
      <div
        data-testid="order-loading"
        className="max-w-md mx-auto text-center py-20 space-y-4"
      >
        <div className="w-12 h-12 border-4 border-terracotta-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-forest-700 font-semibold">
          Loading order details for <span className="font-mono">{orderId || "order"}</span>...
        </p>
      </div>
    );
  }

  // Useful Not-Found State for unknown IDs
  if (!order) {
    return (
      <motion.div
        data-testid="order-not-found"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-12 px-4 space-y-5"
      >
        <div className="w-20 h-20 rounded-full bg-cream-200 border-2 border-cream-300 flex items-center justify-center mx-auto text-forest-600 shadow-warm">
          <Package className="w-10 h-10 stroke-[1.5]" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-terracotta-600">
            Lookup Notice
          </span>
          <h2 className="font-serif font-extrabold text-2xl text-forest-950">
            Order Not Found
          </h2>
          <p className="text-xs text-forest-600 max-w-sm mx-auto leading-relaxed">
            We could not find an active or completed order matching identifier{" "}
            <span
              data-testid="not-found-order-id"
              className="font-mono font-bold text-forest-950 bg-cream-200 px-1.5 py-0.5 rounded border border-cream-300"
            >
              {orderId || "Unknown"}
            </span>
            .
          </p>
        </div>

        {/* Helpful Suggestions */}
        <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 text-left text-xs space-y-2 text-forest-700">
          <p className="font-bold text-forest-900 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Why might this happen?</span>
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-forest-600 pl-1">
            <li>The order link or ID was mistyped.</li>
            <li>The order was created in another browser or incognito window.</li>
          </ul>

          {/* Quick links to active orders if present */}
          {orders.length > 0 && (
            <div className="pt-2 border-t border-cream-200 mt-2">
              <span className="text-[11px] font-bold text-forest-900 block mb-1.5">
                Active orders found in your session:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {orders.slice(0, 3).map((o) => (
                  <Link
                    key={o.id}
                    href={`/orders/${o.id}`}
                    className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-1 rounded-lg bg-cream-50 hover:bg-terracotta-50 hover:text-terracotta-700 border border-cream-300 transition-colors"
                  >
                    <span>{o.id}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Link
            href="/orders"
            data-testid="view-all-orders-link"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-forest-800 hover:bg-forest-900 text-cream-100 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Package className="w-3.5 h-3.5" />
            <span>View All Orders</span>
          </Link>
          <Link
            href="/"
            data-testid="back-to-home-link"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cream-200 hover:bg-cream-300 text-forest-900 rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </Link>
        </div>
      </motion.div>
    );
  }

  const currentStepIndex = Math.max(0, ORDER_FLOW.indexOf(order.status));
  const statusInfo = STATUS_HEADLINES[order.status] || STATUS_HEADLINES.placed;

  const isDeliveryOrder = order.deliveryOption === "delivery";
  const deliveryPartner = order.deliveryPartner || {
    id: "dp-default",
    name: "Ramesh Kulkarni",
    phone: "+91 98450 88219",
    vehicle: "Hero Electric Optima",
    vehicleNumber: "KA-25-EM-4821",
    rating: 4.9,
    totalDeliveries: 540,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    assignedAt: order.createdAt || new Date().toISOString(),
    estimatedArrivalMins: 25,
    estimatedArrivalTime: order.estimatedArrival || new Date(Date.now() + 25 * 60 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    liveStatus: "out_for_delivery" as const,
  };

  const deliveryETA = order.estimatedArrival || deliveryPartner.estimatedArrivalTime || "25 - 35 mins";

  // Live Delivery Countdown Timer (Defaults to 25 mins / 1500 secs)
  const [countdownSeconds, setCountdownSeconds] = useState(1500);

  useEffect(() => {
    let initialSeconds = 1500;
    if (order?.createdAt) {
      const elapsed = Math.floor(
        (Date.now() - new Date(order.createdAt).getTime()) / 1000
      );
      initialSeconds = Math.max(30, 1500 - elapsed);
    }
    setCountdownSeconds(initialSeconds);

    const interval = setInterval(() => {
      setCountdownSeconds((prev: number) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.createdAt]);

  const countdownMins = Math.floor(countdownSeconds / 60);
  const countdownSecs = countdownSeconds % 60;
  const formattedCountdown = `${String(countdownMins).padStart(2, "0")}:${String(
    countdownSecs
  ).padStart(2, "0")}`;

  const targetArrivalTime = order.estimatedArrival || new Date(Date.now() + countdownSeconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Checkpoint CP-OB02: Realtime Tracking Subscription for Customer View
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel(`customer-order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated && updated.status) {
            updateOrderStatus(orderId, updated.status as OrderStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, updateOrderStatus]);

  const advanceStatus = () => {
    if (currentStepIndex < ORDER_FLOW.length - 1) {
      const nextStatus = ORDER_FLOW[currentStepIndex + 1];
      updateOrderStatus(order.id, nextStatus);
    }
  };

  const setExplicitStatus = (status: OrderStatus) => {
    updateOrderStatus(order.id, status);
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
      <title>{`Order ${order.id} • Live Tracking • LocalLoop Hubballi`}</title>
      <meta
        name="description"
        content={`Track real-time counter fulfillment progress for order ${order.id} from ${order.storeName}.`}
      />

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
          Order ID:{" "}
          <span data-testid="order-id" className="font-mono text-forest-800 font-bold">
            {order.id}
          </span>
        </span>
      </div>

      {/* Main Status Header Card */}
      <div
        data-testid="order-details-card"
        className="p-6 rounded-3xl bg-cream-50 border border-cream-300 shadow-warm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-200">
          <div>
            <div className="flex items-center gap-2">
              <span
                data-testid="order-status"
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-forest-800 text-cream-100"
              >
                {order.status}
              </span>
              <span
                data-testid="realtime-tracking-indicator"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-[10px] font-bold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Updates Active</span>
              </span>
              <span className="text-xs text-forest-500">
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={order.status}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-1"
              >
                <h1
                  data-testid="order-status-headline"
                  className="font-serif font-extrabold text-2xl sm:text-3xl text-forest-950"
                >
                  {statusInfo.headline}
                </h1>
                <p className="text-xs text-forest-600 mt-0.5">{statusInfo.detail}</p>
              </motion.div>
            </AnimatePresence>

            <p className="text-xs text-forest-600 mt-2 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-terracotta-500" />
              <span>
                Pickup Slot:{" "}
                <strong data-testid="order-pickup-slot" className="text-forest-900">
                  {order.pickupTime}
                </strong>
              </span>
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
            <span
              data-testid="order-pickup-code"
              className="font-mono font-extrabold text-2xl text-terracotta-600 block mt-0.5"
            >
              {order.pickupCode}
            </span>
            <span className="text-[10px] text-forest-500 block">
              Show this code at counter
            </span>
          </motion.div>
        </div>

        {/* 4-Step Visual Progress Bar */}
        <div
          data-testid="order-progress-timeline"
          data-active-step={order.status}
          className="pt-6"
        >
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-6 right-6 h-1 bg-cream-200 -z-0">
              <motion.div
                data-testid="order-progress-bar"
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentStepIndex / (TRACKING_STEPS.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="h-full bg-terracotta-500"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 relative z-10">
              {TRACKING_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const StepIcon = step.icon;

                const stepState = isCurrent ? "active" : isCompleted ? "completed" : "pending";

                return (
                  <div
                    key={step.key}
                    data-testid={`timeline-step-${step.key}`}
                    data-status={stepState}
                    data-active={isCurrent ? "true" : "false"}
                    data-completed={isCompleted ? "true" : "false"}
                    className="flex flex-col items-center text-center"
                  >
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
                      } ${isCurrent ? "ring-4 ring-terracotta-200" : ""}`}
                    >
                      <StepIcon className="w-4 h-4" />
                      {isCompleted && (
                        <div
                          data-testid={`timeline-step-${step.key}-check`}
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-forest-800 text-cream-100 flex items-center justify-center shadow-xs"
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </motion.div>

                    {/* Step Title Label */}
                    <span
                      data-testid={`timeline-step-${step.key}-label`}
                      className={`text-[11px] mt-2 transition-colors ${
                        isCurrent
                          ? "font-extrabold text-forest-950 underline decoration-terracotta-500 decoration-2 underline-offset-2"
                          : isCompleted
                          ? "font-bold text-forest-800"
                          : "font-medium text-forest-400"
                      }`}
                    >
                      {step.title}
                    </span>

                    {/* Step Sub-label Description */}
                    <span className="text-[9px] text-forest-500 hidden sm:block mt-0.5">
                      {step.desc}
                    </span>

                    {/* Active Step Badge for screen readers / mobile */}
                    {isCurrent && (
                      <span className="mt-1 text-[8px] font-extrabold uppercase tracking-wider text-terracotta-700 bg-terracotta-100 px-1.5 py-0.2 rounded">
                        Current
                      </span>
                    )}
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
        className="p-4 rounded-2xl bg-forest-900 text-cream-100 space-y-3 shadow-warm"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-terracotta-400 animate-pulse" />
            <span className="text-xs font-semibold">
              Live Progress Simulator: Step through order states in real time
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              data-testid="order-advance-status-button"
              onClick={advanceStatus}
              disabled={currentStepIndex >= TRACKING_STEPS.length - 1}
              className="flex-1 sm:flex-none px-3.5 py-1.5 bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Advance to Next Step →
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              data-testid="order-reset-status-button"
              onClick={resetStatus}
              className="px-2.5 py-1.5 bg-forest-800 hover:bg-forest-700 text-cream-200 rounded-xl text-xs font-medium cursor-pointer"
            >
              Reset
            </motion.button>
          </div>
        </div>

        {/* Step Jump Pills for quick testing of any specific status */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-forest-800 text-[11px]">
          <span className="text-forest-400 font-medium">Jump to status:</span>
          {TRACKING_STEPS.map((step) => {
            const isCurrent = order.status === step.key;
            return (
              <button
                key={step.key}
                type="button"
                data-testid={`jump-to-status-${step.key}`}
                onClick={() => setExplicitStatus(step.key)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-terracotta-500 text-white shadow-xs"
                    : "bg-forest-800 hover:bg-forest-700 text-cream-200"
                }`}
              >
                {step.title}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* 1-Minute Order Cancellation Cooldown Window after Payment */}
      <OrderCancelCooldown
        orderId={order.id}
        createdAt={order.createdAt}
        totalAmount={order.total}
        paymentMethod={order.paymentMethod}
        currentStatus={order.status}
      />

      {/* Delivery Partner Details & Estimated Arrival Time (ETA) Card */}
      <motion.div
        data-testid="delivery-partner-eta-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 sm:p-6 rounded-3xl bg-cream-50 border border-cream-300 shadow-warm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-terracotta-600 block">
                {isDeliveryOrder ? "Doorstep Delivery Fleet" : "Express Counter Fulfillment"}
              </span>
              <h3 className="font-serif font-extrabold text-base sm:text-lg text-forest-950">
                {isDeliveryOrder ? "Assigned Delivery Boy & Live ETA" : "Store Counter In-Charge"}
              </h3>
            </div>
          </div>

          {/* ETA Badge */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl px-4 py-2 text-left sm:text-right flex items-center sm:flex-col justify-between sm:justify-center gap-0.5">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Live Delivery Countdown
            </span>
            <div className="flex items-baseline gap-1 sm:justify-end">
              <span data-testid="delivery-eta-time" className="font-mono font-black text-emerald-950 text-base sm:text-lg">
                {formattedCountdown}
              </span>
              <span className="text-[10px] font-bold text-emerald-700">mins left</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">
              Expected by {targetArrivalTime}
            </span>
          </div>
        </div>

        {/* Delivery Boy Profile & Vehicle Details */}
        <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-13 h-13 rounded-2xl overflow-hidden bg-forest-800 text-cream-100 flex items-center justify-center font-bold text-lg border-2 border-cream-300 shrink-0 shadow-xs">
              <img
                src={deliveryPartner.avatarUrl}
                alt={deliveryPartner.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 data-testid="delivery-boy-name" className="font-bold text-sm text-forest-950">
                  {deliveryPartner.name}
                </h4>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-terracotta-100 text-terracotta-800">
                  <ShieldCheck className="w-3 h-3 text-terracotta-600" />
                  Verified Partner
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-forest-600">
                <span className="flex items-center gap-1 font-semibold text-amber-700">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {deliveryPartner.rating} ({deliveryPartner.totalDeliveries}+ deliveries)
                </span>
              </div>
              <p className="text-[11px] text-forest-500 flex items-center gap-1 pt-0.5">
                <Navigation className="w-3 h-3 text-terracotta-600" />
                <span>{deliveryPartner.vehicle} • <strong className="font-mono text-forest-800">{deliveryPartner.vehicleNumber}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Call Action */}
          <div className="w-full sm:w-auto flex sm:flex-col gap-2">
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              data-testid="call-delivery-boy-button"
              href={`tel:${deliveryPartner.phone}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 text-cream-100 text-xs font-bold hover:bg-forest-950 shadow-warm transition-all cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-terracotta-400" />
              <span>Call Delivery Boy</span>
            </motion.a>
          </div>
        </div>

        {/* Live Delivery Note / Destination Preview */}
        <div className="p-3 bg-cream-100/60 rounded-xl border border-cream-200/80 flex items-center justify-between text-xs text-forest-700">
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-4 h-4 text-terracotta-600 shrink-0" />
            <span className="truncate">
              {isDeliveryOrder && order.deliveryAddress
                ? `Destination: ${(order.deliveryAddress as any).street || (order.deliveryAddress as any).locality || "Customer Delivery Address"}, Hubballi`
                : `Pickup: ${order.storeLane}, ${order.storeArea} (Counter Slot: ${order.pickupTime})`}
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md shrink-0">
            {order.status === "completed" ? "Delivered" : "En Route"}
          </span>
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
            <h4
              data-testid="order-store-name"
              className="font-bold text-sm text-forest-900"
            >
              {order.storeName}
            </h4>
            <p
              data-testid="order-store-address"
              className="text-xs text-forest-600 flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-terracotta-500 flex-shrink-0" />
              <span>
                {order.storeLane}, {order.storeArea} (Hubballi)
              </span>
            </p>
          </div>

          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            data-testid="order-call-merchant-button"
            href="tel:+919845012345"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-700 text-cream-100 text-xs font-bold hover:bg-forest-800 transition-colors flex-shrink-0 cursor-pointer"
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

        <div data-testid="order-items-list" className="divide-y divide-cream-200">
          {order.items.map(({ product, quantity }) => (
            <div
              key={product.id}
              data-testid={`order-item-${product.id}`}
              className="py-2.5 flex justify-between items-center text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-cream-200 shrink-0 border border-cream-300">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-forest-400">
                      <Package className="w-4 h-4" />
                    </div>
                  )}
                </div>
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
            <span data-testid="order-subtotal">₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-forest-600">
            <span className="flex items-center gap-1">
              <span>GST (5%)</span>
              <span className="text-[10px] bg-cream-200 text-forest-700 px-1.5 py-0.2 rounded font-semibold">
                Tax
              </span>
            </span>
            <span data-testid="order-gst">₹{order.gst ?? Math.round(order.subtotal * 0.05)}</span>
          </div>
          <div className="flex justify-between text-forest-600">
            <span className="flex items-center gap-1">
              <span>Local platform fair fee</span>
              <span className="text-[10px] bg-forest-100 text-forest-800 px-1.5 py-0.2 rounded font-semibold">
                Fair Share
              </span>
            </span>
            <span data-testid="order-platform-fee">₹{order.platformFee}</span>
          </div>
          {order.deliveryOption === "delivery" && (
            <div className="flex justify-between text-forest-600">
              <span className="flex items-center gap-1">
                <span>Delivery Charge</span>
                {order.deliveryDistance ? (
                  <span className="text-[10px] bg-terracotta-100 text-terracotta-800 px-1.5 py-0.2 rounded font-semibold">
                    {order.deliveryDistance > 3
                      ? `${(order.deliveryDistance - 3).toFixed(1)} km extra @ ₹15/km`
                      : "Within 3 km (FREE)"}
                  </span>
                ) : null}
              </span>
              <span data-testid="order-delivery-fee">
                {(order.deliveryFee ?? 0) > 0 ? `₹${order.deliveryFee}` : "FREE"}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm text-forest-950 pt-2 border-t border-cream-300">
            <span>Total Amount</span>
            <span
              data-testid="order-total"
              className="font-serif text-base text-terracotta-700 font-extrabold"
            >
              ₹{order.total}
            </span>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-between text-xs text-forest-600">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
            <span>
              Method:{" "}
              <strong data-testid="order-payment-method" className="text-forest-900 capitalize">
                {order.paymentMethod === "upi" ? "UPI Paid Online" : "Cash at Counter"}
              </strong>
            </span>
          </span>
          <span
            data-testid="order-payment-status"
            className="font-semibold text-forest-800"
          >
            Status: {order.paymentStatus === "paid" ? "Verified" : "Due on pickup"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div
          data-testid="order-loading"
          className="max-w-md mx-auto text-center py-20 space-y-4"
        >
          <div className="w-12 h-12 border-4 border-terracotta-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-forest-700 font-semibold">
            Loading order details...
          </p>
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}
