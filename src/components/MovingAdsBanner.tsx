"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  MapPin,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Tag,
  Clock,
  Flame,
  ArrowRight,
  ShieldCheck,
  Gift,
  Award,
} from "lucide-react";

export interface AdSlide {
  id: string;
  badge: string;
  badgeIcon: "sparkles" | "flame" | "gift" | "clock" | "award";
  taglineSmall: string;
  title: string;
  titleHighlight: string;
  description: string;
  offerPill: string;
  bgGradient: string;
  accentColor: string;
  primaryCtaText: string;
  primaryCtaHref?: string;
  primaryCtaAction?: "location" | "catalog";
  secondaryCtaText: string;
  secondaryCtaHref: string;
  categoryTag?: string;
}

interface MovingAdsBannerProps {
  userLocation?: string | null;
  onOpenLocationModal: () => void;
  slides?: AdSlide[];
}

export const DEFAULT_ADS: AdSlide[] = [
  {
    id: "ad-hubballi-hyperlocal",
    badge: "Official City Marketplace • Hubli-Dharwad",
    badgeIcon: "sparkles",
    taglineSmall: "Hyperlocal Marketplace • Direct Store Pickup",
    title: "Your city’s hyperlocal digital marketplace.",
    titleHighlight:
      "Connecting authentic corner shops across Hubli-Dharwad with citywide shoppers.",
    description:
      "Support independent local vendors in Hubli-Dharwad. Choose Home Delivery or express Counter Pick-up with zero markups.",
    offerPill: "⚡ FLAT 20% OFF FIRST 3 ORDERS • CODE: LOCAL20",
    bgGradient: "from-forest-900 via-forest-800 to-forest-950",
    accentColor: "text-terracotta-400",
    primaryCtaText: "Change Location",
    primaryCtaAction: "location",
    secondaryCtaText: "Explore Catalog",
    secondaryCtaHref: "/categories",
  },
  {
    id: "ad-dharwad-pedha",
    badge: "GI Tagged Heritage • Fresh Daily",
    badgeIcon: "flame",
    taglineSmall: "Babusingh & Mishra Line Bazaar Specials",
    title: "Authentic Dharwad Pedha Delivered in 25 Mins.",
    titleHighlight:
      "Pure organic cow milk & natural cardamom aroma right to your door.",
    description:
      "Freshly prepared artisanal sweets from historic sweetmakers of Line Bazaar & Subhas Road. 100% genuine GI-certified taste.",
    offerPill: "🍬 BUY 2 GET 10% OFF • USE CODE: SWEET10",
    bgGradient: "from-amber-950 via-orange-900 to-stone-950",
    accentColor: "text-amber-300",
    primaryCtaText: "Explore Sweets & Bakery",
    secondaryCtaText: "View Local Shops",
    secondaryCtaHref: "/categories?category=Bakery",
    primaryCtaAction: "catalog",
  },
  {
    id: "ad-farm-produce",
    badge: "CBT & APMC Yard • Dawn Harvest",
    badgeIcon: "gift",
    taglineSmall: "Farm-to-Kitchen • 0 Cold Storage Delay",
    title: "Dawn Farm Harvest: Organic Greens & Staples.",
    titleHighlight:
      "Direct from Dharwad rural farmers with zero middleman commissions.",
    description:
      "Crisp leafy greens, cold-pressed groundnut oils, unpolished lentils, and local spices harvested just hours ago.",
    offerPill: "🥬 FREE DELIVERY ON ORDERS OVER ₹249",
    bgGradient: "from-emerald-950 via-teal-900 to-forest-950",
    accentColor: "text-emerald-300",
    primaryCtaText: "Explore Fresh Produce",
    secondaryCtaText: "Shop Daily Needs",
    secondaryCtaHref: "/categories?category=Grocery",
    primaryCtaAction: "catalog",
  },
  {
    id: "ad-handicrafts-khadi",
    badge: "Karnataka Heritage • Handloom & Terracotta",
    badgeIcon: "award",
    taglineSmall: "Over 100+ Local Artisans Empowered",
    title: "Dharwad Khadi, Terracotta Cookware & Brass Diyas.",
    titleHighlight:
      "Handmade crafts that celebrate our region's timeless heritage.",
    description:
      "Eco-friendly red clay handi pots, pure khadi kurtas, and festival decorations crafted by neighborhood artisans in Vidyanagar & Unkal.",
    offerPill: "🏺 DIRECT ARTISAN PRICING • ZERO PLATFORM SURCHARGE",
    bgGradient: "from-purple-950 via-slate-900 to-forest-950",
    accentColor: "text-purple-300",
    primaryCtaText: "Explore Handicrafts",
    secondaryCtaText: "View Artisan Goods",
    secondaryCtaHref: "/categories?category=Household",
    primaryCtaAction: "catalog",
  },
  {
    id: "ad-express-counter-pickup",
    badge: "Express 15-Min Pickup • Live Tracking",
    badgeIcon: "clock",
    taglineSmall: "Zero Wait In Queues • Safe & Instant",
    title: "Order Online & Grab at Counter with VIP PIN LL-593.",
    titleHighlight:
      "Your order is packed and sealed before you arrive at the lane shop.",
    description:
      "Love shopping in town? Place your order ahead of time and pick it up on your way home with instant OTP confirmation.",
    offerPill: "🚀 ZERO WAITING • READY IN 15 MINUTES",
    bgGradient: "from-rose-950 via-terracotta-900 to-stone-950",
    accentColor: "text-rose-300",
    primaryCtaText: "Set Delivery Location",
    primaryCtaAction: "location",
    secondaryCtaText: "Browse All Items",
    secondaryCtaHref: "/categories",
  },
];

