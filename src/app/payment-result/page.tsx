"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, ArrowRight, RefreshCw, ShieldCheck, ShoppingBag, Store, Truck, Phone, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

function money(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart, getOrderById } = useCart();

  const orderId = searchParams.get("order_id") || searchParams.get("orderId");
  const currentOrder = orderId ? getOrderById(orderId) : undefined;
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("Verifying payment with Cashfree Gateway...");
  const [paymentResult, setPaymentResult] = useState<{
    orderId: string;
    amount?: number;
    currency?: string;
    status: string;
  } | null>(null);

  const checkPaymentStatus = async (id = orderId) => {
    if (!id) return;
    setChecking(true);
    setMessage("Verifying payment status with Cashfree...");

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(id)}/status`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not verify payment status.");
      }

      setPaymentResult(data);

      if (data.status === "PAID") {
        setMessage("Payment successful! Your order is confirmed.");
        clearCart();
      } else {
        setMessage("Payment is still processing. You can check again shortly.");
      }
    } catch (err: any) {
      setMessage(err?.message || "Failed to contact payment verification service.");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      checkPaymentStatus(orderId);
    }
  }, [orderId]);

  if (!orderId) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-cream-300 text-center shadow-warm space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cream-100 flex items-center justify-center text-forest-700">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold font-serif text-forest-950">No Order Specified</h1>
          <p className="text-xs text-forest-600">
            Return to the marketplace to explore authentic corner shops across Hubli-Dharwad.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-forest-900 text-cream-100 text-xs font-bold shadow-warm hover:bg-forest-950 transition-all"
          >
            Back to Marketplace
          </Link>
        </div>
      </main>
    );
  }

  const isPaid = paymentResult?.status === "PAID";

  return (
    <main className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-warm space-y-6 text-center">
        {/* Status Icon */}
        <div className="flex justify-center">
          {isPaid ? (
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <Clock className="w-9 h-9 animate-pulse" />
            </div>
          )}
        </div>

        {/* Heading & Status Message */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-100 text-forest-800 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
            <span>Cashfree Payment Gateway</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
            {isPaid ? "Payment Successful" : "Payment Verification"}
          </h1>
          <p className="text-xs text-forest-600 max-w-sm mx-auto leading-relaxed">{message}</p>
        </div>

        {/* Order Details Panel */}
        {paymentResult && (
          <div className="bg-cream-50 rounded-2xl p-4 border border-cream-200 text-left space-y-2.5 text-xs font-medium">
            <div className="flex items-center justify-between pb-2 border-b border-cream-200">
              <span className="text-forest-600">Order ID</span>
              <span className="font-mono font-bold text-forest-950 select-all">{paymentResult.orderId}</span>
            </div>
            {paymentResult.amount !== undefined && (
              <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                <span className="text-forest-600">Total Paid</span>
                <span className="font-bold text-forest-950">{money(paymentResult.amount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-forest-600">Gateway Status</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {paymentResult.status}
              </span>
            </div>
          </div>
        )}

        {/* Delivery Partner Details & Estimated Arrival Time (ETA) after Payment */}
        {isPaid && (
          <div
            data-testid="post-payment-delivery-eta"
            className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-left space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">
                    {currentOrder?.deliveryOption === "delivery" ? "Doorstep Delivery Fleet" : "Express Counter Pickup"}
                  </span>
                  <h4 className="font-bold text-xs text-forest-950">
                    {currentOrder?.deliveryOption === "delivery" ? "Delivery Partner Assigned" : "Counter Manager Assigned"}
                  </h4>
                </div>
              </div>

              {/* ETA Display */}
              <div className="text-right">
                <span className="text-[9px] font-bold uppercase text-emerald-700 tracking-wider flex items-center gap-1 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  Estimated Arrival
                </span>
                <span data-testid="payment-result-eta" className="font-serif font-black text-emerald-950 text-sm">
                  {currentOrder?.estimatedArrival || new Date(Date.now() + 25 * 60 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            {/* Delivery Partner Profile Card */}
            <div className="flex items-center justify-between p-3 bg-white/90 rounded-xl border border-emerald-100/80 gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentOrder?.deliveryPartner?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                  alt={currentOrder?.deliveryPartner?.name || "Ramesh Kulkarni"}
                  className="w-10 h-10 rounded-xl object-cover border border-emerald-200 shrink-0"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span data-testid="payment-result-delivery-name" className="font-bold text-xs text-forest-950">
                      {currentOrder?.deliveryPartner?.name || "Ramesh Kulkarni"}
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {currentOrder?.deliveryPartner?.rating || 4.9}
                    </span>
                  </div>
                  <p className="text-[10px] text-forest-500">
                    {currentOrder?.deliveryPartner?.vehicle || "Hero Electric Optima"} • <strong className="font-mono text-forest-700">{currentOrder?.deliveryPartner?.vehicleNumber || "KA-25-EM-4821"}</strong>
                  </p>
                </div>
              </div>

              <a
                data-testid="payment-result-call-delivery"
                href={`tel:${currentOrder?.deliveryPartner?.phone || "+919845088219"}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest-900 text-cream-100 text-xs font-bold shadow-xs hover:bg-forest-950 transition-colors shrink-0"
              >
                <Phone className="w-3 h-3 text-terracotta-400" />
                <span>Call</span>
              </a>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {isPaid ? (
            <Link
              href={`/orders/${orderId}`}
              className="w-full py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-950 text-cream-100 text-xs font-bold shadow-warm flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Track Order & Counter Pickup PIN</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => checkPaymentStatus()}
              disabled={checking}
              className="w-full py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-950 disabled:opacity-50 text-cream-100 text-xs font-bold shadow-warm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              <span>{checking ? "Checking..." : "Refresh Payment Status"}</span>
            </button>
          )}

          <Link
            href="/"
            className="block text-xs font-medium text-forest-600 hover:text-forest-900 transition-colors pt-1"
          >
            Return to Hyperlocal Marketplace
          </Link>
        </div>

        <p className="text-[11px] text-forest-500 pt-2 border-t border-cream-200">
          🔒 Payments are securely settled via Cashfree PG with 256-bit encryption. Keep your Order ID for reference.
        </p>
      </div>
    </main>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-forest-700 text-xs font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading payment result...</span>
          </div>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
