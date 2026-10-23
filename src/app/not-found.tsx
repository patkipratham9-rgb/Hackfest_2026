"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  Search,
  Store,
  LayoutGrid,
  RotateCcw,
  Phone,
  Mail,
  Home,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/?q=${encodeURIComponent(searchVal.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full bg-cream-50 border border-cream-300 rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-floating">
        {/* Animated Brand Badge */}
        <div className="w-20 h-20 rounded-3xl bg-terracotta-100 border border-terracotta-200 text-terracotta-600 flex items-center justify-center mx-auto shadow-xs">
          <Compass className="w-10 h-10 animate-pulse" />
        </div>

        {/* 404 Header */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-terracotta-600 bg-terracotta-50 px-3 py-1 rounded-full border border-terracotta-200">
            Error 404 • Lost in the Lanes
          </span>
          <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-forest-950">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 max-w-sm mx-auto leading-relaxed">
            The lane or shop shelf you’re looking for doesn’t exist or has moved. Explore authentic Hubballi merchants below.
          </p>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-sm mx-auto">
          <input
            type="text"
            placeholder="Search stores or items (e.g. Pedha, Coffee)..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 bg-white border border-cream-300 rounded-2xl text-xs font-medium text-forest-950 focus:ring-2 focus:ring-terracotta-500 focus:outline-hidden shadow-xs"
          />
          <Search className="w-4 h-4 text-forest-500 absolute left-3.5 top-3" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-cream-50 text-[11px] font-bold shadow-xs transition-colors"
          >
            Find
          </button>
        </form>

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <Link
            href="/"
            className="p-3 rounded-2xl bg-forest-900 hover:bg-forest-950 text-cream-50 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Home className="w-4 h-4 text-terracotta-400" />
            <span>Storefront Home</span>
          </Link>
          <Link
            href="/categories"
            className="p-3 rounded-2xl bg-cream-100 hover:bg-cream-200 text-forest-900 text-xs font-bold border border-cream-300 flex items-center justify-center gap-2 transition-all"
          >
            <LayoutGrid className="w-4 h-4 text-forest-700" />
            <span>Browse Categories</span>
          </Link>
          <Link
            href="/orders-again"
            className="p-3 rounded-2xl bg-cream-100 hover:bg-cream-200 text-forest-900 text-xs font-bold border border-cream-300 flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-forest-700" />
            <span>Past Orders</span>
          </Link>
          <Link
            href="/seller"
            className="p-3 rounded-2xl bg-terracotta-50 hover:bg-terracotta-100 text-terracotta-800 text-xs font-bold border border-terracotta-200 flex items-center justify-center gap-2 transition-all"
          >
            <Store className="w-4 h-4 text-terracotta-600" />
            <span>Merchant Portal</span>
          </Link>
        </div>

        {/* Contact Support */}
        <div className="pt-4 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-forest-600">
          <span>Need help finding a shop?</span>
          <div className="flex items-center gap-3">
            <a
              href="tel:+919845122334"
              className="font-bold text-forest-900 hover:text-terracotta-600 flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-terracotta-600" />
              <span>+91 98451 22334</span>
            </a>
            <a
              href="mailto:pratham.patki@kletech.ac.in"
              className="font-bold text-forest-900 hover:text-terracotta-600 flex items-center gap-1"
            >
              <Mail className="w-3 h-3 text-terracotta-600" />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
