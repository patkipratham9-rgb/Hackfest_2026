"use client";

import React from "react";
import { useSeller } from "@/context/SellerContext";
import { Sparkles, TrendingUp, Lightbulb, Users, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SellerGrowthPage() {
  const { activeStore } = useSeller();

  const insights = [
    {
      id: "insight-1",
      title: "Weekend Diya & Festive Spike",
      metric: "+34% Search Interest",
      desc: "Shoppers in Vidyanagar and CBT are frequently searching for clay craft items on Friday and Saturday evenings. We recommend keeping 10 pre-packed sets ready near the counter for express pickup.",
      badge: "High Impact",
    },
    {
      id: "insight-2",
      title: "Filter Coffee Repeat Orders",
      metric: "72% Reorder Rate",
      desc: "500g Chicory Filter Coffee bags have the highest reorder frequency in Hubballi. Setting a small 5% bulk discount on 2+ packs can boost multi-pack cart additions.",
      badge: "Loyalty Driver",
    },
    {
      id: "insight-3",
      title: "Storefront Pickup Speed",
      metric: "Avg. 14 mins fulfillment",
      desc: "Your counter packing speed is within the top 5% of Hubballi artisan shops, contributing to a 4.9-star shopper rating.",
      badge: "Operational Excellence",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-cream-300">
        <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
          AI Merchant Intelligence
        </span>
        <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-forest-950">
          Growth Coach Digest
        </h1>
        <p className="text-xs text-forest-600 mt-0.5">
          Data-driven tips derived from neighborhood shopper trends in Hubballi
        </p>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-3 shadow-warm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-forest-800 text-cream-100">
                  <Sparkles className="w-4 h-4 text-terracotta-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-forest-950">{insight.title}</h3>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {insight.metric}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-700 bg-terracotta-100 px-2.5 py-1 rounded-full">
                {insight.badge}
              </span>
            </div>

            <p className="text-xs text-forest-700 leading-relaxed bg-cream-100 p-3.5 rounded-2xl border border-cream-200">
              {insight.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
