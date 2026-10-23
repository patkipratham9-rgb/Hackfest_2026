"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  ShoppingBag,
  ChevronDown,
  Sparkles,
  User,
  Search,
  Store,
  Menu,
  X,
  Phone,
  Mail,
  Compass,
  LayoutGrid,
  RotateCcw,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { LocationModal } from "@/components/LocationModal";
import { NotificationCenter } from "@/components/NotificationCenter";

export function Navbar() {
  const {
    totalItems,
    setIsCartOpen,
    userLocation,
    setIsLocationModalOpen,
    setIsProfileOpen,
    isLoaded,
  } = useCart();
  const { user, isAuthenticated, activeAppMode, switchRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream-100/95 backdrop-blur-md border-b border-cream-300 transition-all w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo (Clickable to Home) */}
        <Link
          href="/"
          data-testid="brand-header-mark"
          aria-label="LocalLoop Home"
          className="flex items-center gap-2 group flex-shrink-0 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-forest-800 flex items-center justify-center text-cream-100 font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
            <span className="font-serif">L</span>
            <span className="w-2 h-2 rounded-full bg-terracotta-500 -ml-0.5 mt-1.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-forest-950 leading-none">
              LocalLoop<span className="text-terracotta-500">.</span>
            </span>
            <span className="text-[10px] font-semibold text-forest-600 tracking-wider uppercase mt-0.5">
              Hubballi City
            </span>
          </div>
        </Link>

        {/* Location Selector Pill (Desktop & Tablet) */}
        <div className="relative hidden xs:block">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            data-testid="nav-location-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-200 border border-cream-300 hover:border-terracotta-400 text-xs font-semibold text-forest-800 transition-colors shadow-xs"
            aria-label="Set Delivery Location"
          >
            <MapPin className="w-3.5 h-3.5 text-terracotta-500 flex-shrink-0" />
            <span className="truncate max-w-[130px] sm:max-w-[190px]">
              {userLocation || "Add / Share Location"}
            </span>
          </button>
        </div>

        {/* Right Actions: AI Badge, App Switcher, Profile, Cart, Mobile Menu */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-100 text-forest-700 text-[11px] font-semibold border border-forest-200">
            <Sparkles className="w-3 h-3 text-terracotta-500 animate-pulse" />
            <span>Hyperlocal AI Routing</span>
          </div>

          {/* App Mode Switcher Pill */}
          <Link
            href={activeAppMode === "shopper" ? "/seller" : "/"}
            onClick={() => {
              if (activeAppMode === "shopper") {
                switchRole("seller");
              } else {
                switchRole("customer");
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-200 hover:bg-cream-300 text-forest-800 border border-cream-300 text-xs font-bold transition-all shadow-xs"
            title={activeAppMode === "shopper" ? "Open Merchant Application" : "Open Shopper Application"}
          >
            {activeAppMode === "shopper" ? (
              <>
                <Store className="w-3.5 h-3.5 text-terracotta-600" />
                <span className="text-[11px]">Merchant App</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-forest-700" />
                <span className="text-[11px]">Shopper App</span>
              </>
            )}
          </Link>

          {/* Search Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            data-testid="header-search-button"
            aria-label="Search the market"
            onClick={() => {
              const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-cream-200 hover:bg-cream-300 text-forest-800 transition-colors border border-cream-300 shadow-xs"
          >
            <Search className="w-4 h-4 text-forest-700" />
          </motion.button>

          {/* User Profile Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            data-testid="header-user-details-button"
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-cream-200 hover:bg-cream-300 text-forest-800 transition-colors border border-cream-300 shadow-xs"
            aria-label="Open user and application details"
            title="Profile & Application Details"
          >
            <User className="w-4 h-4 text-forest-700" />
          </motion.button>

          {/* Notifications Center */}
          <NotificationCenter />

          {/* Cart Button */}
          <motion.button
            data-testid="header-cart-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-forest-800 hover:bg-forest-900 text-cream-100 transition-all shadow-sm"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 text-cream-100" />
            {isLoaded && totalItems > 0 && (
              <motion.span
                suppressHydrationWarning
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                data-testid="navbar-cart-badge"
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-terracotta-600 text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-cream-100 shadow-xs"
              >
                {totalItems}
              </motion.span>
            )}
          </motion.button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            data-testid="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex sm:hidden items-center justify-center w-10 h-10 rounded-full bg-cream-200 hover:bg-cream-300 text-forest-800 border border-cream-300 shadow-xs"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden bg-cream-50 border-b border-cream-300 px-4 py-4 space-y-4 shadow-floating overflow-hidden"
          >
            {/* Quick App Mode Switcher Banner */}
            <div className="p-3 rounded-2xl bg-cream-200/80 border border-cream-300 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-950">
                {activeAppMode === "merchant" ? (
                  <Store className="w-4 h-4 text-terracotta-600" />
                ) : (
                  <ShoppingBag className="w-4 h-4 text-forest-700" />
                )}
                <span>
                  {activeAppMode === "merchant"
                    ? "Merchant Mode Active"
                    : "Shopper Mode Active"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activeAppMode === "shopper") {
                    switchRole("seller");
                  } else {
                    switchRole("customer");
                  }
                  setIsMobileMenuOpen(false);
                }}
                className="px-3 py-1 rounded-xl bg-forest-900 text-cream-50 text-[11px] font-bold"
              >
                Switch
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="grid grid-cols-2 gap-2 text-xs font-bold text-forest-900">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLocationModalOpen(true);
                }}
                className="col-span-2 p-3 rounded-xl bg-cream-100 hover:bg-cream-200 flex items-center justify-between border border-cream-200 text-left"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-terracotta-600" />
                  <span className="truncate max-w-[200px]">{userLocation || "Add / Share Location"}</span>
                </div>
                <span className="text-[10px] bg-terracotta-100 text-terracotta-800 px-2 py-0.5 rounded-full font-bold">
                  {userLocation ? "Change" : "Set"}
                </span>
              </button>
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-cream-100 hover:bg-cream-200 flex items-center gap-2 border border-cream-200"
              >
                <Compass className="w-4 h-4 text-terracotta-600" />
                <span>Storefront</span>
              </Link>
              <Link
                href="/categories"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-cream-100 hover:bg-cream-200 flex items-center gap-2 border border-cream-200"
              >
                <LayoutGrid className="w-4 h-4 text-forest-700" />
                <span>Categories</span>
              </Link>
              <Link
                href="/orders-again"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-cream-100 hover:bg-cream-200 flex items-center gap-2 border border-cream-200"
              >
                <RotateCcw className="w-4 h-4 text-forest-700" />
                <span>Past Orders</span>
              </Link>
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-cream-100 hover:bg-cream-200 flex items-center gap-2 border border-cream-200"
              >
                <User className="w-4 h-4 text-terracotta-600" />
                <span>Address Book</span>
              </Link>
              <Link
                href="/seller"
                onClick={() => {
                  switchRole("seller");
                  setIsMobileMenuOpen(false);
                }}
                className="col-span-2 p-3 rounded-xl bg-terracotta-50 hover:bg-terracotta-100 border border-terracotta-200 text-terracotta-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-terracotta-600" />
                  <span>Merchant Partner Portal (/seller)</span>
                </div>
                <span className="text-[10px] bg-terracotta-600 text-white px-2 py-0.5 rounded-full">
                  Partner
                </span>
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="col-span-2 p-3 rounded-xl bg-forest-900 text-cream-50 flex items-center justify-center gap-2 text-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Phone OTP</span>
                </Link>
              )}
            </nav>

            {/* Clickable Mobile Contacts */}
            <div className="pt-2 border-t border-cream-200 flex flex-col gap-1.5 text-xs text-forest-700">
              <a
                href="tel:+919845122334"
                className="flex items-center gap-2 font-bold text-forest-900 hover:text-terracotta-600"
              >
                <Phone className="w-3.5 h-3.5 text-terracotta-600" />
                <span>+91 98451 22334</span>
              </a>
              <a
                href="mailto:pratham.patki@kletech.ac.in"
                className="flex items-center gap-2 font-bold text-forest-900 hover:text-terracotta-600 truncate"
              >
                <Mail className="w-3.5 h-3.5 text-terracotta-600" />
                <span>pratham.patki@kletech.ac.in</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <LocationModal />
    </header>
  );
}
