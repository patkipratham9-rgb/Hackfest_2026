"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Smartphone,
  Mail,
  ShieldCheck,
  ArrowRight,
  Store,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DEMO_OTP } from "@/lib/authSecurity";

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    sendOtp,
    loginWithPhoneOtp,
    loginWithEmailPermission,
    activeAppMode,
    setActiveAppMode,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone");
  const [selectedRole, setSelectedRole] = useState<"customer" | "seller">("customer");

  // Phone OTP States
  const [phone, setPhone] = useState(user?.number || "9845122334");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Email Permission States
  const [email, setEmail] = useState(user?.email || "pratham.patki@kletech.ac.in");
  const [name, setName] = useState(user?.name || "Pratham Patki");
  const [emailPhone, setEmailPhone] = useState(user?.number || "9845122334");
  const [orderPermission, setOrderPermission] = useState(true);
  const [marketingPermission, setMarketingPermission] = useState(true);
  const [emailError, setEmailError] = useState("");

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer cooldown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendOtp = () => {
    setPhoneError("");
    setStatusMessage("");
    setIsLoading(true);

    const res = sendOtp(phone);
    setIsLoading(false);

    if (!res.success) {
      setPhoneError(res.message);
      return;
    }

    setIsOtpSent(true);
    setCooldown(res.cooldownSeconds);
    setStatusMessage(res.message);
    setOtp(["", "", "", "", "", ""]);
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 150);
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    const updated = [...otp];
    updated[index] = clean.slice(-1);
    setOtp(updated);
    setOtpError("");

    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setOtpError("Please enter the complete 6-digit OTP code");
      return;
    }

    setIsLoading(true);
    setOtpError("");

    const res = await loginWithPhoneOtp(phone, fullOtp, selectedRole);
    setIsLoading(false);

    if (!res.success) {
      setOtpError(res.message);
      return;
    }

    setStatusMessage(res.message);
    if (selectedRole === "seller") {
      setActiveAppMode("merchant");
      router.push("/seller");
    } else {
      setActiveAppMode("shopper");
      router.push("/");
    }
  };

  const handleFillDemoOtp = () => {
    const chars = DEMO_OTP.split("");
    setOtp(chars);
    setOtpError("");
    setTimeout(() => {
      otpInputRefs.current[5]?.focus();
    }, 50);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setIsLoading(true);

    const res = await loginWithEmailPermission(
      email,
      name,
      emailPhone,
      orderPermission,
      selectedRole
    );
    setIsLoading(false);

    if (!res.success) {
      setEmailError(res.message);
      return;
    }

    setStatusMessage(res.message);
    if (selectedRole === "seller") {
      setActiveAppMode("merchant");
      router.push("/seller");
    } else {
      setActiveAppMode("shopper");
      router.push("/");
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-terracotta-600 text-cream-50 shadow-md">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="font-serif font-extrabold text-2xl text-forest-950">
          Welcome to LocalLoop
        </h1>
        <p className="text-xs text-forest-600 max-w-xs mx-auto">
          Hubballi-Dharwad’s trusted neighborhood marketplace. Secure sign-in for shoppers and merchants.
        </p>
      </div>

      {/* Role Selection Tabs (Separating User from Merchant) */}
      <div className="bg-cream-200/70 p-1.5 rounded-2xl flex border border-cream-300">
        <button
          type="button"
          onClick={() => setSelectedRole("customer")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedRole === "customer"
              ? "bg-forest-900 text-cream-50 shadow-sm"
              : "text-forest-700 hover:text-forest-950"
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-terracotta-400" />
          <span>Shopper Application</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedRole("seller")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            selectedRole === "seller"
              ? "bg-terracotta-600 text-cream-50 shadow-sm"
              : "text-forest-700 hover:text-forest-950"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Merchant Partner</span>
        </button>
      </div>

      {/* Method Tabs: Phone (OTP) vs Email (Permission) */}
      <div className="border-b border-cream-300 flex">
        <button
          type="button"
          onClick={() => {
            setActiveTab("phone");
            setStatusMessage("");
          }}
          className={`flex-1 pb-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === "phone"
              ? "border-terracotta-600 text-terracotta-700 font-extrabold"
              : "border-transparent text-forest-600 hover:text-forest-900"
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Phone (OTP)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("email");
            setStatusMessage("");
          }}
          className={`flex-1 pb-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
            activeTab === "email"
              ? "border-terracotta-600 text-terracotta-700 font-extrabold"
              : "border-transparent text-forest-600 hover:text-forest-900"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Email &amp; Permissions</span>
        </button>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className="p-3 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Tab 1: Phone (OTP) Sign In */}
      {activeTab === "phone" && (
        <div className="p-6 rounded-3xl bg-cream-50 border border-cream-300 shadow-warm space-y-5">
          {!isOtpSent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center rounded-xl bg-white border border-cream-300 px-3 py-2.5 focus-within:ring-2 focus-within:ring-terracotta-500">
                  <span className="text-xs font-bold text-forest-500 mr-2 border-r border-cream-200 pr-2">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="98451 22334"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      setPhoneError("");
                    }}
                    className="w-full text-sm font-semibold text-forest-950 focus:outline-hidden"
                  />
                </div>
                {phoneError && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              <div className="text-[11px] text-forest-500 leading-relaxed">
                We’ll send a 6-digit One Time Password (OTP) to verify your account securely.
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-cream-50 font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <span>{isLoading ? "Sending OTP..." : "Send Verification OTP"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-forest-500 block">Code sent to:</span>
                  <span className="font-bold text-sm text-forest-950 font-mono">
                    +91 {phone}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="text-xs font-semibold text-terracotta-700 hover:underline"
                >
                  Change
                </button>
              </div>

              {/* 6-box OTP entry */}
              <div>
                <label className="block text-xs font-bold text-forest-900 mb-2">
                  Enter 6-Digit OTP Code
                </label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpInputRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-12 h-13 text-center text-lg font-bold font-mono rounded-xl border border-cream-300 bg-white focus:border-terracotta-600 focus:ring-2 focus:ring-terracotta-500 focus:outline-hidden"
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{otpError}</span>
                  </p>
                )}
              </div>

              {/* Helper Demo OTP autofill chip */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 text-xs font-medium">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Demo test OTP: <strong>123456</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoOtp}
                  className="px-2.5 py-1 rounded-lg bg-amber-200/70 hover:bg-amber-300 text-amber-950 text-[11px] font-bold"
                >
                  Auto-fill
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-forest-600">
                  {cooldown > 0 ? (
                    `Resend code in ${cooldown}s`
                  ) : (
                    "Didn't receive code?"
                  )}
                </span>
                <button
                  type="button"
                  disabled={cooldown > 0}
                  onClick={handleSendOtp}
                  className="font-bold text-terracotta-700 hover:text-terracotta-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Resend OTP</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-cream-50 font-bold text-sm shadow-sm transition-all disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify & Sign In"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Email (Permission) Sign In */}
      {activeTab === "email" && (
        <form
          onSubmit={handleEmailSubmit}
          className="p-6 rounded-3xl bg-cream-50 border border-cream-300 shadow-warm space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-forest-900 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pratham Patki"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-semibold rounded-xl border border-cream-300 bg-white focus:ring-2 focus:ring-terracotta-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-900 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. pratham@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              className="w-full px-3 py-2.5 text-sm font-semibold rounded-xl border border-cream-300 bg-white focus:ring-2 focus:ring-terracotta-500 focus:outline-hidden"
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{emailError}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-900 mb-1">
              Contact Phone (Required for Pickup verification)
            </label>
            <div className="flex items-center rounded-xl bg-white border border-cream-300 px-3 py-2 focus-within:ring-2 focus-within:ring-terracotta-500">
              <span className="text-xs font-bold text-forest-500 mr-2 border-r border-cream-200 pr-2">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                required
                placeholder="98451 22334"
                value={emailPhone}
                onChange={(e) => setEmailPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full text-sm font-semibold text-forest-950 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Explicit Permissions Consent as specified by user */}
          <div className="p-3.5 rounded-2xl bg-cream-100 border border-cream-200 space-y-2.5">
            <span className="text-xs font-bold text-forest-900 uppercase tracking-wider block">
              Required Permissions &amp; Consent
            </span>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={orderPermission}
                onChange={(e) => setOrderPermission(e.target.checked)}
                className="mt-0.5 rounded-sm text-terracotta-600 focus:ring-terracotta-500"
              />
              <span className="text-xs text-forest-800 leading-snug">
                Grant permission to receive digital pickup receipts, counter PINs, and order status tracking via Email/SMS.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingPermission}
                onChange={(e) => setMarketingPermission(e.target.checked)}
                className="mt-0.5 rounded-sm text-terracotta-600 focus:ring-terracotta-500"
              />
              <span className="text-xs text-forest-700 leading-snug">
                (Optional) Receive neighborhood store discount alerts and fresh harvest updates in Hubballi.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !orderPermission}
            className="w-full py-3 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-cream-50 font-bold text-sm shadow-sm transition-all disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Consent & Sign In"}
          </button>
        </form>
      )}

      {/* Safety & Security Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-forest-900 text-cream-100 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-terracotta-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>LocalLoop Security &amp; Privacy Guarantee</span>
        </div>
        <p className="text-cream-200/80 text-[11px] leading-relaxed">
          Your phone number and delivery addresses are encrypted and never sold to third parties. Merchant actions are guarded with strict role-based access control.
        </p>
      </div>

      <div className="text-center">
        <Link
          href="/"
          className="text-xs font-bold text-forest-700 hover:text-terracotta-600"
        >
          ← Continue browsing as Guest Shopper
        </Link>
      </div>
    </div>
  );
}
