"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Crosshair,
  Home,
  Briefcase,
  Building,
  Check,
  AlertCircle,
  Navigation,
  Compass,
  Search,
  Sparkles,
} from "lucide-react";
import { AddressType, UserAddress, NeighborhoodArea } from "@/types";

interface Map4MePickerProps {
  onSaveAddress: (address: Omit<UserAddress, "id">) => void;
  onCancel?: () => void;
  initialAddress?: Partial<UserAddress>;
  title?: string;
}

// Hubballi Landmark Points for accurate pinpoint geocoding
const HUBBALLI_LANDMARKS = [
  { name: "KIMS Hospital Circle", area: "Vidyanagar", lat: 15.3533, lng: 75.1328, pincode: "580021" },
  { name: "BVB Campus / KLE Tech", area: "Vidyanagar", lat: 15.3647, lng: 75.1240, pincode: "580031" },
  { name: "CBT Bus Terminal", area: "CBT", lat: 15.3482, lng: 75.1384, pincode: "580020" },
  { name: "Hubballi Junction Railway Station", area: "Station Road", lat: 15.3456, lng: 75.1455, pincode: "580023" },
  { name: "Unkal Lake Promenade", area: "Unkal Lake", lat: 15.3785, lng: 75.1122, pincode: "580031" },
  { name: "Gokul Road Industrial Corridor", area: "Gokul Road", lat: 15.3370, lng: 75.0990, pincode: "580030" },
];

