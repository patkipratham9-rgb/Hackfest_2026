import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import {
  ShieldCheck,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Clock,
  FileText,
  Lock,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import {
  GRIEVANCE_OFFICER,
  CUSTOMER_SUPPORT,
  DATA_COLLECTION_TABLE,
} from "@/lib/legalPolicies";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How LocalLoop collects, uses, stores and protects personal data of shoppers and merchants in Hubballi-Dharwad, under the IT Act 2000 and SPDI Rules.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-cream-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Breadcrumbs items={[{ name: "Privacy Policy" }]} />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-terracotta-700 transition-colors bg-white px-3.5 py-2 rounded-xl border border-cream-300 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </Link>

          <Link
            href="/terms"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-forest-950 transition-colors bg-white px-3.5 py-2 rounded-xl border border-cream-300 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Terms and Conditions</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-warm space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cream-100 text-forest-800 text-[11px] font-bold border border-cream-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Legal Compliance • IT Act 2000</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-forest-950 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 leading-relaxed max-w-2xl">
            Localloop E-Commerce Technologies Pvt. Ltd. is committed to protecting your privacy and personal data across the Hubballi-Dharwad metropolitan area.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-[11px] font-semibold text-forest-500 border-t border-cream-200">
            <span>Effective Date: October 24, 2026</span>
            <span>Last Updated: October 26, 2026</span>
            <span>Version: 1.1.0</span>
            <span>Jurisdiction: Hubballi, Karnataka, India</span>
          </div>
        </div>

        {/* Policy Body */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-300 shadow-warm space-y-8 text-forest-900 leading-relaxed text-xs sm:text-sm">
          {/* Introduction */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <Lock className="w-4 h-4 text-terracotta-600" />
              <span>1. Regulatory Framework &amp; Scope</span>
            </h2>
            <p>
              This Privacy Policy is drafted and published in compliance with Section 43A of the Information Technology Act, 2000, Rule 4 of the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules), and the Consumer Protection (E-Commerce) Rules, 2020.
            </p>
            <p>
              This document governs the collection, storage, processing, transfer, and disclosure of personal data collected from customers, local merchant partners, and visitors of the LocalLoop website and marketplace platform.
            </p>
          </section>

          {/* Categories of Data Collected */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-terracotta-600" />
              <span>2. Categories of Information We Collect</span>
            </h2>
            <p>
              To deliver hyperlocal commerce, accurate GPS dispatch, atomic order processing, and payment receipts, LocalLoop collects the following categories of data:
            </p>

            <div className="overflow-x-auto rounded-2xl border border-cream-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 text-forest-950 font-bold border-b border-cream-300">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Information Type</th>
                    <th className="p-3">Purpose &amp; Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {DATA_COLLECTION_TABLE.map((item, idx) => (
                    <tr key={`data-col-${idx}`} className="hover:bg-cream-50">
                      <td className="p-3 font-semibold text-terracotta-800">{item.category}</td>
                      <td className="p-3 font-medium text-forest-900">{item.informationType}</td>
                      <td className="p-3 text-forest-600 leading-normal">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Purpose of Data Processing */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3. How We Use Your Information</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-forest-700">
              <li>Facilitating store order placement, merchant inventory allocation, and local parcel handoff.</li>
              <li>Calculating accurate delivery distances and dispatching verified Hubballi fleet riders to pinpoint GPS coordinates.</li>
              <li>Generating digital receipts, 6-digit counter pickup tokens, and Cashfree PG transaction audit records.</li>
              <li>Complying with statutory accounting, Goods and Services Tax (GST), and dispute resolution guidelines under Indian law.</li>
              <li>Preventing unauthorized fraudulent attempts and safeguarding consumer payment credentials.</li>
            </ul>
          </section>

          {/* Data Protection & Security */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              <span>4. Data Security Standards</span>
            </h2>
            <p>
              LocalLoop employs industry-standard 256-bit TLS/SSL transport encryption, Row-Level Security (RLS) partition controls on all database tables, and PCI-DSS Level 1 tokenized payment handshakes via Cashfree PG.
            </p>
            <p>
              We do not sell, rent, or trade your personal information to third-party data brokers or marketing agencies. Information is shared only with verified delivery partners and merchants strictly required to fulfill your order.
            </p>
          </section>

          {/* Cookies, Analytics & Contact Form */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>5. Cookies, Local Storage &amp; Analytics</span>
            </h2>
            <p>
              LocalLoop uses essential local storage and cookies to keep your shopping cart, sign-in session and preferred delivery locality across visits. These are required for the site to work.
            </p>
            <p>
              We use Google Analytics 4 to understand which pages are visited and how the site performs. It sets first-party cookies (such as <code>_ga</code>) and sends Google information about your device, browser, approximate location derived from your IP address, and the pages you view. Google Analytics 4 does not log or store full IP addresses. We do not use this data for advertising and do not load advertising trackers. You can opt out with the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-terracotta-700 hover:underline"
              >
                Google Analytics opt-out browser add-on
              </a>{" "}
              or by blocking cookies in your browser.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <Mail className="w-4 h-4 text-terracotta-600" />
              <span>6. Messages Sent Through Our Contact Form</span>
            </h2>
            <p>
              When you use the{" "}
              <Link href="/contact" className="font-semibold text-terracotta-700 hover:underline">
                contact form
              </Link>
              , we store your name, email address, optional phone number, the topic and your message so our support team can reply. These records are kept in our database (hosted by Supabase) for up to 24 months and then deleted, unless they relate to an open order dispute. Email{" "}
              <a href={`mailto:${CUSTOMER_SUPPORT.deskEmail}`} className="font-semibold text-terracotta-700 hover:underline">
                {CUSTOMER_SUPPORT.deskEmail}
              </a>{" "}
              to ask for a copy of, or deletion of, your messages.
            </p>
          </section>

          {/* Grievance Redressal */}
          <section className="space-y-3 pt-4 border-t border-cream-200">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <Building className="w-4 h-4 text-terracotta-600" />
              <span>7. Grievance Officer &amp; Statutory Contacts</span>
            </h2>
            <p>
              In accordance with Rule 5(9) of the SPDI Rules, 2011 and Consumer Protection (E-Commerce) Rules, 2020, the details of our designated Nodal &amp; Grievance Officer are set forth below:
            </p>

            <div className="p-4 sm:p-5 rounded-2xl bg-cream-50 border border-cream-300 space-y-2 text-xs">
              <p className="font-bold text-forest-950 text-sm">{GRIEVANCE_OFFICER.name}</p>
              <p className="text-forest-700 font-semibold">{GRIEVANCE_OFFICER.designation} • {GRIEVANCE_OFFICER.organization}</p>
              <p className="text-forest-600">{GRIEVANCE_OFFICER.address}</p>
              <div className="flex flex-wrap gap-4 pt-2 text-forest-800">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-terracotta-600" />
                  <a href={`mailto:${GRIEVANCE_OFFICER.email}`} className="hover:underline">{GRIEVANCE_OFFICER.email}</a>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-forest-600" />
                  <span>{GRIEVANCE_OFFICER.phone}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{GRIEVANCE_OFFICER.hours}</span>
                </span>
              </div>
            </div>

            <div className="text-[11px] text-forest-600 pt-1">
              For general customer service and return inquiries, contact our customer desk at{" "}
              <a href={`mailto:${CUSTOMER_SUPPORT.deskEmail}`} className="font-semibold text-terracotta-700 hover:underline">
                {CUSTOMER_SUPPORT.deskEmail}
              </a>
              {" "}or call {CUSTOMER_SUPPORT.helpline}.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
