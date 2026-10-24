"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Smartphone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Store,
  Database,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { loginOrRegisterUserDbAction } from "@/actions/authActions";

export default function UserLoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, setActiveAppMode } = useAuth();

  // Mode: "login" (Sign In) vs "signup" (Create User Account)
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");

  // Sign In Form States
  const [loginPhone, setLoginPhone] = useState("+91 98451 22334");
  const [loginOtp, setLoginOtp] = useState("123456");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up Form States
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [dbVerified, setDbVerified] = useState(false);

  // Quick One-Tap Test User Logins
  const handleQuickLogin = async (name: string, phone: string, locality: string) => {
    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage(`Signing in as ${name}...`);

    try {
      const res = await loginOrRegisterUserDbAction({
        fullName: name,
        phone,
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@localloop.hubballi`,
        addresses: [
          {
            id: `addr_${Date.now()}`,
            label: "Home",
            locality,
            street: `${locality} Main Cross`,
            city: "Hubballi",
            pincode: "580021",
            isDefault: true,
          },
        ],
      });

      if (res.success) {
        setDbVerified(true);
        setStatusMessage(res.message);
        localStorage.setItem(
          "localloop_auth_session_v1",
          JSON.stringify({
            isAuthenticated: true,
            user: res.user,
            token: `token_${Date.now()}`,
          })
        );
        setActiveAppMode("shopper");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 800);
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to log in.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Handler for Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("Signing in...");

    try {
      const cleanPhone = loginPhone.replace(/\D/g, "").slice(-10);
      if (authMethod === "phone" && cleanPhone.length < 10) {
        setErrorMessage("Please enter a valid 10-digit mobile number.");
        setIsLoading(false);
        return;
      }

      const res = await loginOrRegisterUserDbAction({
        fullName: loginEmail ? loginEmail.split("@")[0] : "Hubballi Shopper",
        phone: cleanPhone || "9845122334",
        email: loginEmail || undefined,
      });

      if (res.success) {
        setDbVerified(true);
        setStatusMessage(res.message);
        localStorage.setItem(
          "localloop_auth_session_v1",
          JSON.stringify({
            isAuthenticated: true,
            user: res.user,
            token: `token_${Date.now()}`,
          })
        );
        setActiveAppMode("shopper");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 900);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Login failed. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Handler for Sign Up
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    const cleanPhone = signupPhone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("Saving your profile...");

    try {
      const res = await loginOrRegisterUserDbAction({
        fullName: signupName.trim(),
        phone: cleanPhone,
        email: signupEmail.trim() || undefined,
        addresses: [],
      });

      if (res.success) {
        setDbVerified(true);
        setStatusMessage("Account successfully registered!");
        localStorage.setItem(
          "localloop_auth_session_v1",
          JSON.stringify({
            isAuthenticated: true,
            user: res.user,
            token: `token_${Date.now()}`,
          })
        );
        setActiveAppMode("shopper");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 900);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 flex-1 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-100 text-terracotta-800 text-xs font-bold border border-terracotta-300 shadow-2xs">
            <User className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Shopper Login</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-forest-950">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-xs text-forest-600 max-w-sm mx-auto">
            {mode === "login"
              ? "Sign in to track orders and shop from local stores."
              : "Sign up to start shopping."}
          </p>
        </div>

        {/* Main Card */}
        <div className="p-6 rounded-3xl bg-white border border-cream-300 shadow-warm space-y-5">
          {/* Mode Switcher: Sign In vs Sign Up */}
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
                  ? "bg-white text-forest-950 shadow-xs"
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
                  ? "bg-white text-forest-950 shadow-xs"
                  : "text-forest-600 hover:text-forest-900"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Quick 1-Tap Demo Shoppers */}
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
                  onClick={() => handleQuickLogin("Pratham Patki", "+91 98451 22334", "Vidyanagar")}
                  className="p-2.5 rounded-xl border border-cream-300 bg-white hover:border-terracotta-400 text-left transition-all cursor-pointer hover:shadow-2xs"
                >
                  <p className="font-bold text-xs text-forest-900">Pratham Patki</p>
                  <p className="text-[10px] text-forest-500 font-mono">+91 98451 22334</p>
                  <p className="text-[10px] text-terracotta-600 font-medium">Vidyanagar</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("Anita Kulkarni", "+91 98450 11223", "Keshwapur")}
                  className="p-2.5 rounded-xl border border-cream-300 bg-white hover:border-terracotta-400 text-left transition-all cursor-pointer hover:shadow-2xs"
                >
                  <p className="font-bold text-xs text-forest-900">Anita Kulkarni</p>
                  <p className="text-[10px] text-forest-500 font-mono">+91 98450 11223</p>
                  <p className="text-[10px] text-terracotta-600 font-medium">Keshwapur</p>
                </button>
              </div>
            </div>
          )}

          {/* Status & Error Messages */}
          <AnimatePresence>
            {statusMessage && (
              <motion.div
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

          {/* Form: Sign In Mode */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Method Switch: Mobile OTP vs Email */}
              <div className="flex items-center gap-2 border-b border-cream-200 pb-2">
                <button
                  type="button"
                  onClick={() => setAuthMethod("phone")}
                  className={`text-xs font-bold pb-1 flex items-center gap-1 border-b-2 transition-all ${
                    authMethod === "phone"
                      ? "border-terracotta-600 text-terracotta-700"
                      : "border-transparent text-forest-600 hover:text-forest-900"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Phone &amp; OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod("email")}
                  className={`text-xs font-bold pb-1 flex items-center gap-1 border-b-2 transition-all ${
                    authMethod === "email"
                      ? "border-terracotta-600 text-terracotta-700"
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
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-forest-500">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="98451 22334"
                        className="w-full text-xs font-medium py-2.5 pl-16 pr-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-terracotta-400 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-forest-900">
                        Enter OTP
                      </label>
                      <span className="text-[10px] text-terracotta-600 font-mono font-semibold">
                        Test OTP: 123456
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full text-xs font-mono font-bold tracking-widest py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-terracotta-400 focus:bg-white text-center"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-forest-900 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="customer@localloop.hubballi"
                      className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-terracotta-400 focus:bg-white"
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
                      className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-terracotta-400 focus:bg-white"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-50 text-white text-xs font-bold shadow-warm flex items-center justify-center gap-2 transition-all cursor-pointer"
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
            /* Form: Sign Up Mode */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-forest-900 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Pratham Patki"
                  className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-terracotta-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-forest-900 block">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="98451 22334"
                  className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-terracotta-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-forest-900 block">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="pratham@example.com"
                  className="w-full text-xs font-medium py-2.5 px-3 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-terracotta-400"
                />
              </div>

              <p className="text-[11px] text-forest-600 bg-cream-100 p-2.5 rounded-xl border border-cream-200">
                💡 You can add your delivery address later at checkout.
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white text-xs font-bold shadow-warm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Creating account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Switch to Merchant Callout */}
          <div className="pt-3 border-t border-cream-200 text-center">
            <p className="text-xs text-forest-600">
              Are you a store owner?{" "}
              <Link
                href="/login/merchant"
                className="font-bold text-terracotta-700 hover:text-terracotta-800 underline inline-flex items-center gap-1"
              >
                <Store className="w-3 h-3" />
                <span>Merchant Login &rarr;</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
