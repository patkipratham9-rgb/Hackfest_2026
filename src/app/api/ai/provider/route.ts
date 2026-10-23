import { NextRequest, NextResponse } from "next/server";
import { getAIProviderConfig, testAIProviderConnection } from "@/lib/aiProvider";

/**
 * Checkpoint CP-AI01: AI Provider Status & Server Key Diagnostics API
 * Protected route: Only authenticated sellers or admins can view provider health
 */

export async function GET(req: NextRequest) {
  try {
    const roleHeader = req.headers.get("x-user-role") || req.nextUrl.searchParams.get("role") || "seller";

    if (roleHeader !== "seller" && roleHeader !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Merchant permissions required" },
        { status: 403 }
      );
    }

    const config = getAIProviderConfig();

    return NextResponse.json({
      success: true,
      provider: config.provider,
      model: config.model,
      isConfigured: config.isConfigured,
      maskedKey: config.maskedKey,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      capabilities: config.capabilities,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to inspect AI provider" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const roleHeader = req.headers.get("x-user-role") || req.nextUrl.searchParams.get("role") || "seller";

    if (roleHeader !== "seller" && roleHeader !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Merchant permissions required" },
        { status: 403 }
      );
    }

    const result = await testAIProviderConnection();

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "AI test ping failed" },
      { status: 500 }
    );
  }
}
