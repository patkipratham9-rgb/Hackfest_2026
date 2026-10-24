import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { Store } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(req.url);
    const area = searchParams.get("area");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query = supabase.from("stores").select("*");

    if (area && area !== "All") {
      query = query.eq("area", area);
    }
    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    if (search && search.trim() !== "") {
      query = query.or(`name.ilike.%${search}%,lane.ilike.%${search}%,tagline.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error || !data) {
      return NextResponse.json({ stores: [] });
    }

    const stores: Store[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline || "",
      category: row.category as any,
      area: row.area as any,
      lane: row.lane,
      distance: row.distance || "0.5 km",
      rating: Number(row.rating) || 5.0,
      reviewCount: row.review_count || 0,
      isOpen: row.is_open,
      openingHours: row.opening_hours || "8:00 AM - 9:00 PM",
      imageUrl: row.image_url || "",
      bannerUrl: row.banner_url || row.image_url || "",
      phone: row.phone || "",
      verified: row.verified ?? true,
    }));

    return NextResponse.json({ stores });
  } catch (err: any) {
    console.warn("API GET /api/stores notice:", err?.message);
    return NextResponse.json({ stores: [] });
  }
}
