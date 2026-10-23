import { NextRequest, NextResponse } from "next/server";
import {
  verifyPhoneOtp,
  validatePhoneNumber,
  generateSessionToken,
  sanitizeInput,
} from "@/lib/authSecurity";
import { UserRole, UserProfile } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp, role = "customer", name, email } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: "Both phone number and OTP code are required" },
        { status: 400 }
      );
    }

    const verification = verifyPhoneOtp(phone, otp);

    if (!verification.success) {
      return NextResponse.json(
        {
          success: false,
          message: verification.message,
          remainingAttempts: verification.remainingAttempts,
        },
        { status: 400 }
      );
    }

    // OTP is valid. Generate verified session
    const phoneValidation = validatePhoneNumber(phone);
    const userId = `user_${Date.now()}`;
    const cleanRole: UserRole = role === "seller" ? "seller" : "customer";
    const userName = sanitizeInput(name) || (cleanRole === "seller" ? "Hubballi Merchant" : "Hubballi Shopper");

    const verifiedUser: UserProfile = {
      id: userId,
      name: userName,
      number: phoneValidation.cleanNumber,
      email: email ? sanitizeInput(email).toLowerCase() : undefined,
      role: cleanRole,
      storeId: cleanRole === "seller" ? `store_${Date.now()}` : undefined,
      storeName: cleanRole === "seller" ? `${userName}'s Store` : undefined,
      addresses: [],
      emailPermissionsGranted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sessionToken = generateSessionToken(userId, cleanRole);

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully. Login granted.",
      token: sessionToken,
      user: verifiedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
