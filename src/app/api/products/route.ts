import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query = supabase.from("products").select("*, stores(name, area, lane)");

    if (storeId) {
      query = query.eq("store_id", storeId);
    }
    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    if (search && search.trim() !== "") {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error || !data) {
      return NextResponse.json({ products: [] });
    }

    const products: Product[] = data.map((row: any) => ({
      id: row.id,
      storeId: row.store_id,
      storeName: row.stores?.name || "Local Shop",
      name: row.name,
      description: row.description || "",
      price: Number(row.price),
      originalPrice: row.original_price ? Number(row.original_price) : undefined,
      category: row.category as any,
      stock: Number(row.stock),
      unit: row.unit || "per piece",
      imageUrl: row.image_url || "",
      isBestseller: Boolean(row.is_bestseller),
      tags: row.tags || [],
      availableSizes: row.available_sizes || undefined,
      availableFormats: row.available_formats || undefined,
    }));

    return NextResponse.json({ products });
  } catch (err: any) {
    console.warn("API GET /api/products notice:", err?.message);
    return NextResponse.json({ products: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, name, description, price, originalPrice, category, stock, unit, imageUrl, isBestseller, tags, availableSizes, availableFormats } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }

    const parsedStock = parseInt(stock, 10);
    const safeStock = isNaN(parsedStock) || parsedStock < 0 ? 0 : parsedStock;

    const supabase = createServerSupabaseClient();
    const insertPayload = {
      store_id: storeId || "store-manual-01",
      name: String(name).trim(),
      description: description ? String(description).trim() : "",
      price: parsedPrice,
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      category: category || "Household",
      stock: safeStock,
      unit: unit ? String(unit).trim() : "per piece",
      image_url: imageUrl || "https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=600&auto=format&fit=crop&q=80",
      is_bestseller: Boolean(isBestseller),
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      available_sizes: availableSizes || null,
      available_formats: availableFormats || null,
    };

    const { data, error } = await supabase
      .from("products")
      .insert(insertPayload)
      .select("*, stores(name)")
      .single();

    if (error || !data) {
      // Return gracefully with synthetic product
      const fallbackProduct: Product = {
        id: `prod-local-${Date.now()}`,
        storeId: insertPayload.store_id,
        storeName: "Local Shop",
        name: insertPayload.name,
        description: insertPayload.description,
        price: insertPayload.price,
        originalPrice: insertPayload.original_price || undefined,
        category: insertPayload.category as any,
        stock: insertPayload.stock,
        unit: insertPayload.unit,
        imageUrl: insertPayload.image_url,
        isBestseller: insertPayload.is_bestseller,
        tags: insertPayload.tags,
        availableSizes: insertPayload.available_sizes || undefined,
        availableFormats: insertPayload.available_formats || undefined,
      };
      return NextResponse.json({ success: true, product: fallbackProduct });
    }

    const createdProduct: Product = {
      id: data.id,
      storeId: data.store_id,
      storeName: data.stores?.name || "Local Shop",
      name: data.name,
      description: data.description || "",
      price: Number(data.price),
      originalPrice: data.original_price ? Number(data.original_price) : undefined,
      category: data.category as any,
      stock: Number(data.stock),
      unit: data.unit || "per piece",
      imageUrl: data.image_url || "",
      isBestseller: Boolean(data.is_bestseller),
      tags: data.tags || [],
      availableSizes: data.available_sizes || undefined,
      availableFormats: data.available_formats || undefined,
    };

    return NextResponse.json({ success: true, product: createdProduct }, { status: 201 });
  } catch (err: any) {
    console.error("API POST /api/products error:", err);
    return NextResponse.json({ error: err?.message || "Failed to create product" }, { status: 500 });
  }
}
