import { NextRequest, NextResponse } from "next/server";
import {
  verifyPhoneOtp,
  validatePhoneNumber,
  generateSessionToken,
  sanitizeInput,
} from "@/lib/authSecurity";
import { UserRole, UserProfile } from "@/types";
import { saveUserProfileToDbAction } from "@/actions/marketplaceActions";
import { phoneToUuid, findUserByPhone, upsertStoredUser } from "@/lib/userDb";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone =
      body.phone || body.number || body.phoneNumber || body.mobile || "";
    const otp =
      body.otp || body.code || body.otpCode || body.token || body.pin || "";
    const { role = "customer", name, email } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: "Both phone number and OTP code are required" },
        { status: 400 }
      );
    }

    const verification = verifyPhoneOtp(phone, String(otp));

    if (!verification.success) {
      return NextResponse.json(
        {
          success: false,
          message: verification.message,
          remainingAttempts: verification.remainingAttempts,
          lockedUntil: verification.lockedUntil,
        },
        { status: 400 }
      );
    }

    // OTP is valid. Generate or retrieve verified user from database
    const phoneValidation = validatePhoneNumber(phone);
    const cleanPhone = phoneValidation.cleanNumber;
    const cleanRole: UserRole = role === "seller" ? "seller" : "customer";

    // 1. Look for existing user in database
    const existing = findUserByPhone(cleanPhone);
    const userId = existing?.id || phoneToUuid(cleanPhone);

    const userName =
      sanitizeInput(name) ||
      existing?.name ||
      (cleanRole === "seller" ? "Hubballi Merchant" : "Hubballi Shopper");

    const userEmail = email ? sanitizeInput(email).toLowerCase() : existing?.email;
    const addresses = existing?.addresses || [];

    // 2. Persist in database
    const stored = upsertStoredUser({
      id: userId,
      name: userName,
      number: cleanPhone,
      email: userEmail,
      role: cleanRole,
      storeId: cleanRole === "seller" ? existing?.storeId || `store_${cleanPhone}` : undefined,
      storeName: cleanRole === "seller" ? existing?.storeName || `${userName}'s Store` : undefined,
      addresses,
    });

    const verifiedUser: UserProfile = {
      id: stored.id,
      name: stored.name,
      number: stored.number,
      email: stored.email,
      role: stored.role,
      storeId: stored.storeId,
      storeName: stored.storeName,
      addresses: stored.addresses,
      emailPermissionsGranted: true,
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
    };

    const sessionToken = generateSessionToken(userId, cleanRole);

    // Synchronize to Supabase database
    try {
      await saveUserProfileToDbAction({
        id: verifiedUser.id,
        fullName: verifiedUser.name,
        phone: verifiedUser.number,
        email: verifiedUser.email,
        addresses: verifiedUser.addresses,
      });
    } catch {}

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
