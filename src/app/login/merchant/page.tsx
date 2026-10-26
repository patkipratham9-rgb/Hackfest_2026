"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  Smartphone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Building2,
  User,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useSeller } from "@/context/SellerContext";
import { loginOrRegisterMerchantDbAction } from "@/actions/authActions";
import { ProductCategory, NeighborhoodArea } from "@/types";

const CATEGORIES: ProductCategory[] = [
  "Grocery",
  "Bakery",
  "Produce",
  "Household",
  "Sweets & Snacks",
  "Handloom & Crafts",
  "Filter Coffee & Tea",
  "Fresh Produce",
  "Spices & Pantry",
];

const AREAS: NeighborhoodArea[] = [
  "Vidyanagar",
  "Gokul Road",
  "CBT",
  "Station Road",
  "Unkal Lake",
];

export default function MerchantLoginPage() {
  const router = useRouter();
  const { setActiveAppMode, setAuthenticatedSession } = useAuth();
  const { setUserRole, updateStoreProfile } = useSeller();

  // Mode: "login" (Merchant Sign In) vs "signup" (Register New Store)
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");

  // Sign In Form States
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up Form States
  const [ownerName, setOwnerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [storeEmail, setStoreEmail] = useState("");

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [dbVerified, setDbVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(300);

  // Active Cooldown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Active OTP Expiry Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && otpExpiry > 0) {
      timer = setInterval(() => {
        setOtpExpiry((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, otpExpiry]);

  const formattedOtpExpiry = `${Math.floor(otpExpiry / 60)}:${String(
    otpExpiry % 60
  ).padStart(2, "0")}`;

  const handleSendOtp = async () => {
    setErrorMessage("");
    setStatusMessage("");
    const clean = loginPhone.replace(/\D/g, "").slice(-10);
    if (clean.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: clean }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSent(true);
        setStatusMessage(data.message || `OTP sent to +91 ${clean}`);
        setCooldown(data.cooldownSeconds || 30);
        setOtpExpiry(300);
      } else {
        setErrorMessage(data.message || "Failed to send OTP.");
      }
    } catch {
      setErrorMessage("Network error while requesting OTP.");
    }
  };

  // Quick One-Tap Test Merchant Logins
  const handleQuickLogin = async (
    owner: string,
    store: string,
    cat: ProductCategory,
    phone: string,
    area: NeighborhoodArea
  ) => {
    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage(`Verifying merchant & store with Supabase database...`);

    try {
      const res = await loginOrRegisterMerchantDbAction({
        ownerName: owner,
        shopName: store,
        category: cat,
        phone,
        area,
        pickupAddress: `${area} Main Market Lane`,
        email: `${store.toLowerCase().replace(/[^a-z0-9]/g, "")}@localloop.hubballi`,
      });

      if (res.success) {
        setDbVerified(true);
        setStatusMessage(res.message);

        await setAuthenticatedSession(res.user);
        setUserRole("seller");
        updateStoreProfile({
          id: res.storeId,
          name: res.storeName,
          category: cat,
          area,
          phone,
          lane: `${area} Main Market Lane`,
        });

        setTimeout(() => {
          router.push("/seller");
          router.refresh();
        }, 800);
      } else {
        setErrorMessage("Merchant verification failed. Please check credentials.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to log in as merchant.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Handler for Merchant Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("Authenticating store profile in Supabase Database...");

    try {
      const cleanPhone = loginPhone.replace(/\D/g, "").slice(-10);
      if (authMethod === "phone" && cleanPhone.length < 10) {
        setErrorMessage("Please enter a valid 10-digit mobile number.");
        setIsLoading(false);
        return;
      }

      if (authMethod === "phone") {
        const otpRes = await fetch("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: cleanPhone,
            otp: loginPin,
            role: "seller",
          }),
        });
        const otpData = await otpRes.json();
        if (!otpRes.ok || !otpData.success) {
          setErrorMessage(otpData.message || "Invalid OTP code. Please check and try again.");
          setIsLoading(false);
          return;
        }
      }

      const res = await loginOrRegisterMerchantDbAction({
        ownerName: loginEmail ? loginEmail.split("@")[0] : "Hubballi Merchant",
        shopName: "Neighborhood Artisan Shop",
        category: "Household",
        phone: cleanPhone || "9876543210",
        area: "Vidyanagar",
        pickupAddress: "Vidyanagar Market Cross",
        email: loginEmail || undefined,
      });

      if (res.success) {
        setDbVerified(true);
        setStatusMessage(res.message);
        await setAuthenticatedSession(res.user);
        setUserRole("seller");

        setTimeout(() => {
          router.push("/seller");
          router.refresh();
        }, 900);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Merchant authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Handler for Store Registration
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim()) {
      setErrorMessage("Please enter the shop owner's full name.");
      return;
    }
    if (!shopName.trim()) {
      setErrorMessage("Please enter your store's commercial name.");
      return;
    }
    const cleanPhone = storePhone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit store contact phone.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("Registering store profile in Supabase Database (stores & profiles tables)...");

    try {
      const res = await loginOrRegisterMerchantDbAction({
        ownerName: ownerName.trim(),
        shopName: shopName.trim(),
        phone: cleanPhone,
        pickupAddress: pickupAddress.trim() || undefined,
        email: storeEmail.trim() || undefined,
      });

      if (res.success) {
        setDbVerified(true);
        setStatusMessage("Store & Merchant account registered in Supabase database!");
        await setAuthenticatedSession(res.user);
        setUserRole("seller");
        updateStoreProfile({
          id: res.storeId,
          name: shopName.trim(),
          phone: cleanPhone,
          lane: pickupAddress.trim() || "Hubballi",
        });

        setTimeout(() => {
          router.push("/seller");
          router.refresh();
        }, 900);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to register store.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 flex-1 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <img
              src="/logo.png"
              alt="LocalLoop Logo"
              className="h-20 w-auto object-contain rounded-2xl shadow-xs"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900 text-cream-100 text-xs font-bold border border-forest-800 shadow-2xs">
            <Store className="w-3.5 h-3.5 text-terracotta-400" />
            <span>Store Owner Login</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
            {mode === "login" ? "Welcome Back" : "Register Your Store"}
          </h1>
          <p className="text-xs text-forest-600 max-w-sm mx-auto">
            {mode === "login"
              ? "Sign in to manage your store and orders."
              : "Create an account to sell local goods in Hubballi."}
          </p>
        </div>

        {/* Main Card */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-warm space-y-5">
          {/* Mode Switcher: Merchant Sign In vs Register Store */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-cream-100 border border-cream-300 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
                setStatusMessage("");
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-forest-900 text-cream-50 shadow-xs"
                  : "text-forest-600 hover:text-forest-900"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage("");
                setStatusMessage("");
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-forest-900 text-cream-50 shadow-xs"
                  : "text-forest-600 hover:text-forest-900"
              }`}
            >
              Register Store
            </button>
          </div>

          {/* Quick 1-Tap Demo Merchant Accounts */}
          {mode === "login" && (
            <div className="space-y-2 p-3 rounded-2xl bg-cream-50 border border-cream-200">
              <div className="flex items-center justify-between text-xs font-bold text-forest-800">
                <span className="flex items-center gap-1 text-[11px] text-terracotta-700 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Quick Demo Login</span>
                </span>
                <span className="text-[10px] text-forest-500 font-normal">Click to test</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin(
                      "Meena Deshpande",
                      "Meena's Diyas & Filter Coffee",
                      "Filter Coffee & Tea",
                      "+91 98765 43210",
                      "Vidyanagar"
                    )
                  }
                  className="p-2.5 rounded-xl border border-cream-300 bg-white hover:border-forest-700 text-left transition-all cursor-pointer hover:shadow-2xs"
                >
                  <p className="font-bold text-xs text-forest-900 truncate">Meena&apos;s Diyas &amp; Coffee</p>
                  <p className="text-[10px] text-forest-500 font-mono">+91 98765 43210</p>
                  <p className="text-[10px] text-forest-700 font-medium">Vidyanagar • Filter Coffee</p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin(
                      "Kavita Patil",
                      "Threads & Tales",
                      "Handloom & Crafts",
                      "+91 98451 99887",
                      "CBT"
                    )
                  }
                  className="p-2.5 rounded-xl border border-cream-300 bg-white hover:border-forest-700 text-left transition-all cursor-pointer hover:shadow-2xs"
                >
                  <p className="font-bold text-xs text-forest-900 truncate">Threads &amp; Tales</p>
                  <p className="text-[10px] text-forest-500 font-mono">+91 98451 99887</p>
                  <p className="text-[10px] text-forest-700 font-medium">CBT • Handloom &amp; Crafts</p>
                </button>
              </div>
            </div>
          )}

          {/* Status & Error Messages */}
          <AnimatePresence mode="wait">
            {statusMessage && (
              <motion.div
                key="merchant-status-msg"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{statusMessage}</span>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                key="merchant-error-msg"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form: Merchant Sign In */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-cream-200 pb-2">
                <button
                  type="button"
                  onClick={() => setAuthMethod("phone")}
                  className={`text-xs font-bold pb-1 flex items-center gap-1 border-b-2 transition-all ${
                    authMethod === "phone"
                      ? "border-forest-900 text-forest-900"
                      : "border-transparent text-forest-600 hover:text-forest-900"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Phone &amp; PIN</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod("email")}
                  className={`text-xs font-bold pb-1 flex items-center gap-1 border-b-2 transition-all ${
                    authMethod === "email"
                      ? "border-forest-900 text-forest-900"
                      : "border-transparent text-forest-600 hover:text-forest-900"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
              </div>

              {authMethod === "phone" ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-forest-900 block">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-500">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          placeholder="98765 43210"
                          className="w-full text-xs font-medium py-2.5 pl-16 pr-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-forest-600 focus:bg-white"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loginPhone.replace(/\D/g, "").length < 10 || cooldown > 0}
                        className="px-3.5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {cooldown > 0 ? `${cooldown}s` : otpSent ? "Resend" : "Send OTP"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-forest-900">
                        Store PIN / OTP
                      </label>
                      <span className="text-[10px] text-forest-600 font-mono font-semibold">
                        Expires in {formattedOtpExpiry}
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value)}
                      placeholder="Enter 6-digit PIN"
                      className="w-full text-xs font-mono font-bold tracking-widest py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-forest-600 focus:bg-white text-center"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-forest-900 block">
                      Merchant Email
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="merchant@localloop.hubballi"
                      className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-forest-600 focus:bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-forest-900 block">
                      Password
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-forest-600 focus:bg-white"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-forest-900 hover:bg-forest-950 disabled:opacity-50 text-cream-50 text-xs font-bold shadow-warm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Form: Register New Store */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-forest-900 block">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-forest-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-forest-900 block">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Patil Organics"
                    className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-forest-600"
                    required
                  />
                </div>
              </div>


              <div className="space-y-1">
                <label className="text-xs font-bold text-forest-900 block">
                  Store Phone
                </label>
                <input
                  type="tel"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-forest-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-forest-900 block">
                  Store Address
                </label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. Shop #12, Market Road, Near CBT Bus Stand"
                  className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-forest-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-forest-900 block">
                  Merchant Email (Optional)
                </label>
                <input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  placeholder="ramesh@patilorganics.com"
                  className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-forest-900 hover:bg-forest-950 disabled:opacity-50 text-cream-50 text-xs font-bold shadow-warm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Registering store...</span>
                ) : (
                  <>
                    <span>Register Store</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
