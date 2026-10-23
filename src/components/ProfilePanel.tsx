"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import {
  X,
  User,
  MapPin,
  ShieldCheck,
  Smartphone,
  Mail,
  Code2,
  Sparkles,
  ExternalLink,
  Bell,
  Heart,
  Store,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ProfilePanel() {
  const { isProfileOpen, setIsProfileOpen, activeArea, setActiveArea, orders } = useCart();

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
                    PP
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-lg text-forest-950">
                      Profile & Application
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
                {/* User Profile Card */}
                <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-forest-500 uppercase tracking-wider">
                      Shopper Profile
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-forest-800 text-cream-100 text-[10px] font-bold">
                      Verified Buyer
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2.5 text-forest-900 font-bold text-sm">
                      <User className="w-4 h-4 text-terracotta-500" />
                      <span>Pratham Patki</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-forest-700">
                      <Smartphone className="w-4 h-4 text-forest-500" />
                      <span>+91 98451 22334</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-forest-700">
                      <Mail className="w-4 h-4 text-forest-500" />
                      <span>pratham.patki@kletech.ac.in</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-forest-700">
                      <MapPin className="w-4 h-4 text-terracotta-500" />
                      <span>Vidyanagar, Hubballi-Dharwad</span>
                    </div>
                  </div>
                </div>

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

                {/* Application Details Card */}
                <div className="p-4 rounded-2xl bg-forest-900 text-cream-100 space-y-3 shadow-warm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-terracotta-400 animate-pulse" />
                    <h3 className="font-serif font-bold text-sm text-cream-50">
                      LocalLoop Application Details
                    </h3>
                  </div>

                  <p className="text-xs text-cream-200/90 leading-relaxed">
                    LocalLoop is a hyper-local digital marketplace connecting neighborhood corner shops in Tier-2 Indian cities with citywide shoppers.
                  </p>

                  <div className="pt-2 border-t border-forest-800 space-y-1.5 text-[11px] text-cream-200">
                    <div className="flex justify-between">
                      <span className="text-forest-300">Version:</span>
                      <span className="font-mono text-cream-50 font-semibold">v0.1.0-beta</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forest-300">Team:</span>
                      <span className="text-cream-50 font-semibold">Digital Titans</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forest-300">Members:</span>
                      <span className="text-cream-50">Pratham P, Srushti D, Aditya A</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forest-300">College:</span>
                      <span className="text-cream-50">KLE Technological University</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-forest-300">Database:</span>
                      <span className="text-terracotta-400 font-semibold">Supabase PostgreSQL (Live)</span>
                    </div>
                  </div>
                </div>

                {/* GitHub Repository Link */}
                <a
                  href="https://github.com/patkipratham9-rgb/Hackfest_2026.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-cream-100 border border-cream-300 hover:border-terracotta-400 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Code2 className="w-4 h-4 text-forest-700 group-hover:text-terracotta-600" />
                    <span className="text-xs font-bold text-forest-900 group-hover:text-terracotta-700">
                      GitHub Repository
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-forest-400 group-hover:text-terracotta-600" />
                </a>
              </div>

              {/* Footer */}
              <div className="p-4 bg-cream-100 border-t border-cream-300 text-center">
                <span className="text-[11px] text-forest-500 font-medium">
                  LocalLoop • Think local. Shop smarter. Grow together.
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
