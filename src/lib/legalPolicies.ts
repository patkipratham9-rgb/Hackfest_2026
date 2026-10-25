/**
 * Localloop - Legal Policies & Customer Guidelines
 * Comprehensive Operational, Legal, and Customer Support Documentation for the Localloop E-Commerce Platform.
 */

export interface PolicyFAQ {
  question: string;
  answer: string;
  category: "ordering" | "returns" | "refunds";
}

export interface ReturnWindowCategory {
  category: string;
  returnEligible: string;
  window: string;
  requirements: string;
}

export interface DeliveryTimelineItem {
  mode: string;
  area: string;
  window: string;
}

export interface RefundSettlementItem {
  paymentMode: string;
  destinationMode: string;
  processingTime: string;
}

export interface InformationCollectionCategory {
  category: string;
  informationType: string;
  description: string;
}

export const GRIEVANCE_OFFICER = {
  name: "Pratham Patki",
  designation: "Nodal & Grievance Officer",
  organization: "Localloop E-Commerce Technologies Pvt. Ltd.",
  address: "Localloop Digital Office, KLE Tech BVB Campus, Vidyanagar, Hubballi, Karnataka, India - 580031",
  email: "grievance.officer@localloop.in",
  phone: "+91 98451 22334",
  hours: "Monday to Saturday: 10:00 AM - 6:00 PM IST",
};

export const CUSTOMER_SUPPORT = {
  deskEmail: "support@localloop.in",
  escalationsEmail: "escalations@localloop.in",
  helpline: "+91 98860 12345",
  address: "Localloop Headquarters, Hubballi, Karnataka, India - 580031",
};

export const CHECKOUT_RETURN_BADGES = [
  {
    id: "7-day-returns",
    title: "Easy 7-Day Returns",
    desc: "Hassle-free return pick-up for eligible items across Hubballi-Dharwad.",
    highlight: "Free Doorstep Pick-up",
  },
  {
    id: "instant-refunds",
    title: "Instant Refund Processing",
    desc: "Refunds initiated immediately upon counter quality verification.",
    highlight: "UPI & Bank Settlement",
  },
  {
    id: "safe-payments",
    title: "100% Safe Payments",
    desc: "Encrypted and protected transaction processing via PCI-DSS gateway.",
    highlight: "256-Bit SSL Protection",
  },
];

export const DATA_COLLECTION_TABLE: InformationCollectionCategory[] = [
  {
    category: "Direct Information",
    informationType: "Personal & Contact Data",
    description:
      "Name, email address, phone number, physical shipping address (Home, Office, Others), billing address, and account login details.",
  },
  {
    category: "Automatic Information",
    informationType: "Device & Usage Data",
    description:
      "IP address, browser type, device identifiers, operating system, browsing history, clickstream data, and GPS location coordinates for Map4Me pinpointing.",
  },
  {
    category: "Payment Handling",
    informationType: "Financial Transaction Data",
    description:
      "Payment method details (card tokens, UPI IDs, billing records). Note: Sensitive payment credentials are handled directly by PCI-DSS compliant payment gateways (Cashfree / Razorpay).",
  },
];

export const DELIVERY_TIMELINES_TABLE: DeliveryTimelineItem[] = [
  {
    mode: "Express Hyper-Local",
    area: "Intra-City / Select Pin Codes (Hubballi-Dharwad)",
    window: "2 Hours – 24 Hours",
  },
  {
    mode: "Standard Regional",
    area: "Within State (Karnataka)",
    window: "2 – 3 Business Days",
  },
  {
    mode: "Standard National",
    area: "Rest of India (Inter-State)",
    window: "4 – 7 Business Days",
  },
  {
    mode: "Remote / Special Areas",
    area: "Designated Non-Standard Regions",
    window: "7 – 10 Business Days",
  },
];

export const RETURN_WINDOWS_TABLE: ReturnWindowCategory[] = [
  {
    category: "Electronics & Gadgets",
    returnEligible: "Yes",
    window: "7 Days from Delivery",
    requirements: "Unused, original tags, box, manuals, and accessories intact.",
  },
  {
    category: "Apparel & Fashion",
    returnEligible: "Yes",
    window: "7 Days from Delivery",
    requirements: "Unwashed, unworn, original brand tags attached.",
  },
  {
    category: "Home & Living Goods",
    returnEligible: "Yes",
    window: "7 Days from Delivery",
    requirements: "Unused, original packaging intact.",
  },
  {
    category: "Perishables & Groceries (e.g. Pedha, Fresh Sweets)",
    returnEligible: "Restricted",
    window: "Same Day / Doorstep Only",
    requirements: "Damaged or incorrect items verified at counter/delivery time.",
  },
  {
    category: "Personal Care & Hygiene",
    returnEligible: "No",
    window: "Non-Returnable",
    requirements: "Sealed items; non-returnable once opened for hygiene reasons.",
  },
];

