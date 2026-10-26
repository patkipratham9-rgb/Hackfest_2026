"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  MapPin,
  Navigation,
  Compass,
  Check,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const POPULAR_NEIGHBORHOODS = [
  "Vidyanagar",
  "Station Road",
  "CBT Old City",
  "Gokul Road",
  "Keshwapur",
  "Unkal Lake",
  "Dharwad Center",
  "Navanagar",
];

interface PostLoginLocationModalProps {
  isOpen: boolean;
  onLocationSet?: (locationName: string) => void;
  onSkip: () => void;
  title?: string;
  description?: string;
  requireLocation?: boolean; // When true (e.g. before payment), disables skip
}

export function PostLoginLocationModal({
  isOpen,
  onLocationSet,
  onSkip,
  title = "Enable Location Permission",
  description = "Connecting authentic corner shops across Hubli-Dharwad with citywide shoppers. Share your location to discover neighborhood vendors and accurate delivery estimates.",
  requireLocation = false,
}: PostLoginLocationModalProps) {
  const { setUserLocation, requestCurrentLocation, isLocating } = useCart();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState("");

  const handleShareGps = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const res = await requestCurrentLocation();
    if (res.success && res.location) {
      setSuccessMessage(`Location detected: ${res.location}`);
      setTimeout(() => {
        onLocationSet?.(res.location || "Hubballi-Dharwad");
      }, 700);
    } else {
      setErrorMessage(
        res.error || "Could not detect GPS location. Please select an area below or enter manually."
      );
    }
  };

  const handleSelectArea = (area: string) => {
    setErrorMessage(null);
    setUserLocation(area);
    setSuccessMessage(`Location selected: ${area}`);
    setTimeout(() => {
      onLocationSet?.(area);
    }, 500);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInput.trim();
    if (!clean) {
      setErrorMessage("Please enter an address or neighborhood name.");
      return;
    }
    setErrorMessage(null);
    setUserLocation(clean);
    setSuccessMessage(`Location set to "${clean}"`);
    setTimeout(() => {
      onLocationSet?.(clean);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="post-login-location-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-forest-950/70 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            key="post-login-location-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-cream-50 border border-cream-300 rounded-3xl p-6 sm:p-8 shadow-floating space-y-6 text-forest-950 overflow-hidden"
        >
          {/* Decorative Background Accent */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-36 h-36 bg-terracotta-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Header Icon & Badges */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-terracotta-100 border border-terracotta-200 text-terracotta-600 flex items-center justify-center mx-auto shadow-xs">
              <Compass className="w-8 h-8 animate-pulse text-terracotta-600" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-800 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-terracotta-600" />
              <span>Hyperlocal Location Setup</span>
            </div>

            <h3 className="font-serif font-extrabold text-2xl text-forest-950 tracking-tight">
              {title}
            </h3>

            <p className="text-xs sm:text-sm text-forest-700 max-w-md mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Feedback Alerts */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                key="loc-error-alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="flex-1">{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                key="loc-success-alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold"
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Primary Action: Use GPS Current Location */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleShareGps}
              disabled={isLocating}
              data-testid="post-login-gps-button"
              className="w-full py-3.5 px-4 rounded-2xl bg-forest-900 hover:bg-forest-950 text-cream-100 font-bold text-sm shadow-warm flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              {isLocating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Detecting your location in Hubballi...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-terracotta-400" />
                  <span>Share Current Location (GPS)</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Hubballi Neighborhoods */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-forest-600" />
              <span className="text-xs font-bold text-forest-800 uppercase tracking-wider">
                Or pick a neighborhood area:
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {POPULAR_NEIGHBORHOODS.map((hood) => (
                <button
                  key={`quick-hood-${hood}`}
                  type="button"
                  onClick={() => handleSelectArea(hood)}
                  data-testid={`quick-area-${hood.toLowerCase().replace(/\s+/g, "-")}`}
                  className="px-3 py-1.5 rounded-lg bg-cream-200 hover:bg-terracotta-100 hover:text-terracotta-800 border border-cream-300 hover:border-terracotta-300 text-xs font-semibold text-forest-800 transition-colors cursor-pointer"
                >
                  {hood}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Address Input */}
          <form onSubmit={handleCustomSubmit} className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter street, landmark, or apartment..."
                className="flex-1 px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400 placeholder:text-forest-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-cream-100 font-bold text-xs transition-colors cursor-pointer shrink-0"
              >
                Save
              </button>
            </div>
          </form>

          {/* Skip for Now Action */}
          <div className="pt-2 border-t border-cream-200 text-center space-y-2">
            {!requireLocation ? (
              <>
                <button
                  type="button"
                  onClick={onSkip}
                  data-testid="post-login-skip-button"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-forest-700 hover:text-forest-950 hover:bg-cream-200/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Skip for now &amp; go to Marketplace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <p className="text-[11px] text-forest-500">
                  You can explore local stores now. We will ask for your location before payment.
                </p>
              </>
            ) : (
              <p className="text-[11px] text-terracotta-700 font-semibold flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Delivery location is required before processing payment.</span>
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
}
