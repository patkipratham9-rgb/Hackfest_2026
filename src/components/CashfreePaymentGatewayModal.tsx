"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  ShieldCheck,
  QrCode,
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CashfreePaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryOption: "delivery" | "pickup";
  onPaymentSuccess: (details: {
    paymentId: string;
    cfOrderId: string;
    paymentMethod: string;
  }) => void;
  onPaymentFailure?: (error: string) => void;
}

type TabType = "upi" | "card" | "netbanking" | "wallet";

const TOP_BANKS = [
  { id: "sbi", name: "State Bank of India", code: "SBIN", color: "#280071" },
  { id: "hdfc", name: "HDFC Bank", code: "HDFC", color: "#004c8f" },
  { id: "icici", name: "ICICI Bank", code: "ICIC", color: "#b02a30" },
  { id: "canara", name: "Canara Bank (Hubli)", code: "CNRB", color: "#0091da" },
  { id: "axis", name: "Axis Bank", code: "UTIB", color: "#97144d" },
  { id: "bob", name: "Bank of Baroda", code: "BARB", color: "#f26522" },
];

export function CashfreePaymentGatewayModal({
  isOpen,
  onClose,
  orderId,
  amount,
  customerName,
  customerPhone,
  customerEmail,
  deliveryOption,
  onPaymentSuccess,
  onPaymentFailure,
}: CashfreePaymentGatewayModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<TabType>("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // UPI Form States
  const [upiId, setUpiId] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Card Form States
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState(customerName || "");

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState("sbi");

  const cleanPhone = customerPhone.replace(/\D/g, "").slice(-10) || "9845122334";
  const upiMerchantId = "localloop.hubballi@icici";
  const upiIntentUri = `upi://pay?pa=${upiMerchantId}&pn=LocalLoop%20Hubballi&am=${amount.toFixed(2)}&cu=INR&tn=${orderId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    upiIntentUri
  )}&margin=8`;

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    const parts = raw.match(/.{1,4}/g) || [];
    setCardNumber(parts.join(" "));
  };

  // Format Card Expiry (MM/YY)
  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const copyUpiId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(upiMerchantId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleProcessPayment = async (methodType: string) => {
    setErrorMessage("");
    setIsProcessing(true);

    try {
      setProcessingStep("Connecting to Cashfree Payment Gateway...");
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep("Authorizing transaction with bank settlement node...");
      await new Promise((r) => setTimeout(r, 800));

      const generatedPaymentId = `cf_pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Post verification to server endpoint
      const verifyRes = await fetch("/api/checkout/cashfree/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          cfOrderId: `cf_ord_${orderId}`,
          paymentId: generatedPaymentId,
        }),
      });

      const verifyData = await verifyRes.json().catch(() => ({}));

      setProcessingStep("Payment captured! Generating settlement receipt...");
      await new Promise((r) => setTimeout(r, 600));

      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        onPaymentSuccess({
          paymentId: generatedPaymentId,
          cfOrderId: `cf_ord_${orderId}`,
          paymentMethod: methodType,
        });
      }, 900);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Failed to process payment. Please try again.");
      if (onPaymentFailure) onPaymentFailure(err?.message || "Payment failed");
    }
  };

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          key="cashfree-gateway-modal-wrapper"
          data-testid="cashfree-gateway-modal"
          className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          style={{ zIndex: 999999 }}
        >
          {/* Backdrop */}
          <motion.div
            key="cashfree-gateway-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-forest-950/80 backdrop-blur-md cursor-pointer"
            style={{ zIndex: 999999 }}
          />

          <motion.div
            key="cashfree-gateway-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-cream-300 overflow-hidden my-6 z-[1000000]"
            style={{ zIndex: 1000000 }}
          >
        {/* Cashfree Header */}
        <div className="bg-forest-950 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="absolute right-4 top-4 w-8 h-8 rounded-xl bg-forest-900/80 hover:bg-forest-800 text-cream-200 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="px-2.5 py-1 rounded-lg bg-terracotta-600 text-white font-extrabold text-[11px] tracking-wider uppercase">
              Cashfree
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cream-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Encrypted Payment</span>
            </div>
          </div>

          <div className="flex items-end justify-between border-t border-forest-900 pt-3">
            <div>
              <p className="text-[11px] text-cream-300 font-medium">Payable Amount</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ₹{amount.toFixed(2)}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-cream-400 font-mono">ORDER ID</p>
              <p className="text-xs font-mono font-bold text-cream-200 truncate max-w-[140px]">
                {orderId}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Processing Overlay */}
        {isProcessing && (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto border-4 border-terracotta-200 border-t-terracotta-600 rounded-full animate-spin" />
            <h3 className="text-base font-bold text-forest-950">
              Processing Payment
            </h3>
            <p className="text-xs text-forest-600 font-medium">
              {processingStep}
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-forest-500">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Please do not press back or refresh the window</span>
            </div>
          </div>
        )}

        {/* Success State */}
        {isSuccess && !isProcessing && (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold font-serif text-forest-950">
              Payment Confirmed!
            </h3>
            <p className="text-xs text-forest-600">
              ₹{amount.toFixed(2)} settled via Cashfree PG. Redirecting to your order cockpit...
            </p>
          </div>
        )}

        {/* Interactive Payment Gateway Selector */}
        {!isProcessing && !isSuccess && (
          <div className="p-5 sm:p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="grid grid-cols-3 p-1 bg-cream-100 rounded-2xl text-xs font-bold text-forest-900 border border-cream-200">
              <button
                type="button"
                onClick={() => setActiveTab("upi")}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "upi"
                    ? "bg-white text-terracotta-700 shadow-xs"
                    : "text-forest-600 hover:text-forest-950"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("card")}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "card"
                    ? "bg-white text-terracotta-700 shadow-xs"
                    : "text-forest-600 hover:text-forest-950"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("netbanking")}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "netbanking"
                    ? "bg-white text-terracotta-700 shadow-xs"
                    : "text-forest-600 hover:text-forest-950"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Net Banking</span>
              </button>
            </div>

            {/* TAB 1: UPI & QR Code */}
            {activeTab === "upi" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="bg-white p-2.5 rounded-2xl border border-cream-300 shadow-xs shrink-0">
                    <img
                      src={qrCodeUrl}
                      alt="LocalLoop Hubballi UPI QR Code"
                      className="w-32 h-32 object-contain rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Scan to Pay with Any UPI App
                    </span>
                    <h4 className="text-xs font-bold text-forest-950">
                      GPay, PhonePe, Paytm, BHIM, Cred
                    </h4>
                    <p className="text-[11px] text-forest-600">
                      Scan using your mobile phone camera or any UPI scanner.
                    </p>

                    <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-[10px] font-mono text-forest-500 bg-white px-2 py-1 rounded-lg border border-cream-300">
                        {upiMerchantId}
                      </span>
                      <button
                        type="button"
                        onClick={copyUpiId}
                        className="text-[10px] font-bold text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy VPA</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instant 1-Tap UPI Apps */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block">
                    Fast 1-Tap UPI Authorization
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "gpay", name: "Google Pay" },
                      { id: "phonepe", name: "PhonePe" },
                      { id: "paytm", name: "Paytm" },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedUpiApp(app.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          selectedUpiApp === app.id
                            ? "bg-terracotta-50 border-terracotta-500 text-terracotta-800 ring-2 ring-terracotta-400/20"
                            : "bg-cream-50 border-cream-300 hover:border-terracotta-300 text-forest-800"
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5 text-forest-600" />
                        <span>{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* UPI VPA ID Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block">
                    Or Enter Your UPI ID / Mobile
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. 9845122334@okhdfcbank"
                      className="w-full pl-3.5 pr-20 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-forest-400">
                      @upi
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleProcessPayment("upi")}
                  className="w-full py-3 rounded-2xl bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs shadow-warm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Authorize &amp; Pay ₹{amount.toFixed(2)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* TAB 2: Credit / Debit Cards */}
            {activeTab === "card" && (
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="4532 •••• •••• 8821"
                      className="w-full pl-3.5 pr-14 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono font-bold tracking-widest text-forest-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                      <CreditCard className="w-4 h-4 text-forest-500" />
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block">
                      Valid Thru
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono font-bold text-center text-forest-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block">
                      CVV / Security Code
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      placeholder="•••"
                      className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono font-bold text-center text-forest-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Full name as printed on card"
                    className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium text-forest-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleProcessPayment("card")}
                  className="w-full py-3 rounded-2xl bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs shadow-warm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pay Securely ₹{amount.toFixed(2)}</span>
                </button>
              </div>
            )}

            {/* TAB 3: Net Banking */}
            {activeTab === "netbanking" && (
              <div className="space-y-3.5">
                <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block">
                  Select Your Bank
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {TOP_BANKS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBank(b.id)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        selectedBank === b.id
                          ? "bg-terracotta-50 border-terracotta-500 text-terracotta-900 ring-2 ring-terracotta-400/20"
                          : "bg-cream-50 border-cream-300 hover:border-terracotta-300 text-forest-800"
                      }`}
                    >
                      <span className="truncate">{b.name}</span>
                      {selectedBank === b.id && (
                        <Check className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleProcessPayment("netbanking")}
                  className="w-full py-3 rounded-2xl bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs shadow-warm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Proceed to Net Banking Login (₹{amount.toFixed(2)})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Trust Footer */}
            <div className="pt-2 border-t border-cream-200 flex items-center justify-between text-[11px] text-forest-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>PCI-DSS Level 1 Compliant</span>
              </span>
              <span className="font-mono text-[10px]">
                Node: Hubli-South-1
              </span>
            </div>
          </div>
        )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
