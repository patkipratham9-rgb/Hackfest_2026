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
  Sparkles,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogIn,
  MapPin,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DEMO_OTP } from "@/lib/authSecurity";
import { createRecaptchaVerifier, sendFirebasePhoneOtp } from "@/lib/firebaseClient";
import { PostLoginLocationModal } from "@/components/PostLoginLocationModal";
import { useCart } from "@/context/CartContext";

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    activeAppMode,
    signup,
    sendOtp,
    loginWithPhoneOtp,
    loginWithFirebaseToken,
    loginWithEmailPermission,
    setActiveAppMode,
  } = useAuth();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const { setIsCartOpen } = useCart();

  // Return the shopper to where they started, or redirect merchants directly to /seller
  const finishLoginRedirect = () => {
    if (user?.role === "seller" || activeAppMode === "merchant") {
      router.push("/seller");
      router.refresh();
      return;
    }
    const next =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("next")
        : null;
    router.push("/");
    router.refresh();
    if (next === "checkout") {
      setTimeout(() => setIsCartOpen(true), 300);
    }
  };

  const handleLocationComplete = (loc: string) => {
    setShowLocationModal(false);
    finishLoginRedirect();
  };

  const handleSkipLocation = () => {
    setShowLocationModal(false);
    finishLoginRedirect();
  };

  // Mode: "signup" (Create an account) vs "login" (Already have an account? Log in)
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [method, setMethod] = useState<"phone" | "email">("phone");

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupError, setSignupError] = useState("");

  // Login Phone OTP States
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [dispatchedOtp, setDispatchedOtp] = useState<string>("");
  const [firebaseConfirmation, setFirebaseConfirmation] = useState<any>(null);

  // Login Email Permission & OTP States
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emailPhone, setEmailPhone] = useState("");
  const [orderPermission, setOrderPermission] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailDispatchedOtp, setEmailDispatchedOtp] = useState<string>("");
  const [emailOtpExpiry, setEmailOtpExpiry] = useState(300);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timers
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emailCooldown > 0) {
      timer = setInterval(() => {
        setEmailCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailCooldown]);

  // Active OTP Expiry Countdown Timer
  const [otpExpiry, setOtpExpiry] = useState(300);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpSent && otpExpiry > 0) {
      timer = setInterval(() => {
        setOtpExpiry((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, otpExpiry]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isEmailOtpSent && emailOtpExpiry > 0) {
      timer = setInterval(() => {
        setEmailOtpExpiry((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isEmailOtpSent, emailOtpExpiry]);

  const formattedOtpExpiry = `${Math.floor(otpExpiry / 60)}:${String(
    otpExpiry % 60
  ).padStart(2, "0")}`;

  const formattedEmailOtpExpiry = `${Math.floor(emailOtpExpiry / 60)}:${String(
    emailOtpExpiry % 60
  ).padStart(2, "0")}`;

  // Handle Signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");
    setStatusMessage("");
    setIsLoading(true);

    const res = await signup({
      name: signupName,
      phone: signupPhone,
      email: signupEmail,
      role: "customer",
    });

    setIsLoading(false);
    if (!res.success) {
      setSignupError(res.message);
      return;
    }

    setStatusMessage(res.message);
    setActiveAppMode("shopper");
    setTimeout(() => {
      setShowLocationModal(true);
    }, 400);
  };

  // Handle Send OTP for Login
  const handleSendOtp = async () => {
    setPhoneError("");
    setStatusMessage("");
    setIsLoading(true);

    const res = await sendOtp(phone);

    if (!res.success) {
      setIsLoading(false);
      setPhoneError(res.message);
      return;
    }

    setIsOtpSent(true);
    setCooldown(res.cooldownSeconds);
    setOtpExpiry(300);
    setStatusMessage(res.message);
    setOtp(["", "", "", "", "", ""]);
    setDispatchedOtp(res.testOtp || "123456");

    // Attempt Firebase reCAPTCHA initialization in background if DOM container ready
    try {
      const verifier = await createRecaptchaVerifier("recaptcha-container");
      if (verifier) {
        const fbRes = await sendFirebasePhoneOtp(phone, verifier);
        if (fbRes.success && fbRes.confirmationResult) {
          setFirebaseConfirmation(fbRes.confirmationResult);
        }
      }
    } catch (fbErr) {
      console.warn("Firebase reCAPTCHA background init notice:", fbErr);
    }

    setIsLoading(false);
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

  // Handle Verify OTP for Login
  const handleVerifyOtp = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setOtpError("Please enter the complete 6-digit OTP code");
      return;
    }

    setIsLoading(true);
    setOtpError("");

    // If Firebase confirmation is active, verify via Firebase ID token
    if (firebaseConfirmation) {
      try {
        const fbResult = await firebaseConfirmation.confirm(fullOtp);
        const idToken = await fbResult.user.getIdToken();
        const fbVerifyRes = await loginWithFirebaseToken(idToken, undefined, "customer");
        if (fbVerifyRes.success) {
          setStatusMessage("Firebase Phone Verification Successful! Welcome back.");
          setActiveAppMode("shopper");
          setTimeout(() => {
            setShowLocationModal(true);
          }, 400);
          return;
        }
      } catch (fbErr: any) {
        console.warn("Firebase confirmation notice, falling back to local OTP verify:", fbErr);
      }
    }

    const res = await loginWithPhoneOtp(phone, fullOtp, "customer");
    setIsLoading(false);

    if (!res.success) {
      setOtpError(res.message);
      return;
    }

    setStatusMessage(res.message);
    setActiveAppMode("shopper");
    setTimeout(() => {
      setShowLocationModal(true);
    }, 400);
  };

  const handleFillDemoOtp = () => {
    // Fill active verification code (fallback 123456)
    const code = dispatchedOtp || DEMO_OTP || "123456";
    const chars = code.slice(0, 6).split("");
    setOtp(chars);
    setOtpError("");
    setTimeout(() => {
      otpInputRefs.current[5]?.focus();
    }, 50);
  };

  const handleSendEmailOtp = async () => {
    setEmailError("");
    if (!email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setIsLoading(true);
    const res = await sendOtp(email.trim().toLowerCase());
    setIsLoading(false);
    if (!res.success) {
      setEmailError(res.message);
      return;
    }
    setIsEmailOtpSent(true);
    setEmailCooldown(res.cooldownSeconds || 30);
    setEmailOtpExpiry(300);
    setEmailDispatchedOtp(res.testOtp || "123456");
    setStatusMessage(res.message);
  };

  const handleFillDemoEmailOtp = () => {
    const code = emailDispatchedOtp || DEMO_OTP || "123456";
    const chars = code.slice(0, 6).split("");
    setEmailOtp(chars);
  };

  // Handle Email Login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setIsLoading(true);

    const fullEmailOtp = emailOtp.join("");
    if (isEmailOtpSent && fullEmailOtp.length === 6) {
      try {
        const otpRes = await fetch("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: fullEmailOtp,
            role: "customer",
            method: "email",
            name,
          }),
        });
        const otpData = await otpRes.json();
        if (otpRes.ok && otpData.success && otpData.user) {
          setIsLoading(false);
          setStatusMessage("Email OTP verified successfully!");
          setActiveAppMode("shopper");
          await setAuthenticatedSession(otpData.user);
          setTimeout(() => {
            setShowLocationModal(true);
          }, 400);
          return;
        }
      } catch (err) {
        console.warn("Email OTP verification fallback:", err);
      }
    }

    const res = await loginWithEmailPermission(
      email,
      name,
      emailPhone || "9845122334",
      orderPermission,
      "customer"
    );
    setIsLoading(false);

    if (!res.success) {
      setEmailError(res.message);
      return;
    }

    setStatusMessage(res.message);
    setActiveAppMode("shopper");
    setTimeout(() => {
      setShowLocationModal(true);
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="LocalLoop Logo"
            className="h-24 w-auto object-contain rounded-2xl shadow-xs"
          />
        </div>
        <div className="inline-block px-3 py-1 rounded-full bg-cream-200 text-forest-700 text-[11px] font-bold">
          Shopper Application
        </div>
        <h1 className="font-serif font-extrabold text-2xl text-forest-950">
          Your city’s hyperlocal digital marketplace.
        </h1>
        <p className="text-xs text-forest-600 max-w-sm mx-auto font-medium">
          Connecting authentic corner shops across Hubli-Dharwad with citywide shoppers.
        </p>
      </div>

      {/* Primary Toggle: Create Account vs Already have an account? Log in */}
      <div className="p-1.5 bg-cream-200 rounded-2xl flex border border-cream-300">
        <button
          type="button"
          onClick={() => {
            setAuthMode("signup");
            setStatusMessage("");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === "signup"
              ? "bg-forest-900 text-white shadow-xs"
              : "text-forest-700 hover:text-forest-950"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5 text-terracotta-400" />
          <span>Create Account</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMode("login");
            setStatusMessage("");
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMode === "login"
              ? "bg-terracotta-600 text-white shadow-xs"
              : "text-forest-700 hover:text-forest-950"
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Already Have an Account? Log In</span>
        </button>
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div
          data-testid="auth-status-message"
          className="p-3 rounded-2xl bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* SECTION 1: CREATE ACCOUNT (SIGN UP) */}
      {authMode === "signup" && (
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 shadow-warm space-y-4">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <UserPlus className="w-4 h-4 text-forest-700" />
            <h2 className="font-serif font-bold text-base text-forest-950">
              Create Your Shopper Account
            </h2>
          </div>

          {signupError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{signupError}</span>
            </div>
          )}

          <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                data-testid="signup-name-input"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Anand Kulkarni"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Mobile Number (10 digits) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-600">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  data-testid="signup-phone-input"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98450 12345"
                  className="w-full pl-12 pr-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Email Address <span className="text-forest-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                data-testid="signup-email-input"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="anand@example.com"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div className="p-3 bg-cream-100 border border-cream-300 rounded-xl flex items-center gap-2 text-xs text-forest-700">
              <Sparkles className="w-4 h-4 text-terracotta-500 shrink-0" />
              <span>You can add your delivery address later at checkout.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              data-testid="create-account-button"
              className="w-full py-3 rounded-xl bg-forest-900 hover:bg-forest-950 text-cream-100 font-bold text-xs shadow-warm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-terracotta-400" />
                  <span>Create Shopper Account</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* SECTION 2: ALREADY HAVE AN ACCOUNT? LOG IN */}
      {authMode === "login" && (
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 shadow-warm space-y-4">
          {/* Quick Demo Options for Judge */}
          <div className="p-3 bg-cream-100 rounded-2xl border border-cream-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-forest-800">
              <span className="flex items-center gap-1 text-[11px] text-terracotta-700 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Quick Demo Login (Judge Selection)</span>
              </span>
              <span className="text-[10px] text-forest-500 font-normal">Instant 1-Click</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  const res = await loginOrRegisterUserDbAction({
                    fullName: "Pratham Patki",
                    phone: "7975633023",
                    email: "patkipratham9@gmail.com",
                    addresses: [{ id: "addr_vidyanagar", label: "Home", street: "KLE Tech, Vidyanagar", locality: "Vidyanagar", city: "Hubballi", pincode: "580021", isDefault: true }],
                  });
                  setIsLoading(false);
                  if (res.success && res.user) {
                    await setAuthenticatedSession(res.user);
                    setTimeout(() => setShowLocationModal(true), 300);
                  }
                }}
                className="p-2.5 rounded-xl border border-cream-300 bg-white hover:border-terracotta-400 text-left transition-all cursor-pointer hover:shadow-2xs"
              >
                <p className="font-bold text-xs text-forest-900">Pratham Patki</p>
                <p className="text-[10px] text-forest-500 font-mono">+91 79756 33023</p>
                <p className="text-[10px] text-terracotta-600 font-medium">Vidyanagar • patkipratham9@gmail.com</p>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  const res = await loginOrRegisterUserDbAction({
                    fullName: "Hubballi Test Shopper",
                    phone: "9845122334",
                    email: "test.shopper@localloop.hubballi",
                    addresses: [{ id: "addr_vidyanagar_2", label: "Home", street: "Shirur Park", locality: "Vidyanagar", city: "Hubballi", pincode: "580021", isDefault: true }],
                  });
                  setIsLoading(false);
                  if (res.success && res.user) {
                    await setAuthenticatedSession(res.user);
                    setTimeout(() => setShowLocationModal(true), 300);
                  }
                }}
                className="p-2.5 rounded-xl border border-cream-300 bg-white hover:border-terracotta-400 text-left transition-all cursor-pointer hover:shadow-2xs"
              >
                <p className="font-bold text-xs text-forest-900">Hubballi Shopper</p>
                <p className="text-[10px] text-forest-500 font-mono">+91 98451 22334</p>
                <p className="text-[10px] text-terracotta-600 font-medium">Vidyanagar • test.shopper@localloop.hubballi</p>
              </button>
            </div>
          </div>

          {/* Method Sub-Tabs: Phone OTP vs Email OTP */}
          <div className="grid grid-cols-2 p-1 bg-cream-200 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMethod("phone")}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                method === "phone"
                  ? "bg-white text-forest-950 shadow-xs"
                  : "text-forest-600 hover:text-forest-950"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Phone (OTP)</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("email")}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                method === "email"
                  ? "bg-white text-forest-950 shadow-xs"
                  : "text-forest-600 hover:text-forest-950"
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Email (OTP)</span>
            </button>
          </div>

          {/* Phone (OTP) Login */}
          {method === "phone" && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                  Registered Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-600">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      data-testid="phone-input"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ""));
                        setPhoneError("");
                      }}
                      placeholder="98450 12345"
                      className="w-full pl-12 pr-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>
                  <button
                    type="button"
                    data-testid="send-otp-button"
                    disabled={phone.length < 10 || cooldown > 0 || isLoading}
                    onClick={handleSendOtp}
                    className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-cream-100 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {cooldown > 0 ? `${cooldown}s` : isOtpSent ? "Resend" : "Send OTP"}
                  </button>
                </div>
                {phoneError && (
                  <p data-testid="phone-error" className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{phoneError}</span>
                  </p>
                )}
                {/* Firebase reCAPTCHA Container */}
                <div id="recaptcha-container" className="my-1 empty:hidden"></div>
              </div>

              {/* OTP Input Fields */}
              {isOtpSent && (
                <div className="space-y-3.5 pt-3 border-t border-cream-200">
                  {/* Production Carrier Delivery Card */}
                  <div
                    data-testid="otp-demo-badge"
                    className="p-3.5 rounded-2xl bg-forest-900 text-cream-100 border border-forest-800 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-white tracking-wide">
                          SMS Dispatched
                        </span>
                      </div>
                      <span className="text-[10px] text-terracotta-300 font-semibold font-mono">
                        Expires in {formattedOtpExpiry}
                      </span>
                    </div>

                    <p className="text-[11px] text-cream-200">
                      Verification code:{" "}
                      <span className="font-mono font-bold text-white text-xs bg-forest-800 px-2 py-0.5 rounded-lg tracking-wider">
                        {dispatchedOtp || "123456"}
                      </span>
                    </p>

                    <div className="pt-2 border-t border-forest-800/80 flex items-center justify-between text-[11px] text-cream-300">
                      <span>Dispatched to +91 {phone.slice(0, 5)} {phone.slice(5)}</span>
                      <button
                        type="button"
                        onClick={handleFillDemoOtp}
                        className="px-2.5 py-1 rounded-lg bg-terracotta-600 hover:bg-terracotta-700 text-white text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        Auto-fill OTP
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider">
                      Enter 6-Digit Verification Code
                    </label>
                  </div>

                  <div className="flex justify-between gap-1.5 sm:gap-2">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        data-testid={`otp-input-${idx}`}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-base font-bold bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 text-forest-950 font-mono"
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p data-testid="otp-error" className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{otpError}</span>
                    </p>
                  )}

                  <button
                    type="button"
                    data-testid="verify-otp-button"
                    disabled={isLoading}
                    onClick={handleVerifyOtp}
                    className="w-full py-3 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-cream-50 font-bold text-xs shadow-warm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isLoading ? "Verifying..." : "Verify OTP & Log In"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Email OTP & Permission Login */}
          {method === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    data-testid="email-input"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    placeholder="judge@localloop.in"
                    className="w-full px-3.5 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    disabled={!email.includes("@") || emailCooldown > 0 || isLoading}
                    className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-cream-100 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {emailCooldown > 0 ? `${emailCooldown}s` : isEmailOtpSent ? "Resend" : "Send OTP"}
                  </button>
                </div>
              </div>

              {/* Email OTP Card with Verification Code */}
              {isEmailOtpSent && (
                <div
                  data-testid="email-otp-demo-badge"
                  className="p-3.5 rounded-2xl bg-forest-900 text-cream-100 border border-forest-800 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white tracking-wide">
                        Email OTP Dispatched
                      </span>
                    </div>
                    <span className="text-[10px] text-terracotta-300 font-semibold font-mono">
                      Expires in {formattedEmailOtpExpiry}
                    </span>
                  </div>

                  <p className="text-[11px] text-cream-200">
                    Verification code:{" "}
                    <span className="font-mono font-bold text-white text-xs bg-forest-800 px-2 py-0.5 rounded-lg tracking-wider">
                      {emailDispatchedOtp || "123456"}
                    </span>
                  </p>

                  <div className="pt-2 border-t border-forest-800/80 flex items-center justify-between text-[11px] text-cream-300">
                    <span>Dispatched to {email}</span>
                    <button
                      type="button"
                      onClick={handleFillDemoEmailOtp}
                      className="px-2.5 py-1 rounded-lg bg-terracotta-600 hover:bg-terracotta-700 text-white text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      Auto-fill OTP
                    </button>
                  </div>
                </div>
              )}

              {isEmailOtpSent && (
                <div>
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                    Enter 6-Digit Email OTP
                  </label>
                  <div className="flex justify-between gap-2 max-w-xs mx-auto">
                    {emailOtp.map((digit, idx) => (
                      <input
                        key={`email-otp-box-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const nextOtp = [...emailOtp];
                          nextOtp[idx] = val;
                          setEmailOtp(nextOtp);
                        }}
                        className="w-10 h-10 text-center font-mono font-bold text-base rounded-xl border border-cream-300 bg-cream-100 text-forest-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:bg-white transition-all shadow-xs"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  data-testid="email-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Kulkarni"
                  className="w-full px-3.5 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  data-testid="email-phone-input"
                  value={emailPhone}
                  onChange={(e) => setEmailPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98450 12345"
                  className="w-full px-3.5 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 text-[11px] text-forest-700 cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="email-order-permission-checkbox"
                  checked={orderPermission}
                  onChange={(e) => setOrderPermission(e.target.checked)}
                  className="mt-0.5 rounded text-terracotta-600 focus:ring-terracotta-400"
                />
                <span>Allow LocalLoop to store email for order receipts and notifications</span>
              </label>

              {emailError && (
                <p data-testid="email-error" className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{emailError}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                data-testid="email-submit-btn"
                className="w-full py-3 rounded-xl bg-forest-900 hover:bg-forest-950 text-cream-100 font-bold text-xs shadow-warm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isLoading ? "Signing In..." : isEmailOtpSent ? "Verify Email OTP & Sign In" : "Sign In with Email"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Merchant Partner switch button to /merchant/login removed per strict app separation */}

      {/* Post-Login Location Permission Step */}
      <PostLoginLocationModal
        key="unified-login-post-location-modal"
        isOpen={showLocationModal}
        onLocationSet={handleLocationComplete}
        onSkip={handleSkipLocation}
      />
    </div>
  );
}
