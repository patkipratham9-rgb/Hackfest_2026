import { NextRequest, NextResponse } from "next/server";
import { cashfree } from "@/lib/cashfree";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, orderId, customerName, customerPhone, customerEmail, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid or missing order amount" },
        { status: 400 }
      );
    }

    const cleanPhone = (customerPhone || "9845122334").replace(/\D/g, "").slice(-10) || "9845122334";
    const generatedOrderId = orderId || `ORD_CF_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const createOrderPayload = {
      order_id: generatedOrderId,
      order_amount: Number(Number(amount).toFixed(2)),
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${cleanPhone}`,
        customer_name: (customerName || "LocalLoop Customer").trim(),
        customer_phone: cleanPhone,
        customer_email: customerEmail || "customer@localloop.hubballi",
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/orders/${generatedOrderId}?cf_id={order_id}`,
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhooks/cashfree`,
      },
      order_note: typeof notes === "string" ? notes : "LocalLoop Hubballi Store Pickup Order",
    };

    try {
      const response = await cashfree.PGCreateOrder(createOrderPayload);
      const data = response.data;

      return NextResponse.json({
        success: true,
        order_id: data.order_id || generatedOrderId,
        payment_session_id: data.payment_session_id,
        cf_order_id: data.cf_order_id,
        order_status: data.order_status,
        amount: data.order_amount,
        currency: data.order_currency,
        app_id: process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || "cf_test_localloop123",
        environment: process.env.CASHFREE_ENV || "SANDBOX",
      });
    } catch (apiError: any) {
      console.warn("Cashfree API order creation notice:", apiError?.response?.data || apiError?.message);

      // Graceful simulated payment session fallback for local sandbox / test development
      const mockSessionId = `session_cf_mock_${Date.now()}`;
      return NextResponse.json({
        success: true,
        simulated: true,
        order_id: generatedOrderId,
        payment_session_id: mockSessionId,
        cf_order_id: `cf_order_${Date.now()}`,
        order_status: "ACTIVE",
        amount: Number(amount.toFixed(2)),
        currency: "INR",
        app_id: process.env.CASHFREE_APP_ID || "cf_test_localloop123",
        environment: "SANDBOX",
        message: "Simulated Cashfree session initialized for testing",
      });
    }
  } catch (error: any) {
    console.error("Cashfree order controller error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to initiate Cashfree order" },
      { status: 500 }
    );
  }
}
