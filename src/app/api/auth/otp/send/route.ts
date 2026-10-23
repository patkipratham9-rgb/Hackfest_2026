import { NextRequest, NextResponse } from "next/server";
import { requestPhoneOtp } from "@/lib/authSecurity";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = body.phone || body.number;

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
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      testOtp: result.testOtp,
      cooldownSeconds: result.cooldownSeconds,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process OTP request" },
      { status: 500 }
    );
  }
}
