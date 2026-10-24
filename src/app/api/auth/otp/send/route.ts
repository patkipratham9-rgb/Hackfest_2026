import { NextRequest, NextResponse } from "next/server";
import { requestPhoneOtp } from "@/lib/authSecurity";
import { dispatchSmsOtp } from "@/lib/smsGateway";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone =
      body.phone || body.number || body.phoneNumber || body.mobile || "";

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Mobile number is required" },
        { status: 400 }
      );
    }

    const result = requestPhoneOtp(phone);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          cooldownSeconds: result.cooldownSeconds,
        },
        { status: result.cooldownSeconds > 0 ? 429 : 400 }
      );
    }

    // Dispatch carrier SMS
    const smsResult = await dispatchSmsOtp(
      phone,
      result.testOtp || "123456"
    );

    return NextResponse.json({
      success: true,
      message: `OTP sent via SMS to ${smsResult.maskedPhone}`,
      testOtp: result.testOtp || "123456",
      cooldownSeconds: result.cooldownSeconds || 30,
      provider: smsResult.provider,
      expiresInSeconds: 300,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process OTP request" },
      { status: 500 }
    );
  }
}
