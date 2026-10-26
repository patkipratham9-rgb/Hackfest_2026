"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  ZoomIn,
  ZoomOut,
  Layers,
  Truck,
  RotateCcw,
  X,
} from "lucide-react";
import { AddressType, UserAddress, NeighborhoodArea } from "@/types";

interface Map4MePickerProps {
  onSaveAddress: (address: Omit<UserAddress, "id"> & { distanceKm?: number; lat?: number; lng?: number }) => void;
  onCancel?: () => void;
  initialAddress?: Partial<UserAddress>;
  title?: string;
}

// Hubballi City Center Benchmark (KIMS Circle, Vidyanagar)
const HUBBALLI_CENTER = { lat: 15.3533, lng: 75.1328 };

// Extensive Hubballi-Dharwad Landmark Knowledge Base for Accurate Pinpointing
export const HUBBALLI_LANDMARKS = [
  {
    id: "bvb",
    name: "BVB Campus / KLE Technological University",
    area: "Vidyanagar",
    lat: 15.3647,
    lng: 75.124,
    pincode: "580031",
    tag: "University & Tech Hub",
  },
  {
    id: "kims",
    name: "KIMS Hospital & Medical Circle",
    area: "Vidyanagar",
    lat: 15.3533,
    lng: 75.1328,
    pincode: "580021",
    tag: "Hospital & Central Circle",
  },
  {
    id: "shirur",
    name: "Shirur Park & Akshay Colony",
    area: "Vidyanagar",
    lat: 15.3695,
    lng: 75.118,
    pincode: "580021",
    tag: "Residential Colony",
  },
  {
    id: "cbt",
    name: "CBT City Bus Terminal / Durgadbail",
    area: "CBT",
    lat: 15.3482,
    lng: 75.1384,
    pincode: "580020",
    tag: "Central Transit & Market",
  },
  {
    id: "broadway",
    name: "Broadway & Koppikar Road Commercial Lane",
    area: "CBT",
    lat: 15.344,
    lng: 75.139,
    pincode: "580020",
    tag: "Old Hubli Market",
  },
  {
    id: "station",
    name: "Hubballi Junction Railway Station",
    area: "Station Road",
    lat: 15.3456,
    lng: 75.1455,
    pincode: "580023",
    tag: "South Western Railway HQ",
  },
  {
    id: "keshwapur",
    name: "Keshwapur Circle & Kusugal Road",
    area: "Station Road",
    lat: 15.356,
    lng: 75.152,
    pincode: "580023",
    tag: "Shopping & Residential",
  },
  {
    id: "unkal",
    name: "Unkal Lake Promenade & Garden",
    area: "Unkal Lake",
    lat: 15.3785,
    lng: 75.1122,
    pincode: "580031",
    tag: "Scenic Lake & Gardens",
  },
  {
    id: "navanagar",
    name: "Navanagar BRTS Corridor & Court Complex",
    area: "Unkal Lake",
    lat: 15.395,
    lng: 75.105,
    pincode: "580025",
    tag: "Twin City Corridor",
  },
  {
    id: "gokul",
    name: "Gokul Road Industrial Estate & Airport Corridor",
    area: "Gokul Road",
    lat: 15.337,
    lng: 75.099,
    pincode: "580030",
    tag: "Commercial & Airport Hub",
  },
  {
    id: "tarihal",
    name: "Tarihal Bypass & Industrial Area",
    area: "Gokul Road",
    lat: 15.321,
    lng: 75.085,
    pincode: "580026",
    tag: "Industrial Zone",
  },
];

// Calculate Haversine distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDist = R * c;
  // Apply a 1.25 road curvature multiplier for real road distances
  return Number((rawDist * 1.25).toFixed(1));
}

