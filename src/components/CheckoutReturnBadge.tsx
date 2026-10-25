"use client";

import React from "react";
import Link from "next/link";
import { RotateCcw, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { CHECKOUT_RETURN_BADGES } from "@/lib/legalPolicies";

interface CheckoutReturnBadgeProps {
  className?: string;
  variant?: "compact" | "detailed";
  showLink?: boolean;
}

/**
 * Section 5.1 Checkout Return & Refund Badge
 * 3 Pillars:
 * 1. Easy 7-Day Returns (Hassle-free doorstep returns on eligible items)
 * 2. Instant Refund Processing (Reversals initiated immediately upon verification)
 * 3. 100% Safe Payments (Encrypted UPI, Cards & NetBanking transactions)
 */
export function CheckoutReturnBadge({
  className = "",
  variant = "compact",
  showLink = true,
}: CheckoutReturnBadgeProps) {
  const icons = [
    <RotateCcw key="return" className="w-3.5 h-3.5 text-terracotta-600 shrink-0" />,
    <Zap key="refund" className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
    <ShieldCheck key="safe" className="w-3.5 h-3.5 text-forest-700 shrink-0" />,
  ];

  if (variant === "compact") {
    return (
      <div
        data-testid="checkout-return-refund-badge"
        className={`p-3 rounded-2xl bg-cream-100/90 border border-cream-300 space-y-2 ${className}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-forest-700 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Buyer Protection & Guarantee</span>
          </span>
          {showLink && (
            <Link
              href="/policies?tab=returns"
              target="_blank"
              className="text-[10px] font-bold text-terracotta-700 hover:text-terracotta-800 underline inline-flex items-center gap-0.5"
            >
              <span>Policy</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
          {CHECKOUT_RETURN_BADGES.map((badge, idx) => (
            <div
              key={badge.id || `badge-compact-${idx}`}
              className="p-2 rounded-xl bg-white/90 border border-cream-200/80 space-y-0.5 shadow-2xs"
            >
              <div className="flex items-center gap-1.5">
                {icons[idx]}
                <span className="font-bold text-[11px] text-forest-950 truncate">
                  {badge.title}
                </span>
              </div>
              <p className="text-[10px] text-forest-600 line-clamp-2 leading-tight">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="checkout-return-refund-badge"
      className={`p-4 rounded-3xl bg-cream-50 border border-cream-300 space-y-3.5 shadow-warm ${className}`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-cream-200">
        <div>
          <h4 className="font-serif font-bold text-xs sm:text-sm text-forest-950">
            Localloop Buyer Guarantee
          </h4>
          <p className="text-[11px] text-forest-600">
            Hyperlocal consumer guidelines and return assurance across Hubli-Dharwad.
          </p>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
          Verified Safe
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {CHECKOUT_RETURN_BADGES.map((badge, idx) => (
          <div
            key={badge.id || `badge-detailed-${idx}`}
            className="p-3 rounded-2xl bg-cream-100 border border-cream-200 space-y-1"
          >
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-lg bg-white border border-cream-300 shadow-2xs">
                {icons[idx]}
              </div>
              <span className="font-bold text-xs text-forest-950">{badge.title}</span>
            </div>
            <p className="text-[11px] text-forest-700 leading-snug">{badge.desc}</p>
            <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-terracotta-700 bg-terracotta-50 border border-terracotta-200 px-1.5 py-0.5 rounded-md mt-1">
              {badge.highlight}
            </span>
          </div>
        ))}
      </div>

      {showLink && (
        <div className="pt-2 border-t border-cream-200 flex items-center justify-between text-[11px] text-forest-600">
          <span>Need return assistance or support?</span>
          <Link
            href="/policies?tab=returns"
            className="font-bold text-terracotta-700 hover:text-terracotta-800 underline inline-flex items-center gap-1"
          >
            <span>Read Complete Legal Policies &amp; FAQs</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
