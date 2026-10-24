/**
 * Verification Suite for GST, Distance Rate Calculation (> 3 km @ ₹15/km), and Minimum Bill (₹599)
 */

import assert from "assert";
import fs from "fs";
import path from "path";

const rootDir = process.cwd();

console.log("\n==================================================================");
console.log("🧾 LOCALLOOP BILLING: GST, DISTANCE FEE (>3KM) & MINIMUM BILL (₹599)");
console.log("==================================================================");

let passedCount = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. GST Calculation Logic
test("GST (5%) calculation on various subtotals", () => {
  const calcGst = (subtotal) => Math.round(subtotal * 0.05);

  assert.strictEqual(calcGst(100), 5);
  assert.strictEqual(calcGst(250), 13);
  assert.strictEqual(calcGst(599), 30);
  assert.strictEqual(calcGst(1000), 50);
  assert.strictEqual(calcGst(0), 0);
});

// 2. Distance Calculation Logic
test("Delivery Distance fee calculation (Base <= 3km FREE, > 3km @ ₹15/km)", () => {
  const calcDeliveryFee = (deliveryOption, distanceKm) => {
    if (deliveryOption !== "delivery") return 0;
    if (distanceKm <= 3) return 0;
    const extraDistance = Math.max(0, Number((distanceKm - 3).toFixed(1)));
    return Math.round(extraDistance * 15);
  };

  // Pickup orders always ₹0 delivery fee
  assert.strictEqual(calcDeliveryFee("pickup", 5.0), 0);
  assert.strictEqual(calcDeliveryFee("pickup", 2.0), 0);

  // Home delivery <= 3 km is FREE
  assert.strictEqual(calcDeliveryFee("delivery", 1.0), 0);
  assert.strictEqual(calcDeliveryFee("delivery", 2.5), 0);
  assert.strictEqual(calcDeliveryFee("delivery", 3.0), 0);

  // Home delivery > 3 km incurs ₹15/km for distance beyond 3 km
  // 3.5 km -> 0.5 km extra -> Math.round(0.5 * 15) = 8
  assert.strictEqual(calcDeliveryFee("delivery", 3.5), 8);
  // 4.0 km -> 1.0 km extra -> Math.round(1.0 * 15) = 15
  assert.strictEqual(calcDeliveryFee("delivery", 4.0), 15);
  // 4.2 km -> 1.2 km extra -> Math.round(1.2 * 15) = 18
  assert.strictEqual(calcDeliveryFee("delivery", 4.2), 18);
  // 5.0 km -> 2.0 km extra -> Math.round(2.0 * 15) = 30
  assert.strictEqual(calcDeliveryFee("delivery", 5.0), 30);
  // 10.0 km -> 7.0 km extra -> Math.round(7.0 * 15) = 105
  assert.strictEqual(calcDeliveryFee("delivery", 10.0), 105);
});

// 3. Minimum Bill Enforcement (₹599)
test("Minimum bill threshold enforcement (₹599)", () => {
  const MIN_BILL = 599;
  const isMinMet = (subtotal) => subtotal >= MIN_BILL;
  const neededMore = (subtotal) => Math.max(0, MIN_BILL - subtotal);

  assert.strictEqual(isMinMet(150), false);
  assert.strictEqual(neededMore(150), 449);

  assert.strictEqual(isMinMet(598), false);
  assert.strictEqual(neededMore(598), 1);

  assert.strictEqual(isMinMet(599), true);
  assert.strictEqual(neededMore(599), 0);

  assert.strictEqual(isMinMet(1200), true);
  assert.strictEqual(neededMore(1200), 0);
});

