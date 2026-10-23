"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { X, Clock, QrCode, Store, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PICKUP_TIMES = [
  "In 20 minutes (Quick)",
  "Today at 5:30 PM",
  "Today at 7:30 PM",
  "Tomorrow at 10:00 AM",
];

export function CheckoutModal() {
  const router = useRouter();
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    totalAmount,
    subtotal,
    platformFee,
    createOrder,
    cart,
  } = useCart();

  const [customerName, setCustomerName] = useState("Pratham Patki");
  const [customerPhone, setCustomerPhone] = useState("+91 98451 22334");
  const [pickupTime, setPickupTime] = useState(PICKUP_TIMES[0]);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "counter">("upi");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen || cart.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const order = createOrder({
        customerName,
        customerPhone,
        pickupTime,
        paymentMethod,
      });

      setIsSubmitting(false);
      if (order) {
        router.push(`/orders/${order.id}`);
      }
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCheckoutOpen(false)}
          className="fixed inset-0 bg-forest-950/60 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-cream-50 rounded-3xl border border-cream-300 shadow-floating overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="p-5 bg-cream-100 border-b border-cream-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-terracotta-500 text-white">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-forest-950">
                  Confirm Pickup Order
                </h3>
                <p className="text-xs text-forest-600">
                  Pick up fresh at the shop counter • No delivery delays
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-1.5 rounded-full hover:bg-cream-200 text-forest-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {/* Pickup Time Selector */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-forest-900 uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5 text-terracotta-500" />
                <span>Estimated Pickup Window</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PICKUP_TIMES.map((time) => (
                  <button
                    type="button"
                    key={time}
                    onClick={() => setPickupTime(time)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                      pickupTime === time
                        ? "bg-forest-800 text-cream-100 border-forest-900 shadow-xs"
                        : "bg-cream-100 text-forest-800 border-cream-300 hover:border-terracotta-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{time}</span>
                      {pickupTime === time && (
                        <Check className="w-3.5 h-3.5 text-terracotta-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Contact */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-forest-900 uppercase tracking-wider block">
                Pickup Contact Details
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[11px] font-medium text-forest-600 mb-1 block">
                    Full Name
                  </span>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:ring-2 focus:ring-terracotta-400 focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-forest-600 mb-1 block">
                    Phone (for pickup SMS/WhatsApp)
                  </span>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:ring-2 focus:ring-terracotta-400 focus:outline-none"
                    placeholder="+91 Phone"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-forest-900 uppercase tracking-wider mb-2 block">
                Payment Option
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentMethod === "upi"
                      ? "bg-terracotta-50 border-terracotta-500 ring-2 ring-terracotta-400/30"
                      : "bg-cream-100 border-cream-300 hover:border-terracotta-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <QrCode className="w-4 h-4 text-terracotta-600" />
                    {paymentMethod === "upi" && (
                      <span className="w-2 h-2 rounded-full bg-terracotta-500" />
                    )}
                  </div>
                  <div className="font-bold text-xs text-forest-950">
                    UPI Instant Pay
                  </div>
                  <div className="text-[10px] text-forest-600 mt-0.5">
                    GPay / PhonePe / Paytm
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("counter")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentMethod === "counter"
                      ? "bg-forest-50 border-forest-600 ring-2 ring-forest-500/30"
                      : "bg-cream-100 border-cream-300 hover:border-forest-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Store className="w-4 h-4 text-forest-700" />
                    {paymentMethod === "counter" && (
                      <span className="w-2 h-2 rounded-full bg-forest-600" />
                    )}
                  </div>
                  <div className="font-bold text-xs text-forest-950">
                    Pay at Store Counter
                  </div>
                  <div className="text-[10px] text-forest-600 mt-0.5">
                    Cash or UPI on pickup
                  </div>
                </button>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-3 bg-cream-200/70 rounded-2xl border border-cream-300 space-y-1 text-xs">
              <div className="flex justify-between text-forest-700">
                <span>Subtotal ({cart.length} items)</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-forest-700">
                <span>Platform fair fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="flex justify-between font-bold text-forest-950 pt-1 border-t border-cream-300 text-sm">
                <span>Total to Pay</span>
                <span className="font-serif text-terracotta-700 text-base">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-forest-700 hover:bg-forest-800 text-cream-100 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-warm tap-bounce transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting with Meena's Shop...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-terracotta-400" />
                  <span>Place Order & Generate Pickup Token (₹{totalAmount})</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
