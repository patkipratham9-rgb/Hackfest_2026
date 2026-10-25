"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { MapPin, Navigation, X, Check, AlertCircle, Compass, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_LOCALITIES = [
  "Vidyanagar",
  "Koppikar Road",
  "Gokul Road",
  "Keshwapur",
  "Station Road",
  "Unkal Lake",
  "CBT Old City",
  "Navanagar",
];

export function LocationModal() {
  const {
    userLocation,
    setUserLocation,
    isLocating,
    requestCurrentLocation,
    isLocationModalOpen,
    setIsLocationModalOpen,
  } = useCart();

  const [manualInput, setManualInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleShareGps = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const res = await requestCurrentLocation();
    if (res.success && res.location) {
      setSuccessMessage(`Location detected: ${res.location}`);
      setTimeout(() => {
        setIsLocationModalOpen(false);
        setSuccessMessage(null);
      }, 1200);
    } else {
      setErrorMessage(res.error || "Could not detect location. Please enter manually.");
    }
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualInput.trim();
    if (!trimmed) {
      setErrorMessage("Please enter an address or neighborhood name.");
      return;
    }
    setErrorMessage(null);
    setUserLocation(trimmed);
    setSuccessMessage(`Location updated to "${trimmed}"`);
    setTimeout(() => {
      setIsLocationModalOpen(false);
      setSuccessMessage(null);
      setManualInput("");
    }, 800);
  };

  const handleSelectQuick = (loc: string) => {
    setErrorMessage(null);
    setUserLocation(`${loc}, Hubballi`);
    setSuccessMessage(`Location set to ${loc}`);
    setTimeout(() => {
      setIsLocationModalOpen(false);
      setSuccessMessage(null);
    }, 600);
  };

  return (
    <AnimatePresence>
      {isLocationModalOpen && (
        <motion.div
          key="location-modal-container"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            key="location-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsLocationModalOpen(false)}
            className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm"
          />

          {/* Modal Window */}
          <motion.div
            key="location-modal-dialog"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-cream-50 rounded-3xl border border-cream-300 shadow-warm-xl overflow-hidden z-10"
          >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-terracotta-100 flex items-center justify-center text-terracotta-700">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-forest-950 text-base">
                  Set Your Delivery Location
                </h3>
                <p className="text-[11px] text-forest-600">
                  Find local shops and discover products in your vicinity
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="p-1.5 rounded-full text-forest-600 hover:text-forest-900 hover:bg-cream-200 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Feedback messages */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800"
              >
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-forest-50 border border-forest-200 rounded-xl flex items-start gap-2.5 text-xs text-forest-800 font-semibold"
              >
                <Check className="w-4 h-4 text-forest-600 flex-shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {/* GPS Auto-detect button */}
            <button
              type="button"
              data-testid="btn-share-location-gps"
              onClick={handleShareGps}
              disabled={isLocating}
              className="w-full py-3.5 px-4 rounded-2xl bg-terracotta-600 hover:bg-terracotta-700 disabled:opacity-60 text-cream-100 font-bold text-sm shadow-warm flex items-center justify-center gap-2.5 transition-transform active:scale-[0.98]"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
              <span>{isLocating ? "Detecting GPS location..." : "Share Current Location (GPS)"}</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-cream-300 w-full" />
              <span className="bg-cream-50 px-3 text-[11px] font-bold text-forest-500 uppercase tracking-wider">
                Or enter address manually
              </span>
            </div>

            {/* Manual input form */}
            <form onSubmit={handleSaveManual} className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-forest-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  data-testid="input-manual-location"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Street name, landmark, area, or PIN code..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-cream-300 focus:outline-none focus:border-terracotta-500 focus:ring-1 focus:ring-terracotta-500 bg-white text-forest-950 placeholder:text-forest-400"
                />
              </div>
              <button
                type="submit"
                data-testid="btn-save-manual-location"
                className="w-full py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-cream-100 text-xs font-bold transition-colors shadow-xs"
              >
                Save Location
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-forest-600 flex items-center gap-1.5 uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-terracotta-500" />
                Popular Hubballi Localities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_LOCALITIES.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleSelectQuick(loc)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cream-200 hover:bg-terracotta-100 hover:text-terracotta-800 text-forest-800 border border-cream-300 transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Active Location display */}
            {userLocation && (
              <div className="p-3 bg-cream-100 rounded-xl border border-cream-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-terracotta-500 flex-shrink-0" />
                  <span className="font-semibold text-forest-900 truncate max-w-[260px]">
                    Current: {userLocation}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUserLocation("")}
                  className="text-[11px] font-bold text-terracotta-600 hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
}