export const TICKER_ITEMS = [
  "🔥 FLASH DEAL: Up to 20% Off on Dharwad Pedha",
  "🚚 FREE Delivery on orders above ₹249 in Vidyanagar & CBT",
  "⚡ Fresh Morning Harvest directly from APMC Dharwad",
  "🏺 Handcrafted Terracotta & Khadi with Zero Markups",
  "⏱️ Express 15-Minute Counter Pick-up with Secret VIP PIN",
  "🛡️ 100% Genuine Local Hubballi Artisans Verified",
];

export function MovingAdsBanner({
  userLocation,
  onOpenLocationModal,
  slides = DEFAULT_ADS,
}: MovingAdsBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 5000; // 5 seconds per moving ad
  const INTERVAL_STEP = 50;

  // Handle Auto-Advancing Slider
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setDirection(1);
          setCurrentIndex((curr) => (curr + 1) % slides.length);
          return 0;
        }
        return prev + (INTERVAL_STEP / SLIDE_DURATION) * 100;
      });
    }, INTERVAL_STEP);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const handleNext = () => {
    setDirection(1);
    setProgress(0);
    setCurrentIndex((curr) => (curr + 1) % slides.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setProgress(0);
    setCurrentIndex((curr) => (curr - 1 + slides.length) % slides.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setProgress(0);
    setCurrentIndex(index);
  };

  const currentAd = slides[currentIndex];

  const renderBadgeIcon = (icon: AdSlide["badgeIcon"]) => {
    switch (icon) {
      case "flame":
        return <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;
      case "gift":
        return <Gift className="w-3.5 h-3.5 text-emerald-400" />;
      case "clock":
        return <Clock className="w-3.5 h-3.5 text-rose-400" />;
      case "award":
        return <Award className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-terracotta-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Dynamic Animated Hero Advertisement Carousel */}
      <motion.section
        data-testid="home-hero-banner"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden rounded-3xl text-cream-100 shadow-warm-lg border border-cream-200/20 group select-none"
      >
        {/* Animated Background Slide */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentAd.id}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className={`relative p-6 sm:p-10 bg-gradient-to-br ${currentAd.bgGradient} min-h-[300px] sm:min-h-[340px] flex flex-col justify-between`}
          >
            {/* Subtle Decorative Pattern Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_50%)] pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-3.5">
              {/* Badge & Ticker Tag */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-xs font-semibold text-cream-200 shadow-xs">
                  {renderBadgeIcon(currentAd.badgeIcon)}
                  <span>{currentAd.badge}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-terracotta-500/30 text-terracotta-200 border border-terracotta-500/40">
                  <Tag className="w-2.5 h-2.5" />
                  <span>Moving Advertisement</span>
                </span>
              </div>

              {/* Headline & Highlights */}
              <div className="space-y-1">
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-cream-50 leading-[1.2]">
                  {currentAd.title}
                </h1>
                <p className={`font-serif text-base sm:text-lg md:text-xl italic font-semibold ${currentAd.accentColor} leading-snug`}>
                  {currentAd.titleHighlight}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-cream-200/90 max-w-xl leading-relaxed">
                {currentAd.description}
              </p>

              {/* Offer Pill */}
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-bold text-amber-300 shadow-xs">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentAd.offerPill}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {currentAd.primaryCtaAction === "location" ? (
                  <button
                    type="button"
                    onClick={onOpenLocationModal}
                    data-testid="hero-set-location-btn"
                    className="px-5 py-2.5 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-warm flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{userLocation ? "Change Location" : "Add / Share Location"}</span>
                  </button>
                ) : (
                  <Link
                    href={currentAd.secondaryCtaHref || "/categories"}
                    className="px-5 py-2.5 rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-warm flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{currentAd.primaryCtaText}</span>
                  </Link>
                )}

                <Link
                  href={currentAd.secondaryCtaHref || "/categories"}
                  className="px-5 py-2.5 rounded-full bg-cream-100/10 hover:bg-cream-100/20 text-cream-100 font-bold text-xs border border-cream-200/30 flex items-center gap-2 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-terracotta-400" />
                  <span>{currentAd.secondaryCtaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cream-200" />
                </Link>
              </div>
            </div>

            {/* Slider Bottom Controls & Progress Dots */}
            <div className="relative z-10 pt-6 flex items-center justify-between border-t border-white/10 mt-4">
              {/* Pagination Dots */}
              <div className="flex items-center gap-2">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => handleDotClick(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      currentIndex === idx
                        ? "w-8 h-2 bg-amber-400 shadow-xs"
                        : "w-2 h-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
                <span className="text-[11px] font-semibold text-cream-300 ml-1.5">
                  {currentIndex + 1} / {slides.length}
                </span>
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous advertisement"
                  className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-cream-100 border border-white/15 flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next advertisement"
                  className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-cream-100 border border-white/15 flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Live Auto-Moving Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden z-20">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-terracotta-400"
            style={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>
      </motion.section>

      {/* Moving Continuous Ticker Tape Marquee */}
      <div className="relative overflow-hidden rounded-2xl bg-forest-900 border border-forest-800 p-2 shadow-xs flex items-center">
        <div className="flex items-center gap-2 px-3 py-1 bg-terracotta-600 rounded-xl text-[11px] font-black uppercase tracking-wider text-white shrink-0 shadow-xs z-10">
          <Flame className="w-3.5 h-3.5 animate-pulse" />
          <span>Live Deals</span>
        </div>

        <div className="flex overflow-hidden whitespace-nowrap ml-3">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 25,
              ease: "linear",
            }}
            className="flex items-center gap-8 text-xs font-semibold text-cream-200"
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
              <span key={index} className="inline-flex items-center gap-2">
                <span>{item}</span>
                <span className="text-terracotta-400">•</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