export function Map4MePicker({
  onSaveAddress,
  onCancel,
  initialAddress,
  title = "Map4Me Pinpoint Delivery Location",
}: Map4MePickerProps) {
  // Pinpoint Coordinates (Default: BVB Campus / KLE Tech, Vidyanagar)
  const [lat, setLat] = useState<number>(15.3647);
  const [lng, setLng] = useState<number>(75.124);
  const [zoomLevel, setZoomLevel] = useState<number>(15);
  const [mapLayer, setMapLayer] = useState<"standard" | "satellite">("standard");

  const [isLocating, setIsLocating] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState<string>("");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>("All");

  // Form Fields
  const [label, setLabel] = useState<AddressType>(initialAddress?.label || "Home");
  const [street, setStreet] = useState(initialAddress?.street || "");
  const [landmark, setLandmark] = useState(initialAddress?.landmark || "Near BVB Campus / KLE Tech");
  const [locality, setLocality] = useState<string>(initialAddress?.locality || "Vidyanagar");
  const [pincode, setPincode] = useState(initialAddress?.pincode || "580031");
  const [isDefault, setIsDefault] = useState(initialAddress?.isDefault ?? true);
  const [errorMsg, setErrorMsg] = useState("");

  const canvasRef = useRef<HTMLDivElement>(null);

  // Compute road delivery distance from Hubballi center
  const computedDistance = useMemo(() => {
    return calculateDistanceKm(HUBBALLI_CENTER.lat, HUBBALLI_CENTER.lng, lat, lng);
  }, [lat, lng]);

  // Dynamic delivery fee calculation: ₹0 up to 3km, ₹15/km beyond 3km
  const computedFee = computedDistance > 3 ? Math.round((computedDistance - 3) * 15) : 0;

  // Sync initial address if provided
  useEffect(() => {
    if (initialAddress?.locality) {
      const match = HUBBALLI_LANDMARKS.find((lm) => lm.area === initialAddress.locality);
      if (match) {
        setLat(match.lat);
        setLng(match.lng);
      }
    }
  }, [initialAddress]);

  // Filter landmarks for search
  const filteredLandmarks = useMemo(() => {
    if (!searchQuery.trim()) return HUBBALLI_LANDMARKS;
    const q = searchQuery.toLowerCase().trim();
    return HUBBALLI_LANDMARKS.filter(
      (lm) =>
        lm.name.toLowerCase().includes(q) ||
        lm.area.toLowerCase().includes(q) ||
        lm.tag.toLowerCase().includes(q) ||
        lm.pincode.includes(q)
    );
  }, [searchQuery]);

  // Handle GPS Auto-detect
  const handleUseCurrentGps = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoFeedback("Geolocation is not supported by your browser. Tap map to pinpoint.");
      return;
    }

    setIsLocating(true);
    setGeoFeedback("Acquiring GPS lock in Hubballi-Dharwad...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = Number(pos.coords.latitude.toFixed(5));
        const userLng = Number(pos.coords.longitude.toFixed(5));
        setLat(userLat);
        setLng(userLng);
        setIsLocating(false);

        // Find closest landmark
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
        if (!landmark || landmark.includes("Near")) {
          setLandmark(`Near ${closest.name.split("/")[0].trim()}`);
        }
        setGeoFeedback(`GPS locked: ${closest.area} (±${Math.round(pos.coords.accuracy)}m)`);
        setTimeout(() => setGeoFeedback(""), 4000);
      },
      () => {
        setIsLocating(false);
        // Fallback gracefully to KLE Tech hub if permission denied
        setGeoFeedback("GPS access blocked. Centered on Hubballi Vidyanagar Hub. Tap map to reposition.");
        setTimeout(() => setGeoFeedback(""), 4000);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Pinpoint click on Map4Me canvas
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;

    // Canvas bounds tailored for Hubballi-Dharwad:
    // Lat: 15.3150 to 15.4050 (Y-axis inverted)
    // Lng: 75.0750 to 75.1650
    const newLat = Number((15.405 - yRatio * 0.09).toFixed(5));
    const newLng = Number((75.075 + xRatio * 0.09).toFixed(5));

    setLat(newLat);
    setLng(newLng);

    // Auto-update landmark & locality based on click
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
    setLandmark(`Near ${nearest.name.split("/")[0].trim()}`);
    setGeoFeedback(`Pinpoint placed: ${nearest.area} (${newLat}°N, ${newLng}°E)`);
    setTimeout(() => setGeoFeedback(""), 3500);
  };

  // Select landmark from autocomplete or map pin
  const handleSelectLandmark = (lm: typeof HUBBALLI_LANDMARKS[0]) => {
    setLat(lm.lat);
    setLng(lm.lng);
    setLocality(lm.area);
    setPincode(lm.pincode);
    setLandmark(`Near ${lm.name.split("/")[0].trim()}`);
    setSearchQuery("");
    setIsSearchFocused(false);
    setGeoFeedback(`Centered on ${lm.name}`);
    setTimeout(() => setGeoFeedback(""), 3000);
  };

  // Change locality from form dropdown and sync map pin
  const handleLocalityChange = (newLocality: string) => {
    setLocality(newLocality);
    const match = HUBBALLI_LANDMARKS.find((lm) => lm.area === newLocality);
    if (match) {
      setLat(match.lat);
      setLng(match.lng);
      setPincode(match.pincode);
      setLandmark(`Near ${match.name.split("/")[0].trim()}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!street.trim()) {
      setErrorMsg("Please enter flat, house number, or street details for counter/doorstep delivery.");
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
      distanceKm: computedDistance,
      lat,
      lng,
    });
  };

  // Calculate percentage positions on canvas for markers
  const markerTop = Math.max(6, Math.min(92, ((15.405 - lat) / 0.09) * 100));
  const markerLeft = Math.max(6, Math.min(94, ((lng - 75.075) / 0.09) * 100));

  return (
    <div
      className="bg-cream-50 rounded-3xl border border-cream-300 shadow-warm overflow-hidden"
      data-testid="map4me-picker"
    >
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
          className="px-3.5 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-cream-100 text-xs font-bold flex items-center gap-1.5 border border-forest-700 shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
        >
          <Crosshair className={`w-3.5 h-3.5 text-emerald-400 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? "Locating..." : "Use My GPS"}</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Search & Area Filter Bar */}
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search colony, college, circle or road (e.g. BVB, Shirur Park, KIMS, CBT)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-cream-300 rounded-xl text-xs text-forest-950 font-medium placeholder:text-forest-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-forest-400 hover:text-forest-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Instant Search Autocomplete Dropdown */}
            {isSearchFocused && filteredLandmarks.length > 0 && searchQuery && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-cream-300 rounded-xl shadow-xl max-h-56 overflow-y-auto z-30 divide-y divide-cream-100">
                {filteredLandmarks.map((lm, idx) => (
                  <button
                    key={lm.id || `lm-search-${idx}`}
                    type="button"
                    onClick={() => handleSelectLandmark(lm)}
                    className="w-full p-2.5 text-left hover:bg-cream-100/80 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-forest-950">{lm.name}</p>
                      <p className="text-[10px] text-forest-600">
                        {lm.area} • PIN {lm.pincode} ({lm.tag})
                      </p>
                    </div>
                    <span className="text-[10px] bg-terracotta-50 text-terracotta-700 border border-terracotta-200 px-2 py-0.5 rounded-md font-bold">
                      Snap Pin
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Hubballi Area Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            {["All Hubballi", "Vidyanagar", "CBT", "Station Road", "Unkal Lake", "Gokul Road"].map((area, idx) => (
              <button
                key={area || `area-${idx}`}
                type="button"
                onClick={() => {
                  setSelectedAreaFilter(area);
                  if (area !== "All Hubballi") {
                    handleLocalityChange(area);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-bold border transition-all shrink-0 cursor-pointer ${
                  (selectedAreaFilter === area || (area !== "All Hubballi" && locality === area))
                    ? "bg-forest-900 text-white border-forest-900"
                    : "bg-white text-forest-700 border-cream-300 hover:border-terracotta-400"
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Map4Me Interactive Canvas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-forest-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Interactive Map4Me Pinpoint Canvas</span>
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold text-forest-700 bg-cream-200/80 px-2 py-0.5 rounded-md">
                {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
              </span>

              {/* Delivery Distance Tag */}
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-700" />
                <span>{computedDistance} km ({computedFee === 0 ? "FREE Delivery" : `+₹${computedFee}`})</span>
              </span>
            </div>
          </div>

          <div
            ref={canvasRef}
            onClick={handleMapClick}
            data-testid="map4me-canvas"
            className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-forest-800/20 bg-[#f4f2ee] cursor-crosshair group shadow-inner select-none"
            style={{
              backgroundImage:
                mapLayer === "standard"
                  ? `
                  radial-gradient(#b8b09f 1.5px, transparent 1.5px),
                  linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
                `
                  : undefined,
              backgroundSize: "24px 24px, 48px 48px, 48px 48px",
            }}
          >
            {/* OpenStreetMap Real Tile Layer Simulation */}
            <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-multiply bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

            {/* Hubballi-Dharwad Arterial Road & Geography Vectors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Unkal Lake & Tolankere water bodies */}
              <circle cx="38%" cy="30%" r="30" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" opacity="0.8" />
              <text x="39%" y="31%" fontSize="9" fill="#0369a1" fontWeight="bold">Unkal Lake</text>

              <ellipse cx="78%" cy="65%" rx="18" ry="12" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" opacity="0.6" />
              <text x="73%" y="67%" fontSize="8" fill="#0369a1" fontWeight="bold">Tolankere</text>

              {/* PB Road / NH 48 Arterial Highway */}
              <path
                d="M 10 240 Q 150 180 260 130 T 480 30"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M 10 240 Q 150 180 260 130 T 480 30"
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* BRTS Hubballi-Dharwad Dedicated Corridor */}
              <path
                d="M 30 270 Q 180 190 280 120 T 460 10"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                opacity="0.75"
              />

              {/* Hubballi Railway Line (South Western Railway) */}
              <path
                d="M 120 280 L 320 180 L 490 140"
                fill="none"
                stroke="#475569"
                strokeWidth="3"
                strokeDasharray="6 3"
                opacity="0.7"
              />

              {/* Gokul Road Connection */}
              <line x1="5%" y1="75%" x2="45%" y2="55%" stroke="#ffffff" strokeWidth="5" opacity="0.9" />
              <line x1="5%" y1="75%" x2="45%" y2="55%" stroke="#64748b" strokeWidth="2.5" />
              <text x="14%" y="70%" fontSize="8" fill="#475569" fontWeight="bold">Gokul Road</text>

              {/* Kusugal Road */}
              <line x1="60%" y1="50%" x2="95%" y2="80%" stroke="#ffffff" strokeWidth="4" opacity="0.9" />
              <line x1="60%" y1="50%" x2="95%" y2="80%" stroke="#64748b" strokeWidth="2" />
              <text x="75%" y="75%" fontSize="8" fill="#475569" fontWeight="bold">Kusugal Rd</text>
            </svg>

            {/* Landmark Fast-Snap Nodes */}
            {HUBBALLI_LANDMARKS.map((lm, idx) => {
              const top = Math.max(8, Math.min(88, ((15.405 - lm.lat) / 0.09) * 100));
              const left = Math.max(8, Math.min(92, ((lm.lng - 75.075) / 0.09) * 100));
              const isCurrent = Math.abs(lm.lat - lat) < 0.003 && Math.abs(lm.lng - lng) < 0.003;

              return (
                <button
                  key={lm.id || `lm-node-${idx}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectLandmark(lm);
                  }}
                  style={{ top: `${top}%`, left: `${left}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs flex items-center gap-1 transition-all z-10 cursor-pointer ${
                    isCurrent
                      ? "bg-forest-950 text-cream-50 border-2 border-emerald-400 scale-105"
                      : "bg-white/95 text-forest-800 border border-forest-300 hover:scale-105 hover:bg-forest-900 hover:text-white"
                  }`}
                  title={`Click to snap pinpoint to ${lm.name}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? "bg-emerald-400" : "bg-terracotta-500"}`} />
                  <span className="hidden sm:inline">{lm.name.split("/")[0].trim().slice(0, 16)}</span>
                </button>
              );
            })}

            {/* Active Pinpoint Marker */}
            <div
              style={{ top: `${markerTop}%`, left: `${markerLeft}%` }}
              className="absolute -translate-x-1/2 -translate-y-full z-20 pointer-events-none transition-all duration-200 flex flex-col items-center"
            >
              <div className="bg-forest-950 text-cream-50 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap mb-1 flex items-center gap-1.5 border border-forest-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  {locality}: {landmark.replace("Near ", "").slice(0, 20)}
                </span>
              </div>
              <div className="relative">
                <MapPin className="w-9 h-9 text-terracotta-600 drop-shadow-xl fill-terracotta-500 animate-bounce" />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-terracotta-950 shadow-md" />
              </div>
            </div>

            {/* Map Controls (Zoom & Center) */}
            <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((z) => Math.min(18, z + 1));
                  setGeoFeedback("Zoomed in (+1 level)");
                  setTimeout(() => setGeoFeedback(""), 1500);
                }}
                className="w-8 h-8 rounded-xl bg-white border border-cream-300 text-forest-800 hover:bg-cream-100 flex items-center justify-center font-bold text-sm shadow-xs cursor-pointer transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((z) => Math.max(12, z - 1));
                  setGeoFeedback("Zoomed out (-1 level)");
                  setTimeout(() => setGeoFeedback(""), 1500);
                }}
                className="w-8 h-8 rounded-xl bg-white border border-cream-300 text-forest-800 hover:bg-cream-100 flex items-center justify-center font-bold text-sm shadow-xs cursor-pointer transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectLandmark(HUBBALLI_LANDMARKS[0]);
                }}
                className="w-8 h-8 rounded-xl bg-white border border-cream-300 text-forest-800 hover:bg-cream-100 flex items-center justify-center shadow-xs cursor-pointer transition-colors"
                title="Reset to City Center"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Instruction Bar */}
            <div className="absolute bottom-2 left-2 right-2 p-2 bg-forest-950/85 backdrop-blur-xs rounded-xl text-cream-100 text-[11px] text-center flex items-center justify-between pointer-events-none">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-terracotta-400 shrink-0" />
                <span>Click anywhere on the map to pinpoint delivery destination</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold hidden sm:inline">
                Hubli-Dharwad High Precision
              </span>
            </div>
          </div>

          {geoFeedback && (
            <p className="text-xs text-forest-700 font-semibold flex items-center gap-1.5 px-1">
              <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{geoFeedback}</span>
            </p>
          )}
        </div>

        {/* Address Form */}
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
              {(["Home", "Office", "Others"] as AddressType[]).map((lbl, idx) => {
                const isSelected = label === lbl;
                return (
                  <button
                    key={lbl || `addr-label-${idx}`}
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
                onChange={(e) => handleLocalityChange(e.target.value)}
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
          <div className="flex items-center justify-between pt-3 border-t border-cream-200">
            <div className="text-[11px] text-forest-600 flex items-center gap-1 font-medium">
              <Truck className="w-3.5 h-3.5 text-forest-500" />
              <span>Est. Delivery: ~{computedDistance} km from Store</span>
            </div>

            <div className="flex items-center gap-2.5">
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
          </div>
        </form>
      </div>
    </div>
  );
}
