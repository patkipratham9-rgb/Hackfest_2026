"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  User,
  MapPin,
  ShieldCheck,
  Smartphone,
  Mail,
  Code2,
  Sparkles,
  ChevronRight,
  Store,
  ShoppingBag,
  LogOut,
  LogIn,
  Home,
  Briefcase,
  Building,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AddressType } from "@/types";

export function ProfilePanel() {
  const router = useRouter();
  const { isProfileOpen, setIsProfileOpen, activeArea, orders } = useCart();
  const { user, isAuthenticated, logout, activeAppMode, switchRole, setActiveAppMode } = useAuth();

  const primaryAddress = user?.addresses.find((a) => a.isDefault) || user?.addresses[0];

  const getLabelIcon = (label: AddressType) => {
    switch (label) {
      case "Home":
        return <Home className="w-3 h-3 text-blue-600" />;
      case "Office":
        return <Briefcase className="w-3 h-3 text-purple-600" />;
      case "Primary":
        return <Tag className="w-3 h-3 text-amber-600" />;
      default:
        return <Building className="w-3 h-3 text-forest-600" />;
    }
  };

  return (
    <AnimatePresence>
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsProfileOpen(false)}
            className="absolute inset-0 bg-forest-950/50 backdrop-blur-xs"
          />

          {/* Slide-over Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 27, stiffness: 290 }}
              className="w-screen max-w-md bg-cream-50 border-l border-cream-300 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              {/* Header */}
              <div className="p-5 border-b border-cream-300 flex items-center justify-between bg-cream-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-forest-800 text-cream-100 flex items-center justify-center font-serif font-bold text-base shadow-xs">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "LL"}
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-lg text-forest-950">
                      User Profile &amp; Apps
                    </h2>
                    <p className="text-xs text-forest-600">LocalLoop Hubballi</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsProfileOpen(false)}
                  className="p-2 rounded-full hover:bg-cream-200 text-forest-700"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-5 flex-1">
                {/* App Switcher Banner */}
                <div className="p-3.5 rounded-2xl bg-cream-200/80 border border-cream-300 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-forest-950">
                    {activeAppMode === "merchant" ? (
                      <Store className="w-4 h-4 text-terracotta-600" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 text-forest-700" />
                    )}
                    <span>
                      {activeAppMode === "merchant"
                        ? "Merchant Partner Mode"
                        : "Shopper Consumer Mode"}
                    </span>
                  </div>

                  {activeAppMode === "shopper" ? (
                    <button
                      type="button"
                      onClick={() => {
                        switchRole("seller");
                        setIsProfileOpen(false);
                        router.push("/seller");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-terracotta-600 hover:bg-terracotta-700 text-cream-50 text-[11px] font-bold"
                    >
                      Go to Merchant App
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        switchRole("customer");
                        setIsProfileOpen(false);
                        router.push("/");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-forest-800 hover:bg-forest-900 text-cream-50 text-[11px] font-bold"
                    >
                      Go to Shopper App
                    </button>
                  )}
                </div>

                {/* User Information Card */}
                {user ? (
                  <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-forest-500 uppercase tracking-wider">
                        {user.role === "seller" ? "Merchant Profile" : "Shopper Profile"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-forest-800 text-cream-100 text-[10px] font-bold">
                        Verified
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2.5 text-forest-900 font-bold text-sm">
                        <User className="w-4 h-4 text-terracotta-500" />
                        <span>{user.name}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-forest-700">
                        <Smartphone className="w-4 h-4 text-forest-500" />
                        <a
                          href={`tel:+91${user.number}`}
                          className="hover:text-terracotta-600 hover:underline font-semibold"
                          title="Call user number"
                        >
                          +91 {user.number}
                        </a>
                      </div>
                      {user.email ? (
                        <div className="flex items-center gap-2.5 text-forest-700">
                          <Mail className="w-4 h-4 text-forest-500" />
                          <a
                            href={`mailto:${user.email}`}
                            className="hover:text-terracotta-600 hover:underline font-semibold"
                            title="Send email"
                          >
                            {user.email}
                          </a>
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-700 italic pl-6">
                          Email: None added (Optional)
                        </div>
                      )}
                      {primaryAddress && (
                        <div className="flex items-center gap-2.5 text-forest-700">
                          <MapPin className="w-4 h-4 text-terracotta-500" />
                          <span className="truncate">
                            {primaryAddress.label}: {primaryAddress.street}, {primaryAddress.locality}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-cream-200 flex justify-end">
                      <Link
                        href="/account"
                        onClick={() => setIsProfileOpen(false)}
                        className="text-xs font-bold text-terracotta-700 hover:text-terracotta-800 flex items-center gap-1"
                      >
                        <span>Manage Addresses &amp; Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-cream-100 border border-cream-300 text-center space-y-3">
                    <p className="text-xs text-forest-700 font-medium">
                      You are browsing as a guest. Sign in to save addresses and track orders.
                    </p>
                    <Link
                      href="/login"
                      onClick={() => setIsProfileOpen(false)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-cream-50 font-bold text-xs shadow-xs"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In with Phone (OTP)</span>
                    </Link>
                  </div>
                )}

                {/* Addresses Preview (Primary, Home, Office, Others) */}
                {user && user.addresses.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-forest-900">
                        Saved Locations ({user.addresses.length})
                      </span>
                      <Link
                        href="/account"
                        onClick={() => setIsProfileOpen(false)}
                        className="text-[11px] font-bold text-terracotta-700 hover:underline"
                      >
                        + Add New
                      </Link>
                    </div>
                    <div className="space-y-1.5">
                      {user.addresses.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className="p-2.5 rounded-xl bg-white border border-cream-300 text-xs flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {getLabelIcon(a.label)}
                            <span className="font-bold text-forest-900">{a.label}</span>
                            <span className="text-forest-600 text-[11px] truncate">
                              • {a.locality}
                            </span>
                          </div>
                          {a.isDefault && (
                            <span className="text-[10px] font-bold text-terracotta-700 bg-terracotta-50 px-1.5 py-0.5 rounded-sm">
                              Default
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-cream-100 border border-cream-300 text-center">
                    <span className="text-[10px] font-semibold text-forest-500 uppercase tracking-wider block">
                      Past Pickups
                    </span>
                    <span className="font-serif font-extrabold text-2xl text-forest-950 block mt-0.5">
                      {orders.length}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-cream-100 border border-cream-300 text-center">
                    <span className="text-[10px] font-semibold text-forest-500 uppercase tracking-wider block">
                      Active Area
                    </span>
                    <span className="font-serif font-bold text-sm text-terracotta-600 block mt-1.5 truncate">
                      {activeArea === "All" ? "All Hubballi" : activeArea}
                    </span>
                  </div>
                </div>

                {/* Team Info Card */}
                <div className="p-4 rounded-2xl bg-forest-900 text-cream-100 space-y-3 shadow-warm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-terracotta-400" />
                    <h3 className="font-serif font-bold text-sm text-cream-50">
                      LocalLoop • Team Digital Titans
                    </h3>
                  </div>
                  <p className="text-xs text-cream-200/90 leading-relaxed">
                    Built for Hubballi-Dharwad. Separate consumer &amp; merchant application modes, verified phone OTP, and address book.
                  </p>
                  <div className="pt-2 border-t border-forest-800 flex justify-between text-[11px] text-cream-200">
                    <span>Pratham, Srushti, Aditya</span>
                    <span>Hackfest 2026</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-cream-300 bg-cream-100 flex items-center justify-between">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                      router.push("/login");
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsProfileOpen(false)}
                    className="text-xs font-bold text-forest-800 hover:text-terracotta-600 flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                )}

                <div className="flex items-center gap-1 text-[11px] text-forest-500 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
                  <span>Secure &amp; Safe</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
