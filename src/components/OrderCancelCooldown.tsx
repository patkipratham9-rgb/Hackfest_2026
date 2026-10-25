"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { OrderStatus } from "@/types";
import {
  Clock,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderCancelCooldownProps {
  orderId: string;
  createdAt?: string;
  totalAmount?: number;
  paymentMethod?: string;
  currentStatus?: OrderStatus;
  onOrderCancelled?: () => void;
  className?: string;
}

export function OrderCancelCooldown({
  orderId,
  createdAt,
  totalAmount = 0,
  paymentMethod = "upi",
  currentStatus = "placed",
  onOrderCancelled,
  className = "",
}: OrderCancelCooldownProps) {
  const { updateOrderStatus } = useCart();
  const CANCELLATION_LIMIT_SECONDS = 60; // 1-minute cancellation grace window

  // Calculate remaining seconds from order creation
  const calculateRemaining = () => {
    if (!createdAt) return CANCELLATION_LIMIT_SECONDS;
    const createdMs = new Date(createdAt).getTime();
    if (isNaN(createdMs)) return CANCELLATION_LIMIT_SECONDS;
    const elapsed = Math.floor((Date.now() - createdMs) / 1000);
    return Math.max(0, CANCELLATION_LIMIT_SECONDS - elapsed);
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(calculateRemaining);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(currentStatus === "cancelled");

  // Keep in sync with prop updates
  useEffect(() => {
    if (currentStatus === "cancelled") {
      setIsCancelled(true);
      setSecondsLeft(0);
    }
  }, [currentStatus]);

  // Countdown timer loop
  useEffect(() => {
    if (isCancelled) return;

    // Recalculate accurately against createdAt
    setSecondsLeft(calculateRemaining());

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, isCancelled]);

  const handleConfirmCancel = async () => {
    if (secondsLeft <= 0 || isCancelled) return;

    setIsCancelling(true);
    try {
      // Update local cart state and storage
      updateOrderStatus(orderId, "cancelled");
      setIsCancelled(true);
      setIsModalOpen(false);
      onOrderCancelled?.();
    } catch (err) {
      console.error("Order cancellation failed:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  const formattedSeconds = String(secondsLeft).padStart(2, "0");
  const percentRemaining = (secondsLeft / CANCELLATION_LIMIT_SECONDS) * 100;

  // 1. If order is already cancelled
  if (isCancelled) {
    return (
      <div
        data-testid="order-cancelled-banner"
        className={`p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-2 shadow-xs ${className}`}
      >
        <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
          <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>Order Cancelled Successfully</span>
        </div>
        <p className="text-[11px] text-rose-700 leading-relaxed">
          This order was cancelled within the 1-minute grace window. Full refund of{" "}
          <strong className="font-semibold text-rose-950">₹{totalAmount}</strong> has been
          initiated to your {paymentMethod === "upi" ? "UPI account" : "original payment source"}.
        </p>
        <div className="pt-1.5 border-t border-rose-200/70 flex items-center gap-1.5 text-[10px] text-rose-600 font-medium">
          <CheckCircle2 className="w-3 h-3 text-rose-600" />
          <span>Estimated refund turnaround: 15-30 minutes for UPI • Reference #{orderId}</span>
        </div>
      </div>
    );
  }

  // 2. Cancellation section with active cooldown or expired button
  const canCancel = secondsLeft > 0 && !isCancelled;

  return (
    <div
      data-testid="order-cancellation-container"
      className={`p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-3 text-left ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${canCancel ? "text-terracotta-600 animate-pulse" : "text-forest-400"}`} />
          <span className="font-bold text-xs text-forest-950">
            Order Cancellation Window (1 Min)
          </span>
        </div>

        {canCancel ? (
          <span
            data-testid="cancel-order-cooldown-timer"
            className="font-mono text-xs font-black px-2 py-0.5 rounded-full bg-rose-100 border border-rose-300 text-rose-800 shadow-2xs"
          >
            00:{formattedSeconds}
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-500 bg-cream-200 px-2 py-0.5 rounded-full">
            Window Closed
          </span>
        )}
      </div>

      {/* Progress Bar for Cooldown */}
      {canCancel && (
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-cream-200 rounded-full overflow-hidden">
            <motion.div
              initial={false}
              animate={{ width: `${percentRemaining}%` }}
              transition={{ duration: 1, ease: "linear" }}
              className="h-full bg-gradient-to-r from-rose-500 to-terracotta-500 rounded-full"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-forest-600">
            <span>You have {secondsLeft}s left to cancel with instant refund</span>
            <span className="font-semibold text-rose-700">{secondsLeft}s remaining</span>
          </div>
        </div>
      )}

      {/* Action Button: Interactive while cooldown active, of no use / disabled once expired */}
      {canCancel ? (
        <button
          type="button"
          data-testid="cancel-order-button"
          onClick={() => setIsModalOpen(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <XCircle className="w-4 h-4 text-rose-600" />
          <span>Cancel Order (00:{formattedSeconds} left)</span>
        </button>
      ) : (
        <div className="space-y-1.5">
          <button
            type="button"
            disabled
            data-testid="cancel-order-button-disabled"
            className="w-full py-2.5 px-4 rounded-xl bg-cream-200/80 border border-cream-300 text-forest-400 text-xs font-semibold cursor-not-allowed opacity-75 flex items-center justify-center gap-2 select-none"
            title="The 1-minute cancellation cooldown has elapsed. The order is now being processed."
          >
            <Lock className="w-3.5 h-3.5 text-forest-400" />
            <span>Cancellation Unavailable (1-Min Window Expired)</span>
          </button>
          <p
            data-testid="cancellation-expired-notice"
            className="text-[10px] text-forest-500 text-center leading-tight"
          >
            🔒 The 1-minute grace period has passed. Artisan merchant staff have initiated packing fresh goods.
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            data-testid="cancel-order-modal"
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 border border-rose-200 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-forest-950">
                  Cancel Order #{orderId}?
                </h3>
                <p className="text-xs text-forest-600 leading-relaxed">
                  You have{" "}
                  <strong className="text-rose-700 font-mono font-bold">
                    {secondsLeft}s
                  </strong>{" "}
                  remaining in your cancellation cooldown window.
                </p>
              </div>

              <div className="bg-cream-100 p-3 rounded-xl border border-cream-200 text-xs text-forest-700 text-left space-y-1">
                <div className="flex justify-between">
                  <span>Refund Amount:</span>
                  <span className="font-bold text-forest-950">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Refund Destination:</span>
                  <span className="font-bold text-forest-950">
                    {paymentMethod === "upi" ? "UPI (Instant)" : "Original Source"}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700 pt-1 border-t border-cream-200 font-semibold text-[11px]">
                  <span>Cancellation Penalty:</span>
                  <span>₹0 (100% Free)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  data-testid="cancel-order-dismiss-button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCancelling}
                  className="py-2.5 px-3 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  data-testid="confirm-cancel-order-button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-warm"
                >
                  {isCancelling ? (
                    <span>Cancelling...</span>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Yes, Cancel</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
