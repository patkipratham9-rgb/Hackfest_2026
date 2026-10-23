"use client";

import React from "react";
import Link from "next/link";
import { User, MapPin, Shield, ShoppingBag, ArrowLeft, Heart, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function AccountPage() {
  const { orders } = useCart();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif font-extrabold text-2xl text-forest-950">
          Buyer Profile
        </h1>
        <Link
          href="/"
          className="text-xs font-bold text-forest-700 hover:text-terracotta-600 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-3xl bg-cream-50 border border-cream-300 shadow-warm flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-forest-800 text-cream-100 flex items-center justify-center text-xl font-bold font-serif shadow-xs">
          PP
        </div>
        <div>
          <h2 className="font-serif font-bold text-lg text-forest-950">
            Pratham Patki
          </h2>
          <p className="text-xs text-forest-600">+91 98451 22334</p>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-terracotta-700">
            <MapPin className="w-3 h-3" />
            <span>Vidyanagar, Hubballi</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 text-center">
          <span className="text-[11px] text-forest-500 font-medium uppercase tracking-wider block">
            Local Pickups
          </span>
          <span className="font-serif font-extrabold text-2xl text-forest-950 block mt-1">
            {orders.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 text-center">
          <span className="text-[11px] text-forest-500 font-medium uppercase tracking-wider block">
            Shops Supported
          </span>
          <span className="font-serif font-extrabold text-2xl text-terracotta-600 block mt-1">
            {new Set(orders.map((o) => o.storeId)).size || 1}
          </span>
        </div>
      </div>

      {/* Team Info Card for Hackathon Judges */}
      <div className="p-5 rounded-3xl bg-forest-900 text-cream-100 space-y-3 shadow-warm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-terracotta-400" />
          <h3 className="font-serif font-bold text-sm text-cream-50">
            Team Digital Titans • Hackathon 2026
          </h3>
        </div>
        <p className="text-xs text-cream-200/80 leading-relaxed">
          LocalLoop is built by Pratham P (Frontend/UX), Srushti D (Backend/Data), and Aditya A (Seller & AI).
        </p>
        <div className="pt-2 border-t border-forest-800 text-[11px] text-cream-300 flex justify-between">
          <span>KLE Technological University</span>
          <span>Full Stack Web Dev</span>
        </div>
      </div>
    </div>
  );
}
