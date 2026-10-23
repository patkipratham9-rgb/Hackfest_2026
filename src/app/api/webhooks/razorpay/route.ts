import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "whsec_test_secret789";

    // Validate signature if webhookSecret is configured
    if (signature && webhookSecret) {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 400 }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment capture / order paid events
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.notes?.order_id || payload.payload?.order?.entity?.receipt;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        // Update order in Supabase
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            razorpay_payment_id: paymentId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }
    }

    return NextResponse.json({ received: true, event });
  } catch (err: any) {
    console.error("Razorpay webhook handler error:", err);
    return NextResponse.json(
      { error: err?.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
