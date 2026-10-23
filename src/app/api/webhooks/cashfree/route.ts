import { NextRequest, NextResponse } from "next/server";
import { verifyCashfreeWebhookSignature } from "@/lib/cashfree";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    const secretKey =
      process.env.CASHFREE_SECRET_KEY ||
      process.env.CASHFREE_CLIENT_SECRET ||
      "cf_secret_test_mock456";

    // Cashfree signature verification
    if (signature && timestamp && secretKey) {
      const isValid = verifyCashfreeWebhookSignature(
        rawBody,
        signature,
        timestamp,
        secretKey
      );

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid Cashfree webhook signature" },
          { status: 400 }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.type || payload.event;
    const supabase = createServerSupabaseClient();

    // Process Payment Success Events
    if (
      eventType === "PAYMENT_SUCCESS_WEBHOOK" ||
      eventType === "ORDER_PAID_WEBHOOK" ||
      eventType === "payment.captured"
    ) {
      const orderId =
        payload.data?.order?.order_id ||
        payload.order?.order_id ||
        payload.data?.order_id;

      const paymentId =
        payload.data?.payment?.cf_payment_id ||
        payload.payment?.cf_payment_id ||
        payload.data?.cf_payment_id ||
        `cf_pay_${Date.now()}`;

      if (orderId) {
        // Idempotency check: check if order is already settled
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("payment_status, cashfree_payment_id")
          .eq("id", orderId)
          .single();

        if (existingOrder && existingOrder.payment_status === "paid") {
          return NextResponse.json({
            received: true,
            idempotent: true,
            message: "Order already processed and settled idempotently",
            orderId,
          });
        }

        // Update order in Supabase
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            cashfree_payment_id: String(paymentId),
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }
    }

    return NextResponse.json({
      received: true,
      event: eventType,
      gateway: "cashfree",
      processedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Cashfree webhook handler error:", err);
    return NextResponse.json(
      { error: err?.message || "Cashfree webhook processing error" },
      { status: 500 }
    );
  }
}