export function Map4MePicker({
  onSaveAddress,
  onCancel,
  initialAddress,
  title = "Map4Me Pinpoint Delivery Location",
}: Map4MePickerProps) {
  // Pinpoint Coordinates
  const [lat, setLat] = useState<number>(15.3647);
  const [lng, setLng] = useState<number>(75.124);
  const [isLocating, setIsLocating] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState<string>("");

  // Form Fields
  const [label, setLabel] = useState<AddressType>(initialAddress?.label || "Home");
  const [street, setStreet] = useState(initialAddress?.street || "");
  const [landmark, setLandmark] = useState(initialAddress?.landmark || "Near KLE Tech Campus");
  const [locality, setLocality] = useState<string>(initialAddress?.locality || "Vidyanagar");
  const [pincode, setPincode] = useState(initialAddress?.pincode || "580031");
  const [isDefault, setIsDefault] = useState(initialAddress?.isDefault ?? true);
  const [errorMsg, setErrorMsg] = useState("");

  // Map search query
  const [searchQuery, setSearchQuery] = useState("");

  // Handle GPS Auto-detect
  const handleUseCurrentGps = () => {
    if (!navigator.geolocation) {
      setGeoFeedback("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setGeoFeedback("Acquiring high-precision GPS lock...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = Number(pos.coords.latitude.toFixed(6));
        const userLng = Number(pos.coords.longitude.toFixed(6));
        setLat(userLat);
        setLng(userLng);
        setIsLocating(false);
        setGeoFeedback(`GPS locked: ${userLat}° N, ${userLng}° E (±${Math.round(pos.coords.accuracy)}m)`);

        // Find closest Hubballi landmark
        let closest = HUBBALLI_LANDMARKS[0];
        let minDist = 999999;
        for (const lm of HUBBALLI_LANDMARKS) {
          const d = Math.hypot(lm.lat - userLat, lm.lng - userLng);
          if (d < minDist) {
            minDist = d;
            closest = lm;
          }
        }
        setLocality(closest.area);
        setPincode(closest.pincode);
        if (!landmark) {
          setLandmark(`Near ${closest.name}`);
        }
        setTimeout(() => setGeoFeedback(""), 4000);
      },
      (err) => {
        setIsLocating(false);
        setGeoFeedback("Location permission denied. Click anywhere on Map4Me to pinpoint.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Pinpoint click on Map4Me canvas
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;

    // Map canvas bounds for Hubballi region:
    // Lat: 15.3300 to 15.3900 (Y-axis inverted)
    // Lng: 75.0900 to 75.1600
    const newLat = Number((15.39 - yRatio * 0.06).toFixed(5));
    const newLng = Number((75.09 + xRatio * 0.07).toFixed(5));

    setLat(newLat);
    setLng(newLng);

    // Auto-update landmark & locality based on pinpoint
    let nearest = HUBBALLI_LANDMARKS[0];
    let minD = 999999;
    for (const lm of HUBBALLI_LANDMARKS) {
      const dist = Math.hypot(lm.lat - newLat, lm.lng - newLng);
      if (dist < minD) {
        minD = dist;
        nearest = lm;
      }
    }
    setLocality(nearest.area);
    setPincode(nearest.pincode);
    setLandmark(`Near ${nearest.name}`);
    setGeoFeedback(`Pinpoint updated: ${nearest.area} (${newLat}°N, ${newLng}°E)`);
    setTimeout(() => setGeoFeedback(""), 3000);
  };

  const handleSelectLandmarkPreset = (lm: typeof HUBBALLI_LANDMARKS[0]) => {
    setLat(lm.lat);
    setLng(lm.lng);
    setLocality(lm.area);
    setPincode(lm.pincode);
    setLandmark(`Near ${lm.name}`);
    setGeoFeedback(`Selected ${lm.name}`);
    setTimeout(() => setGeoFeedback(""), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!street.trim()) {
      setErrorMsg("Please enter flat, building, or street details for counter/door delivery.");
      return;
    }

    if (pincode.replace(/\D/g, "").length !== 6) {
      setErrorMsg("Please enter a valid 6-digit Indian PIN code (e.g. 580021).");
      return;
    }

    onSaveAddress({
      label,
      street: street.trim(),
      landmark: landmark.trim(),
      locality,
      city: "Hubballi-Dharwad",
      pincode: pincode.trim(),
      isDefault,
    });
  };

  return (
    <div className="bg-cream-50 rounded-3xl border border-cream-300 shadow-warm overflow-hidden" data-testid="map4me-picker">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-forest-900 text-cream-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-cream-50">{title}</h3>
            <p className="text-[11px] text-cream-200">
              Pinpoint precise coordinates in Hubballi-Dharwad for 1-tap delivery
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentGps}
          disabled={isLocating}
          data-testid="map4me-gps-button"
          className="px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-cream-100 text-xs font-bold flex items-center gap-1.5 border border-forest-700 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <Crosshair className={`w-3.5 h-3.5 text-emerald-400 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? "Locating..." : "Use My GPS"}</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Map4Me Interactive Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-forest-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Interactive Map4Me Pinpoint Canvas</span>
            </span>
            <span className="text-[11px] font-mono font-semibold text-forest-600 bg-cream-200/80 px-2 py-0.5 rounded-md">
              {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
            </span>
          </div>

          <div
            onClick={handleMapClick}
            data-testid="map4me-canvas"
            className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border-2 border-forest-800/20 bg-[#e5e3df] cursor-crosshair group shadow-inner select-none"
            style={{
              backgroundImage: `
                radial-gradient(#c2bcaf 1.5px, transparent 1.5px),
                linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px, 40px 40px, 40px 40px",
            }}
          >
            {/* Road Networks Simulation */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <line x1="10%" y1="20%" x2="90%" y2="85%" stroke="#ffffff" strokeWidth="8" />
              <line x1="10%" y1="20%" x2="90%" y2="85%" stroke="#d97706" strokeWidth="3" />
              <line x1="85%" y1="10%" x2="20%" y2="90%" stroke="#ffffff" strokeWidth="7" />
              <line x1="85%" y1="10%" x2="20%" y2="90%" stroke="#2563eb" strokeWidth="2.5" />
              <circle cx="50%" cy="50%" r="35" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" opacity="0.6" />
              <text x="52%" y="52%" fontSize="10" fill="#0369a1" fontWeight="bold">Unkal Lake</text>
            </svg>

            {/* Hubballi Key Landmark Pins */}
            {HUBBALLI_LANDMARKS.map((lm, idx) => {
              // Convert lat/lng to percentage offset on canvas
              const topPct = Math.max(10, Math.min(85, ((15.39 - lm.lat) / 0.06) * 100));
              const leftPct = Math.max(10, Math.min(85, ((lm.lng - 75.09) / 0.07) * 100));
              return (
                <button
                  key={lm.name}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectLandmarkPreset(lm);
                  }}
                  style={{ top: `${topPct}%`, left: `${leftPct}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 p-1 rounded-full bg-white/90 border border-forest-300 text-forest-800 text-[10px] font-bold shadow-xs flex items-center gap-1 hover:scale-110 hover:bg-forest-900 hover:text-white transition-all z-10 cursor-pointer"
                  title={`Click to snap to ${lm.name}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500" />
                  <span className="hidden sm:inline pr-1">{lm.name.split(" ")[0]}</span>
                </button>
              );
            })}

            {/* Active Pinpoint Marker */}
            {(() => {
              const markerTop = Math.max(8, Math.min(88, ((15.39 - lat) / 0.06) * 100));
              const markerLeft = Math.max(8, Math.min(92, ((lng - 75.09) / 0.07) * 100));
              return (
                <div
                  style={{ top: `${markerTop}%`, left: `${markerLeft}%` }}
                  className="absolute -translate-x-1/2 -translate-y-full z-20 pointer-events-none transition-all duration-300 flex flex-col items-center"
                >
                  <div className="bg-forest-950 text-cream-50 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap mb-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Pinpoint Delivery: {locality}</span>
                  </div>
                  <div className="relative">
                    <MapPin className="w-8 h-8 text-terracotta-600 drop-shadow-md fill-terracotta-500" />
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-terracotta-900" />
                  </div>
                </div>
              );
            })()}

            {/* Instruction Banner at bottom */}
            <div className="absolute bottom-2 left-2 right-2 p-1.5 bg-forest-950/80 backdrop-blur-xs rounded-xl text-cream-100 text-[11px] text-center flex items-center justify-center gap-1.5 pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 text-terracotta-400" />
              <span>Tap anywhere on Map4Me to pinpoint your exact delivery counter</span>
            </div>
          </div>

          {geoFeedback && (
            <p className="text-xs text-forest-700 font-semibold flex items-center gap-1">
              <Navigation className="w-3 h-3 text-emerald-600" />
              <span>{geoFeedback}</span>
            </p>
          )}
        </div>

        {/* Form Details */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Address Label Selector: Home, Office, Others */}
          <div>
            <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1.5">
              Address Category [Home, Office, Others] *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Home", "Office", "Others"] as AddressType[]).map((lbl) => {
                const isSelected = label === lbl;
                return (
                  <button
                    key={lbl}
                    type="button"
                    data-testid={`map4me-label-${lbl.toLowerCase()}`}
                    onClick={() => setLabel(lbl)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-terracotta-600 text-white border-terracotta-600 shadow-xs"
                        : "bg-cream-100 text-forest-800 border-cream-300 hover:bg-cream-200"
                    }`}
                  >
                    {lbl === "Home" && <Home className="w-3.5 h-3.5" />}
                    {lbl === "Office" && <Briefcase className="w-3.5 h-3.5" />}
                    {lbl === "Others" && <Building className="w-3.5 h-3.5" />}
                    <span>{lbl}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Street & Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                House / Flat / Street Name *
              </label>
              <input
                type="text"
                required
                data-testid="map4me-street-input"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. Flat 302, Green Acres Apt, Lingaraj Nagar 2nd Cross"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Pinpoint Landmark
              </label>
              <input
                type="text"
                data-testid="map4me-landmark-input"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near KIMS Circle / Behind Hotel Metropolis"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Pinpoint Locality
              </label>
              <select
                data-testid="map4me-locality-select"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400 cursor-pointer"
              >
                <option value="Vidyanagar">Vidyanagar (580021)</option>
                <option value="Gokul Road">Gokul Road (580030)</option>
                <option value="CBT">CBT / Market (580020)</option>
                <option value="Station Road">Station Road / Keshwapur (580023)</option>
                <option value="Unkal Lake">Unkal Lake / Shirur Park (580031)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Postal PIN Code (Hubballi) *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                data-testid="map4me-pincode-input"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                placeholder="580021"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-forest-800">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-terracotta-600 focus:ring-terracotta-400"
                />
                <span>Set as Default Delivery Address</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-cream-200">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              data-testid="map4me-save-address-button"
              className="px-5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-cream-100 text-xs font-bold shadow-warm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save Pinpoint Address</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