export const REFUND_SETTLEMENT_TABLE: RefundSettlementItem[] = [
  {
    paymentMode: "UPI / Instant Bank Transfer",
    destinationMode: "Original UPI Handle / Account",
    processingTime: "24 – 48 Hours",
  },
  {
    paymentMode: "Credit / Debit Card",
    destinationMode: "Card Account",
    processingTime: "5 – 7 Business Days",
  },
  {
    paymentMode: "Net Banking",
    destinationMode: "Bank Account",
    processingTime: "3 – 5 Business Days",
  },
  {
    paymentMode: "Cash on Delivery (COD)",
    destinationMode: "Customer Verified Bank Account / UPI",
    processingTime: "2 – 4 Business Days post bank detail submission",
  },
  {
    paymentMode: "Localloop Wallet / Credit",
    destinationMode: "Store Credit",
    processingTime: "Instant (Within 2 Hours)",
  },
];

export const HELP_CENTER_FAQS: PolicyFAQ[] = [
  // Category A: Ordering & Cancellations
  {
    category: "ordering",
    question: "How do I track my active order?",
    answer:
      "You can track your order in real-time by going to My Orders in the Localloop app/website, selecting your active order, and tapping Track Shipment. Live status updates include Placed, Packed, Ready for Pickup, and Completed, with real-time delivery countdowns.",
  },
  {
    category: "ordering",
    question: "Can I modify my shipping address after placing an order?",
    answer:
      "Address changes are permitted only before the order status transitions to 'Dispatched'. Go to My Orders > Edit Order Address. If already dispatched, contact customer support for assistance.",
  },
  {
    category: "ordering",
    question: "Why was my order cancelled by Localloop?",
    answer:
      "Orders may be cancelled due to unexpected stock deficits, merchant quality check failures prior to packing, or temporary logistics unserviceability. If prepaid, your refund will be automatically processed to your original payment method.",
  },
  {
    category: "ordering",
    question: "What is the 1-minute order cancellation window?",
    answer:
      "Immediately after completing payment, Localloop provides an active 1-minute cancellation cooldown timer. During this 60-second grace period, you can cancel your order for an instant 100% full refund with zero penalty. After 1 minute, the counter merchant begins fresh preparation and cancellation is locked.",
  },

  // Category B: Returns & Exchanges
  {
    category: "returns",
    question: "How do I initiate a return for an item?",
    answer:
      "1. Navigate to My Orders.\n2. Select the order containing the item you wish to return.\n3. Click Return / Exchange and select the applicable reason.\n4. Upload clear photos if the item is damaged or incorrect, then submit your request.",
  },
  {
    category: "returns",
    question: "What if I receive a damaged, defective, or incorrect product?",
    answer:
      "Report the issue within 24 hours of delivery via the app with clear unboxing images or videos. We will arrange a prioritized replacement or complete refund.",
  },
  {
    category: "returns",
    question: "Can I exchange an item for a different size or color?",
    answer:
      "Yes, if the item is eligible for exchange and the desired size/color variant is in stock with the merchant, you can select the Exchange option during the return workflow.",
  },

  // Category C: Refunds & Doorstep Pick-Up
  {
    category: "refunds",
    question: "How does doorstep return pick-up work?",
    answer:
      "Once your return request is approved, a delivery partner will visit your address to pick up the item. Ensure the item is packed securely with all original tags, manuals, and accessories included.",
  },
  {
    category: "refunds",
    question: "Do I need to pay extra for return doorstep pick-up?",
    answer:
      "No, doorstep reverse pick-up is completely FREE for all valid returns and defective/damaged item claims across Hubballi-Dharwad.",
  },
  {
    category: "refunds",
    question: "How will I receive my refund if I paid via Cash on Delivery (COD)?",
    answer:
      "For COD orders, you will be prompted to enter your UPI ID or Bank Account details during the return request process. Once the returned item passes quality verification, the funds will be transferred directly to your bank account within 2-4 business days.",
  },
];
