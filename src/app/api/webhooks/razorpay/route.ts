import { NextRequest, NextResponse } from "next/server";
import { POST as cashfreeWebhookPost } from "../cashfree/route";

export const dynamic = "force-dynamic";

/**
 * @deprecated Use /api/webhooks/cashfree instead.
 * Automatically delegates to Cashfree webhook handler.
 */
export async function POST(req: NextRequest) {
  return cashfreeWebhookPost(req);
}
