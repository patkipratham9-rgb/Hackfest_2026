"use client";

import React from "react";
import Link from "next/link";
import { User, Store, ArrowRight, ShieldCheck, ShoppingBag, Sparkles, Database } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="py-12 px-4 sm:px-6 flex-1 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-8">
        {/* Gateway Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200 text-forest-800 text-xs font-bold border border-cream-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
            <span>LocalLoop Sign In Gateway • Hubballi</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-forest-950">
            Choose Your Account Portal
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 max-w-md mx-auto">
            Sign in as a neighborhood shopper to discover artisanal goods, or as a merchant partner to manage orders and stock.
          </p>
        </div>

        {/* 2 Big Action Cards: Shopper vs Merchant */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Shopper / User */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-white border border-cream-300 shadow-warm flex flex-col justify-between space-y-6 hover:border-terracotta-400 transition-all"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-terracotta-100 border border-terracotta-200 flex items-center justify-center text-terracotta-700 shadow-2xs">
                <User className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-xl text-forest-950">
                    Shopper / User
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-800">
                    Customer
                  </span>
                </div>
                <p className="text-xs text-forest-600 leading-relaxed">
                  Discover local corner shops, save multiple delivery addresses, track live counter pickups, and repeat your favorite orders in one tap.
                </p>
              </div>

              <ul className="text-xs text-forest-700 space-y-2 pt-2 border-t border-cream-200">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />
                  <span>1-Tap Instant Mobile OTP Login</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />
                  <span>Doorstep delivery &amp; express counter pickups</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />
                  <span>Persistent cart &amp; reorder history in Supabase</span>
                </li>
              </ul>
            </div>

            <Link
              href="/login/user"
              className="w-full py-3 rounded-2xl bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold shadow-warm flex items-center justify-center gap-2 transition-all"
            >
              <span>Continue to User Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Card 2: Merchant Partner */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-forest-900 text-cream-50 border border-forest-800 shadow-warm flex flex-col justify-between space-y-6 hover:border-terracotta-400 transition-all"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-forest-800 border border-forest-700 flex items-center justify-center text-terracotta-400 shadow-2xs">
                <Store className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-xl text-cream-50">
                    Merchant Partner
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-forest-800 text-terracotta-300">
                    Seller Studio
                  </span>
                </div>
                <p className="text-xs text-cream-200 leading-relaxed">
                  Merchant command center for Hubballi shops. Process orders on the fulfillment Kanban board, verify customer pickup PINs, and adjust inventory in real time.
                </p>
              </div>

              <ul className="text-xs text-cream-200 space-y-2 pt-2 border-t border-forest-800">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta-400" />
                  <span>Real-time order board &amp; counter PIN check</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta-400" />
                  <span>Catalog &amp; atomic stock increment/decrement</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta-400" />
                  <span>Linked store profile in Supabase database</span>
                </li>
              </ul>
            </div>

            <Link
              href="/login/merchant"
              className="w-full py-3 rounded-2xl bg-terracotta-600 hover:bg-terracotta-500 text-white text-xs font-bold shadow-warm flex items-center justify-center gap-2 transition-all"
            >
              <span>Continue to Merchant Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
