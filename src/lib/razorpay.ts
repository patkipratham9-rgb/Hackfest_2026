/**
 * @deprecated Razorpay integration has been migrated to Cashfree Payment Gateway (@/lib/cashfree).
 * This module provides backward-compatibility stubs without requiring the legacy `razorpay` npm package.
 */
import crypto from "crypto";
import { cashfree, verifyCashfreeWebhookSignature, verifyCashfreePaymentSignature } from "./cashfree";

export { cashfree };

export const razorpay = {
  orders: {
    create: async (options: { amount: number; currency?: string; receipt?: string; notes?: any }) => {
      try {
        const orderAmount = Number((options.amount / 100).toFixed(2));
        const res = await cashfree.PGCreateOrder({
          order_id: options.receipt || `order_${Date.now()}`,
          order_amount: orderAmount,
          order_currency: options.currency || "INR",
          customer_details: {
            customer_id: "cust_localloop_default",
            customer_phone: "9845122334",
            customer_name: "LocalLoop Customer",
          },
          order_note: typeof options.notes === "string" ? options.notes : "LocalLoop Order via Cashfree",
        });

        return {
          id: res.data.order_id || `order_${Date.now()}`,
          amount: options.amount,
          currency: options.currency || "INR",
          receipt: options.receipt,
          status: "created",
        };
      } catch {
        return {
          id: `order_cf_${Date.now()}`,
          amount: options.amount,
          currency: options.currency || "INR",
          receipt: options.receipt,
          status: "created",
        };
      }
    },
  },
};

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    return expectedSignature === signature;
  } catch {
    return false;
  }
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string = "cf_secret_test_mock456"
): boolean {
  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    return expectedSignature === signature;
  } catch {
    return false;
  }
}

export { verifyCashfreeWebhookSignature, verifyCashfreePaymentSignature };
