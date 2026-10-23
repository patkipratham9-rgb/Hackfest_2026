import { Cashfree, CFEnvironment } from "cashfree-pg";
import crypto from "crypto";

const appId =
  process.env.CASHFREE_APP_ID ||
  process.env.CASHFREE_CLIENT_ID ||
  "cf_test_localloop123";

const secretKey =
  process.env.CASHFREE_SECRET_KEY ||
  process.env.CASHFREE_CLIENT_SECRET ||
  "cf_secret_test_mock456";

const cfEnvironment =
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

export const cashfree = new Cashfree(
  cfEnvironment,
  appId,
  secretKey
);

/**
 * Verifies Cashfree Webhook signature using rawBody, timestamp, and secret.
 * Cashfree signs: `timestamp + rawBody` using HMAC-SHA256 with Base64 encoding.
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string,
  secret: string = secretKey
): boolean {
  try {
    if (!signature || !timestamp || !rawBody) {
      return false;
    }

    // Cashfree signature is HMAC-SHA256 of `${timestamp}${rawBody}` encoded in Base64
    const signedPayload = `${timestamp}${rawBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("base64");

    return expectedSignature === signature;
  } catch (err) {
    console.error("Cashfree webhook signature verification error:", err);
    return false;
  }
}

/**
 * Verifies Cashfree payment signature on client return
 */
export function verifyCashfreePaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string = secretKey
): boolean {
  try {
    const payload = `${orderId}${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64");
    return expectedSignature === signature;
  } catch (err) {
    console.error("Cashfree payment signature verification error:", err);
    return false;
  }
}
