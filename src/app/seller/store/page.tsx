"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSeller } from "@/context/SellerContext";
import { supabase } from "@/lib/supabaseClient";
import { NeighborhoodArea, ProductCategory } from "@/types";
import {
  ALL_DAYS,
  DayOfWeek,
  parseOperatingHoursString,
  formatOperatingHoursString,
  validateOperatingHours,
  checkLiveOperatingStatus,
  formatTo12Hour,
} from "@/lib/operatingHours";
import {
  Store,
  MapPin,
  Clock,
  Phone,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Check,
  AlertCircle,
  RotateCcw,
  Save,
  UploadCloud,
  X,
  FileImage,
  Calendar,
  Trash2,
  Building2,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES: ProductCategory[] = [
  "Grocery",
  "Bakery",
  "Produce",
  "Household",
  "Sweets & Snacks",
  "Handloom & Crafts",
  "Filter Coffee & Tea",
];

const AREAS: NeighborhoodArea[] = [
  "Vidyanagar",
  "Gokul Road",
  "CBT",
  "Station Road",
  "Unkal Lake",
];

const DAY_TEST_IDS: Record<DayOfWeek, string> = {
  Mon: "day-toggle-mon",
  Tue: "day-toggle-tue",
  Wed: "day-toggle-wed",
  Thu: "day-toggle-thu",
  Fri: "day-toggle-fri",
  Sat: "day-toggle-sat",
  Sun: "day-toggle-sun",
};

export default function StoreProfilePage() {
  const router = useRouter();
  const { activeStore, updateStoreProfile, toggleStoreOpen, deleteMerchantStore } = useSeller();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states initialized with activeStore
  const [name, setName] = useState(activeStore.name);
  const [tagline, setTagline] = useState(activeStore.tagline || "");
  const [category, setCategory] = useState<ProductCategory>(activeStore.category);
  const [area, setArea] = useState<NeighborhoodArea>(activeStore.area);
  const [lane, setLane] = useState(activeStore.lane);
  const [phone, setPhone] = useState(activeStore.phone || "+91 98450 12345");
  const [openingHours, setOpeningHours] = useState(activeStore.openingHours || "7:00 AM - 9:00 PM");
  const [bannerUrl, setBannerUrl] = useState(activeStore.bannerUrl || "");
  const [imageUrl, setImageUrl] = useState(activeStore.imageUrl || "");

  // Extended Merchant Details
  const [location, setLocation] = useState(activeStore.location || activeStore.area || "Vidyanagar");
  const [shopTiming, setShopTiming] = useState(activeStore.shopTiming || activeStore.openingHours || "8:00 AM - 9:00 PM");
  const [holidays, setHolidays] = useState(activeStore.holidays || "Every Sunday & National Holidays");
  const [businessType, setBusinessType] = useState(activeStore.businessType || "Sole Proprietorship");
  const [contactPhone, setContactPhone] = useState(activeStore.contactPhone || activeStore.phone || "+91 98450 12345");
  const [panNumber, setPanNumber] = useState(activeStore.panNumber || "ABCDE1234F");
  const [bankAccountNumber, setBankAccountNumber] = useState(activeStore.bankAccountNumber || "9876543210123");
  const [bankIfscCode, setBankIfscCode] = useState(activeStore.bankIfscCode || "SBIN0001234");
  const [bankName, setBankName] = useState(activeStore.bankName || "State Bank of India");
  const [pickupAddress, setPickupAddress] = useState(activeStore.pickupAddress || activeStore.lane || "Shop #12, Market Road, Hubballi");
  const [returnAddress, setReturnAddress] = useState(activeStore.returnAddress || activeStore.lane || "Shop #12, Market Road, Hubballi");
  const [logoUrl, setLogoUrl] = useState(activeStore.logoUrl || activeStore.imageUrl || "");

  // Account Removal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingStore, setIsDeletingStore] = useState(false);

  // Checkpoint CP-SP04: Structured Operating Hours & Schedule States
  const initialHours = useMemo(
    () => parseOperatingHoursString(activeStore.openingHours || "7:00 AM - 9:00 PM"),
    [activeStore.openingHours]
  );
  const [openTime, setOpenTime] = useState(initialHours.openTime);
  const [closeTime, setCloseTime] = useState(initialHours.closeTime);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(initialHours.days);
  const [hoursError, setHoursError] = useState("");

  // Supabase Storage Banner Upload states
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");

  // Validation & Feedback
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Checkpoint CP-SP04: Live operating status calculation
  const liveOperatingStatus = useMemo(() => {
    return checkLiveOperatingStatus(openTime, closeTime, selectedDays, activeStore.isOpen);
  }, [openTime, closeTime, selectedDays, activeStore.isOpen]);

  // CP-SP04: Operating hours handlers
  const handleOpenTimeChange = (newOpen: string) => {
    setOpenTime(newOpen);
    const result = validateOperatingHours(newOpen, closeTime, selectedDays);
    if (!result.valid) {
      setHoursError(result.error || "");
    } else {
      setHoursError("");
    }
    setOpeningHours(formatOperatingHoursString(newOpen, closeTime, selectedDays));
  };

  const handleCloseTimeChange = (newClose: string) => {
    setCloseTime(newClose);
    const result = validateOperatingHours(openTime, newClose, selectedDays);
    if (!result.valid) {
      setHoursError(result.error || "");
    } else {
      setHoursError("");
    }
    setOpeningHours(formatOperatingHoursString(openTime, newClose, selectedDays));
  };

  const handleToggleDay = (day: DayOfWeek) => {
    const nextDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(nextDays);
    const result = validateOperatingHours(openTime, closeTime, nextDays);
    if (!result.valid) {
      setHoursError(result.error || "");
    } else {
      setHoursError("");
    }
    setOpeningHours(formatOperatingHoursString(openTime, closeTime, nextDays));
  };

  const handleApplyPreset = (presetOpen: string, presetClose: string, presetDays: DayOfWeek[]) => {
    setOpenTime(presetOpen);
    setCloseTime(presetClose);
    setSelectedDays(presetDays);
    setHoursError("");
    const formatted = formatOperatingHoursString(presetOpen, presetClose, presetDays);
    setOpeningHours(formatted);
  };

  // Checkpoint CP-SP03: Handle Supabase Storage Banner Upload
  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploadSuccessMsg("");

    // 1. Validate file size (<= 5MB)
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`Banner image size exceeds ${MAX_SIZE_MB}MB limit.`);
      return;
    }

    // 2. Validate MIME type
    if (!file.type.startsWith("image/")) {
      setUploadError("Only valid image formats (JPEG, PNG, WebP, AVIF) are supported.");
      return;
    }

    setIsUploadingBanner(true);

    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `banner-${activeStore.id || "store"}-${Date.now()}.${fileExt}`;
      const filePath = `store-banners/${fileName}`;

      // Upload directly to Supabase Storage bucket 'store-banners'
      const { data, error: uploadErr } = await supabase.storage
        .from("store-banners")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadErr) {
        console.warn("Supabase Storage upload note:", uploadErr.message);
        // Fallback: Use local base64/object URL for instant preview & persistence
        const reader = new FileReader();
        reader.onloadend = () => {
          const fallbackUrl = reader.result as string;
          setBannerUrl(fallbackUrl);
          setUploadSuccessMsg("Banner loaded from image file (Demo mode)");
          setIsUploadingBanner(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      // Obtain public URL from Supabase Storage
      const { data: urlData } = supabase.storage
        .from("store-banners")
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        setBannerUrl(urlData.publicUrl);
        setUploadSuccessMsg("Banner successfully uploaded to Supabase Storage!");
      }
    } catch (err: any) {
      console.warn("Storage upload exception:", err);
      // Fallback to FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerUrl(reader.result as string);
        setUploadSuccessMsg("Banner loaded successfully");
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingBanner(false);
      setTimeout(() => setUploadSuccessMsg(""), 4000);
    }
  };

  const validate = () => {
    let isValid = true;
    if (!name.trim()) {
      setNameError("Store name cannot be empty.");
      isValid = false;
    } else {
      setNameError("");
    }

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setPhoneError("Please enter a valid 10-digit counter phone number.");
      isValid = false;
    } else {
      setPhoneError("");
    }

    // Checkpoint CP-SP04: Operating Hours Validation
    const hoursValidation = validateOperatingHours(openTime, closeTime, selectedDays);
    if (!hoursValidation.valid) {
      setHoursError(hoursValidation.error || "Please specify valid operating hours.");
      isValid = false;
    } else {
      setHoursError("");
    }

    return isValid;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      updateStoreProfile({
        name: name.trim(),
        tagline: tagline.trim(),
        category,
        area,
        lane: lane.trim(),
        phone: phone.trim(),
        openingHours: openingHours.trim(),
        bannerUrl: bannerUrl.trim() || activeStore.bannerUrl,
        imageUrl: imageUrl.trim() || activeStore.imageUrl,
        location: location.trim(),
        shopTiming: shopTiming.trim(),
        holidays: holidays.trim(),
        businessType: businessType.trim(),
        contactPhone: contactPhone.trim(),
        panNumber: panNumber.trim().toUpperCase(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankIfscCode: bankIfscCode.trim().toUpperCase(),
        bankName: bankName.trim(),
        pickupAddress: pickupAddress.trim(),
        returnAddress: returnAddress.trim(),
        logoUrl: logoUrl.trim() || imageUrl.trim(),
      });

      setIsSubmitting(false);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3500);
    }, 400);
  };

  const handleDeleteStore = async () => {
    setIsDeletingStore(true);
    try {
      await deleteMerchantStore();
      router.push("/merchant/login");
    } catch (err) {
      console.error("Failed to delete store account:", err);
      setIsDeletingStore(false);
    }
  };

  const handleReset = () => {
    setName(activeStore.name);
    setTagline(activeStore.tagline || "");
    setCategory(activeStore.category);
    setArea(activeStore.area);
    setLane(activeStore.lane);
    setPhone(activeStore.phone || "+91 98450 12345");
    setOpeningHours(activeStore.openingHours || "7:00 AM - 9:00 PM");
    const resetHours = parseOperatingHoursString(activeStore.openingHours || "7:00 AM - 9:00 PM");
    setOpenTime(resetHours.openTime);
    setCloseTime(resetHours.closeTime);
    setSelectedDays(resetHours.days);
    setHoursError("");
    setBannerUrl(activeStore.bannerUrl || "");
    setImageUrl(activeStore.imageUrl || "");
    setLocation(activeStore.location || activeStore.area || "Vidyanagar");
    setShopTiming(activeStore.shopTiming || activeStore.openingHours || "8:00 AM - 9:00 PM");
    setHolidays(activeStore.holidays || "Every Sunday & National Holidays");
    setBusinessType(activeStore.businessType || "Sole Proprietorship");
    setContactPhone(activeStore.contactPhone || activeStore.phone || "+91 98450 12345");
    setPanNumber(activeStore.panNumber || "ABCDE1234F");
    setBankAccountNumber(activeStore.bankAccountNumber || "9876543210123");
    setBankIfscCode(activeStore.bankIfscCode || "SBIN0001234");
    setBankName(activeStore.bankName || "State Bank of India");
    setPickupAddress(activeStore.pickupAddress || activeStore.lane || "Shop #12, Market Road, Hubballi");
    setReturnAddress(activeStore.returnAddress || activeStore.lane || "Shop #12, Market Road, Hubballi");
    setLogoUrl(activeStore.logoUrl || activeStore.imageUrl || "");
    setNameError("");
    setPhoneError("");
    setUploadError("");
    setUploadSuccessMsg("");
  };

  return (
    <div className="space-y-6">
      <title>Store Presence &amp; Hours • LocalLoop Partner</title>
      <meta
        name="description"
        content="Configure store banner branding, Hubballi lane address, counter phone, and weekly operating hours."
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
              Merchant Settings • Checkpoint CP-SP02 & CP-SP03
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-forest-100 border border-forest-200 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3 text-forest-700" />
              <span>Verified Artisan</span>
            </span>
          </div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-forest-950 mt-1">
            Store Profile & Presence
          </h1>
          <p className="text-xs text-forest-600 mt-0.5">
            Configure your shop branding, Hubballi locality geocoding, and counter pickup operating hours
          </p>
        </div>

        {/* Live Status Switch */}
        <div className="flex items-center gap-2 bg-cream-50 p-2 rounded-2xl border border-cream-300 shadow-xs self-start sm:self-auto">
          <span className="text-xs font-semibold text-forest-700">Counter Status:</span>
          <button
            type="button"
            data-testid="store-status-toggle"
            onClick={toggleStoreOpen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStore.isOpen
                ? "bg-forest-800 text-cream-100 shadow-xs"
                : "bg-rose-100 text-rose-800 border border-rose-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                activeStore.isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-600"
              }`}
            />
            <span>{activeStore.isOpen ? "Open Now" : "Paused / Closed"}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            data-testid="store-save-success-alert"
            className="p-4 rounded-2xl bg-forest-800 text-cream-100 flex items-center justify-between gap-3 shadow-warm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="text-xs">
                <p className="font-bold">Store profile saved successfully!</p>
                <p className="text-cream-200 text-[11px]">
                  Updated presence is now live across LocalLoop shopper discovery in {area}.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessAlert(false)}
              className="text-xs font-bold text-cream-200 hover:text-white px-2 py-1"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Banner Preview & Supabase Storage Upload Card */}
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-terracotta-500" />
              <span>Storefront Banner & Supabase Storage Upload</span>
            </span>
            <span className="text-[11px] text-forest-500 font-medium">
              Bucket: <span className="font-mono text-terracotta-700 font-bold">store-banners</span> (Max 5MB)
            </span>
          </div>

          {/* Banner Visual Preview */}
          <div
            data-testid="store-banner-preview"
            className="relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden bg-forest-950 border border-cream-300 shadow-inner group"
          >
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                alt={name}
                fill
                sizes="800px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-cream-300">
                <Store className="w-10 h-10 opacity-40 mb-1" />
                <span className="text-xs">No banner image uploaded yet</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-terracotta-400 bg-forest-900/80 px-2 py-0.5 rounded-md">
                  {category}
                </span>
                <h3 className="font-serif font-bold text-xl text-white mt-1 drop-shadow-sm">
                  {name || "Store Name"}
                </h3>
                <p className="text-xs text-cream-200 line-clamp-1 drop-shadow-xs">
                  {tagline || "Artisanal neighborhood goods in Hubballi"}
                </p>
              </div>

              <span className="hidden sm:inline-flex text-[11px] font-semibold text-white bg-forest-900/90 px-2.5 py-1 rounded-lg border border-white/20">
                {lane}, {area}
              </span>
            </div>
          </div>

          {/* Checkpoint CP-SP03: Upload Control Zone */}
          <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-forest-900 block">
                  Upload Custom Banner Image
                </span>
                <span className="text-[11px] text-forest-600 block">
                  Uploads directly to your Supabase Storage bucket (`store-banners`)
                </span>
              </div>

              {/* Hidden file input triggered by button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                data-testid="banner-file-input"
                onChange={handleBannerFileUpload}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="banner-upload-button"
                  disabled={isUploadingBanner}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-cream-100 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isUploadingBanner ? (
                    <>
                      <span
                        data-testid="banner-upload-loading"
                        className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
                      />
                      <span>Uploading to Storage...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-terracotta-400" />
                      <span>Choose Banner File</span>
                    </>
                  )}
                </button>

                {bannerUrl && (
                  <button
                    type="button"
                    data-testid="remove-banner-button"
                    onClick={() => setBannerUrl("")}
                    className="p-2 rounded-xl bg-cream-200 hover:bg-rose-100 text-forest-700 hover:text-rose-700 transition-colors"
                    title="Remove Banner"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Upload Feedback alerts */}
            {uploadSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid="banner-upload-success"
                className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl"
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadSuccessMsg}</span>
              </motion.div>
            )}

            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                data-testid="banner-upload-error"
                className="flex items-center gap-2 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 p-2.5 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Direct Banner Image URL (or Storage URL)
              </label>
              <input
                type="url"
                data-testid="store-banner-input"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://...supabase.co/storage/v1/object/public/store-banners/..."
                className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Storefront Thumbnail / Icon URL
              </label>
              <input
                type="url"
                data-testid="store-image-input"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Merchant Logo URL
              </label>
              <input
                type="url"
                data-testid="store-logo-input"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/logo..."
                className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>
          </div>
        </div>

        {/* Basic Brand Identity */}
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-4 shadow-xs">
          <span className="text-xs font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
            <Store className="w-4 h-4 text-terracotta-500" />
            <span>Storefront Brand Identity</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Store Name *
              </label>
              <input
                type="text"
                data-testid="store-name-input"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                placeholder="e.g. Meena's Diyas & Filter Coffee"
                className={`w-full px-3.5 py-2.5 bg-cream-100 border rounded-xl text-xs text-forest-950 font-medium focus:outline-none transition-colors ${
                  nameError
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-300"
                    : "border-cream-300 focus:ring-2 focus:ring-terracotta-400"
                }`}
              />
              {nameError && (
                <p
                  data-testid="store-name-error"
                  className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Primary Category
              </label>
              <select
                data-testid="store-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Artisanal Tagline / Story
              </label>
              <textarea
                rows={2}
                data-testid="store-tagline-input"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Brief 1-2 sentence description of your specialty crafts, heritage recipes, or goods..."
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>
          </div>
        </div>

        {/* Neighborhood Geocoding & Operating Hours */}
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-4 shadow-xs">
          <span className="text-xs font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-terracotta-500" />
            <span>Hubballi Locality Address & Pickup Timing</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Neighborhood Locality
              </label>
              <select
                data-testid="store-area-select"
                value={area}
                onChange={(e) => setArea(e.target.value as NeighborhoodArea)}
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400 cursor-pointer"
              >
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Street Lane / Landmark Address
              </label>
              <input
                type="text"
                data-testid="store-lane-input"
                value={lane}
                onChange={(e) => setLane(e.target.value)}
                placeholder="e.g. 2nd Cross, Near KIMS Circle"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Counter Phone (for shopper pickups) *
              </label>
              <input
                type="tel"
                data-testid="store-phone-input"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
                placeholder="+91 98450 12345"
                className={`w-full px-3.5 py-2.5 bg-cream-100 border rounded-xl text-xs text-forest-950 font-medium focus:outline-none transition-colors ${
                  phoneError
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-300"
                    : "border-cream-300 focus:ring-2 focus:ring-terracotta-400"
                }`}
              />
              {phoneError && (
                <p
                  data-testid="store-phone-error"
                  className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{phoneError}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Checkpoint CP-SP04: Operating Hours & Schedule Management Card */}
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-terracotta-500" />
              <span>Counter Operating Hours & Schedule (CP-SP04)</span>
            </span>

            {/* Live Operational Status Indicator */}
            <div
              data-testid="store-hours-live-status"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                liveOperatingStatus.isOpen
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  liveOperatingStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span>{liveOperatingStatus.badgeText}</span>
              <span className="text-[11px] font-medium opacity-80">({liveOperatingStatus.detail})</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="p-3.5 rounded-2xl bg-cream-100 border border-cream-200 space-y-2">
            <span className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block">
              Quick Schedule Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                data-testid="preset-retail"
                onClick={() => handleApplyPreset("09:00", "21:00", [...ALL_DAYS])}
                className="px-2.5 py-1.5 rounded-xl bg-cream-50 hover:bg-forest-100 border border-cream-300 text-forest-800 text-xs font-semibold transition-colors text-left cursor-pointer"
              >
                <div className="font-bold text-[11px]">Regular Retail</div>
                <div className="text-[10px] text-forest-500">9 AM - 9 PM • All Days</div>
              </button>

              <button
                type="button"
                data-testid="preset-early"
                onClick={() => handleApplyPreset("06:30", "21:30", [...ALL_DAYS])}
                className="px-2.5 py-1.5 rounded-xl bg-cream-50 hover:bg-forest-100 border border-cream-300 text-forest-800 text-xs font-semibold transition-colors text-left cursor-pointer"
              >
                <div className="font-bold text-[11px]">Early Fresh</div>
                <div className="text-[10px] text-forest-500">6:30 AM - 9:30 PM • All Days</div>
              </button>

              <button
                type="button"
                data-testid="preset-bazaar"
                onClick={() =>
                  handleApplyPreset("10:00", "20:30", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"])
                }
                className="px-2.5 py-1.5 rounded-xl bg-cream-50 hover:bg-forest-100 border border-cream-300 text-forest-800 text-xs font-semibold transition-colors text-left cursor-pointer"
              >
                <div className="font-bold text-[11px]">Market Bazaar</div>
                <div className="text-[10px] text-forest-500">10 AM - 8:30 PM • Mon-Sat</div>
              </button>

              <button
                type="button"
                data-testid="preset-24h"
                onClick={() => handleApplyPreset("00:00", "23:59", [...ALL_DAYS])}
                className="px-2.5 py-1.5 rounded-xl bg-cream-50 hover:bg-forest-100 border border-cream-300 text-forest-800 text-xs font-semibold transition-colors text-left cursor-pointer"
              >
                <div className="font-bold text-[11px]">24/7 Counter</div>
                <div className="text-[10px] text-forest-500">Always Open • All Days</div>
              </button>
            </div>
          </div>

          {/* Time Input Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Counter Opens At
              </label>
              <div className="relative">
                <input
                  type="time"
                  data-testid="store-open-time-input"
                  value={openTime}
                  onChange={(e) => handleOpenTimeChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-cream-100 border rounded-xl text-xs text-forest-950 font-semibold focus:outline-none transition-colors ${
                    hoursError
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-300"
                      : "border-cream-300 focus:ring-2 focus:ring-terracotta-400"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Counter Closes At
              </label>
              <div className="relative">
                <input
                  type="time"
                  data-testid="store-close-time-input"
                  value={closeTime}
                  onChange={(e) => handleCloseTimeChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-cream-100 border rounded-xl text-xs text-forest-950 font-semibold focus:outline-none transition-colors ${
                    hoursError
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-300"
                      : "border-cream-300 focus:ring-2 focus:ring-terracotta-400"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Operational Days Selector */}
          <div>
            <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1.5">
              Active Operational Days
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {ALL_DAYS.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    data-testid={DAY_TEST_IDS[day]}
                    onClick={() => handleToggleDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-forest-800 text-cream-100 shadow-xs"
                        : "bg-cream-200 text-forest-700 hover:bg-cream-300 opacity-60"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formatted Hours Preview & Fallback Input */}
          <div>
            <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
              Formatted Storefront Display String
            </label>
            <input
              type="text"
              data-testid="store-hours-input"
              value={openingHours}
              onChange={(e) => {
                setOpeningHours(e.target.value);
                if (hoursError) setHoursError("");
              }}
              placeholder="e.g. 7:00 AM - 9:00 PM (Mon - Sat)"
              className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
            />
          </div>

          {/* Operating Hours Validation Error Banner */}
          {hoursError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              data-testid="store-hours-error"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{hoursError}</span>
            </motion.div>
          )}
        </div>

        {/* Business & Tax Identification */}
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-4 shadow-xs">
          <span className="text-xs font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-terracotta-500" />
            <span>Business Entity & Tax Details</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Business Type
              </label>
              <select
                data-testid="store-business-type-select"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400 cursor-pointer"
              >
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Private Limited">Private Limited</option>
                <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                <option value="Individual Artisan">Individual Artisan</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                data-testid="store-contact-phone-input"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98450 12345"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                PAN Number
              </label>
              <input
                type="text"
                data-testid="store-pan-input"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Fulfillment, Pickup & Return Addresses */}
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-4 shadow-xs">
          <span className="text-xs font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-terracotta-500" />
            <span>Store Location, Pickup & Return Addresses</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Store Location / Neighborhood Description
              </label>
              <input
                type="text"
                data-testid="store-location-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Vidyanagar, Hubballi"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div className="sm:col-span-3 sm:grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                  Pickup Address (Customer Fulfillment)
                </label>
                <textarea
                  rows={2}
                  data-testid="store-pickup-address-input"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Full pickup counter address for customer orders..."
                  className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                  Return Address (Returns & Exchanges)
                </label>
                <textarea
                  rows={2}
                  data-testid="store-return-address-input"
                  value={returnAddress}
                  onChange={(e) => setReturnAddress(e.target.value)}
                  placeholder="Address where returns or exchanges should be dispatched..."
                  className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shop Timings & Designated Holidays */}
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-4 shadow-xs">
          <span className="text-xs font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-terracotta-500" />
            <span>Shop Timings & Designated Holidays</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Shop Timing
              </label>
              <input
                type="text"
                data-testid="store-shop-timing-input"
                value={shopTiming}
                onChange={(e) => setShopTiming(e.target.value)}
                placeholder="e.g. 8:00 AM - 9:00 PM"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Holidays / Weekly Offs
              </label>
              <input
                type="text"
                data-testid="store-holidays-input"
                value={holidays}
                onChange={(e) => setHolidays(e.target.value)}
                placeholder="e.g. Every Sunday & National Holidays"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>
          </div>
        </div>

        {/* Settlement Bank Account Details */}
        <div className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-4 shadow-xs">
          <span className="text-xs font-bold text-forest-900 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-terracotta-500" />
            <span>Settlement Bank Account</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Bank Name
              </label>
              <input
                type="text"
                data-testid="store-bank-name-input"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. State Bank of India"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                data-testid="store-bank-account-input"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="9876543210123"
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                Bank IFSC Code
              </label>
              <input
                type="text"
                data-testid="store-bank-ifsc-input"
                value={bankIfscCode}
                onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                placeholder="SBIN0001234"
                maxLength={11}
                className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone: Remove Store Account */}
        <div className="p-5 rounded-3xl bg-rose-50/60 border border-rose-200 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Remove Store & Merchant Account</span>
              </span>
              <p className="text-xs text-rose-700 mt-1">
                Permanently delete this store profile, product inventory, and merchant database records.
              </p>
            </div>
            <button
              type="button"
              data-testid="delete-store-button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shadow-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Store Account</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            data-testid="reset-store-profile-button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Saved</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isUploadingBanner}
            data-testid="save-store-profile-button"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-cream-100 text-xs font-bold transition-all shadow-warm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-terracotta-400" />
                <span>Save Store Profile</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Remove Store Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 bg-forest-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-cream-100 rounded-3xl max-w-md w-full p-6 border border-rose-200 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-forest-950">
                  Delete Merchant Store?
                </h3>
                <p className="text-xs text-forest-600 mt-1">
                  This action is permanent and cannot be undone. All listings, settings, and database entries for{" "}
                  <strong>{name || "your store"}</strong> will be permanently wiped.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeletingStore}
                  className="px-4 py-2 bg-cream-200 hover:bg-cream-300 text-forest-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-testid="confirm-delete-store-button"
                  onClick={handleDeleteStore}
                  disabled={isDeletingStore}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isDeletingStore ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting Store...</span>
                    </>
                  ) : (
                    <span>Yes, Delete Store</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
