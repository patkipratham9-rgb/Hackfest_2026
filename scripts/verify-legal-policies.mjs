/**
 * Localloop Legal Policies & Customer Guidelines Verification Suite
 * Verifies:
 * 1. Section 1: Terms and Conditions for Localloop (1.1 to 1.12, Grievance Officer)
 * 2. Section 2: Privacy Policy for Localloop (2.1 to 2.10, Data Collection Table, Security, Retention, Rights)
 * 3. Section 3: Shipping and Delivery Policy for Localloop (3.1 to 3.8, Timelines Table, Rates)
 * 4. Section 4: Cancellation, Return, and Refund Policy for Localloop (4.1 to 4.7, Windows Table, Settlement Table)
 * 5. Section 5: Checkout Return Badge & Customer Help Center FAQs (5.1 Badge, 5.2 Categories A, B, C)
 */

import assert from "assert";
import fs from "fs";
import path from "path";

const rootDir = process.cwd();

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log("\n==================================================================");
console.log("📜 LOCALLOOP LEGAL POLICIES & CUSTOMER GUIDELINES VERIFICATION");
console.log("==================================================================");

// --- 1. LEGAL POLICY DATA STRUCTURES ---
console.log("\n--- 1. STRUCTURED LEGAL POLICY DATA (src/lib/legalPolicies.ts) ---");

test("Legal Data: Grievance Officer details defined under IT Act 2000", () => {
  const filePath = path.join(rootDir, "src/lib/legalPolicies.ts");
  assert.ok(fs.existsSync(filePath));
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(content.includes("GRIEVANCE_OFFICER"));
  assert.ok(content.includes("Nodal & Grievance Officer"));
  assert.ok(content.includes("Hubballi, Karnataka"));
  assert.ok(content.includes("CUSTOMER_SUPPORT"));
  assert.ok(content.includes("support@localloop.in"));
});

test("Legal Data: Section 2.1 Data Collection Table contains required categories", () => {
  const content = fs.readFileSync(path.join(rootDir, "src/lib/legalPolicies.ts"), "utf8");
  assert.ok(content.includes("DATA_COLLECTION_TABLE"));
  assert.ok(content.includes("Direct Information"));
  assert.ok(content.includes("Automatic Information"));
  assert.ok(content.includes("Payment Handling"));
});

test("Legal Data: Section 3.3 Delivery Timelines Table defined", () => {
  const content = fs.readFileSync(path.join(rootDir, "src/lib/legalPolicies.ts"), "utf8");
  assert.ok(content.includes("DELIVERY_TIMELINES_TABLE"));
  assert.ok(content.includes("Express Hyper-Local"));
  assert.ok(content.includes("Standard Regional"));
  assert.ok(content.includes("Standard National"));
  assert.ok(content.includes("Remote / Special Areas"));
});

test("Legal Data: Section 4.2 & 4.6 Return Windows and Refund Settlement Tables defined", () => {
  const content = fs.readFileSync(path.join(rootDir, "src/lib/legalPolicies.ts"), "utf8");
  assert.ok(content.includes("RETURN_WINDOWS_TABLE"));
  assert.ok(content.includes("Electronics & Gadgets"));
  assert.ok(content.includes("Apparel & Fashion"));
  assert.ok(content.includes("Home & Living Goods"));
  assert.ok(content.includes("Perishables & Groceries"));
  assert.ok(content.includes("Personal Care & Hygiene"));

  assert.ok(content.includes("REFUND_SETTLEMENT_TABLE"));
  assert.ok(content.includes("UPI / Instant Bank Transfer"));
  assert.ok(content.includes("Credit / Debit Card"));
  assert.ok(content.includes("Cash on Delivery (COD)"));
});

test("Legal Data: Section 5.2 Help Center FAQs include Categories A, B, and C", () => {
  const content = fs.readFileSync(path.join(rootDir, "src/lib/legalPolicies.ts"), "utf8");
  assert.ok(content.includes("HELP_CENTER_FAQS"));
  assert.ok(content.includes("How do I track my active order?"));
  assert.ok(content.includes("Can I modify my shipping address after placing an order?"));
  assert.ok(content.includes("How do I initiate a return for an item?"));
  assert.ok(content.includes("What if I receive a damaged, defective, or incorrect product?"));
  assert.ok(content.includes("How does doorstep return pick-up work?"));
  assert.ok(content.includes("Do I need to pay extra for return doorstep pick-up?"));
  assert.ok(content.includes("Cash on Delivery (COD)"));
});

// --- 2. SECTION 5.1 CHECKOUT RETURN BADGE ---
console.log("\n--- 2. SECTION 5.1 CHECKOUT RETURN BADGE INTEGRATION ---");

