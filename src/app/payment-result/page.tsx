"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, ArrowRight, RefreshCw, ShieldCheck, ShoppingBag, Store } from "lucide-react";
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
  const { clearCart } = useCart();

  const orderId = searchParams.get("order_id") || searchParams.get("orderId");
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
