"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Heart,
  ShoppingBag,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Check,
  X,
  Truck,
  RotateCcw,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import {
  GRIEVANCE_OFFICER,
  CUSTOMER_SUPPORT,
  DATA_COLLECTION_TABLE,
  DELIVERY_TIMELINES_TABLE,
  RETURN_WINDOWS_TABLE,
  REFUND_SETTLEMENT_TABLE,
  HELP_CENTER_FAQS,
} from "@/lib/legalPolicies";

export function Footer() {
  const pathname = usePathname();
  const [activeModal, setActiveModal] = useState<
    "terms" | "privacy" | "shipping" | "returns" | "merchant" | "help" | "feedback" | null
  >(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const currentYear = 2026;

  if (pathname?.startsWith("/login") || pathname?.startsWith("/merchant/login")) {
    return null;
  }

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackText("");
      setActiveModal(null);
    }, 2200);
  };

  return (
    <footer className="mt-16 bg-cream-200/90 border-t border-cream-300 text-forest-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-28 sm:pb-12 space-y-10">
        {/* Top Brand & Hubballi-Dharwad Highlights Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-cream-300/80">
          {/* Brand Identity */}
          <div className="space-y-2 max-w-xl">
            <Link
              href="/"
              aria-label="LocalLoop Home"
              className="inline-flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-cream-300 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform overflow-hidden p-0.5">
                <img
                  src="/logo.png"
                  alt="LocalLoop Logo"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-forest-950 leading-none">
                  LocalLoop<span className="text-terracotta-600">.</span>
                </span>
                <span className="text-[11px] font-bold text-terracotta-700 tracking-wider uppercase mt-1">
                  Hubballi-Dharwad Hyperlocal Marketplace
                </span>
              </div>
            </Link>
            <p className="text-xs text-forest-700 leading-relaxed">
              Your twin cities’ local commerce network. Connecting authentic neighborhood stores in Vidyanagar, Station Road, CBT, Durgadbail, Keshwapur, and Dharwad with direct counter pickup and local delivery.
            </p>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2.5 p-3 bg-cream-50 rounded-2xl border border-cream-300 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="text-[11px] leading-tight">
                <p className="font-bold text-forest-950">100% Verified</p>
                <p className="text-forest-600">Hubli Local Sellers</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-cream-50 rounded-2xl border border-cream-300 shadow-xs">
              <Clock className="w-4 h-4 text-terracotta-600 shrink-0" />
              <div className="text-[11px] leading-tight">
                <p className="font-bold text-forest-950">Direct Counter Pickup</p>
                <p className="text-forest-600">Secure 4-Digit PIN</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-cream-50 rounded-2xl border border-cream-300 shadow-xs">
              <Heart className="w-4 h-4 text-terracotta-600 shrink-0" />
              <div className="text-[11px] leading-tight">
                <p className="font-bold text-forest-950">Zero Predatory Fees</p>
                <p className="text-forest-600">Fair Share Code</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Main Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1: Hubballi-Dharwad Markets */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-forest-950 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Local Markets</span>
            </h4>
            <ul className="space-y-2 text-xs text-forest-700 font-medium">
              <li>
                <Link href="/?search=Vidyanagar" className="hover:text-terracotta-600 transition-colors">
                  Vidyanagar &amp; Shirur Park
                </Link>
              </li>
              <li>
                <Link href="/?search=Station%20Road" className="hover:text-terracotta-600 transition-colors">
                  Station Road &amp; Durgadbail
                </Link>
              </li>
              <li>
                <Link href="/?search=CBT" className="hover:text-terracotta-600 transition-colors">
                  CBT &amp; Broadway Bazaar
                </Link>
              </li>
              <li>
                <Link href="/?search=Gokul%20Road" className="hover:text-terracotta-600 transition-colors">
                  Gokul Road &amp; Industrial
                </Link>
              </li>
              <li>
                <Link href="/?search=Keshwapur" className="hover:text-terracotta-600 transition-colors">
                  Keshwapur &amp; Deshpande Ngr
                </Link>
              </li>
              <li>
                <Link href="/?search=Dharwad" className="hover:text-terracotta-600 transition-colors">
                  Dharwad City Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Explore Marketplace */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-forest-950 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Explore Marketplace</span>
            </h4>
            <ul className="space-y-2 text-xs text-forest-700 font-medium">
              <li>
                <Link href="/" className="hover:text-terracotta-600 transition-colors">
                  Storefront Discovery
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-terracotta-600 transition-colors">
                  Product Categories
                </Link>
              </li>
              <li>
                <Link href="/orders-again" className="hover:text-terracotta-600 transition-colors">
                  Repeat Past Orders
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-terracotta-600 transition-colors">
                  Buyer Profile &amp; Addresses
                </Link>
              </li>
              <li>
                <Link href="/login/user" className="hover:text-terracotta-600 transition-colors">
                  Customer Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Need Help & Support */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-forest-950 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Help &amp; Support</span>
            </h4>
            <ul className="space-y-2 text-xs text-forest-700 font-medium">
              <li>
                <Link
                  href="/help"
                  className="font-bold text-terracotta-700 hover:text-terracotta-800 transition-colors flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3 text-terracotta-600" />
                  <span>Customer Help Center FAQs</span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("help")}
                  className="hover:text-terracotta-600 transition-colors text-left cursor-pointer"
                >
                  Contact Support Desk
                </button>
              </li>
              <li>
                <a
                  href="tel:+919886012345"
                  className="hover:text-terracotta-600 transition-colors block text-forest-700"
                >
                  Helpline: +91 98860 12345
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@localloop.in?subject=LocalLoop%20Support%20Request"
                  className="hover:text-terracotta-600 transition-colors block text-forest-700"
                >
                  support@localloop.in
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("feedback")}
                  className="hover:text-terracotta-600 transition-colors text-left cursor-pointer block"
                >
                  Feedback &amp; Suggestions
                </button>
              </li>
              <li>
                <Link
                  href="/policies?tab=terms"
                  className="hover:text-terracotta-600 transition-colors block text-forest-600 text-[11px] pt-1"
                >
                  Grievance Officer: Pratham Patki
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Policies & Trust */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-forest-950 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Policies &amp; Trust</span>
            </h4>
            <ul className="space-y-2 text-xs text-forest-700 font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("terms")}
                  className="hover:text-terracotta-600 transition-colors text-left cursor-pointer"
                >
                  1. Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("privacy")}
                  className="hover:text-terracotta-600 transition-colors text-left cursor-pointer"
                >
                  2. Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("shipping")}
                  className="hover:text-terracotta-600 transition-colors text-left cursor-pointer"
                >
                  3. Shipping &amp; Delivery Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal("returns")}
                  className="hover:text-terracotta-600 transition-colors text-left cursor-pointer"
                >
                  4. Cancellation &amp; Refund Policy
                </button>
              </li>
              <li>
                <Link
                  href="/policies"
                  className="font-bold text-terracotta-700 hover:text-terracotta-800 transition-colors inline-flex items-center gap-1 pt-0.5"
                >
                  <span>View All Policies Full Page</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </li>
            </ul>

            <div className="pt-2 text-[11px] text-forest-600 leading-relaxed border-t border-cream-300">
              Serving Hubballi-Dharwad with 100% direct merchant settlements and transparent pricing.
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-6 border-t border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forest-600">
          <p>
            © {currentYear} <strong>LocalLoop</strong> • Hubballi-Dharwad Hyperlocal Marketplace.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <p className="flex items-center gap-1.5">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-terracotta-600 fill-terracotta-600" />
              <span>for Hubballi-Dharwad Local Merchants &amp; Shoppers</span>
            </p>
            <span className="text-[11px] font-mono text-forest-700 bg-cream-300 px-2.5 py-0.5 rounded-full font-bold">
              v1.0.0
            </span>
          </div>
        </div>
      </div>

      {/* Info & Support Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-cream-50 rounded-3xl p-6 border border-cream-300 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-cream-200">
              <h3 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
                {activeModal === "terms" && "Terms and Conditions"}
                {activeModal === "privacy" && "Privacy Policy"}
                {activeModal === "shipping" && "Shipping and Delivery Policy"}
                {activeModal === "returns" && "Cancellation, Return & Refund Policy"}
                {activeModal === "merchant" && "Fair Share Merchant Code"}
                {activeModal === "help" && "Hubballi-Dharwad Help & Support"}
                {activeModal === "feedback" && "Share Your Feedback"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setFeedbackSubmitted(false);
                }}
                className="p-1 rounded-full text-forest-600 hover:bg-cream-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-forest-800 space-y-3 leading-relaxed">
              {activeModal === "terms" && (
                <div className="space-y-3">
                  <p>
                    <strong>1. Terms and Conditions:</strong> Governs access to Localloop website, mobile applications, and services. Operates e-commerce connecting buyers with local sellers across Hubballi-Dharwad.
                  </p>
                  <p>
                    <strong>1.1 General &amp; Age:</strong> Must be at least 18 years old or legal majority. Minors may use only under guardian supervision.
                  </p>
                  <p>
                    <strong>1.3 Pricing &amp; Tax:</strong> All prices in INR inclusive of applicable taxes. In pricing error, Localloop reserves the right to cancel.
                  </p>
                  <p>
                    <strong>1.10 Governing Law:</strong> Governed by laws of India. Legal proceedings exclusively in competent courts at <strong>Hubballi, Karnataka, India</strong>.
                  </p>
                  <div className="p-3 rounded-xl bg-cream-100 border border-cream-200">
                    <p className="font-bold text-forest-950">1.12 Grievance Officer</p>
                    <p>{GRIEVANCE_OFFICER.name} ({GRIEVANCE_OFFICER.designation})</p>
                    <p>{GRIEVANCE_OFFICER.address}</p>
                    <p>Email: {GRIEVANCE_OFFICER.email} • Tel: {GRIEVANCE_OFFICER.phone}</p>
                  </div>
                  <Link
                    href="/policies?tab=terms"
                    onClick={() => setActiveModal(null)}
                    className="inline-flex items-center gap-1 font-bold text-terracotta-700 hover:underline pt-1"
                  >
                    <span>Read Full 12 Clauses on Dedicated Policies Page &rarr;</span>
                  </Link>
                </div>
              )}

              {activeModal === "privacy" && (
                <div className="space-y-3">
                  <p>
                    <strong>2. Privacy Policy:</strong> Explains how we collect, use, disclose, and safeguard your information.
                  </p>
                  <div className="p-2.5 bg-cream-100 rounded-xl space-y-1.5 border border-cream-200">
                    <p className="font-bold text-forest-950">Data Collected &amp; Purpose</p>
                    {DATA_COLLECTION_TABLE.map((row, i) => (
                      <p key={`data-row-${i}`} className="text-[11px]">
                        <strong>{row.category}:</strong> {row.description}
                      </p>
                    ))}
                  </div>
                  <p>
                    <strong>Security:</strong> All sensitive payment credentials handled directly by PCI-DSS compliant gateways. Data stored on secure cloud servers. Permanent deletion supported upon request.
                  </p>
                  <div className="p-3 rounded-xl bg-cream-100 border border-cream-200">
                    <p className="font-bold text-forest-950">2.10 Privacy Grievance Officer</p>
                    <p>{GRIEVANCE_OFFICER.name} • {GRIEVANCE_OFFICER.email}</p>
                  </div>
                  <Link
                    href="/policies?tab=privacy"
                    onClick={() => setActiveModal(null)}
                    className="inline-flex items-center gap-1 font-bold text-terracotta-700 hover:underline pt-1"
                  >
                    <span>Read Full Privacy Policy &amp; Data Rights &rarr;</span>
                  </Link>
                </div>
              )}

              {activeModal === "shipping" && (
                <div className="space-y-3">
                  <p>
                    <strong>3. Shipping &amp; Delivery Policy:</strong> High-efficiency shipping with hyper-local delivery across Hubballi-Dharwad.
                  </p>
                  <div className="p-2.5 bg-cream-100 rounded-xl space-y-1 border border-cream-200">
                    <p className="font-bold text-forest-950">Estimated Timelines</p>
                    {DELIVERY_TIMELINES_TABLE.map((t, i) => (
                      <div key={`delivery-timeline-${i}`} className="flex justify-between text-[11px] py-0.5 border-b border-cream-200 last:border-0">
                        <span className="font-semibold">{t.mode} ({t.area}):</span>
                        <span className="font-mono text-terracotta-700 font-bold">{t.window}</span>
                      </div>
                    ))}
                  </div>
                  <p>
                    <strong>Rates:</strong> Base delivery up to 3 km is FREE (₹0). Distance &gt; 3 km is ₹15 per additional km. Up to 3 delivery attempts made before return.
                  </p>
                  <Link
                    href="/policies?tab=shipping"
                    onClick={() => setActiveModal(null)}
                    className="inline-flex items-center gap-1 font-bold text-terracotta-700 hover:underline pt-1"
                  >
                    <span>Read Full Shipping Policy &amp; Timelines &rarr;</span>
                  </Link>
                </div>
              )}

              {activeModal === "returns" && (
                <div className="space-y-3">
                  <p>
                    <strong>4. Cancellation, Return, and Refund Policy:</strong> Outlines processes, criteria, and timelines for cancellations, returns, and refunds.
                  </p>
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-950 font-medium">
                    ⏱️ <strong>1-Minute Grace Window:</strong> Instant 100% full refund available for 60 seconds immediately post-payment.
                  </div>
                  <div className="p-2.5 bg-cream-100 rounded-xl space-y-1 border border-cream-200">
                    <p className="font-bold text-forest-950">Category Return Windows</p>
                    {RETURN_WINDOWS_TABLE.map((r, i) => (
                      <div key={`return-window-${i}`} className="flex justify-between text-[11px] py-0.5 border-b border-cream-200 last:border-0">
                        <span>{r.category}:</span>
                        <span className="font-semibold text-terracotta-700">{r.window}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-2.5 bg-cream-100 rounded-xl space-y-1 border border-cream-200">
                    <p className="font-bold text-forest-950">Refund Processing Speeds</p>
                    {REFUND_SETTLEMENT_TABLE.map((s, i) => (
                      <div key={`refund-settlement-${i}`} className="flex justify-between text-[11px] py-0.5 border-b border-cream-200 last:border-0">
                        <span>{s.paymentMode}:</span>
                        <span className="font-mono text-emerald-800 font-bold">{s.processingTime}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href="/policies?tab=returns"
                    onClick={() => setActiveModal(null)}
                    className="inline-flex items-center gap-1 font-bold text-terracotta-700 hover:underline pt-1"
                  >
                    <span>Read Full Return &amp; Refund Guidelines &rarr;</span>
                  </Link>
                </div>
              )}

              {activeModal === "merchant" && (
                <>
                  <p>
                    Unlike predatory aggregator apps that take 25–35% of local shop margins, LocalLoop charges a flat, nominal fair-share platform fee of ₹15 per order.
                  </p>
                  <p>
                    100% of product revenue settles directly to the local merchant counter via UPI or in-person cash settlement.
                  </p>
                </>
              )}

              {activeModal === "help" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 space-y-2">
                    <p className="font-bold text-forest-950">Twin Cities Customer Helpline</p>
                    <p className="text-forest-700">Available Monday to Sunday, 9:00 AM – 9:00 PM IST</p>
                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                      <a
                        href="tel:+919886012345"
                        className="px-4 py-2 bg-terracotta-600 hover:bg-terracotta-700 text-white rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call +91 98860 12345</span>
                      </a>
                      <a
                        href="mailto:support@localloop.in?subject=Help%20Request%20-%20LocalLoop"
                        className="px-4 py-2 bg-cream-200 hover:bg-cream-300 text-forest-950 rounded-xl font-bold text-xs border border-cream-300 inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Support</span>
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-forest-950">Frequently Asked Questions</p>
                    <div className="space-y-1.5 text-forest-700">
                      <p>
                        <strong>How does counter pickup work?</strong>
                        <br />
                        Place your order online. You will get a 4-digit pickup PIN. Visit the store counter, show your PIN, and collect your fresh goods.
                      </p>
                      <p>
                        <strong>Which areas are covered?</strong>
                        <br />
                        We cover Vidyanagar, Shirur Park, Station Road, CBT, Durgadbail, Gokul Road, Keshwapur, Deshpande Nagar, and Dharwad.
                      </p>
                    </div>
                    <Link
                      href="/help"
                      onClick={() => setActiveModal(null)}
                      className="inline-flex items-center gap-1 font-bold text-terracotta-700 hover:underline pt-2 text-xs"
                    >
                      <span>Open Customer Help Center &amp; View All Categorized FAQs &rarr;</span>
                    </Link>
                  </div>
                </div>
              )}

              {activeModal === "feedback" && (
                <div>
                  {feedbackSubmitted ? (
                    <div className="p-6 text-center space-y-2">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-forest-950 text-sm">Thank You for Your Feedback!</p>
                      <p className="text-forest-600 text-xs">
                        Your input helps us improve LocalLoop for everyone in Hubballi-Dharwad.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                      <p className="text-forest-700">
                        Help us make LocalLoop better for Hubballi-Dharwad shoppers and shopkeepers.
                      </p>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-forest-900 uppercase">
                          How would you rate your experience?
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={`feedback-star-${star}`}
                              type="button"
                              onClick={() => setFeedbackRating(star)}
                              className={`w-9 h-9 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                                feedbackRating >= star
                                  ? "bg-terracotta-500 text-white"
                                  : "bg-cream-200 text-forest-700"
                              }`}
                            >
                              ★ {star}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-forest-900 uppercase">
                          Your Comments or Suggestions
                        </label>
                        <textarea
                          rows={3}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Tell us about shops you'd like to see, app experience, or delivery feedback..."
                          className="w-full p-3 text-xs bg-cream-100 border border-cream-300 rounded-xl focus:outline-none focus:border-terracotta-500"
                          required
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveModal(null)}
                          className="px-4 py-2 rounded-xl bg-cream-200 text-forest-800 text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-bold shadow-warm cursor-pointer transition-colors"
                        >
                          Submit Feedback
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {activeModal !== "feedback" && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-forest-900 text-cream-50 font-bold text-xs cursor-pointer hover:bg-forest-950 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
