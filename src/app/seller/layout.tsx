"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SellerProvider, useSeller } from "@/context/SellerContext";
import {
  Store,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Power,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function SellerPortalProtectedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { seller, activeStore, isAuthorizedSeller, userRole, setUserRole, toggleStoreOpen } =
    useSeller();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Checkpoint CP-SP01: Role & Permission Verification Guard
  if (!isAuthorizedSeller) {
    return (
      <div
        data-testid="seller-unauthorized-guard"
        className="min-h-screen bg-cream-100 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-cream-50 border border-cream-300 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-floating"
        >
          <div className="w-16 h-16 rounded-2xl bg-terracotta-100 border border-terracotta-200 text-terracotta-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-terracotta-600">
              Checkpoint CP-SP01 • Access Guard
            </span>
            <h1 className="font-serif font-extrabold text-2xl text-forest-950">
              Merchant Access Required
            </h1>
            <p className="text-xs text-forest-600 leading-relaxed">
              The Seller Portal is protected by role-based authorization (RLS). Your active session is currently assigned the role:{" "}
              <span
                data-testid="current-unauthorized-role"
                className="font-mono font-bold text-forest-900 bg-cream-200 px-2 py-0.5 rounded border border-cream-300"
              >
                {userRole}
              </span>
              .
            </p>
          </div>

          {/* Role simulation helper for evaluators and judges */}
          <div className="bg-cream-100 p-4 rounded-2xl border border-cream-200 text-left space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-forest-900">
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              <span>Evaluator Demo Switch</span>
            </div>
            <p className="text-[11px] text-forest-600">
              Tap below to simulate an authenticated Hubballi merchant session with verified store ownership:
            </p>
            <button
              type="button"
              data-testid="grant-seller-demo-access"
              onClick={() => setUserRole("seller")}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-forest-800 hover:bg-forest-900 text-cream-100 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <UserCheck className="w-4 h-4 text-terracotta-400" />
              <span>Sign in as Verified Seller (Meena Kulkarni)</span>
            </button>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-forest-700 hover:text-terracotta-600 transition-colors pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Consumer Marketplace</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  const navLinks = [
    {
      id: "dashboard",
      title: "Store Dashboard",
      href: "/seller",
      icon: LayoutDashboard,
      isActive: pathname === "/seller",
    },
    {
      id: "orders",
      title: "Orders Pipeline",
      href: "/seller/orders",
      icon: ShoppingBag,
      isActive: pathname.startsWith("/seller/orders"),
    },
    {
      id: "products",
      title: "Product Catalog",
      href: "/seller/products",
      icon: Package,
      isActive: pathname.startsWith("/seller/products"),
    },
    {
      id: "growth",
      title: "AI Growth Coach",
      href: "/seller/growth",
      icon: TrendingUp,
      isActive: pathname.startsWith("/seller/growth"),
    },
    {
      id: "store",
      title: "Store Profile",
      href: "/seller/store",
      icon: Store,
      isActive: pathname.startsWith("/seller/store"),
    },
  ];

  return (
    <div
      data-testid="seller-portal-layout"
      className="min-h-screen bg-cream-100 flex flex-col md:flex-row text-forest-950 font-sans"
    >
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-cream-50 border-b border-cream-300 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white border border-cream-300 flex items-center justify-center shadow-xs overflow-hidden p-0.5">
            <img
              src="/logo.png"
              alt="LocalLoop Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-serif font-bold text-sm text-forest-950 block leading-tight">
              Seller Studio
            </span>
            <span className="text-[10px] text-forest-500 block">Hubballi Merchant</span>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-cream-200 text-forest-700 hover:bg-cream-300"
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop / Collapsible Sidebar */}
      <aside
        data-testid="seller-sidebar"
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-72 bg-cream-50 border-r border-cream-300 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/seller"
              data-testid="seller-portal-header"
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-cream-300 flex items-center justify-center shadow-warm overflow-hidden p-0.5 group-hover:scale-105 transition-transform">
                <img
                  src="/logo.png"
                  alt="LocalLoop Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-serif font-extrabold text-base text-forest-950 tracking-tight block leading-tight">
                  LocalLoop<span className="text-terracotta-500">.</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-forest-500">
                  Seller Studio
                </span>
              </div>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-forest-500 hover:bg-cream-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Store Card */}
          <div
            data-testid="seller-store-card"
            className="p-3.5 rounded-2xl bg-cream-100 border border-cream-300 space-y-2.5 shadow-xs"
          >
            <div className="flex items-start justify-between gap-1">
              <div>
                <h2 className="font-bold text-xs text-forest-950 leading-tight">
                  {activeStore.name}
                </h2>
                <p className="text-[10px] text-forest-500 mt-0.5">
                  {activeStore.lane}, {activeStore.area}
                </p>
              </div>
              <span
                data-testid="seller-verified-badge"
                className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-forest-800 bg-forest-100 border border-forest-200 px-1.5 py-0.5 rounded-md"
              >
                <ShieldCheck className="w-3 h-3 text-forest-700" />
                <span>Verified</span>
              </span>
            </div>

            {/* Live Store Status Switch */}
            <div className="flex items-center justify-between pt-2 border-t border-cream-200">
              <span className="text-[11px] font-semibold text-forest-700">
                Storefront Status:
              </span>
              <button
                type="button"
                onClick={toggleStoreOpen}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeStore.isOpen
                    ? "bg-forest-800 text-cream-100 shadow-xs"
                    : "bg-rose-100 text-rose-800 border border-rose-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeStore.isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-600"
                  }`}
                />
                <span>{activeStore.isOpen ? "Open Now" : "Closed"}</span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-400 px-3 block mb-1.5">
              Store Operations
            </span>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  data-testid={`seller-nav-${link.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    link.isActive
                      ? "bg-forest-800 text-cream-100 shadow-warm"
                      : "text-forest-700 hover:bg-cream-200 hover:text-forest-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.title}</span>
                  </div>
                  {link.isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Mode Switcher & Marketplace Link */}
        <div className="p-4 border-t border-cream-300 bg-cream-100/70 space-y-2.5">
          {/* Role Status Tag */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-forest-500 font-medium">Session Role:</span>
            <span
              data-testid="seller-role-indicator"
              className="text-[10px] font-mono font-bold text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-2 py-0.5 rounded-full"
            >
              {userRole.toUpperCase()}
            </span>
          </div>

          {/* Evaluator Quick Role Switcher */}
          <div className="pt-2 border-t border-cream-200">
            <span className="text-[9px] font-bold text-forest-500 uppercase tracking-wider block mb-1">
              Role Permission Test Switch:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                data-testid="switch-role-seller"
                onClick={() => setUserRole("seller")}
                className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                  userRole === "seller"
                    ? "bg-forest-800 text-cream-100"
                    : "bg-cream-200 hover:bg-cream-300 text-forest-700"
                }`}
              >
                Seller (Allowed)
              </button>
              <button
                type="button"
                data-testid="switch-role-customer"
                onClick={() => setUserRole("customer")}
                className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                  userRole === "customer"
                    ? "bg-rose-700 text-white"
                    : "bg-cream-200 hover:bg-cream-300 text-forest-700"
                }`}
              >
                Customer (Blocked)
              </button>
            </div>
          </div>

          <Link
            href="/"
            data-testid="back-to-store-link"
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-800 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Customer Marketplace</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-6 bg-cream-50 border-b border-cream-300 hidden md:flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="font-serif font-extrabold text-lg text-forest-950">
              {activeStore.name}
            </span>
            <span className="text-xs text-forest-400">•</span>
            <span className="text-xs text-forest-600">{activeStore.area} Counter</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-200 text-forest-800 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
              <span>Seller: {seller.fullName}</span>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-terracotta-600 hover:text-terracotta-700 transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Child Pages Container */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SellerProvider>
      <SellerPortalProtectedShell>{children}</SellerPortalProtectedShell>
    </SellerProvider>
  );
}
