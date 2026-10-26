import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import {
  GRIEVANCE_OFFICER,
  CUSTOMER_SUPPORT,
  DELIVERY_TIMELINES_TABLE,
} from "@/lib/legalPolicies";

export const metadata: Metadata = {
  title: "Terms and Conditions • LocalLoop Hubballi",
  description:
    "Official Terms and Conditions for LocalLoop hyperlocal marketplace in Hubballi-Dharwad. Formulated under the Information Technology Act 2000.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-cream-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
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
            href="/privacy"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-forest-950 transition-colors bg-white px-3.5 py-2 rounded-xl border border-cream-300 shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Privacy Policy</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-warm space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cream-100 text-forest-800 text-[11px] font-bold border border-cream-200">
            <FileText className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Platform Agreement • Hubballi-Dharwad</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-forest-950 tracking-tight">
            Terms and Conditions
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 leading-relaxed max-w-2xl">
            Governing your access, ordering, merchant interactions, and payments across the LocalLoop hyperlocal digital marketplace.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-[11px] font-semibold text-forest-500 border-t border-cream-200">
            <span>Last Updated: October 24, 2026</span>
            <span>Applicable Law: Indian Contract Act, 1872 &amp; IT Act, 2000</span>
            <span>Version: 1.0.0</span>
          </div>
        </div>

        {/* Terms Body */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-cream-300 shadow-warm space-y-8 text-forest-900 leading-relaxed text-xs sm:text-sm">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>1. Introduction &amp; Nature of Marketplace</span>
            </h2>
            <p>
              LocalLoop is an electronic marketplace operated by Localloop E-Commerce Technologies Pvt. Ltd., connecting authentic neighborhood corner stores across Hubballi-Dharwad with citywide consumers.
            </p>
            <p>
              LocalLoop acts as a digital intermediary facilitating order reservation, payment collection via authorized payment aggregators (Cashfree Payments India Pvt. Ltd.), and local logistics dispatch. All commercial terms of sale (including pricing, warranty, and quality of goods) are agreed upon directly between the buyer and the registered merchant.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-terracotta-600" />
              <span>2. User Account Registration &amp; Security</span>
            </h2>
            <p>
              Users must provide valid personal identifiers, including an active Indian mobile number (+91) for OTP verification and an accurate delivery address within Hubballi-Dharwad.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your session tokens and pickup verification codes (LL-PIN). Any transaction initiated under your credentials shall be deemed authorized by you.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <Building className="w-4 h-4 text-forest-700" />
              <span>3. Ordering, Pricing, and Payments</span>
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-forest-700">
              <li><strong>Pricing &amp; Taxes:</strong> All product prices displayed include applicable Goods and Services Tax (GST). A nominal fair platform fee (₹15) is applied per checkout order to support neighborhood infrastructure.</li>
              <li><strong>Payment Processing:</strong> Payments are processed via PCI-DSS certified gateway protocols supporting UPI, Credit/Debit Cards, and Net Banking. LocalLoop does not store CVV or bank passwords.</li>
              <li><strong>Atomic Inventory Reservation:</strong> Product availability is locked using database row-level concurrency at checkout. In the rare event of concurrent out-of-stock, unfulfillable items are refunded immediately.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>4. Delivery &amp; Counter Pickup Timelines</span>
            </h2>
            <p>
              Orders are fulfilled via Home Delivery or express Counter Pick-up according to the following service standards:
            </p>

            <div className="overflow-x-auto rounded-2xl border border-cream-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 text-forest-950 font-bold border-b border-cream-300">
                  <tr>
                    <th className="p-3">Fulfillment Mode</th>
                    <th className="p-3">Coverage Locality</th>
                    <th className="p-3">Standard SLA Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {DELIVERY_TIMELINES_TABLE.map((row, idx) => (
                    <tr key={`del-timeline-${idx}`} className="hover:bg-cream-50">
                      <td className="p-3 font-semibold text-terracotta-800">{row.mode}</td>
                      <td className="p-3 font-medium text-forest-900">{row.area}</td>
                      <td className="p-3 text-forest-700 font-mono">{row.window}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-terracotta-600" />
              <span>5. Cancellations, Returns &amp; Refunds</span>
            </h2>
            <p>
              LocalLoop provides an automated <strong>1-minute (60 seconds) instant cancellation window</strong> immediately after payment is confirmed. During this window, you may cancel without reason for an instant 100% refund.
            </p>
            <p>
              Once packing commences, return eligibility is governed by product category. Non-perishable grocery, packaged goods, and handicrafts are eligible for 7-day doorstep return pickup if sealed and in original condition. Fresh perishables and bakery sweets are inspectable at pickup or delivery drop-off.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>6. Limitation of Liability &amp; Disclaimers</span>
            </h2>
            <p>
              LocalLoop disclaims liability for indirect, consequential, or incidental damages arising out of merchant service delays, traffic congestion in Hubballi, or third-party telecommunication failures. Our aggregate liability shall not exceed the total amount paid by the customer for the specific order under dispute.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 pt-4 border-t border-cream-200">
            <h2 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <Building className="w-4 h-4 text-forest-700" />
              <span>7. Governing Law &amp; Dispute Resolution</span>
            </h2>
            <p>
              These Terms shall be construed in accordance with the laws of India. Any disputes arising out of or related to platform usage shall be subject to the exclusive jurisdiction of the competent courts in Hubballi-Dharwad, Karnataka.
            </p>

            <div className="p-4 sm:p-5 rounded-2xl bg-cream-50 border border-cream-300 space-y-2 text-xs">
              <p className="font-bold text-forest-950 text-sm">{GRIEVANCE_OFFICER.name} • {GRIEVANCE_OFFICER.designation}</p>
              <p className="text-forest-600">{GRIEVANCE_OFFICER.organization}, {GRIEVANCE_OFFICER.address}</p>
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
              For support inquiries, email{" "}
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
