import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, receipt, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount specified" },
        { status: 400 }
      );
    }

    // Convert amount from Rupees to Paise (₹1 = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {
        platform: "LocalLoop Hubballi",
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_localloop123",
    });
  } catch (error: any) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to create Razorpay order",
        // Fallback simulated order id for testing without live credentials
        simulated: true,
        id: `order_mock_${Date.now()}`,
        amount: 100,
        currency: "INR",
        key_id: "rzp_test_mock",
      },
      { status: 200 }
    );
  }
}
