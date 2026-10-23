"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  X,
  Clock,
  QrCode,
  Store,
  Check,
  Sparkles,
  AlertCircle,
  Ban,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface PickupSlot {
  id: string;
  label: string;
  time: string;
  badge?: string;
  isAvailable: boolean;
  unavailableReason?: string;
}

export const PICKUP_SLOTS: PickupSlot[] = [
  {
    id: "quick-20",
    label: "Express Counter Pickup",
    time: "In 20 minutes (Quick)",
    badge: "Fastest",
    isAvailable: true,
  },
  {
    id: "today-530",
    label: "Evening Pickup Slot",
    time: "Today at 5:30 PM",
    badge: "Popular",
    isAvailable: true,
  },
  {
    id: "today-730",
    label: "Night Pickup Slot",
    time: "Today at 7:30 PM",
    isAvailable: true,
  },
  {
    id: "today-930",
    label: "Late Evening Slot",
    time: "Today at 9:30 PM",
    isAvailable: false,
    unavailableReason: "Store Closed / Slot Full",
  },
  {
    id: "tomorrow-1030",
    label: "Next Morning Slot",
    time: "Tomorrow at 10:30 AM",
    isAvailable: true,
  },
  {
    id: "tomorrow-0800",
    label: "Early Morning Slot",
    time: "Tomorrow at 8:00 AM",
    isAvailable: false,
    unavailableReason: "Before Store Hours",
  },
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
  const [selectedSlotId, setSelectedSlotId] = useState<string>("quick-20");
  const [slotError, setSlotError] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "counter">("upi");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen || cart.length === 0) return null;

  const selectedSlot = PICKUP_SLOTS.find((s) => s.id === selectedSlotId);
  const isValidSlotSelected = Boolean(selectedSlot && selectedSlot.isAvailable);

  const handleSlotSelect = (slot: PickupSlot) => {
    if (!slot.isAvailable) {
      setSlotError(`"${slot.time}" is unavailable: ${slot.unavailableReason}`);
      return;
    }
    setSelectedSlotId(slot.id);
    setSlotError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Checkpoint 3.4: Validate that an available slot is selected
    if (!selectedSlot || !selectedSlot.isAvailable) {
      setSlotError("Please choose an available pickup window before proceeding.");
      return;
    }

    setSlotError("");
    setIsSubmitting(true);

    setTimeout(() => {
      const order = createOrder({
        customerName,
        customerPhone,
        pickupTime: selectedSlot.time,
        paymentMethod,
      });

      setIsSubmitting(false);
      if (order) {
        setIsCheckoutOpen(false);
        router.push(`/orders/${order.id}`);
      }
    }, 600);
  };

  return (
    <AnimatePresence>
      <div
        data-testid="checkout-modal"
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCheckoutOpen(false)}
          className="fixed inset-0 bg-forest-950/60 backdrop-blur-xs cursor-pointer"
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
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-terracotta-500 text-white shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-forest-950">
                  Confirm Store Pickup
                </h3>
                <p className="text-xs text-forest-600">
                  Pick up fresh at the counter • Direct artisan settlement
                </p>
              </div>
            </div>
            <button
              data-testid="checkout-modal-close-button"
              onClick={() => setIsCheckoutOpen(false)}
              className="p-1.5 rounded-full hover:bg-cream-200 text-forest-700 transition-colors"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {/* Pickup Time Selector */}
            <div data-testid="pickup-time-selector" className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-forest-900 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-terracotta-500" />
                  <span>Select Available Pickup Window</span>
                </label>
                {selectedSlot && (
                  <span
                    data-testid="selected-pickup-slot"
                    className="text-[11px] font-bold text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-2 py-0.5 rounded-full"
                  >
                    {selectedSlot.time}
                  </span>
                )}
              </div>

              {/* Slots Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PICKUP_SLOTS.map((slot) => {
                  const isSelected = selectedSlotId === slot.id && slot.isAvailable;
                  return (
                    <button
                      type="button"
                      key={slot.id}
                      data-testid={`pickup-slot-${slot.id}`}
                      data-available={slot.isAvailable ? "true" : "false"}
                      data-selected={isSelected ? "true" : "false"}
                      disabled={!slot.isAvailable}
                      onClick={() => handleSlotSelect(slot)}
                      className={`relative p-3 rounded-2xl text-xs font-semibold text-left transition-all border ${
                        !slot.isAvailable
                          ? "bg-cream-200/50 text-forest-400 border-cream-300 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "bg-forest-800 text-cream-100 border-forest-900 shadow-warm ring-2 ring-forest-700"
                          : "bg-cream-100 text-forest-800 border-cream-300 hover:border-terracotta-400 hover:bg-cream-50 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <p className={`font-bold leading-tight ${isSelected ? "text-cream-100" : "text-forest-950"}`}>
                            {slot.time}
                          </p>
                          <p className={`text-[10px] mt-0.5 ${isSelected ? "text-cream-200" : "text-forest-500"}`}>
                            {slot.label}
                          </p>
                        </div>

                        {/* Status / Selected Icon */}
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <div className="w-4 h-4 rounded-full bg-terracotta-500 flex items-center justify-center text-white">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : !slot.isAvailable ? (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 border border-rose-200 px-1.5 py-0.5 rounded-md">
                              <Ban className="w-2.5 h-2.5" />
                              <span>Full</span>
                            </span>
                          ) : slot.badge ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-terracotta-700 bg-terracotta-100 px-1.5 py-0.5 rounded-md">
                              {slot.badge}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Reason if unavailable */}
                      {!slot.isAvailable && (
                        <p className="text-[10px] text-rose-600 font-medium mt-1">
                          {slot.unavailableReason}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Slot Validation Error message */}
              {slotError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  data-testid="pickup-slot-error"
                  className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold bg-rose-50 border border-rose-200 p-2.5 rounded-xl mt-1"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{slotError}</span>
                </motion.div>
              )}
            </div>

            {/* Customer Contact */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-forest-900 uppercase tracking-wider block">
                Shopper Pickup Identification
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[11px] font-medium text-forest-600 mb-1 block">
                    Full Name
                  </span>
                  <input
                    type="text"
                    required
                    data-testid="customer-name-input"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:ring-2 focus:ring-terracotta-400 focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-forest-600 mb-1 block">
                    Phone (for pickup SMS token)
                  </span>
                  <input
                    type="tel"
                    required
                    data-testid="customer-phone-input"
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
                  data-testid="payment-method-upi"
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
                  data-testid="payment-method-counter"
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
              data-testid="confirm-order-button"
              disabled={isSubmitting || !isValidSlotSelected}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-warm tap-bounce transition-all ${
                !isValidSlotSelected
                  ? "bg-cream-300 text-forest-500 cursor-not-allowed"
                  : "bg-forest-700 hover:bg-forest-800 text-cream-100"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Confirming with Store Counter...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-terracotta-400" />
                  <span>Confirm Pickup & Generate Token (₹{totalAmount})</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
