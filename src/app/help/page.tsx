"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  RotateCcw,
  Truck,
  ShieldCheck,
  Phone,
  Mail,
  ArrowLeft,
  ArrowRight,
  Package,
} from "lucide-react";
import {
  HELP_CENTER_FAQS,
  CUSTOMER_SUPPORT,
  GRIEVANCE_OFFICER,
  CHECKOUT_RETURN_BADGES,
} from "@/lib/legalPolicies";

export default function HelpCenterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "ordering" | "returns" | "refunds">("all");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const filtered = HELP_CENTER_FAQS.filter((faq) => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-cream-100 py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-terracotta-700 transition-colors bg-white px-3.5 py-1.5 rounded-xl border border-cream-300 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Hero Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200 text-forest-800 text-[11px] font-bold border border-cream-300">
            <HelpCircle className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Localloop Customer Help Center &amp; Support</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-forest-950">
            How Can We Help You Today?
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 max-w-lg mx-auto leading-relaxed">
            Quick answers regarding order tracking, 1-minute cancellations, doorstep returns, instant refunds, and legal policies across Hubballi-Dharwad.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="w-4 h-4 text-forest-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions (e.g. track order, return pickup, cancel window, COD)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-cream-300 text-xs sm:text-sm text-forest-950 shadow-warm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
          />
        </div>

        {/* Quick Return & Refund Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-3xl bg-white border border-cream-300 shadow-warm">
          {CHECKOUT_RETURN_BADGES.map((b, idx) => (
            <div key={b.id || `help-badge-${idx}`} className="p-3 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
              <span className="font-bold text-xs text-forest-950 block">{b.title}</span>
              <p className="text-[11px] text-forest-600 leading-snug">{b.desc}</p>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-terracotta-700 bg-terracotta-50 px-1.5 py-0.5 rounded border border-terracotta-200 inline-block mt-0.5">
                {b.highlight}
              </span>
            </div>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-forest-900 text-white shadow-xs"
                : "bg-white text-forest-700 border border-cream-300 hover:bg-cream-200"
            }`}
          >
            All Questions ({HELP_CENTER_FAQS.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("ordering")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "ordering"
                ? "bg-forest-900 text-white shadow-xs"
                : "bg-white text-forest-700 border border-cream-300 hover:bg-cream-200"
            }`}
          >
            A. Ordering &amp; Cancellations
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("returns")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "returns"
                ? "bg-forest-900 text-white shadow-xs"
                : "bg-white text-forest-700 border border-cream-300 hover:bg-cream-200"
            }`}
          >
            B. Returns &amp; Exchanges
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("refunds")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === "refunds"
                ? "bg-forest-900 text-white shadow-xs"
                : "bg-white text-forest-700 border border-cream-300 hover:bg-cream-200"
            }`}
          >
            C. Refunds &amp; Doorstep Pick-Up
          </button>
        </div>

        {/* FAQs List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-warm space-y-3">
          <h2 className="font-serif font-bold text-base sm:text-lg text-forest-950 pb-2 border-b border-cream-200">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3 pt-1">
            {filtered.map((faq, idx) => {
              const isOpen = expandedIndex === idx || Boolean(searchTerm.trim());
              return (
                <div
                  key={idx}
                  className="border border-cream-200 rounded-2xl bg-cream-50/70 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left font-bold text-xs sm:text-sm text-forest-950 hover:bg-cream-100 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        faq.category === "ordering"
                          ? "bg-terracotta-500"
                          : faq.category === "returns"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`} />
                      <span>{faq.question}</span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-forest-500 transition-transform ${
                        isOpen ? "rotate-180 text-terracotta-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-1 border-t border-cream-200/60 text-xs sm:text-sm text-forest-700 whitespace-pre-line leading-relaxed bg-white">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legal Policies Deep Link */}
          <div className="pt-6 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-forest-600">
            <span>Looking for official legal policy documents?</span>
            <div className="flex items-center gap-3">
              <Link
                href="/policies?tab=terms"
                className="font-bold text-terracotta-700 hover:underline"
              >
                Terms &amp; Conditions
              </Link>
              <span>•</span>
              <Link
                href="/policies?tab=privacy"
                className="font-bold text-terracotta-700 hover:underline"
              >
                Privacy Policy
              </Link>
              <span>•</span>
              <Link
                href="/policies?tab=returns"
                className="font-bold text-terracotta-700 hover:underline"
              >
                Return &amp; Refund Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Support Footer */}
        <div className="p-6 rounded-3xl bg-forest-900 text-cream-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-warm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif font-bold text-lg text-cream-50">
              Need personalized assistance?
            </h3>
            <p className="text-xs text-cream-200">
              Localloop Hubballi-Dharwad support desk is active Monday to Saturday.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href={`tel:${CUSTOMER_SUPPORT.helpline}`}
              className="px-4 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              Call {CUSTOMER_SUPPORT.helpline}
            </a>
            <a
              href={`mailto:${CUSTOMER_SUPPORT.deskEmail}`}
              className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-cream-100 text-xs font-bold border border-forest-700 transition-all"
            >
              Email Desk
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
