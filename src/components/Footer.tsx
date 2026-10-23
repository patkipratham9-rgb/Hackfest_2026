"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Heart,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";

export function Footer() {
  const [activeModal, setActiveModal] = useState<"terms" | "privacy" | "merchant" | null>(null);
  const currentYear = 2026;

  return (
    <footer className="mt-16 bg-cream-200/90 border-t border-cream-300 text-forest-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Hubballi Identity */}
          <div className="space-y-3 md:col-span-1">
            <Link
              href="/"
              aria-label="LocalLoop Home"
              className="inline-flex items-center gap-2 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-terracotta-600 flex items-center justify-center text-cream-50 font-bold text-lg shadow-xs group-hover:scale-105 transition-transform">
                <span className="font-serif">L</span>
                <span className="w-2 h-2 rounded-full bg-cream-50 -ml-0.5 mt-1.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-forest-950 leading-none">
                  LocalLoop<span className="text-terracotta-600">.</span>
                </span>
                <span className="text-[10px] font-semibold text-terracotta-700 tracking-wider uppercase mt-0.5">
                  Hubballi-Dharwad
                </span>
              </div>
            </Link>

            <p className="text-xs text-forest-700 leading-relaxed">
              Your city’s hyperlocal digital marketplace. Connecting authentic corner shops in Vidyanagar, Station Road, CBT, and Gokul Road with citywide shoppers.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-forest-800 pt-1">
              <ShieldCheck className="w-4 h-4 text-forest-600 shrink-0" />
              <span>100% Verified Local Sellers</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-forest-950 uppercase tracking-wider">
              Explore Marketplace
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
                  Buyer Profile &amp; Address Book
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-terracotta-600 transition-colors">
                  Customer Sign In (Phone OTP)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Merchant Partner Portal */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-forest-950 uppercase tracking-wider">
              Merchant Cockpit
            </h4>
            <ul className="space-y-2 text-xs text-forest-700 font-medium">
              <li>
                <Link
                  href="/seller"
                  className="font-bold text-terracotta-700 hover:text-terracotta-800 transition-colors flex items-center gap-1"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Partner Portal (/seller)</span>
                </Link>
              </li>
              <li>
                <Link href="/seller/orders" className="hover:text-terracotta-600 transition-colors">
                  Fulfillment Kanban Board
                </Link>
              </li>
              <li>
                <Link href="/seller/products" className="hover:text-terracotta-600 transition-colors">
                  Product Catalog &amp; AI Helper
                </Link>
              </li>
              <li>
                <Link href="/seller/growth" className="hover:text-terracotta-600 transition-colors">
                  Growth Coach &amp; Traffic Analytics
                </Link>
              </li>
              <li>
                <Link href="/seller/store" className="hover:text-terracotta-600 transition-colors">
                  Store Presence &amp; Hours
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hubballi Coordinates */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-forest-950 uppercase tracking-wider">
              Direct Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-forest-700">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-terracotta-600 shrink-0" />
                <a
                  href="tel:+919845122334"
                  className="font-bold text-forest-900 hover:text-terracotta-600 transition-colors cursor-pointer"
                  title="Call LocalLoop Support"
                >
                  +91 98451 22334
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-terracotta-600 shrink-0" />
                <a
                  href="mailto:pratham.patki@kletech.ac.in"
                  className="font-bold text-forest-900 hover:text-terracotta-600 transition-colors cursor-pointer truncate"
                  title="Email LocalLoop Team"
                >
                  pratham.patki@kletech.ac.in
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  KLE Tech Campus, Vidyanagar, Hubballi-Dharwad, Karnataka 580031
                </span>
              </li>
            </ul>

            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveModal("terms")}
                className="text-[11px] text-forest-600 hover:underline"
              >
                Terms
              </button>
              <span className="text-forest-400">•</span>
              <button
                type="button"
                onClick={() => setActiveModal("privacy")}
                className="text-[11px] text-forest-600 hover:underline"
              >
                Privacy
              </button>
              <span className="text-forest-400">•</span>
              <button
                type="button"
                onClick={() => setActiveModal("merchant")}
                className="text-[11px] text-forest-600 hover:underline"
              >
                Fair Trade Code
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-6 border-t border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-forest-600">
          <p>
            © {currentYear} <strong>LocalLoop</strong> • Built with pride by Team Digital Titans.
          </p>
          <p className="flex items-center gap-1.5">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-terracotta-600 fill-terracotta-600" />
            <span>for Hubballi-Dharwad Local Merchants</span>
          </p>
        </div>
      </div>

      {/* Info Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-cream-50 rounded-3xl p-6 border border-cream-300 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-cream-200">
              <h3 className="font-serif font-bold text-lg text-forest-950">
                {activeModal === "terms" && "Terms of Service"}
                {activeModal === "privacy" && "Privacy & Consumer Safety"}
                {activeModal === "merchant" && "Fair Share Merchant Code"}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-forest-600 hover:bg-cream-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-forest-800 space-y-3 leading-relaxed">
              {activeModal === "terms" && (
                <>
                  <p>
                    LocalLoop provides a hyper-local digital storefront platform allowing verified corner shop merchants in Hubballi-Dharwad to list authentic merchandise for customer counter pickup.
                  </p>
                  <p>
                    All orders are reserved atomically. Customers receive a 4-digit verification PIN to confirm pickup at the shop counter.
                  </p>
                </>
              )}
              {activeModal === "privacy" && (
                <>
                  <p>
                    Your privacy is protected. Customer phone numbers and saved addresses (Primary, Home, Office, Others) are encrypted and used solely for counter pickup verification and order status notifications.
                  </p>
                  <p>
                    We never sell or distribute consumer telemetry or contact details to third-party ad networks.
                  </p>
                </>
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
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-forest-900 text-cream-50 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