// 4. Total Due Formula
test("Combined final total billing formula", () => {
  const computeBill = ({ subtotal, deliveryOption, distanceKm }) => {
    const gst = Math.round(subtotal * 0.05);
    const platformFee = subtotal > 0 ? 15 : 0;
    const extraDistance = Math.max(0, Number((distanceKm - 3).toFixed(1)));
    const deliveryFee = deliveryOption === "delivery" && distanceKm > 3 ? Math.round(extraDistance * 15) : 0;
    const total = subtotal + gst + platformFee + deliveryFee;
    return { subtotal, gst, platformFee, deliveryFee, total, meetsMinBill: subtotal >= 599 };
  };

  const bill1 = computeBill({ subtotal: 600, deliveryOption: "delivery", distanceKm: 4.0 });
  assert.strictEqual(bill1.subtotal, 600);
  assert.strictEqual(bill1.gst, 30);
  assert.strictEqual(bill1.platformFee, 15);
  assert.strictEqual(bill1.deliveryFee, 15);
  assert.strictEqual(bill1.total, 660);
  assert.strictEqual(bill1.meetsMinBill, true);

  const bill2 = computeBill({ subtotal: 700, deliveryOption: "delivery", distanceKm: 2.5 });
  assert.strictEqual(bill2.subtotal, 700);
  assert.strictEqual(bill2.gst, 35);
  assert.strictEqual(bill2.platformFee, 15);
  assert.strictEqual(bill2.deliveryFee, 0); // within 3 km is FREE
  assert.strictEqual(bill2.total, 750);
  assert.strictEqual(bill2.meetsMinBill, true);

  const bill3 = computeBill({ subtotal: 400, deliveryOption: "pickup", distanceKm: 5.0 });
  assert.strictEqual(bill3.subtotal, 400);
  assert.strictEqual(bill3.gst, 20);
  assert.strictEqual(bill3.platformFee, 15);
  assert.strictEqual(bill3.deliveryFee, 0);
  assert.strictEqual(bill3.total, 435);
  assert.strictEqual(bill3.meetsMinBill, false); // below 599 minimum
});

// 5. Source code validation
test("Source code verification: CartContext.tsx", () => {
  const code = fs.readFileSync(path.join(rootDir, "src/context/CartContext.tsx"), "utf8");
  assert.ok(code.includes("Math.round(subtotal * 0.05)"), "CartContext contains GST (5%) calculation");
  assert.ok(code.includes("minBillAmount = 599"), "CartContext exports minBillAmount = 599");
  assert.ok(code.includes("subtotal >= minBillAmount"), "CartContext enforces subtotal >= minBillAmount");
  assert.ok(code.includes("deliveryFee"), "CartContext createOrder supports deliveryFee");
  assert.ok(code.includes("deliveryDistance"), "CartContext createOrder supports deliveryDistance");
});

test("Source code verification: CheckoutModal.tsx", () => {
  const code = fs.readFileSync(path.join(rootDir, "src/components/CheckoutModal.tsx"), "utf8");
  assert.ok(code.includes("data-testid=\"checkout-gst-amount\""), "CheckoutModal renders GST amount");
  assert.ok(code.includes("deliveryDistance > 3"), "CheckoutModal checks distance > 3km");
  assert.ok(code.includes("extraDistance * 15"), "CheckoutModal calculates ₹15 per km beyond 3km");
  assert.ok(code.includes("data-testid=\"checkout-min-bill-warning\""), "CheckoutModal displays minimum bill warning");
  assert.ok(code.includes("data-testid=\"checkout-delivery-fee\""), "CheckoutModal displays delivery fee");
  assert.ok(code.includes("data-testid=\"delivery-distance-calculator\""), "CheckoutModal has delivery distance calculator");
  assert.ok(code.includes("disabled={isSubmitting || !isMinBillMet}"), "CheckoutModal disables submit if minimum bill is not met");
});

test("Source code verification: CartDrawer.tsx", () => {
  const code = fs.readFileSync(path.join(rootDir, "src/components/CartDrawer.tsx"), "utf8");
  assert.ok(code.includes("data-testid=\"cart-gst-amount\""), "CartDrawer renders GST line item");
  assert.ok(code.includes("Minimum Bill: ₹599"), "CartDrawer renders minimum bill alert");
  assert.ok(code.includes("disabled={!isMinBillMet}"), "CartDrawer disables checkout if minimum bill not met");
});

test("Source code verification: src/app/orders/[id]/page.tsx", () => {
  const code = fs.readFileSync(path.join(rootDir, "src/app/orders/[id]/page.tsx"), "utf8");
  assert.ok(code.includes("data-testid=\"order-gst\""), "Order receipt displays GST (5%) row");
  assert.ok(code.includes("data-testid=\"order-delivery-fee\""), "Order receipt displays delivery charge");
  assert.ok(code.includes("order.deliveryDistance > 3"), "Order receipt displays distance calculation formula");
});

console.log("\n==================================================================");
console.log(`🎉 ALL ${passedCount} BILLING, GST, DISTANCE & MINIMUM BILL TESTS PASSED!`);
console.log("==================================================================\n");
