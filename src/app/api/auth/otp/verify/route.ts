import { NextRequest, NextResponse } from "next/server";
import {
  verifyPhoneOtp,
  verifyEmailOtp,
  validatePhoneNumber,
  validateEmail,
  generateSessionToken,
  sanitizeInput,
} from "@/lib/authSecurity";
import { UserRole, UserProfile } from "@/types";
import { saveUserProfileToDbAction } from "@/actions/marketplaceActions";
import { phoneToUuid, emailToUuid, findUserByPhone, findUserByEmail, upsertStoredUser } from "@/lib/userDb";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone =
      body.phone || body.number || body.phoneNumber || body.mobile || "";
    const email = body.email || body.emailAddress || "";
    const otp =
      body.otp || body.code || body.otpCode || body.token || body.pin || "";
    const { role = "customer", name } = body;

    if ((!phone && !email) || !otp) {
      return NextResponse.json(
        { success: false, message: "Phone number or email address, and OTP code are required" },
        { status: 400 }
      );
    }

    const cleanRole: UserRole = role === "seller" ? "seller" : "customer";

    // Email OTP Verification Flow
    if (email && (!phone || body.method === "email")) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return NextResponse.json({ success: false, message: emailValidation.error || "Invalid email" }, { status: 400 });
      }

      const cleanEmail = emailValidation.sanitized;
      const verification = verifyEmailOtp(cleanEmail, String(otp));

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

      // OTP is valid. Find or create user
      const existing = findUserByEmail(cleanEmail);
      const userId = existing?.id || emailToUuid(cleanEmail);
      const userName =
        sanitizeInput(name) ||
        existing?.name ||
        cleanEmail.split("@")[0].replace(/[._]/g, " ") ||
        (cleanRole === "seller" ? "Hubballi Merchant" : "Hubballi Shopper");

      const userPhone = phone ? phone.replace(/\D/g, "").slice(-10) : existing?.number || "9845012345";
      const addresses = existing?.addresses || [];

      const stored = upsertStoredUser({
        id: userId,
        name: userName,
        number: userPhone,
        email: cleanEmail,
        role: cleanRole,
        storeId: cleanRole === "seller" ? existing?.storeId || `store_${cleanEmail.replace(/[^a-z0-9]/gi, "_")}` : undefined,
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
        message: "Email OTP verified successfully. Login granted.",
        token: sessionToken,
        user: verifiedUser,
      });
    }

    // Phone OTP Verification Flow
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
