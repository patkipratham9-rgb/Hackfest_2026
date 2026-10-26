"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Store,
  ShieldCheck,
} from "lucide-react";
import { CUSTOMER_SUPPORT, GRIEVANCE_OFFICER } from "@/lib/legalPolicies";

const INQUIRY_CATEGORIES = [
  "Order Status & Delivery",
  "Product Quality / Returns",
  "Merchant Store Onboarding",
  "Payment & Refund Dispute",
  "Technical App Issue",
  "General Inquiry",
];

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState(INQUIRY_CATEGORIES[0]);
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setErrorMessage("Please write a message with at least 10 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          category,
          orderId: orderId.trim() || undefined,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTicketId(data.ticketId);
        setStatusMessage(data.message || "Message successfully sent!");
        // Reset form
        setFullName("");
        setEmail("");
        setPhone("");
        setOrderId("");
        setMessage("");
      } else {
        setErrorMessage(data.error || "Unable to send message. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <Breadcrumbs items={[{ name: "Contact Us" }]} />

        {/* Page Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-warm space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cream-100 text-forest-800 text-[11px] font-bold border border-cream-200 uppercase tracking-wider">
            <span>Local Desk Support • Hubballi-Dharwad</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-forest-950 tracking-tight">
            Contact LocalLoop Support
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 max-w-2xl leading-relaxed">
            Have questions about an order, merchant onboarding, or local delivery? Our Hubballi operations team is here to assist you promptly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Direct Contact Info */}
          <div className="space-y-4">
            {/* Phone Card */}
            <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-terracotta-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                    Customer Helpline
                  </h3>
                  <a
                    href={`tel:${CUSTOMER_SUPPORT.helpline}`}
                    className="text-sm font-bold text-terracotta-700 hover:text-terracotta-800"
                  >
                    {CUSTOMER_SUPPORT.helpline}
                  </a>
                </div>
              </div>
              <p className="text-[11px] text-forest-600">
                Operating Hours: 9:00 AM – 9:00 PM IST (Mon to Sun)
              </p>
            </div>

            {/* Email Card */}
            <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-forest-700" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                    Support Desk Email
                  </h3>
                  <a
                    href={`mailto:${CUSTOMER_SUPPORT.deskEmail}`}
                    className="text-xs font-bold text-forest-900 hover:underline break-all"
                  >
                    {CUSTOMER_SUPPORT.deskEmail}
                  </a>
                </div>
              </div>
              <p className="text-[11px] text-forest-600">
                Escalations:{" "}
                <a
                  href={`mailto:${CUSTOMER_SUPPORT.escalationsEmail}`}
                  className="font-semibold text-terracotta-700 hover:underline"
                >
                  {CUSTOMER_SUPPORT.escalationsEmail}
                </a>
              </p>
            </div>

            {/* Physical Headquarters */}
            <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-xs space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                    Operations Center
                  </h3>
                  <p className="text-xs font-semibold text-forest-800">
                    {CUSTOMER_SUPPORT.address}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-forest-600">
                Serving Vidyanagar, Station Road, CBT, Gokul Road, and Dharwad Center.
              </p>
            </div>

            {/* Quick Links Card */}
            <div className="bg-cream-200/80 p-5 rounded-2xl border border-cream-300 text-xs space-y-2">
              <h4 className="font-bold text-forest-950 uppercase tracking-wider">
                Common Inquiries
              </h4>
              <ul className="space-y-1.5 text-forest-700 font-medium">
                <li>
                  <Link href="/help" className="hover:text-terracotta-700 hover:underline flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Frequently Asked Questions</span>
                  </Link>
                </li>
                <li>
                  <Link href="/seller" className="hover:text-terracotta-700 hover:underline flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5" />
                    <span>Register as Local Merchant</span>
                  </Link>
                </li>
                <li>
                  <Link href="/policies" className="hover:text-terracotta-700 hover:underline flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Return &amp; Refund Policy</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Working Contact Form */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-warm space-y-6">
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-xl text-forest-950">
                Send a Message
              </h2>
              <p className="text-xs text-forest-600">
                Fill in the details below. Our desk will acknowledge and reply to your ticket within 2 to 4 business hours.
              </p>
            </div>

            {/* Success Message Banner */}
            {ticketId && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Message Received • Reference #{ticketId}</span>
                </div>
                <p>{statusMessage}</p>
                <p className="text-[11px] text-emerald-700 pt-1">
                  Keep reference <strong>{ticketId}</strong> for any follow-up with our helpline.
                </p>
              </div>
            )}

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest-900 block">
                    Full Name <span className="text-terracotta-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Pratham Patki"
                    className="w-full text-xs font-medium py-2.5 px-3.5 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-terracotta-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest-900 block">
                    Email Address <span className="text-terracotta-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pratham@example.com"
                    className="w-full text-xs font-medium py-2.5 px-3.5 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-terracotta-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest-900 block">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98451 22334"
                    className="w-full text-xs font-medium py-2.5 px-3.5 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-terracotta-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-forest-900 block">
                    Inquiry Topic
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-medium py-2.5 px-3.5 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-terracotta-400 focus:outline-none cursor-pointer"
                  >
                    {INQUIRY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-forest-900 block">
                  Order ID (Optional, if related to a purchase)
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. ORD-LL-5124"
                  className="w-full text-xs font-medium py-2.5 px-3.5 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-terracotta-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-forest-900 block">
                  Your Message <span className="text-terracotta-600">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question, request, or issue with as much detail as possible..."
                  className="w-full text-xs font-medium p-3.5 rounded-xl bg-cream-50 border border-cream-300 text-forest-950 focus:ring-2 focus:ring-terracotta-400 focus:outline-none leading-relaxed"
                />
              </div>

              <p className="text-[11px] text-forest-600">
                By submitting this form, you acknowledge that LocalLoop stores this inquiry to respond to your request as described in our{" "}
                <Link href="/privacy" className="text-terracotta-700 font-semibold hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-forest-900 hover:bg-forest-950 text-cream-100 font-bold text-xs shadow-warm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-terracotta-400" />
                    <span>Send Inquiry to Support Desk</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
