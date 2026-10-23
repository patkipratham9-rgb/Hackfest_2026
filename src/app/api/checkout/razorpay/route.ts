import { NextRequest, NextResponse } from "next/server";
import { POST as cashfreePost } from "../cashfree/route";

export const dynamic = "force-dynamic";

/**
 * @deprecated Use /api/checkout/cashfree instead.
 * Automatically adapts and routes requests to Cashfree PG.
 */
export async function POST(req: NextRequest) {
  return cashfreePost(req);
}