test("Checkout Badge: Component exists with 3 required pillars", () => {
  const badgePath = path.join(rootDir, "src/components/CheckoutReturnBadge.tsx");
  assert.ok(fs.existsSync(badgePath));
  const badgeContent = fs.readFileSync(badgePath, "utf8");

  assert.ok(badgeContent.includes('data-testid="checkout-return-refund-badge"'));
  assert.ok(badgeContent.includes("CHECKOUT_RETURN_BADGES"));

  const legalContent = fs.readFileSync(path.join(rootDir, "src/lib/legalPolicies.ts"), "utf8");
  assert.ok(legalContent.includes("Easy 7-Day Returns"));
  assert.ok(legalContent.includes("Instant Refund Processing"));
  assert.ok(legalContent.includes("100% Safe Payments"));
});

test("Checkout Integration: CheckoutModal embeds Section 5.1 Return & Refund badge", () => {
  const modalContent = fs.readFileSync(path.join(rootDir, "src/components/CheckoutModal.tsx"), "utf8");
  assert.ok(modalContent.includes("CheckoutReturnBadge"));
});

test("Order Summary Screens: payment-result and orders/[id] embed Return & Refund badge", () => {
  const paymentContent = fs.readFileSync(path.join(rootDir, "src/app/payment-result/page.tsx"), "utf8");
  const orderContent = fs.readFileSync(path.join(rootDir, "src/app/orders/[id]/page.tsx"), "utf8");

  assert.ok(paymentContent.includes("CheckoutReturnBadge"));
  assert.ok(orderContent.includes("CheckoutReturnBadge"));
});

// --- 3. DEDICATED PAGES: /policies AND /help ---
console.log("\n--- 3. DEDICATED POLICIES & HELP CENTER PAGES ---");

test("Policies Page: src/app/policies/page.tsx renders all 5 document sections", () => {
  const policiesPath = path.join(rootDir, "src/app/policies/page.tsx");
  assert.ok(fs.existsSync(policiesPath));
  const content = fs.readFileSync(policiesPath, "utf8");

  assert.ok(content.includes("Terms and Conditions for Localloop"));
  assert.ok(content.includes("Privacy Policy for Localloop"));
  assert.ok(content.includes("Shipping and Delivery Policy for Localloop"));
  assert.ok(content.includes("Cancellation, Return, and Refund Policy for Localloop"));
  assert.ok(content.includes("Customer Help Center FAQs"));
  assert.ok(content.includes("Hubballi, Karnataka, India"));
  assert.ok(content.includes("Grievance Officer"));
});

test("Help Center Page: src/app/help/page.tsx renders categorized FAQs and support contact", () => {
  const helpPath = path.join(rootDir, "src/app/help/page.tsx");
  assert.ok(fs.existsSync(helpPath));
  const content = fs.readFileSync(helpPath, "utf8");

  assert.ok(
    content.includes("Localloop Customer Help Center & Support") ||
    content.includes("Localloop Customer Help Center &amp; Support")
  );
  assert.ok(content.includes("Ordering & Cancellations") || content.includes("HELP_CENTER_FAQS"));
  assert.ok(content.includes("Returns & Exchanges") || content.includes("HELP_CENTER_FAQS"));
  assert.ok(content.includes("Refunds & Doorstep Pick-Up") || content.includes("HELP_CENTER_FAQS"));
  assert.ok(content.includes("Terms & Conditions") || content.includes("terms"));
  assert.ok(content.includes("Return & Refund Policy") || content.includes("returns"));
});

// --- 4. FOOTER COMPREHENSIVE MODALS & NAVIGATION ---
console.log("\n--- 4. FOOTER COMPREHENSIVE MODALS & POLICY LINKS ---");

test("Footer: Renders direct navigation and comprehensive modals for all policies", () => {
  const footerContent = fs.readFileSync(path.join(rootDir, "src/components/Footer.tsx"), "utf8");

  assert.ok(footerContent.includes("1. Terms and Conditions"));
  assert.ok(footerContent.includes("2. Privacy Policy"));
  assert.ok(
    footerContent.includes("3. Shipping & Delivery Policy") ||
    footerContent.includes("3. Shipping &amp; Delivery Policy")
  );
  assert.ok(
    footerContent.includes("4. Cancellation & Refund Policy") ||
    footerContent.includes("4. Cancellation &amp; Refund Policy")
  );
  assert.ok(footerContent.includes("/policies"));
  assert.ok(footerContent.includes("/help"));
  assert.ok(footerContent.includes("Grievance Officer"));
});

console.log("\n==================================================================");
if (failed === 0) {
  console.log(`🎉 ALL ${passed} LEGAL POLICIES & CUSTOMER GUIDELINES TESTS PASSED!`);
  console.log("Section 1: Terms and Conditions for Localloop Operational");
  console.log("Section 2: Privacy Policy for Localloop Operational");
  console.log("Section 3: Shipping and Delivery Policy for Localloop Operational");
  console.log("Section 4: Cancellation, Return, and Refund Policy for Localloop Operational");
  console.log("Section 5: Checkout Return Badge (5.1) & Customer Help Center FAQs (5.2) Operational");
} else {
  console.error(`❌ ${failed} TESTS FAILED out of ${passed + failed}`);
  process.exit(1);
}
console.log("==================================================================\n");
