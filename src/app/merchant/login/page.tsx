"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSeller } from "@/context/SellerContext";
import {
  Store,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MerchantLoginPage() {
  const router = useRouter();
  const { sendOtp, loginWithPhoneOtp, loginWithEmailPermission } = useAuth();
  const { setUserRole } = useSeller();

  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  const [phoneNumber, setPhoneNumber] = useState("9845012345");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [email, setEmail] = useState("partner@localloop.in");
  const [merchantName, setMerchantName] = useState("Merchant Partner");
  const [emailPhone, setEmailPhone] = useState("9845012345");
  const [emailPermissions, setEmailPermissions] = useState(true);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Send OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const res = sendOtp(phoneNumber);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setOtpSent(true);
    setSuccessMsg(res.message);
    if (res.testOtp) {
      setOtpCode(res.testOtp);
    }

    setCooldown(res.cooldownSeconds);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle Verify OTP & Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const result = await loginWithPhoneOtp(phoneNumber, otpCode, "seller");
      if (!result.success) {
        setErrorMsg(result.message);
        setIsSubmitting(false);
        return;
      }

      setUserRole("seller");
      setSuccessMsg("Merchant signed in successfully! Redirecting to Merchant Cockpit...");
      setTimeout(() => {
        router.push("/seller");
      }, 700);
    } catch {
      setErrorMsg("An unexpected error occurred during login");
      setIsSubmitting(false);
    }
  };

  // Handle Email Permission Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const result = await loginWithEmailPermission(
        email,
        merchantName,
        emailPhone,
        emailPermissions,
        "seller"
      );
      if (!result.success) {
        setErrorMsg(result.message);
        setIsSubmitting(false);
        return;
      }

      setUserRole("seller");
      setSuccessMsg("Merchant authorized successfully! Redirecting...");
      setTimeout(() => {
        router.push("/seller");
      }, 700);
    } catch {
      setErrorMsg("Failed to sign in with email");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      <title>Merchant Partner Login • LocalLoop Hubballi</title>
      <meta
        name="description"
        content="Merchant partner login for local business owners in Hubballi to manage store catalog, operating hours, and live pickup orders."
      />

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center mx-auto shadow-warm">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-950">
          Merchant Partner Portal
        </h1>
        <p className="text-xs text-forest-600 max-w-sm mx-auto">
          Sign in to manage your Hubballi storefront, update stock, configure store timing, and verify customer orders.
        </p>
      </div>

      {/* Login Card */}
      <div className="p-6 bg-cream-50 rounded-3xl border border-cream-300 shadow-warm space-y-5">
        {/* Method Toggle */}
        <div className="grid grid-cols-2 p-1 bg-cream-200/80 rounded-2xl text-xs font-bold text-forest-900">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("phone");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMethod === "phone"
                ? "bg-white text-terracotta-700 shadow-xs"
                : "text-forest-600 hover:text-forest-950"
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone (OTP)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod("email");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMethod === "email"
                ? "bg-white text-terracotta-700 shadow-xs"
                : "text-forest-600 hover:text-forest-950"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Access</span>
          </button>
        </div>

        {/* Demo Fast Fill Chip */}
        <div className="p-2.5 bg-forest-50 border border-forest-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-forest-800">
            <Sparkles className="w-4 h-4 text-forest-600 flex-shrink-0" />
            <span className="font-semibold">Demo Partner: +91 98450 12345</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setPhoneNumber("9845012345");
              setOtpCode("123456");
              setEmail("partner@localloop.in");
              setMerchantName("Meena Kulkarni");
              setEmailPhone("9845012345");
              setOtpSent(true);
            }}
            className="text-[11px] font-bold text-terracotta-700 hover:text-terracotta-900 bg-white border border-terracotta-300 px-2.5 py-1 rounded-lg"
          >
            Autofill
          </button>
        </div>

        {/* Error / Success Alerts */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-forest-50 border border-forest-200 rounded-xl text-xs text-forest-800 font-semibold flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-forest-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form: Phone OTP */}
        {authMethod === "phone" ? (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleRequestOtp} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-forest-800">
                    Merchant Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98450 12345"
                      className="w-full pl-12 pr-4 py-2.5 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-terracotta-500 bg-white text-forest-950 font-medium"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-forest-500">
                    Enter the 10-digit phone linked to your store.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={cooldown > 0}
                  className="w-full py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 disabled:opacity-60 text-white font-bold text-xs shadow-warm flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Request Merchant OTP</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-forest-800">
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] font-semibold text-terracotta-600 hover:underline"
                    >
                      Change Phone
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-2.5 text-center tracking-widest text-base font-bold rounded-xl border border-cream-300 focus:outline-none focus:border-terracotta-500 bg-white text-forest-950"
                    required
                  />
                  <div className="flex items-center justify-between text-[11px] text-forest-500 pt-0.5">
                    <span>Test OTP: 123456</span>
                    {cooldown > 0 ? (
                      <span className="flex items-center gap-1 text-terracotta-600">
                        <Clock className="w-3 h-3" />
                        Resend in {cooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        className="text-terracotta-600 font-bold hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 disabled:opacity-60 text-white font-bold text-xs shadow-warm flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmitting ? "Verifying..." : "Sign In to Merchant Cockpit"}</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Form: Email Permissions */
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-forest-800">Merchant Name</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="Business Owner Name"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-terracotta-500 bg-white text-forest-950"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-forest-800">Business Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="store@hubballi.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-terracotta-500 bg-white text-forest-950"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-forest-800">Contact Phone</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-500">
                  +91
                </span>
                <input
                  type="tel"
                  value={emailPhone}
                  onChange={(e) => setEmailPhone(e.target.value)}
                  placeholder="98450 12345"
                  className="w-full pl-12 pr-4 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-terracotta-500 bg-white text-forest-950"
                  required
                />
              </div>
            </div>

            <div className="pt-1 flex items-start gap-2">
              <input
                type="checkbox"
                id="merchantEmailPerm"
                checked={emailPermissions}
                onChange={(e) => setEmailPermissions(e.target.checked)}
                className="mt-1 rounded border-cream-300 text-terracotta-600 focus:ring-terracotta-500"
              />
              <label htmlFor="merchantEmailPerm" className="text-[11px] text-forest-600 leading-tight">
                Authorize LocalLoop to send settlement reports and order alerts to this email.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 disabled:opacity-60 text-cream-100 font-bold text-xs shadow-warm flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>{isSubmitting ? "Authorizing..." : "Sign In with Email"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Switch to Shopper Login */}
        <div className="pt-3 border-t border-cream-200 text-center text-xs">
          <span className="text-forest-600">Are you a customer? </span>
          <Link
            href="/login"
            className="font-bold text-terracotta-700 hover:underline inline-flex items-center gap-1"
          >
            <span>Shopper Login</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
