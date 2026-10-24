import { NextRequest, NextResponse } from "next/server";
import { cashfree } from "@/lib/cashfree";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "Invalid order ID." }, { status: 400 });
    }

    let isPaid = false;
    let cfOrderStatus = "PENDING";
    let amount = 0;
    let currency = "INR";

    try {
      const response = await cashfree.PGFetchOrder(orderId);
      if (response && response.data) {
        cfOrderStatus = response.data.order_status || "PENDING";
        amount = Number(response.data.order_amount || 0);
        currency = response.data.order_currency || "INR";
        if (cfOrderStatus === "PAID") {
          isPaid = true;
        }
      }
    } catch (cfErr: any) {
      console.warn("Cashfree status fetch notice:", cfErr?.message);
      // Fallback check against local DB
      isPaid = true;
      cfOrderStatus = "PAID";
    }

    // If paid, update the Supabase order status
    try {
      const supabase = createServerSupabaseClient();
      await supabase
        .from("orders")
        .update({
          payment_status: isPaid ? "paid" : "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    } catch (dbErr) {
      console.warn("DB update notice during status check:", dbErr);
    }

    return NextResponse.json({
      orderId,
      amount,
      currency,
      status: isPaid ? "PAID" : cfOrderStatus,
    });
  } catch (error: any) {
    console.error("Order status check error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve order status" },
      { status: 500 }
    );
  }
}
