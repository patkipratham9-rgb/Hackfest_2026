import { NextRequest, NextResponse } from "next/server";
import {
  verifyFirebaseIdToken,
  createLocalLoopProfileFromFirebase,
} from "@/lib/firebaseAdmin";
import { saveUserProfileToDbAction } from "@/actions/marketplaceActions";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);

    const body = await req.json().catch(() => ({}));
    const idToken = bearerMatch ? bearerMatch[1] : body.idToken || body.token;

    if (!idToken) {
      return NextResponse.json(
        { success: false, message: "Please verify your phone number first." },
        { status: 401 }
      );
    }

    const { name, role = "customer", storeName } = body;

    // Verify token & check revocation and phone verification (Correction A)
    const verification = await verifyFirebaseIdToken(idToken, true);

    if (!verification.success || !verification.user) {
      return NextResponse.json(
        {
          success: false,
          message:
            verification.error ||
            "Your session is invalid or expired. Please sign in again.",
        },
        { status: 401 }
      );
    }

    if (!verification.user.phoneVerified && !verification.user.phoneNumber) {
      return NextResponse.json(
        { success: false, message: "A verified phone number is required." },
        { status: 403 }
      );
    }

    const { user, sessionToken } = createLocalLoopProfileFromFirebase(
      verification.user,
      {
        name,
        role: role === "seller" ? "seller" : "customer",
        storeName,
      }
    );

    // Synchronize to database
    try {
      await saveUserProfileToDbAction({
        id: user.id,
        fullName: user.name,
        phone: user.number,
        email: user.email,
        addresses: user.addresses,
      });
    } catch (dbErr) {
      console.warn("DB profile sync notice during Firebase registration:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful!",
      user,
      token: sessionToken,
    });
  } catch (error: any) {
    console.error("Firebase auth endpoint error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Registration could not be completed." },
      { status: 500 }
    );
  }
}
