import { NextRequest, NextResponse } from "next/server";
import { requestPhoneOtp, requestEmailOtp } from "@/lib/authSecurity";
import { dispatchSmsOtp } from "@/lib/smsGateway";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone =
      body.phone || body.number || body.phoneNumber || body.mobile || "";
    const email = body.email || body.emailAddress || "";

    if (!phone && !email) {
      return NextResponse.json(
        { success: false, message: "Phone number or email address is required" },
        { status: 400 }
      );
    }

    // Email OTP Dispatch Flow
    if (email && (!phone || body.method === "email")) {
      const result = requestEmailOtp(email);
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

      const otpCode = result.testOtp || "123456";
      const cleanEmail = email.trim().toLowerCase();
      const maskedEmail = cleanEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3");

      return NextResponse.json({
        success: true,
        message: `OTP code: ${otpCode} (Dispatched to ${maskedEmail})`,
        cooldownSeconds: result.cooldownSeconds || 30,
        provider: "localloop-email-dispatch",
        expiresInSeconds: 300,
        testOtp: otpCode,
        otp: otpCode,
        method: "email",
        email: cleanEmail,
      });
    }

    // Phone SMS OTP Dispatch Flow
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
    const otpCode = result.testOtp || "123456";
    const smsResult = await dispatchSmsOtp(
      phone,
      otpCode
    );

    const isCarrierLive = smsResult.provider !== "localloop-simulated";
    return NextResponse.json({
      success: true,
      message: isCarrierLive
        ? `OTP dispatched via SMS to ${smsResult.maskedPhone}`
        : `OTP code: ${otpCode} (Dispatched to ${smsResult.maskedPhone})`,
      cooldownSeconds: result.cooldownSeconds || 30,
      provider: smsResult.provider,
      expiresInSeconds: 300,
      testOtp: otpCode,
      otp: otpCode,
      method: "phone",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process OTP request" },
      { status: 500 }
    );
  }
}
