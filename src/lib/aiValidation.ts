import { ProductCategory } from "@/types";
import { ProductListingDraft } from "@/lib/aiProvider";

/**
 * LocalLoop AI Structured Output Schema Validation & Sanitization Engine
 * Checkpoint CP-AI03: Validated Structured Output & Coercion Rules
 */

export const CANONICAL_CATEGORIES: ProductCategory[] = [
  "Grocery",
  "Bakery",
  "Produce",
  "Household",
  "Sweets & Snacks",
  "Handloom & Crafts",
  "Filter Coffee & Tea",
  "Fresh Produce",
  "Spices & Pantry",
];

export interface ValidationResult<T> {
  valid: boolean;
  data: T;
  errors: string[];
  repaired: boolean;
  schemaVersion: string;
}

export interface GrowthCoachInsight {
  id: string;
  title: string;
  metric: string;
  desc: string;
  badge: "High Impact" | "Loyalty Driver" | "Operational Excellence";
  actionable: boolean;
}

/**
 * 1. Category Coercion Engine
 * Normalizes informal or slight LLM category variants into strictly valid LocalLoop categories.
 */
export function coerceToValidCategory(rawCategory?: any): ProductCategory {
  if (!rawCategory || typeof rawCategory !== "string") {
    return "Grocery";
  }

  const trimmed = rawCategory.trim();

  // Exact match check
  const exactMatch = CANONICAL_CATEGORIES.find(
    (c) => c.toLowerCase() === trimmed.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  const lower = trimmed.toLowerCase();

  // Alias & fuzzy pattern matching
  if (lower.includes("coffee") || lower.includes("tea") || lower.includes("brew") || lower.includes("chicory")) {
    return "Filter Coffee & Tea";
  }
  if (lower.includes("sweet") || lower.includes("mithai") || lower.includes("snack") || lower.includes("namkeen") || lower.includes("pedha")) {
    return "Sweets & Snacks";
  }
  if (lower.includes("bakery") || lower.includes("bread") || lower.includes("cake") || lower.includes("toast") || lower.includes("khari")) {
    return "Bakery";
  }
  if (lower.includes("craft") || lower.includes("handloom") || lower.includes("saree") || lower.includes("sari") || lower.includes("weave") || lower.includes("textile")) {
    return "Handloom & Crafts";
  }
  if (lower.includes("spice") || lower.includes("masala") || lower.includes("chili") || lower.includes("mirchi") || lower.includes("pantry")) {
    return "Spices & Pantry";
  }
  if (lower.includes("vegetable") || lower.includes("fruit") || lower.includes("fresh") || lower.includes("greens")) {
    return "Fresh Produce";
  }
  if (lower.includes("diya") || lower.includes("clay") || lower.includes("brass") || lower.includes("home") || lower.includes("house") || lower.includes("lamp")) {
    return "Household";
  }

  return "Grocery";
}

/**
 * 2. Product Listing Draft Schema Validator & Sanitizer
 * Validates, cleans, types, and repairs raw LLM JSON outputs into strict ProductListingDraft models.
 */
export function validateProductListingDraft(raw: any): ValidationResult<ProductListingDraft> {
  const errors: string[] = [];
  let repaired = false;

  if (!raw || typeof raw !== "object") {
    errors.push("Invalid input: payload must be a non-null JSON object");
    return {
      valid: false,
      data: {
        title: "Artisanal Hubballi Product",
        description: "Locally handcrafted in Hubballi, Karnataka.",
        category: "Grocery",
        unit: "per piece",
        suggestedPrice: 150,
        tags: ["local", "hubballi", "artisanal"],
        highlights: ["Handcrafted locally", "Fresh quality guaranteed"],
      },
      errors,
      repaired: true,
      schemaVersion: "1.0.0",
    };
  }

  // --- 1. Title Validation & Normalization ---
  let title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) {
    errors.push("Missing required field: title");
    title = "Authentic Hubballi Specialty Product";
    repaired = true;
  } else if (title.length < 3) {
    errors.push("Title too short: must be at least 3 characters");
    title = `${title} (Hubballi Authentic)`;
    repaired = true;
  } else if (title.length > 120) {
    title = title.slice(0, 117).trim() + "...";
    repaired = true;
  }

  // --- 2. Description Validation ---
  let description = typeof raw.description === "string" ? raw.description.trim() : "";
  if (!description) {
    errors.push("Missing required field: description");
    description = "Authentic heritage specialty crafted by local Hubballi merchants with pure ingredients and traditional care.";
    repaired = true;
  } else if (description.length < 10) {
    errors.push("Description too brief: must be at least 10 characters");
    description = `${description}. Handcrafted with traditional expertise by local artisans in Hubballi.`;
    repaired = true;
  } else if (description.length > 600) {
    description = description.slice(0, 597).trim() + "...";
    repaired = true;
  }

  // --- 3. Category Validation & Coercion ---
  const rawCat = raw.category;
  const category = coerceToValidCategory(rawCat);
  if (rawCat !== category) {
    repaired = true;
  }

  // --- 4. Unit Packaging Validation ---
  let unit = typeof raw.unit === "string" ? raw.unit.trim().toLowerCase() : "per piece";
  if (!unit) {
    unit = "per piece";
    repaired = true;
  } else {
    // Standardize common unit phrases
    if (unit === "piece" || unit === "pc" || unit === "1") unit = "per piece";
    else if (unit === "kg" || unit === "1kg") unit = "per kg";
    else if (unit.match(/^\d+g$/)) unit = `${unit} pack`;
  }

  // --- 5. Suggested Price Validation & Sanitization ---
  let suggestedPrice = Number(raw.suggestedPrice);
  if (isNaN(suggestedPrice) || suggestedPrice <= 0) {
    errors.push("Invalid price: suggestedPrice must be a positive number");
    suggestedPrice = 150;
    repaired = true;
  } else {
    // Round to nearest rupee and bound to sensible limits
    suggestedPrice = Math.round(Math.max(5, Math.min(suggestedPrice, 50000)));
    if (suggestedPrice !== raw.suggestedPrice) {
      repaired = true;
    }
  }

  // --- 6. Search Tags Validation & Sanitization ---
  let tags: string[] = [];
  if (Array.isArray(raw.tags)) {
    tags = raw.tags
      .map((t: any) => String(t || "").toLowerCase().replace(/[#,"'\\/]/g, "").trim())
      .filter((t: string) => t.length >= 2);
  } else if (typeof raw.tags === "string") {
    tags = raw.tags
      .split(/[,#]/)
      .map((t: string) => t.toLowerCase().trim())
      .filter((t: string) => t.length >= 2);
    repaired = true;
  }

  // Deduplicate and enforce reasonable tag limits (3 - 8 tags)
  tags = Array.from(new Set(tags));
  if (tags.length < 3) {
    const fallbackTags = ["hubballi", "local", "authentic", "fresh"];
    for (const fb of fallbackTags) {
      if (!tags.includes(fb) && tags.length < 4) tags.push(fb);
    }
    repaired = true;
  }
  if (tags.length > 8) {
    tags = tags.slice(0, 8);
    repaired = true;
  }

  // --- 7. Highlights Bullet Points Validation ---
  let highlights: string[] = [];
  if (Array.isArray(raw.highlights)) {
    highlights = raw.highlights
      .map((h: any) => String(h || "").trim())
      .filter((h: string) => h.length >= 3);
  }
  if (highlights.length < 2) {
    highlights = [
      "100% Authentic Hubballi regional heritage",
      "Freshly prepared and packaged by verified merchants",
      "Ready for convenient in-store counter pickup",
    ];
    repaired = true;
  } else if (highlights.length > 5) {
    highlights = highlights.slice(0, 5);
    repaired = true;
  }

  const sanitizedDraft: ProductListingDraft = {
    title,
    description,
    category,
    unit,
    suggestedPrice,
    tags,
    highlights,
    provider: raw.provider || "gemini",
    model: raw.model || "gemini-1.5-flash",
  };

  return {
    valid: errors.length === 0,
    data: sanitizedDraft,
    errors,
    repaired,
    schemaVersion: "1.0.0",
  };
}

/**
 * 3. AI Growth Coach Insight Schema Validator
 * Validates and sanitizes insight recommendations generated by AI analytics.
 */
export function validateGrowthCoachInsight(raw: any): ValidationResult<GrowthCoachInsight> {
  const errors: string[] = [];
  let repaired = false;

  const validBadges = ["High Impact", "Loyalty Driver", "Operational Excellence"] as const;

  let title = typeof raw?.title === "string" ? raw.title.trim() : "";
  if (!title) {
    title = "Local Market Opportunity";
    errors.push("Missing title");
    repaired = true;
  }

  let metric = typeof raw?.metric === "string" ? raw.metric.trim() : "";
  if (!metric) {
    metric = "+25% Growth Trend";
    repaired = true;
  }

  let desc = typeof raw?.desc === "string" ? raw.desc.trim() : "";
  if (!desc || desc.length < 15) {
    desc = "Shopper engagement has increased in your locality. Ensure counter stock is replenished for express pickup.";
    repaired = true;
  }

  let badge: (typeof validBadges)[number] = "High Impact";
  if (validBadges.includes(raw?.badge)) {
    badge = raw.badge;
  } else {
    repaired = true;
  }

  return {
    valid: errors.length === 0,
    data: {
      id: raw?.id || `insight-${Date.now()}`,
      title,
      metric,
      desc,
      badge,
      actionable: Boolean(raw?.actionable ?? true),
    },
    errors,
    repaired,
    schemaVersion: "1.0.0",
  };
}
