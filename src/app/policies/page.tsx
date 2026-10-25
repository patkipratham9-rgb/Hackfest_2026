"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  Truck,
  RotateCcw,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Printer,
  Search,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  GRIEVANCE_OFFICER,
  CUSTOMER_SUPPORT,
  DATA_COLLECTION_TABLE,
  DELIVERY_TIMELINES_TABLE,
  RETURN_WINDOWS_TABLE,
  REFUND_SETTLEMENT_TABLE,
  HELP_CENTER_FAQS,
  CHECKOUT_RETURN_BADGES,
} from "@/lib/legalPolicies";

type PolicyTab = "terms" | "privacy" | "shipping" | "returns" | "faqs";

function PoliciesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get("tab") as PolicyTab) || "terms";
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as PolicyTab;
    if (tabParam && ["terms", "privacy", "shipping", "returns", "faqs"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: PolicyTab) => {
    setActiveTab(tab);
    router.replace(`/policies?tab=${tab}`, { scroll: false });
  };

  const filteredFaqs = HELP_CENTER_FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cream-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-terracotta-700 transition-colors bg-white px-3 py-1.5 rounded-full border border-cream-300 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </Link>

          <button
            type="button"
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-forest-700 hover:text-forest-950 bg-white px-3 py-1.5 rounded-full border border-cream-300 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-terracotta-600" />
            <span>Print Policy Document</span>
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200 text-forest-800 text-[11px] font-bold border border-cream-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Official Legal Policies &amp; Customer Guidelines</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-forest-950">
            Localloop Legal, Privacy &amp; Customer Support
          </h1>
          <p className="text-xs sm:text-sm text-forest-600 max-w-2xl mx-auto leading-relaxed">
            Comprehensive Operational, Legal, and Customer Support Documentation for the Localloop E-Commerce Platform across Hubballi-Dharwad.
          </p>
        </div>

        {/* Section 5.1 Quick Return & Refund Badge Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-3xl bg-white border border-cream-300 shadow-warm">
          {CHECKOUT_RETURN_BADGES.map((b) => (
            <div key={b.id} className="p-3 rounded-2xl bg-cream-50 border border-cream-200 space-y-1">
              <span className="font-bold text-xs text-forest-950 block">{b.title}</span>
              <p className="text-[11px] text-forest-600 leading-snug">{b.desc}</p>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-terracotta-700 bg-terracotta-50 px-1.5 py-0.5 rounded border border-terracotta-200 inline-block mt-0.5">
                {b.highlight}
              </span>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1.5 bg-cream-200/90 rounded-2xl border border-cream-300 overflow-x-auto shadow-2xs scrollbar-none">
          <button
            type="button"
            data-testid="tab-terms"
            onClick={() => handleTabChange("terms")}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "terms"
                ? "bg-forest-900 text-white shadow-xs"
                : "text-forest-700 hover:text-forest-950 hover:bg-cream-100"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Terms &amp; Conditions</span>
          </button>

          <button
            type="button"
            data-testid="tab-privacy"
            onClick={() => handleTabChange("privacy")}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "privacy"
                ? "bg-forest-900 text-white shadow-xs"
                : "text-forest-700 hover:text-forest-950 hover:bg-cream-100"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Privacy Policy</span>
          </button>

          <button
            type="button"
            data-testid="tab-shipping"
            onClick={() => handleTabChange("shipping")}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "shipping"
                ? "bg-forest-900 text-white shadow-xs"
                : "text-forest-700 hover:text-forest-950 hover:bg-cream-100"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>3. Shipping &amp; Delivery</span>
          </button>

          <button
            type="button"
            data-testid="tab-returns"
            onClick={() => handleTabChange("returns")}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "returns"
                ? "bg-forest-900 text-white shadow-xs"
                : "text-forest-700 hover:text-forest-950 hover:bg-cream-100"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>4. Cancellation &amp; Refunds</span>
          </button>

          <button
            type="button"
            data-testid="tab-faqs"
            onClick={() => handleTabChange("faqs")}
            className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "faqs"
                ? "bg-forest-900 text-white shadow-xs"
                : "text-forest-700 hover:text-forest-950 hover:bg-cream-100"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>5. Help Center FAQs</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-warm">
        {/* ========================================================= */}
        {/* TAB 1: TERMS AND CONDITIONS */}
        {/* ========================================================= */}
        {activeTab === "terms" && (
          <div data-testid="policy-section-terms" className="space-y-6 text-xs sm:text-sm text-forest-800 leading-relaxed">
            <div className="border-b border-cream-200 pb-4">
              <span className="text-[11px] font-bold text-terracotta-700 uppercase tracking-widest block">
                Section 1
              </span>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-forest-950">
                Terms and Conditions for Localloop
              </h2>
              <p className="text-xs text-forest-600 mt-1">
                Last Updated: October 2026 • Governing Localloop E-Commerce Platform
              </p>
            </div>

            <p>
              Welcome to Localloop. These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the Localloop website, mobile applications, and services. By accessing or using our platform, you agree to be bound by these legal terms.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  1.1 General Conditions &amp; Eligibility
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mt-1">
                  <li><strong>Platform Overview:</strong> Localloop operates an e-commerce platform connecting buyers with local sellers, merchants, and logistics partners across Hubballi-Dharwad.</li>
                  <li><strong>Age Requirement:</strong> You must be at least 18 years of age or the age of legal majority in your jurisdiction to create an account or place orders. Minors may use the platform only under the supervision of a parent or legal guardian.</li>
                  <li><strong>Acceptance:</strong> If you do not agree with any part of these Terms, you must immediately cease all use of Localloop.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  1.2 Account Registration and Security
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mt-1">
                  <li><strong>Account Creation:</strong> Users must provide accurate, current, and complete information during registration and keep their profile updated.</li>
                  <li><strong>Account Security:</strong> You are responsible for safeguarding your login credentials and for all activities that occur under your account.</li>
                  <li><strong>Unauthorized Access:</strong> You must notify Localloop immediately of any breach of security or unauthorized use of your account.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  1.3 Products, Listings, and Pricing
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mt-1">
                  <li><strong>Product Descriptions:</strong> Localloop strives to ensure that product details, images, and specifications provided by sellers are accurate. However, we do not warrant that product descriptions or other content are error-free.</li>
                  <li><strong>Pricing &amp; Tax:</strong> All prices are displayed in Indian Rupees (INR) and are inclusive of applicable local taxes unless stated otherwise.</li>
                  <li><strong>Pricing Errors:</strong> In the event of a pricing error on the platform, Localloop reserves the right to cancel any orders placed for items listed at an incorrect price.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  1.4 Orders, Payments, and Billing
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mt-1">
                  <li><strong>Order Acceptance:</strong> Receipt of an order confirmation does not signify our acceptance of your order. We reserve the right to accept or decline your order at any time after receipt.</li>
                  <li><strong>Payment Processing:</strong> Payments are processed through secure third-party payment gateways (Cashfree / Razorpay). Supported modes include Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery (COD) where applicable.</li>
                  <li><strong>Billing Integrity:</strong> You agree to provide current, complete, and accurate purchase and account information for all purchases made on Localloop.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  1.5 Shipping, Fulfillment, and Delivery
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mt-1">
                  <li>Delivery is conducted through partner logistics providers or local merchant networks.</li>
                  <li>Estimated delivery dates are indicative and subject to regional constraints, weather conditions, and logistics traffic.</li>
                  <li>Risk of loss and title for items pass to you upon delivery to the designated shipping address.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  1.6 Cancellations, Returns, and Refunds
                </h3>
                <p className="mt-1">
                  Cancellations, returns, and refunds are subject to our dedicated Cancellation, Return, and Refund Policy detailed in Section 4. Non-defective, perishable, or custom-made goods may not be eligible for return or cancellation once dispatched.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  1.7 Intellectual Property Rights
                </h3>
                <p className="mt-1">
                  All content on Localloop, including text, graphics, logos, icons, images, software, and audio clips, is the property of Localloop or its content suppliers and is protected by intellectual property laws. You may not extract, systematically utilize, or frame any part of the Localloop platform without express written consent.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  1.8 Limitation of Liability
                </h3>
                <p className="mt-1">
                  Localloop shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the platform. Our maximum liability for any claim arising from a transaction shall not exceed the total amount paid by you for the specific product or service giving rise to the claim.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  1.9 Third-Party Links and Integrations
                </h3>
                <p className="mt-1">
                  The platform may contain links to third-party websites or integrated services. Localloop does not control or endorse, and is not responsible for, the content, privacy policies, or practices of any third-party services.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  1.10 Governing Law and Dispute Resolution
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mt-1">
                  <li><strong>Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of India.</li>
                  <li><strong>Jurisdiction:</strong> Any legal action, suit, or proceeding arising out of or relating to these Terms shall be instituted exclusively in the competent courts situated at <strong>Hubballi, Karnataka, India</strong>.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  1.11 Amendments to Terms
                </h3>
                <p className="mt-1">
                  Localloop reserves the right to revise or update these Terms at any time without prior notice. The updated version will be effective immediately upon posting on the platform.
                </p>
              </div>

              {/* 1.12 Grievance Officer */}
              <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 space-y-2 mt-4">
                <h3 className="font-bold text-sm sm:text-base text-forest-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-terracotta-600" />
                  <span>1.12 Contact / Grievance Officer</span>
                </h3>
                <p className="text-xs text-forest-700">
                  In accordance with the Information Technology Act, 2000 and rules made thereunder, the contact details of the Grievance Officer for Localloop are:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-forest-900 pt-1">
                  <div><strong>Name:</strong> {GRIEVANCE_OFFICER.name}</div>
                  <div><strong>Designation:</strong> {GRIEVANCE_OFFICER.designation}</div>
                  <div><strong>Office Address:</strong> {GRIEVANCE_OFFICER.address}</div>
                  <div><strong>Email:</strong> <a href={`mailto:${GRIEVANCE_OFFICER.email}`} className="text-terracotta-700 underline font-semibold">{GRIEVANCE_OFFICER.email}</a></div>
                  <div><strong>Phone:</strong> {GRIEVANCE_OFFICER.phone}</div>
                  <div><strong>Working Hours:</strong> {GRIEVANCE_OFFICER.hours}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRIVACY POLICY */}
        {/* ========================================================= */}
        {activeTab === "privacy" && (
          <div data-testid="policy-section-privacy" className="space-y-6 text-xs sm:text-sm text-forest-800 leading-relaxed">
            <div className="border-b border-cream-200 pb-4">
              <span className="text-[11px] font-bold text-terracotta-700 uppercase tracking-widest block">
                Section 2
              </span>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-forest-950">
                Privacy Policy for Localloop
              </h2>
              <p className="text-xs text-forest-600 mt-1">
                Commitment to Consumer Privacy, Data Encryption &amp; Transparent Processing
              </p>
            </div>

            <p>
              Localloop (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or mobile application.
            </p>

            {/* 2.1 Information We Collect Table */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm sm:text-base text-forest-950">
                2.1 Information We Collect
              </h3>
              <div className="overflow-x-auto border border-cream-300 rounded-2xl shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-cream-200 text-forest-950 font-bold border-b border-cream-300">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Information Type</th>
                      <th className="p-3">Description &amp; Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {DATA_COLLECTION_TABLE.map((row, i) => (
                      <tr key={i} className="hover:bg-cream-50 transition-colors">
                        <td className="p-3 font-semibold text-forest-950 align-top">{row.category}</td>
                        <td className="p-3 font-medium text-terracotta-700 align-top">{row.informationType}</td>
                        <td className="p-3 text-forest-700 align-top leading-relaxed">{row.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  2.2 How We Use Your Information
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mt-1">
                  <li>To facilitate order processing, dispatch, delivery, and customer service fulfillment.</li>
                  <li>To personalize user experience and deliver tailored product recommendations.</li>
                  <li>To communicate order updates, promotional offers, policy updates, and security alerts.</li>
                  <li>To prevent fraudulent transactions, monitor security threats, and comply with legal obligations.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  2.3 Cookies and Tracking Technologies
                </h3>
                <p className="mt-1">
                  We use cookies, web beacons, and analytical tools to maintain session states, understand user navigation, save user preferences, and serve targeted ads. Users can control cookie settings through their browser preferences, though disabling cookies may affect platform functionality.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  2.4 How We Share and Disclose Information
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mt-1">
                  <li><strong>Sellers &amp; Merchants:</strong> Sharing necessary order details (item, delivery address, recipient name) to fulfill orders.</li>
                  <li><strong>Logistics Partners:</strong> Sharing contact names, delivery addresses, and phone numbers to enable physical delivery.</li>
                  <li><strong>Third-Party Service Providers:</strong> Utilizing trusted partners for payment processing, data analytics, customer support software, and email deployment.</li>
                  <li><strong>Legal Compliance:</strong> Disclosing information when required by law, subpoena, court order, or governmental regulation.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  2.5 Data Security and Storage
                </h3>
                <p className="mt-1">
                  We implement robust technical, administrative, and physical security measures (including SSL encryption, secure servers, and restricted data access) to protect user information. All data is stored on secure cloud servers compliant with regional data protection standards.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  2.6 Data Retention and Account Deletion
                </h3>
                <p className="mt-1">
                  Personal data is retained for as long as necessary to fulfill the purposes outlined in this policy or as required by statutory regulations. Users may request permanent deletion of their account and associated personal data by contacting customer support or submitting an in-app request via Account Settings.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  2.7 Privacy Rights
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mt-1">
                  <li><strong>Access &amp; Correction:</strong> Users have the right to view, correct, or update their personal information via their account dashboard.</li>
                  <li><strong>Consent Withdrawal:</strong> Users can withdraw consent for marketing communications at any time using the &quot;unsubscribe&quot; link or account preferences.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  2.8 Third-Party Websites and Links
                </h3>
                <p className="mt-1">
                  Our platform may feature links to external websites. We are not responsible for the privacy practices or content of third-party sites.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  2.9 Updates to Privacy Policy
                </h3>
                <p className="mt-1">
                  We may revise this policy periodically. Changes will be posted on this page with an updated revision date.
                </p>
              </div>

              {/* 2.10 Privacy Grievance Officer */}
              <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 space-y-2 mt-4">
                <h3 className="font-bold text-sm sm:text-base text-forest-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>2.10 Grievance Officer Contact</span>
                </h3>
                <p className="text-xs text-forest-700">
                  For privacy-related inquiries, data access requests, or privacy concerns:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-forest-900 pt-1">
                  <div><strong>Grievance Officer:</strong> {GRIEVANCE_OFFICER.name}</div>
                  <div><strong>Office Address:</strong> {GRIEVANCE_OFFICER.address}</div>
                  <div><strong>Email:</strong> <a href={`mailto:${GRIEVANCE_OFFICER.email}`} className="text-terracotta-700 underline font-semibold">{GRIEVANCE_OFFICER.email}</a></div>
                  <div><strong>Helpline:</strong> {GRIEVANCE_OFFICER.phone}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SHIPPING AND DELIVERY POLICY */}
        {/* ========================================================= */}
        {activeTab === "shipping" && (
          <div data-testid="policy-section-shipping" className="space-y-6 text-xs sm:text-sm text-forest-800 leading-relaxed">
            <div className="border-b border-cream-200 pb-4">
              <span className="text-[11px] font-bold text-terracotta-700 uppercase tracking-widest block">
                Section 3
              </span>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-forest-950">
                Shipping and Delivery Policy for Localloop
              </h2>
              <p className="text-xs text-forest-600 mt-1">
                Hyperlocal &amp; Regional Logistics, Transit Timelines &amp; Free Delivery Guidelines
              </p>
            </div>

            <p>
              Localloop aims to provide reliable and efficient shipping services across supported geographic regions.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  3.1 Delivery Zones &amp; Serviceability
                </h3>
                <p className="mt-1">
                  Localloop services designated pin codes across India, with hyper-local delivery options available in select urban zones (including primary service areas in <strong>Hubballi, Karnataka</strong>, covering Vidyanagar, Station Road, CBT, Gokul Road, Keshwapur, Unkal, and Shirur Park). Serviceability can be verified on the product page or checkout screen by entering the delivery pin code.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  3.2 Processing &amp; Dispatch Times
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mt-1">
                  <li><strong>Standard Orders:</strong> Processed and dispatched within 24 to 48 hours of order confirmation.</li>
                  <li><strong>Hyper-Local Orders:</strong> Dispatched same-day or within a few hours depending on the designated delivery window.</li>
                  <li>Orders placed on Sundays or public holidays are processed on the following business day.</li>
                </ul>
              </div>

              {/* 3.3 Estimated Delivery Timelines Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  3.3 Estimated Delivery Timelines
                </h3>
                <div className="overflow-x-auto border border-cream-300 rounded-2xl shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-cream-200 text-forest-950 font-bold border-b border-cream-300">
                      <tr>
                        <th className="p-3">Delivery Mode</th>
                        <th className="p-3">Target Geographic Area</th>
                        <th className="p-3">Estimated Delivery Window</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-200">
                      {DELIVERY_TIMELINES_TABLE.map((row, i) => (
                        <tr key={i} className="hover:bg-cream-50 transition-colors">
                          <td className="p-3 font-semibold text-terracotta-700">{row.mode}</td>
                          <td className="p-3 text-forest-950">{row.area}</td>
                          <td className="p-3 font-mono font-bold text-forest-900">{row.window}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  3.4 Shipping Rates and Calculations
                </h3>
                <p className="mt-1">
                  Shipping fees are calculated dynamically based on weight, package dimensions, destination pin code, and selected shipping speed.
                  In Hubballi-Dharwad, base home delivery up to <strong>3.0 km is FREE (₹0)</strong>. Distance beyond 3.0 km incurs a flat rate of ₹15 per additional kilometer. Final shipping fees are clearly itemized on the checkout screen prior to payment.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  3.5 Delivery Attempts &amp; Customer Availability
                </h3>
                <p className="mt-1">
                  Our delivery partners will make up to three (3) delivery attempts before returning the shipment to the seller/warehouse.
                  OTP (One-Time Password) verification may be required upon delivery for high-value or specific COD orders to confirm receipt.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  3.6 Damaged, Tampered, or Missing Shipments
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mt-1">
                  <li><strong>Visual Inspection:</strong> Customers must inspect the outer packaging before accepting delivery.</li>
                  <li><strong>Refusal of Delivery:</strong> If the package appears severely damaged, opened, or tampered with, refuse delivery and immediately inform Localloop support.</li>
                  <li><strong>Missing Items:</strong> Any missing item or discrepancy must be reported within 24 hours of delivery accompanied by unboxing photos/video evidence.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  3.7 Force Majeure &amp; Unforeseen Delays
                </h3>
                <p className="mt-1">
                  Localloop is not liable for delivery delays caused by events beyond reasonable control, including extreme weather conditions, natural disasters, civic unrest, transport strikes, or government restrictions.
                </p>
              </div>

              {/* 3.8 Support Contact */}
              <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 space-y-2 mt-4">
                <h3 className="font-bold text-sm sm:text-base text-forest-950 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-terracotta-600" />
                  <span>3.8 Support Contact</span>
                </h3>
                <p className="text-xs text-forest-700">
                  For shipping and delivery assistance, email <a href={`mailto:${CUSTOMER_SUPPORT.deskEmail}`} className="text-terracotta-700 underline font-semibold">{CUSTOMER_SUPPORT.deskEmail}</a> or visit the Help Center in your mobile application.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CANCELLATION, RETURN, AND REFUND POLICY */}
        {/* ========================================================= */}
        {activeTab === "returns" && (
          <div data-testid="policy-section-returns" className="space-y-6 text-xs sm:text-sm text-forest-800 leading-relaxed">
            <div className="border-b border-cream-200 pb-4">
              <span className="text-[11px] font-bold text-terracotta-700 uppercase tracking-widest block">
                Section 4
              </span>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-forest-950">
                Cancellation, Return, and Refund Policy for Localloop
              </h2>
              <p className="text-xs text-forest-600 mt-1">
                Criteria, Windows, 1-Minute Grace Cancellation &amp; Settlement Modes
              </p>
            </div>

            <p>
              This policy outlines the processes, criteria, and timelines for order cancellations, product returns, exchanges, and financial refunds.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  4.1 Order Cancellations
                </h3>
                <div className="space-y-2 mt-1">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                    <strong className="text-amber-950">1-Minute Post-Payment Cooldown Window:</strong> Customers enjoy an active 60-second cancellation window immediately following checkout with 100% full instant refund.
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 pl-2">
                    <li><strong>Before Dispatch:</strong> Orders can be cancelled directly through the app/website prior to shipment. A full refund will be issued to the original payment source.</li>
                    <li><strong>After Dispatch:</strong> Cancellations post-dispatch are not supported via the app. Customers may refuse delivery when the agent arrives, though delivery charges may be non-refundable.</li>
                    <li><strong>Localloop / Seller Cancellations:</strong> Localloop reserves the right to cancel orders due to stock unavailability, pricing errors, fraudulent activity flags, or delivery unserviceability. Full refunds will be processed for cancelled orders.</li>
                  </ul>
                </div>
              </div>

              {/* 4.2 Return & Exchange Windows Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  4.2 Return &amp; Exchange Windows
                </h3>
                <div className="overflow-x-auto border border-cream-300 rounded-2xl shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-cream-200 text-forest-950 font-bold border-b border-cream-300">
                      <tr>
                        <th className="p-3">Product Category</th>
                        <th className="p-3">Return Eligible?</th>
                        <th className="p-3">Return / Replacement Window</th>
                        <th className="p-3">Primary Requirements</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-200">
                      {RETURN_WINDOWS_TABLE.map((row, i) => (
                        <tr key={i} className="hover:bg-cream-50 transition-colors">
                          <td className="p-3 font-semibold text-forest-950">{row.category}</td>
                          <td className="p-3 font-bold">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                              row.returnEligible === "Yes"
                                ? "bg-emerald-100 text-emerald-800"
                                : row.returnEligible === "Restricted"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}>
                              {row.returnEligible}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-terracotta-700">{row.window}</td>
                          <td className="p-3 text-forest-700">{row.requirements}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  4.3 Conditions for Returns
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mt-1">
                  <li>Item must be in its original, unwashed, undamaged, and unused condition.</li>
                  <li>Original brand box, tags, user manuals, warranty cards, and accessories must be intact.</li>
                  <li>Serial numbers / IMEI numbers must match Localloop records.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  4.4 Non-Returnable and Non-Refundable Items
                </h3>
                <ul className="list-disc list-inside space-y-1.5 pl-2 mt-1">
                  <li>Customized or personalized items made to customer specifications.</li>
                  <li>Innerwear, lingerie, swimwear, and personal hygiene products.</li>
                  <li>Opened software, digital downloads, or gift cards.</li>
                  <li>Items explicitly marked as &quot;Non-Returnable&quot; on the product detail page.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  4.5 Return Process &amp; Reverse Pick-Up
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 pl-2 mt-1">
                  <li><strong>Initiate Request:</strong> Go to My Orders &gt; Select Order &gt; Request Return/Exchange within the eligible window.</li>
                  <li><strong>Quality Check Verification:</strong> Provide details and upload photos showing any defect or damage.</li>
                  <li><strong>Reverse Pick-Up:</strong> Once approved, a logistics agent will be dispatched to pick up the item from the delivery address.</li>
                  <li><strong>Inspection:</strong> Items undergo physical quality verification upon return to the fulfillment center/seller.</li>
                </ol>
              </div>

              {/* 4.6 Refund Timelines & Settlement Modes Table */}
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-sm sm:text-base text-forest-950">
                  4.6 Refund Timelines &amp; Settlement Modes
                </h3>
                <div className="overflow-x-auto border border-cream-300 rounded-2xl shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-cream-200 text-forest-950 font-bold border-b border-cream-300">
                      <tr>
                        <th className="p-3">Original Payment Mode</th>
                        <th className="p-3">Refund Destination Mode</th>
                        <th className="p-3">Target Processing Time (Post-QC Approval)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-200">
                      {REFUND_SETTLEMENT_TABLE.map((row, i) => (
                        <tr key={i} className="hover:bg-cream-50 transition-colors">
                          <td className="p-3 font-semibold text-forest-950">{row.paymentMode}</td>
                          <td className="p-3 text-terracotta-700 font-medium">{row.destinationMode}</td>
                          <td className="p-3 font-mono font-bold text-forest-900">{row.processingTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4.7 Support & Grievance Contact */}
              <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 space-y-2 mt-4">
                <h3 className="font-bold text-sm sm:text-base text-forest-950 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-terracotta-600" />
                  <span>4.7 Support &amp; Grievance Contact</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-forest-900 pt-1">
                  <div><strong>Customer Support Desk:</strong> <a href={`mailto:${CUSTOMER_SUPPORT.deskEmail}`} className="text-terracotta-700 underline">{CUSTOMER_SUPPORT.deskEmail}</a></div>
                  <div><strong>Escalations Team:</strong> <a href={`mailto:${CUSTOMER_SUPPORT.escalationsEmail}`} className="text-terracotta-700 underline">{CUSTOMER_SUPPORT.escalationsEmail}</a></div>
                  <div><strong>Direct Support Helpline:</strong> {CUSTOMER_SUPPORT.helpline}</div>
                  <div><strong>Headquarters:</strong> {CUSTOMER_SUPPORT.address}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: CUSTOMER HELP CENTER FAQS */}
        {/* ========================================================= */}
        {activeTab === "faqs" && (
          <div data-testid="policy-section-faqs" className="space-y-6 text-xs sm:text-sm text-forest-800 leading-relaxed">
            <div className="border-b border-cream-200 pb-4">
              <span className="text-[11px] font-bold text-terracotta-700 uppercase tracking-widest block">
                Section 5
              </span>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-forest-950">
                Customer Help Center FAQs
              </h2>
              <p className="text-xs text-forest-600 mt-1">
                Frequently Asked Questions on Ordering, Cancellations, Returns, Doorstep Reverse Pick-Up &amp; Refunds
              </p>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-forest-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search FAQs by keywords (e.g. tracking, cancellation, COD refund)..."
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs sm:text-sm text-forest-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
              />
            </div>

            {/* FAQs Categorized */}
            <div className="space-y-4">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx || Boolean(faqSearch.trim());
                return (
                  <div
                    key={idx}
                    className="border border-cream-200 rounded-2xl bg-cream-50/70 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
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

              {filteredFaqs.length === 0 && (
                <div className="p-8 text-center text-forest-500 space-y-2">
                  <AlertCircle className="w-6 h-6 mx-auto text-amber-500" />
                  <p>No FAQs match &quot;{faqSearch}&quot;.</p>
                  <button
                    type="button"
                    onClick={() => setFaqSearch("")}
                    className="text-xs font-bold text-terracotta-700 underline"
                  >
                    Clear search filter
                  </button>
                </div>
              )}
            </div>

            {/* Quick Contact Card */}
            <div className="p-5 rounded-2xl bg-forest-900 text-cream-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-serif font-bold text-base text-cream-50">
                  Still have questions or need assistance?
                </h4>
                <p className="text-xs text-cream-200">
                  Our Hubballi-Dharwad dedicated customer support desk is available 6 days a week.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${CUSTOMER_SUPPORT.helpline}`}
                  className="px-4 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  Call Support
                </a>
                <a
                  href={`mailto:${CUSTOMER_SUPPORT.deskEmail}`}
                  className="px-4 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-cream-100 text-xs font-bold border border-forest-700 transition-colors"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PoliciesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-xs font-bold text-forest-700 flex items-center gap-2">
            <Clock className="w-4 h-4 animate-spin text-terracotta-600" />
            <span>Loading Localloop Legal Policies &amp; Customer Guidelines...</span>
          </div>
        </div>
      }
    >
      <PoliciesContent />
    </Suspense>
  );
}
