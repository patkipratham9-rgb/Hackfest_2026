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

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    signup,
    sendOtp,
    loginWithPhoneOtp,
    loginWithFirebaseToken,
    loginWithEmailPermission,
    setActiveAppMode,
  } = useAuth();

  // Mode: "signup" (Create an account) vs "login" (Already have an account? Log in)
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [method, setMethod] = useState<"phone" | "email">("phone");

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupStreet, setSignupStreet] = useState("");
  const [signupLocality, setSignupLocality] = useState("Vidyanagar");
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

  // Login Email Permission States
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emailPhone, setEmailPhone] = useState("");
  const [orderPermission, setOrderPermission] = useState(true);
  const [emailError, setEmailError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

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
      initialAddress: signupStreet
        ? {
            label: "Home",
            street: signupStreet,
            landmark: `Near ${signupLocality}`,
            locality: signupLocality,
            city: "Hubballi-Dharwad",
            pincode: "580021",
            isDefault: true,
          }
        : undefined,
    });

    setIsLoading(false);
    if (!res.success) {
      setSignupError(res.message);
      return;
    }

    setStatusMessage(res.message);
    setActiveAppMode("shopper");
    setTimeout(() => {
      router.push("/");
    }, 700);
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
    setStatusMessage(res.message);
    setOtp(["", "", "", "", "", ""]);
    if (res.testOtp) {
      setDispatchedOtp(res.testOtp);
    }

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
            router.push("/");
          }, 600);
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
      router.push("/");
    }, 600);
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

  // Handle Email Login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setIsLoading(true);

    const res = await loginWithEmailPermission(
      email,
      name,
      emailPhone,
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
      router.push("/");
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-6">
      <title>Shopper Account & Login • LocalLoop Hubballi</title>
      <meta
        name="description"
        content="Create a user account or sign in to explore neighborhood stores, save pinpoint delivery addresses, and place orders."
      />

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                  Primary Delivery Street
                </label>
                <input
                  type="text"
                  value={signupStreet}
                  onChange={(e) => setSignupStreet(e.target.value)}
                  placeholder="e.g. Plot 14, 2nd Cross"
                  className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                  Locality
                </label>
                <select
                  value={signupLocality}
                  onChange={(e) => setSignupLocality(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400 cursor-pointer"
                >
                  <option value="Vidyanagar">Vidyanagar (580021)</option>
                  <option value="Gokul Road">Gokul Road (580030)</option>
                  <option value="CBT">CBT / Market (580020)</option>
                  <option value="Station Road">Station Road (580023)</option>
                  <option value="Unkal Lake">Unkal Lake (580031)</option>
                </select>
              </div>
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
          {/* Method Sub-Tabs: Phone OTP vs Email Permission */}
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
              <span>Email (Permission)</span>
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
                  <div className="p-3.5 rounded-2xl bg-forest-900 text-cream-100 border border-forest-800 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-white tracking-wide">
                          SMS Dispatched
                        </span>
                      </div>
                      <span className="text-[10px] text-terracotta-300 font-semibold">
                        Expires in 5m
                      </span>
                    </div>

                    <p className="text-[11px] text-cream-200">
                      A 6-digit verification code has been dispatched to{" "}
                      <span className="font-mono font-bold text-white">
                        +91 {phone.slice(0, 5)} {phone.slice(5)}
                      </span>
                    </p>

                    <div className="pt-2 border-t border-forest-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-cream-300">
                        Code:{" "}
                        <strong className="font-mono text-emerald-400 tracking-wider">
                          {dispatchedOtp || "123456"}
                        </strong>
                      </span>
                      <button
                        type="button"
                        data-testid="fast-fill-otp-btn"
                        onClick={handleFillDemoOtp}
                        className="text-[11px] bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-all"
                      >
                        1-Tap Paste
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

          {/* Email Permission Login */}
          {method === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-3 text-xs">
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
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  data-testid="email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anand@example.com"
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
                {isLoading ? "Signing In..." : "Sign In with Email"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Merchant Redirection Card */}
      <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-terracotta-600 text-cream-50 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xs text-forest-950 block">Are you a Merchant Partner?</span>
            <span className="text-[11px] text-forest-600 block">Register store, upload products, and manage sales</span>
          </div>
        </div>
        <Link
          href="/merchant/login"
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-forest-50 border border-cream-300 text-terracotta-700 hover:text-terracotta-800 text-xs font-bold shrink-0 transition-colors shadow-2xs"
        >
          Merchant Login &rarr;
        </Link>
      </div>
    </div>
  );
}
