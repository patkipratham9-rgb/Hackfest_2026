import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, category, orderId, message } = body;

    // Validation
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a message of at least 10 characters." },
        { status: 400 }
      );
    }

    // Clean optional phone
    let cleanPhone: string | null = null;
    if (phone && typeof phone === "string" && phone.trim()) {
      const digits = phone.replace(/\D/g, "").slice(-10);
      if (digits.length === 10) {
        cleanPhone = `+91 ${digits}`;
      }
    }

    // Generate unique human-readable ticket ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TICK-LL-${randomSuffix}`;

    const record = {
      ticket_id: ticketId,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      category: category?.trim() || "General Inquiry",
      order_id: orderId?.trim() || null,
      message: message.trim(),
      status: "open",
      created_at: new Date().toISOString(),
    };

    // 1. Attempt to insert into Supabase
    let savedToDb = false;
    try {
      const supabase = createServerSupabaseClient();
      const { error } = await supabase.from("contact_messages").insert([record]);
      if (!error) {
        savedToDb = true;
      }
    } catch {
      // Fall through to local fallback storage
    }

    // 2. Persistent fallback storage in data/contact_messages.json
    try {
      const dataDir = path.resolve(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const filePath = path.join(dataDir, "contact_messages.json");
      let messages: any[] = [];
      if (fs.existsSync(filePath)) {
        try {
          messages = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } catch {
          messages = [];
        }
      }
      messages.unshift({
        id: `msg_${Date.now()}`,
        ...record,
        savedToDb,
      });
      fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), "utf-8");
    } catch (e) {
      console.error("Local file storage fallback error:", e);
    }

    return NextResponse.json({
      success: true,
      ticketId,
      message: "Thank you for reaching out! Our Hubballi support desk has received your message.",
      estimatedResponseTime: "Within 2 to 4 business hours",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
