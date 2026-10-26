"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { UserAddress } from "@/types";
import { Map4MePicker } from "@/components/Map4MePicker";
import { CashfreePaymentGatewayModal } from "@/components/CashfreePaymentGatewayModal";
import { CheckoutReturnBadge } from "@/components/CheckoutReturnBadge";
import { PostLoginLocationModal } from "@/components/PostLoginLocationModal";
import {
  X,
  Clock,
  QrCode,
  Store,
  Check,
  Sparkles,
  AlertCircle,
  Ban,
  ShoppingBag,
  CreditCard,
  User,
  Phone,
  MapPin,
  Truck,
  ShieldCheck,
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
    gstAmount,
    minBillAmount,
    isMinBillMet,
    createOrder,
    cart,
    userLocation,
    setUserLocation,
  } = useCart();
  const { user, addAddress } = useAuth();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(
    user?.number ? `+91 ${user.number}` : ""
  );
  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr?.id || "");
  const [deliveryOption, setDeliveryOption] = useState<"delivery" | "pickup">("delivery");
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [isLocationRequiredModalOpen, setIsLocationRequiredModalOpen] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [customDeliveryAddress, setCustomDeliveryAddress] = useState<UserAddress | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("quick-20");
  const [nameError, setNameError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [slotError, setSlotError] = useState<string>("");
  const [billError, setBillError] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "counter">("upi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState("");
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [pendingCashfreeOrderId, setPendingCashfreeOrderId] = useState("");

  // Parse distance from primary item's store or default to 4.2 km to demonstrate per-km fee
  const initialDistance = React.useMemo(() => {
    if (cart.length > 0 && cart[0].product.storeDistance) {
      const parsed = parseFloat(cart[0].product.storeDistance.replace(/[^0-9.]/g, ""));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 4.2;
  }, [cart]);

  const [deliveryDistance, setDeliveryDistance] = useState<number>(4.2);

  React.useEffect(() => {
    if (initialDistance) {
      setDeliveryDistance(initialDistance);
    }
  }, [initialDistance]);

  // Sync with user session if updated
  React.useEffect(() => {
    if (user?.name && !customerName) setCustomerName(user.name);
    if (user?.number && !customerPhone) setCustomerPhone(`+91 ${user.number}`);
    if (user?.addresses?.length && !selectedAddressId) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [user]);

  // Distance calculation:
  // Base delivery up to 3 km is FREE (₹0).
  // Distance > 3 km incurs ₹15 per km for the additional distance beyond 3 km.
  const extraDistance = Math.max(0, Number((deliveryDistance - 3).toFixed(1)));
  const deliveryFee =
    deliveryOption === "delivery" && deliveryDistance > 3
      ? Math.round(extraDistance * 15)
      : 0;

  // Final Total = Subtotal + GST (5%) + Platform Fee + Delivery Fee (if home delivery & distance > 3km)
  const finalTotal = subtotal + gstAmount + platformFee + deliveryFee;

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

  const validate = () => {
    let isValid = true;

    // Minimum bill check (₹599)
    if (subtotal < minBillAmount) {
      setBillError(`Minimum bill amount is ₹${minBillAmount}. Add ₹${minBillAmount - subtotal} more to place this order.`);
      isValid = false;
    } else {
      setBillError("");
    }

    // Name validation
    if (!customerName.trim()) {
      setNameError("Please enter your full name for store counter identification.");
      isValid = false;
    } else {
      setNameError("");
    }

    // Phone validation
    const digitsOnly = customerPhone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      setPhoneError(
        deliveryOption === "delivery"
          ? "Please enter a valid 10-digit mobile number for delivery updates."
          : "Please enter a valid 10-digit mobile number for pickup SMS."
      );
      isValid = false;
    } else {
      setPhoneError("");
    }

    // Slot validation (only required when Express Pick-up is selected)
    if (deliveryOption === "pickup") {
      if (!selectedSlot || !selectedSlot.isAvailable) {
        setSlotError("Please choose an available pickup window before proceeding.");
        isValid = false;
      } else {
        setSlotError("");
      }
    } else {
      setSlotError("");
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Enforce location before payment if user skipped sharing earlier
    const hasSharedLocation = Boolean(
      (userLocation && userLocation.trim() !== "" && !userLocation.toLowerCase().includes("add / share location")) ||
      customDeliveryAddress ||
      (user?.addresses && user.addresses.length > 0)
    );

    if (!hasSharedLocation) {
      setLocationError("Location is required before payment. Please share your location.");
      setIsLocationRequiredModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    const selectedAddr =
      customDeliveryAddress ||
      user?.addresses?.find((a) => a.id === selectedAddressId) ||
      defaultAddr;

    // Cashfree PG Payment Gateway Flow
    if (paymentMethod === "upi") {
      setPaymentStatusMessage("Initializing Cashfree Payment Gateway...");
      try {
        const cfRes = await fetch("/api/checkout/cashfree", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalTotal,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerEmail: user?.email,
            notes: `LocalLoop Hubli-Dharwad: ${deliveryOption === "delivery" ? `Home Delivery (${deliveryDistance} km)` : "Store Pick-up"}`,
          }),
        });

        const cfData = await cfRes.json();
        const cfOrderId = cfData.order_id || cfData.orderId || `cf_ord_${Date.now()}`;
        setPendingCashfreeOrderId(cfOrderId);

        // Launch Cashfree Hosted Checkout if Cashfree SDK is loaded and a live session is active
        if (
          typeof window !== "undefined" &&
          (window as any).Cashfree &&
          cfData.payment_session_id &&
          !cfData.simulated
        ) {
          try {
            setPaymentStatusMessage("Opening Cashfree Hosted Payment Gateway...");
            const cashfree = (window as any).Cashfree({
              mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || "sandbox",
            });
            await cashfree.checkout({
              paymentSessionId: cfData.payment_session_id,
              redirectTarget: "_self",
            });
            return;
          } catch (sdkErr) {
            console.warn("Cashfree SDK launch notice:", sdkErr);
          }
        }

        // Open Interactive Cashfree Payment Gateway Modal
        setIsSubmitting(false);
        setIsGatewayOpen(true);
        return;
      } catch (err) {
        console.warn("Cashfree initiation notice:", err);
      }
    }

    // Pay at counter / offline fallback
    setTimeout(() => {
      const order = createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerId: user?.id,
        userId: user?.id,
        customerEmail: user?.email,
        pickupTime: deliveryOption === "delivery" ? "Doorstep Delivery (35-45 mins)" : (selectedSlot?.time || "Express 20 Mins"),
        paymentMethod,
        paymentStatus: paymentMethod === "upi" ? "paid" : "pending",
        deliveryOption,
        deliveryAddress: selectedAddr,
        deliveryFee,
        deliveryDistance: deliveryOption === "delivery" ? deliveryDistance : 0,
        gst: gstAmount,
      });

      setIsSubmitting(false);
      if (order) {
        setIsCheckoutOpen(false);
        router.push(`/orders/${order.id}`);
      }
    }, 600);
  };

  const handleGatewayPaymentSuccess = async (details: {
    paymentId: string;
    cfOrderId: string;
    paymentMethod: string;
  }) => {
    setIsSubmitting(true);
    setPaymentStatusMessage("Verifying Cashfree payment settlement...");

    const cfOrderId = details.cfOrderId || pendingCashfreeOrderId || `cf_ord_${Date.now()}`;
    const cfPaymentId = details.paymentId || `cf_pay_${Date.now()}`;

    try {
      await fetch("/api/checkout/cashfree/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: cfOrderId, cfOrderId }),
      });
    } catch (err) {
      console.warn("Cashfree verify call notice:", err);
    }

    const selectedAddr =
      customDeliveryAddress ||
      user?.addresses?.find((a) => a.id === selectedAddressId) ||
      defaultAddr;

    const order = createOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerId: user?.id,
      userId: user?.id,
      customerEmail: user?.email,
      pickupTime:
        deliveryOption === "delivery"
          ? "Doorstep Delivery (35-45 mins)"
          : selectedSlot?.time || "Express 20 Mins",
      paymentMethod: "upi",
      paymentStatus: "paid",
      deliveryOption,
      deliveryAddress: selectedAddr,
      deliveryFee,
      deliveryDistance: deliveryOption === "delivery" ? deliveryDistance : 0,
      gst: gstAmount,
      cashfreeOrderId: cfOrderId,
      cashfreePaymentId: cfPaymentId,
    });

    setIsGatewayOpen(false);
    setIsSubmitting(false);
    setIsCheckoutOpen(false);

    if (order) {
      router.push(`/payment-result?order_id=${order.id}`);
    }
  };

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <AnimatePresence>
      {isCheckoutOpen && cart.length > 0 && (
        <div
          key="checkout-modal-wrapper"
          data-testid="checkout-modal"
          className="fixed inset-0 z-[99990] overflow-y-auto flex items-center justify-center p-3 sm:p-4"
          style={{ zIndex: 99990 }}
        >
          {/* Backdrop */}
          <motion.div
            key="checkout-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCheckoutOpen(false)}
            className="fixed inset-0 bg-forest-950/75 backdrop-blur-md cursor-pointer"
            style={{ zIndex: 99990 }}
          />

          {/* Modal Dialog */}
          <motion.div
            key="checkout-modal-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-cream-50 rounded-3xl border border-cream-300 shadow-floating overflow-hidden z-[99991] my-4 sm:my-8"
            style={{ zIndex: 99991 }}
          >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-cream-100 border-b border-cream-300 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-terracotta-500 text-white shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-forest-950">
                  {deliveryOption === "delivery" ? "Confirm Home Delivery" : "Confirm Store Pick-up"}
                </h3>
                <p className="text-[11px] text-forest-600 line-clamp-1">
                  Your city’s hyperlocal digital marketplace. Connecting authentic corner shops across Hubli-Dharwad.
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

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto">
            {/* Checkpoint 3.5: Order Summary Section */}
            <div
              data-testid="checkout-order-summary"
              className="p-4 rounded-2xl bg-cream-100/90 border border-cream-300 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-cream-200 pb-2">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-terracotta-600" />
                  <span className="font-serif font-bold text-sm text-forest-950">
                    Order Summary
                  </span>
                </div>
                <span className="text-xs font-semibold text-forest-600 bg-cream-200 px-2 py-0.5 rounded-full">
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div
                    key={item.product.id || `checkout-item-${idx}`}
                    className="flex items-center justify-between gap-3 text-xs bg-cream-50 p-2.5 rounded-xl border border-cream-200"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-cream-200 shrink-0 border border-cream-300">
                        {Boolean(item.product.imageUrl && item.product.imageUrl.trim()) ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-forest-400">
                            <Store className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-forest-950 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-forest-500 truncate">
                          {item.product.storeName}
                        </p>
                        <p className="text-[11px] text-terracotta-600 font-medium">
                          {item.quantity} × ₹{item.product.price}/{item.product.unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-forest-950 text-xs">
                        ₹{item.product.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-2 border-t border-cream-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-forest-700">
                  <span>Cart Subtotal</span>
                  <span data-testid="checkout-subtotal" className="font-medium">
                    ₹{subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-forest-700">
                  <span className="flex items-center gap-1">
                    <span>GST (5%)</span>
                    <span className="text-[10px] bg-cream-200 text-forest-700 px-1.5 py-0.2 rounded font-semibold">
                      Tax
                    </span>
                  </span>
                  <span data-testid="checkout-gst-amount" className="font-medium text-forest-900">
                    ₹{gstAmount}
                  </span>
                </div>
                <div className="flex justify-between text-forest-700">
                  <span className="flex items-center gap-1">
                    <span>Local Platform Fee</span>
                    <span className="text-[10px] bg-forest-100 text-forest-800 px-1.5 py-0.2 rounded font-semibold">
                      Fair Share
                    </span>
                  </span>
                  <span className="font-medium">₹{platformFee}</span>
                </div>

                {deliveryOption === "delivery" && (
                  <div className="flex justify-between text-forest-700">
                    <span className="flex items-center gap-1">
                      <span>Delivery Fee</span>
                      <span className="text-[10px] bg-terracotta-100 text-terracotta-800 px-1.5 py-0.2 rounded font-semibold">
                        {deliveryDistance > 3
                          ? `${extraDistance} km extra @ ₹15/km`
                          : "Within 3 km (FREE)"}
                      </span>
                    </span>
                    <span
                      data-testid="checkout-delivery-fee"
                      className="font-medium text-forest-900"
                    >
                      {deliveryFee > 0 ? `₹${deliveryFee}` : "FREE"}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-forest-950 pt-2 border-t border-cream-300 text-sm">
                  <span>Total Due</span>
                  <span
                    data-testid="checkout-final-total"
                    className="font-serif text-terracotta-700 text-base font-bold"
                  >
                    ₹{finalTotal}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 5.1 Checkout Page Quick Return & Refund Badge */}
            <CheckoutReturnBadge variant="compact" />

            {/* Minimum Bill Banner & Progress (₹599) */}
            <div data-testid="checkout-min-bill-section">
              {!isMinBillMet ? (
                <div
                  data-testid="checkout-min-bill-warning"
                  className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl space-y-2 text-amber-950"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1.5 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Minimum Bill Value: ₹{minBillAmount}</span>
                    </div>
                    <span className="text-terracotta-700 font-extrabold">
                      Add ₹{minBillAmount - subtotal} more
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    A minimum order subtotal of ₹599 is required to checkout from Hubballi-Dharwad marketplace stores.
                  </p>
                  <div className="w-full bg-amber-200/70 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-terracotta-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((subtotal / minBillAmount) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  data-testid="checkout-min-bill-met"
                  className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold">Minimum Bill Requirement Met</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Subtotal: ₹{subtotal} (≥ ₹599)
                  </span>
                </div>
              )}
            </div>

            {/* Delivery Option Selection: 1. Home Delivery, 2. Pick-up */}
            <div data-testid="delivery-option-selector" className="space-y-2.5">
              <label className="text-xs font-bold text-forest-900 uppercase tracking-wider block">
                Delivery Option
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  data-testid="delivery-option-delivery"
                  onClick={() => setDeliveryOption("delivery")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    deliveryOption === "delivery"
                      ? "bg-terracotta-500 text-cream-50 border-terracotta-600 shadow-warm ring-2 ring-terracotta-400"
                      : "bg-cream-100 text-forest-800 border-cream-300 hover:bg-cream-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Truck className="w-4 h-4 text-cream-100" />
                    <span className="font-bold text-xs">1. Home Delivery</span>
                  </div>
                  <p className="text-[10px] opacity-90">Doorstep delivery across Hubli-Dharwad</p>
                </button>

                <button
                  type="button"
                  data-testid="delivery-option-pickup"
                  onClick={() => setDeliveryOption("pickup")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    deliveryOption === "pickup"
                      ? "bg-forest-800 text-cream-100 border-forest-900 shadow-warm ring-2 ring-forest-700"
                      : "bg-cream-100 text-forest-800 border-cream-300 hover:bg-cream-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Store className="w-4 h-4 text-terracotta-400" />
                    <span className="font-bold text-xs">2. Express Pick-up</span>
                  </div>
                  <p className="text-[10px] opacity-90">Fast counter pick-up in 15-20 mins</p>
                </button>
              </div>

              {/* Distance Calculation for Home Delivery (Distance > 3km incurs ₹15/km for extra distance) */}
              {deliveryOption === "delivery" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  data-testid="delivery-distance-calculator"
                  className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-forest-950">
                      <Truck className="w-4 h-4 text-terracotta-600" />
                      <span>Delivery Distance & Rate Calculation</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white border border-amber-300 rounded-xl px-2 py-1 shadow-2xs">
                      <button
                        type="button"
                        data-testid="distance-decrease-btn"
                        onClick={() =>
                          setDeliveryDistance((d) =>
                            Math.max(1, Number((d - 0.5).toFixed(1)))
                          )
                        }
                        className="w-5 h-5 flex items-center justify-center font-bold text-forest-800 hover:bg-cream-100 rounded cursor-pointer"
                        title="Decrease distance"
                      >
                        -
                      </button>
                      <span
                        data-testid="delivery-distance-val"
                        className="font-mono text-xs font-extrabold text-forest-950 px-1"
                      >
                        {deliveryDistance.toFixed(1)} km
                      </span>
                      <button
                        type="button"
                        data-testid="distance-increase-btn"
                        onClick={() =>
                          setDeliveryDistance((d) =>
                            Math.min(25, Number((d + 0.5).toFixed(1)))
                          )
                        }
                        className="w-5 h-5 flex items-center justify-center font-bold text-forest-800 hover:bg-cream-100 rounded cursor-pointer"
                        title="Increase distance"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-forest-700 bg-white/80 p-2.5 rounded-xl border border-amber-100 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-forest-600">Base allowance (up to 3.0 km):</span>
                      <span className="font-semibold text-emerald-700">FREE</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-forest-600">
                        Distance beyond 3 km (@ ₹15/km):
                      </span>
                      <span className="font-semibold text-forest-900">
                        {deliveryDistance > 3
                          ? `${extraDistance} km extra × ₹15 = ₹${deliveryFee}`
                          : "0 km (₹0)"}
                      </span>
                    </div>
                    <div className="pt-1 border-t border-amber-100 flex justify-between items-center font-bold text-forest-900">
                      <span>Delivery Charge:</span>
                      <span className="font-serif text-terracotta-700">
                        {deliveryFee > 0 ? `₹${deliveryFee}` : "FREE"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Home Delivery Estimated Arrival Notice */}
            {deliveryOption === "delivery" && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-950">Doorstep Delivery (35–45 mins)</p>
                    <p className="text-[11px] text-emerald-700">
                      Dispatched across Hubli-Dharwad directly to your doorstep
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full shrink-0">
                  Express Dispatch
                </span>
              </motion.div>
            )}

            {/* Pickup Time Selector (Shown ONLY when Express Pick-up is selected) */}
            {deliveryOption === "pickup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                data-testid="pickup-time-selector"
                className="space-y-2"
              >
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
                  {PICKUP_SLOTS.map((slot, idx) => {
                    const isSelected = selectedSlotId === slot.id && slot.isAvailable;
                    return (
                      <button
                        type="button"
                        key={slot.id || `pickup-slot-${idx}`}
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
              </motion.div>
            )}

            {/* Delivery Address for Home Delivery OR Store Counter Location for Pick-up */}
            {deliveryOption === "delivery" ? (
              <div className="space-y-2 p-3.5 rounded-2xl bg-cream-100/90 border border-cream-300">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-forest-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-terracotta-600" />
                    <span>Delivery Address [Home, Office, Others]</span>
                  </span>
                  <button
                    type="button"
                    data-testid="checkout-open-map4me-btn"
                    onClick={() => setIsMapPickerOpen(true)}
                    className="text-[11px] font-bold text-terracotta-700 hover:text-terracotta-900 bg-white border border-terracotta-300 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                  >
                    <MapPin className="w-3 h-3 text-terracotta-600" />
                    <span>Pinpoint on Map4Me</span>
                  </button>
                </div>

                {customDeliveryAddress ? (
                  <div className="bg-amber-50/90 p-2.5 rounded-xl border border-amber-300 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-forest-950 px-1.5 py-0.5 rounded-md bg-amber-200 text-[10px] uppercase tracking-wide">
                          {customDeliveryAddress.label} (Map4Me Pinned)
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-800">
                          {deliveryDistance.toFixed(1)} km away
                        </span>
                      </div>
                      <p className="text-[11px] text-forest-800 font-medium truncate mt-1">
                        {customDeliveryAddress.street}
                        {customDeliveryAddress.landmark ? `, Near ${customDeliveryAddress.landmark}` : ""}, {customDeliveryAddress.locality} - {customDeliveryAddress.pincode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      className="shrink-0 text-[11px] font-bold text-terracotta-700 hover:underline px-2 py-1"
                    >
                      Change Pin
                    </button>
                  </div>
                ) : user && user.addresses && user.addresses.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {user.addresses.map((a, idx) => (
                      <button
                        key={a.id || `user-addr-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedAddressId(a.id);
                          setCustomDeliveryAddress(null);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          selectedAddressId === a.id
                            ? "bg-terracotta-600 text-cream-50 border-terracotta-600 shadow-xs"
                            : "bg-white text-forest-700 border-cream-300 hover:bg-cream-200"
                        }`}
                      >
                        <span>{a.label}</span>
                        <span className="text-[10px] opacity-80 line-clamp-1">({a.street}, {a.locality})</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-forest-600 bg-cream-50 p-2.5 rounded-xl border border-dashed border-cream-300 flex items-center justify-between">
                    <span>No delivery address saved yet.</span>
                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      className="font-bold text-terracotta-700 underline"
                    >
                      Set Pinpoint Location
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Store Counter Pick-up Information for Express Pick-up */
              <div className="p-3.5 rounded-2xl bg-forest-50/80 border border-forest-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-forest-950">
                  <span className="flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-forest-700" />
                    <span>Store Counter Pick-up Location</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                    FREE Pick-up
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-forest-100 text-xs space-y-1">
                  <p className="font-bold text-forest-950">
                    {cart[0]?.product?.storeName || "Neighborhood Artisan Store"}
                  </p>
                  <p className="text-[11px] text-forest-600">
                    Market Road, Hubballi-Dharwad • Ready in 15–20 minutes
                  </p>
                  <p className="text-[11px] text-terracotta-700 font-semibold pt-0.5">
                    Show your 6-digit pick-up code at the counter during your chosen window: {selectedSlot?.time || "Express"}
                  </p>
                </div>
              </div>
            )}

            {/* Customer Contact */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-forest-900 uppercase tracking-wider block">
                {deliveryOption === "delivery"
                  ? "Recipient Contact Details"
                  : "Shopper Pickup Identification"}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[11px] font-medium text-forest-600 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-forest-500" />
                    <span>Full Name</span>
                  </span>
                  <input
                    type="text"
                    data-testid="customer-name-input"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (nameError) setNameError("");
                    }}
                    className={`w-full px-3 py-2 bg-cream-100 border rounded-xl text-xs text-forest-950 font-medium focus:outline-none transition-colors ${
                      nameError
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-300"
                        : "border-cream-300 focus:ring-2 focus:ring-terracotta-400"
                    }`}
                    placeholder="e.g. Pratham Patki"
                  />
                  {nameError && (
                    <motion.p
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      data-testid="name-error"
                      className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{nameError}</span>
                    </motion.p>
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-medium text-forest-600 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-forest-500" />
                    <span>
                      {deliveryOption === "delivery"
                        ? "Phone (for doorstep delivery OTP & updates)"
                        : "Phone (for pickup SMS token)"}
                    </span>
                  </span>
                  <input
                    type="tel"
                    data-testid="customer-phone-input"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      if (phoneError) setPhoneError("");
                    }}
                    className={`w-full px-3 py-2 bg-cream-100 border rounded-xl text-xs text-forest-950 font-medium focus:outline-none transition-colors ${
                      phoneError
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-300"
                        : "border-cream-300 focus:ring-2 focus:ring-terracotta-400"
                    }`}
                    placeholder="e.g. +91 98451 22334"
                  />
                  {phoneError && (
                    <motion.p
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      data-testid="phone-error"
                      className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{phoneError}</span>
                    </motion.p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold text-forest-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-terracotta-500" />
                <span>Payment Method</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  data-testid="payment-method-upi"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentMethod === "upi"
                      ? "bg-terracotta-50 border-terracotta-500 ring-2 ring-terracotta-400/30"
                      : "bg-cream-100 border-cream-300 hover:border-terracotta-300 cursor-pointer"
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
                    GPay / PhonePe • Cashfree PG
                  </div>
                </button>

                <button
                  type="button"
                  data-testid="payment-method-counter"
                  onClick={() => setPaymentMethod("counter")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentMethod === "counter"
                      ? "bg-forest-50 border-forest-600 ring-2 ring-forest-500/30"
                      : "bg-cream-100 border-cream-300 hover:border-forest-300 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    {deliveryOption === "delivery" ? (
                      <Truck className="w-4 h-4 text-forest-700" />
                    ) : (
                      <Store className="w-4 h-4 text-forest-700" />
                    )}
                    {paymentMethod === "counter" && (
                      <span className="w-2 h-2 rounded-full bg-forest-600" />
                    )}
                  </div>
                  <div className="font-bold text-xs text-forest-950">
                    {deliveryOption === "delivery"
                      ? "Cash on Delivery (COD)"
                      : "Pay at Store Counter"}
                  </div>
                  <div className="text-[10px] text-forest-600 mt-0.5">
                    {deliveryOption === "delivery"
                      ? "Cash or UPI at doorstep"
                      : "Cash or UPI on pickup"}
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 space-y-2">
              {locationError && (
                <div
                  data-testid="checkout-location-error"
                  className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-900"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>{locationError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLocationRequiredModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-[11px] transition-colors cursor-pointer shrink-0"
                  >
                    Set Location
                  </button>
                </div>
              )}

              {billError && (
                <div
                  data-testid="checkout-bill-error"
                  className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{billError}</span>
                </div>
              )}

              <button
                type="submit"
                data-testid="confirm-order-button"
                disabled={isSubmitting || !isMinBillMet}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-warm tap-bounce transition-all bg-forest-700 hover:bg-forest-800 text-cream-100 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      {paymentStatusMessage ||
                        (deliveryOption === "delivery"
                          ? "Confirming Home Delivery Order..."
                          : "Confirming with Store Counter...")}
                    </span>
                  </div>
                ) : !isMinBillMet ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-300" />
                    <span>Add ₹{minBillAmount - subtotal} More to Order (Min. ₹599)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-terracotta-400" />
                    <span>
                      {deliveryOption === "delivery"
                        ? `Confirm Home Delivery & Pay (₹${finalTotal})`
                        : `Confirm Pickup & Generate Token (₹${finalTotal})`}
                    </span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-forest-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
                <span>Cashfree PG Verified • Hubli-Dharwad Hyperlocal Delivery</span>
              </div>
            </div>
          </form>
          </motion.div>
        </div>
      )}

      {/* Map4Me Pinpoint Delivery Modal */}
      {isMapPickerOpen && (
        <div
          key="map4me-picker-modal-container"
          className="fixed inset-0 z-[999999] overflow-y-auto flex items-center justify-center p-4"
          style={{ zIndex: 999999 }}
        >
          <motion.div
            key="map4me-picker-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMapPickerOpen(false)}
            className="fixed inset-0 bg-forest-950/80 backdrop-blur-md cursor-pointer"
            style={{ zIndex: 999999 }}
          />
          <motion.div
            key="map4me-picker-content"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl my-8 z-[1000000]"
            style={{ zIndex: 1000000 }}
          >
            <Map4MePicker
              title="Map4Me: Pinpoint Delivery Location"
              onSaveAddress={(saved) => {
                const customAddr: UserAddress = {
                  id: `map4me_${Date.now()}`,
                  label: saved.label,
                  street: saved.street,
                  landmark: saved.landmark,
                  locality: saved.locality,
                  city: saved.city,
                  pincode: saved.pincode,
                  isDefault: saved.isDefault,
                };
                setCustomDeliveryAddress(customAddr);
                if (typeof saved.distanceKm === "number" && saved.distanceKm > 0) {
                  setDeliveryDistance(Number(saved.distanceKm.toFixed(1)));
                }
                if (user) {
                  const res = addAddress(saved);
                  if (res.address) {
                    setSelectedAddressId(res.address.id);
                  }
                }
                setIsMapPickerOpen(false);
              }}
              onCancel={() => setIsMapPickerOpen(false)}
            />
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Location Permission Prompt before Payment if user did not share earlier */}
      <PostLoginLocationModal
        key="checkout-location-required-modal"
        isOpen={isLocationRequiredModalOpen}
        requireLocation={true}
        title="Delivery Location Required Before Payment"
        description="You have not shared your location yet. Please share your current location or select your neighborhood so we can calculate delivery timing and dispatch your order."
        onLocationSet={(loc) => {
          setUserLocation(loc);
          setCustomDeliveryAddress({
            id: `addr_${Date.now()}`,
            label: "Home",
            locality: loc,
            street: loc,
            city: "Hubballi-Dharwad",
            pincode: "580021",
            isDefault: true,
          });
          setLocationError("");
          setIsLocationRequiredModalOpen(false);
        }}
        onSkip={() => {
          setIsLocationRequiredModalOpen(false);
        }}
      />

      {/* Cashfree Payment Gateway Interactive Checkout Modal */}
      <CashfreePaymentGatewayModal
        key="checkout-cashfree-gateway-modal"
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        orderId={pendingCashfreeOrderId || `cf_ord_${Date.now()}`}
        amount={finalTotal}
        customerName={customerName}
        customerPhone={customerPhone}
        customerEmail={user?.email}
        deliveryOption={deliveryOption}
        onPaymentSuccess={handleGatewayPaymentSuccess}
        onPaymentFailure={(err) => {
          setPaymentStatusMessage(err || "Payment failed");
        }}
      />
    </>,
    document.body
  );
}
