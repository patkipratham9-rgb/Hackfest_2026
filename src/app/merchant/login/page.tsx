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
  UserPlus,
  LogIn,
  Building2,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCategory } from "@/types";
import { notifyNewStore } from "@/lib/notificationSystem";

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

export default function MerchantLoginPage() {
  const router = useRouter();
  const { signup, sendOtp, loginWithPhoneOtp, loginWithEmailPermission } = useAuth();
  const { setUserRole, updateStoreProfile } = useSeller();

  // Mode: "signup" (Create Merchant Account) vs "login" (Already registered? Log in)
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");

  // Merchant Signup States
  const [ownerName, setOwnerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("Household");
  const [storePhone, setStorePhone] = useState("");
  const [storeArea, setStoreArea] = useState<any>("Vidyanagar");
  const [pickupAddress, setPickupAddress] = useState("");
  const [businessType, setBusinessType] = useState("Sole Proprietorship");
  const [signupError, setSignupError] = useState("");

  // Login Phone OTP States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Login Email States
  const [email, setEmail] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [emailPhone, setEmailPhone] = useState("");
  const [emailPermissions, setEmailPermissions] = useState(true);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Register Store (Create Account)
  const handleRegisterStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setErrorMsg("");
    setSuccessMsg("");

    if (!shopName.trim()) {
      setSignupError("Please provide your shop or storefront name.");
      return;
    }

    if (!storePhone || storePhone.length < 10) {
      setSignupError("Please provide a valid 10-digit counter phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signup({
        name: ownerName || shopName,
        phone: storePhone,
        role: "seller",
        storeName: shopName,
      });

      if (!res.success) {
        setSignupError(res.message);
        setIsSubmitting(false);
        return;
      }

      setUserRole("seller");

      // Initialize store profile
      updateStoreProfile({
        name: shopName.trim(),
        category,
        area: storeArea,
        location: storeArea,
        pickupAddress: pickupAddress.trim() || `Shop #1, Market Road, ${storeArea}`,
        lane: pickupAddress.trim() || `Shop #1, Market Road, ${storeArea}`,
        businessType,
        contactPhone: storePhone,
        isOpen: true,
      });

      notifyNewStore(shopName.trim(), storeArea);

      setSuccessMsg("Merchant Store registered successfully! Redirecting to Merchant Cockpit...");
      setTimeout(() => {
        router.push("/seller");
      }, 700);
    } catch (err: any) {
      setSignupError(err.message || "Failed to register merchant store.");
      setIsSubmitting(false);
    }
  };

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
      <title>Merchant Partner Portal • LocalLoop Hubballi</title>
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
          Your city’s hyperlocal digital marketplace.
        </h1>
        <p className="text-xs text-forest-600 max-w-sm mx-auto font-medium">
          Connecting authentic corner shops across Hubli-Dharwad with citywide shoppers. Merchant Partner Portal.
        </p>
      </div>

      {/* Primary Toggle: Register Store (Create Account) vs Log In */}
      <div className="p-1.5 bg-cream-200 rounded-2xl flex border border-cream-300">
        <button
          type="button"
          onClick={() => {
            setAuthMode("signup");
            setErrorMsg("");
            setSuccessMsg("");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === "signup"
              ? "bg-terracotta-600 text-white shadow-xs"
              : "text-forest-700 hover:text-forest-950"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Register Store</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMode("login");
            setErrorMsg("");
            setSuccessMsg("");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === "login"
              ? "bg-forest-900 text-white shadow-xs"
              : "text-forest-700 hover:text-forest-950"
          }`}
        >
          <LogIn className="w-3.5 h-3.5 text-terracotta-400" />
          <span>Already Registered? Log In</span>
        </button>
      </div>

      {/* Error / Success Alerts */}
      <AnimatePresence>
        {(errorMsg || signupError) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg || signupError}</span>
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

      {/* SECTION 1: REGISTER MERCHANT STORE (CREATE ACCOUNT) */}
      {authMode === "signup" && (
        <div className="p-6 bg-cream-50 rounded-3xl border border-cream-300 shadow-warm space-y-4">
          <div className="border-b border-cream-200 pb-2">
            <h2 className="font-serif font-bold text-base text-forest-950">
              Create Merchant Store Account
            </h2>
            <p className="text-[11px] text-forest-600">
              Onboard your business to start listing items and receiving customer orders.
            </p>
          </div>

          <form onSubmit={handleRegisterStore} className="space-y-3.5 text-xs">
            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Shop / Storefront Name *
              </label>
              <input
                type="text"
                required
                data-testid="merchant-store-name-input"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Ramesh Sweets & Bakery"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Store Owner Full Name *
              </label>
              <input
                type="text"
                required
                data-testid="merchant-owner-name-input"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Ramesh Deshpande"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                  Primary Store Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                  Business Entity Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400 cursor-pointer"
                >
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Private Limited">Private Limited</option>
                  <option value="Individual Artisan">Individual Artisan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Store Counter Phone *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-600">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  data-testid="merchant-store-phone-input"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98450 12345"
                  className="w-full pl-12 pr-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                  Hubballi Area
                </label>
                <select
                  value={storeArea}
                  onChange={(e) => setStoreArea(e.target.value)}
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400 cursor-pointer"
                >
                  <option value="Vidyanagar">Vidyanagar</option>
                  <option value="Gokul Road">Gokul Road</option>
                  <option value="CBT">CBT</option>
                  <option value="Station Road">Station Road</option>
                  <option value="Unkal Lake">Unkal Lake</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                  Pickup Lane / Address
                </label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. Near KIMS Circle"
                  className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="register-merchant-button"
              className="w-full py-3 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs shadow-warm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering Store...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Merchant Store & Account</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* SECTION 2: ALREADY REGISTERED? LOG IN */}
      {authMode === "login" && (
        <div className="p-6 bg-cream-50 rounded-3xl border border-cream-300 shadow-warm space-y-5">
          {/* Method Toggle: Phone (OTP) vs Email (Permission) */}
          <div className="grid grid-cols-2 p-1 bg-cream-200/80 rounded-2xl text-xs font-bold text-forest-900">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("phone");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === "email"
                  ? "bg-white text-terracotta-700 shadow-xs"
                  : "text-forest-600 hover:text-forest-950"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email (Permission)</span>
            </button>
          </div>

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
                        maxLength={10}
                        required
                        data-testid="merchant-phone-input"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="9845012345"
                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-cream-300 rounded-xl text-xs font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-terracotta-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={phoneNumber.length < 10 || cooldown > 0}
                    className="w-full py-2.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Send Merchant OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-forest-800">
                        Enter Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpCode("123456")}
                        className="text-[11px] text-terracotta-600 font-bold hover:underline"
                      >
                        Demo OTP: 123456
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full px-4 py-2.5 bg-white border border-cream-300 rounded-xl text-xs font-mono font-bold tracking-widest text-center focus:outline-hidden focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length < 6}
                    className="w-full py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs shadow-warm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Verifying..." : "Verify OTP & Enter Cockpit"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Form: Email */
            <form onSubmit={handleEmailLogin} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-forest-800 block mb-1">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  required
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="e.g. Meena Kulkarni"
                  className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-terracotta-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-forest-800 block mb-1">
                  Partner Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@localloop.in"
                  className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-terracotta-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-forest-800 block mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={emailPhone}
                  onChange={(e) => setEmailPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="9845012345"
                  className="w-full px-3 py-2 bg-white border border-cream-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-terracotta-400 focus:outline-hidden"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 text-[11px] text-forest-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailPermissions}
                  onChange={(e) => setEmailPermissions(e.target.checked)}
                  className="mt-0.5 rounded text-terracotta-600 focus:ring-terracotta-400"
                />
                <span>Authorize LocalLoop Partner notices and transaction updates</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-forest-900 hover:bg-forest-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Signing In..." : "Sign In to Merchant Cockpit"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Shopper Redirection Card */}
      <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-forest-900 text-cream-50 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 text-terracotta-400" />
          </div>
          <div>
            <span className="font-bold text-xs text-forest-950 block">Looking to shop goods?</span>
            <span className="text-[11px] text-forest-600 block">Browse corner stores & pickup fresh goods</span>
          </div>
        </div>
        <Link
          href="/login"
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-cream-50 border border-cream-300 text-forest-900 text-xs font-bold shrink-0 transition-colors shadow-2xs"
        >
          Shopper Login &rarr;
        </Link>
      </div>
    </div>
  );
}
