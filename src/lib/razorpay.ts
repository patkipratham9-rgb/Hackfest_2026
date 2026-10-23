import Razorpay from "razorpay";
import crypto from "crypto";

const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_localloop123";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "secret_test_mock456";

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

/**
 * Verifies Razorpay Webhook signature
 */
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
  } catch (err) {
    console.error("Signature verification failed:", err);
    return false;
  }
}

/**
 * Verifies Razorpay Payment signature after client-side checkout
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string = keySecret
): boolean {
  try {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    return expectedSignature === signature;
  } catch (err) {
    console.error("Payment verification failed:", err);
    return false;
  }
}
