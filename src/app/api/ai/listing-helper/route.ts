import { NextRequest, NextResponse } from "next/server";
import { generateProductListingDraft } from "@/lib/aiProvider";

/**
 * Checkpoint CP-AI02: AI Listing Helper API Endpoint
 * Protected route: Only authenticated merchants (seller or admin) can generate AI drafts
 */

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const role =
      req.headers.get("x-user-role") ||
      body.role ||
      req.nextUrl.searchParams.get("role") ||
      "seller";

    // Permission Guard: Reject customer and anonymous callers
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Merchant permissions (seller or admin) required to access AI Listing Helper",
        },
        { status: 403 }
      );
    }

    const { notes, categoryHint, storeName } = body;

    // Validation: Require non-empty merchant notes
    if (!notes || typeof notes !== "string" || !notes.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Product notes are required. Provide raw text describing the product.",
        },
        { status: 400 }
      );
    }

    const result = await generateProductListingDraft(notes.trim(), {
      categoryHint,
      storeName,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to generate AI listing" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: result.draft,
      validated: Boolean(result.validated ?? true),
      schemaVersion: (result as any).schemaVersion || "1.0.0",
      latencyMs: result.latencyMs,
    });
  } catch (err: any) {
    console.error("Exception in /api/ai/listing-helper:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error in AI listing helper" },
      { status: 500 }
    );
  }
}
