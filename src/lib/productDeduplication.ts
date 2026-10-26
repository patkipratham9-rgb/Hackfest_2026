import { Product } from "@/types";

/**
 * Standardizes common quantity metric unit strings (e.g. "gms", "gm", "gram" -> "g").
 */
function standardizeUnit(unit: string): string {
  const u = unit.toLowerCase().replace(/[^a-z]/g, "");
  if (u === "kg" || u === "kgs" || u === "kilo" || u === "kilogram" || u === "kilograms") return "kg";
  if (u === "g" || u === "gm" || u === "gms" || u === "gram" || u === "grams") return "g";
  if (u === "l" || u === "ltr" || u === "ltrs" || u === "litre" || u === "litres" || u === "liter" || u === "liters") return "l";
  if (u === "ml" || u === "millilitre" || u === "millilitres" || u === "milliliter") return "ml";
  if (u === "pcs" || u === "pc" || u === "piece" || u === "pieces") return "pcs";
  return u;
}

/**
 * Cleans and standardizes a quantity string.
 */
function cleanQuantityString(str: string): string {
  const match = str.toLowerCase().match(/(\d+(?:\.\d+)?)\s*([a-z]+)/i);
  if (match) {
    const num = match[1];
    const unit = standardizeUnit(match[2]);
    return `${num} ${unit}`;
  }
  return str.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Normalizes a quantity string or values for consistent comparison.
 * e.g., "500 gm", "500 g", "500gms", "0.5kg" -> standardized format
 */
export function normalizeProductQuantity(product: Product): string {
  if (!product) return "";

  // 1. Explicit metric quantity fields (quantityValue + quantityUnit)
  const val = (product.quantityValue || "").trim().toLowerCase();
  const rawUnit = (product.quantityUnit || "").trim().toLowerCase();

  if (val && rawUnit) {
    const cleanUnit = standardizeUnit(rawUnit);
    return `${val} ${cleanUnit}`;
  }

  // 2. netQuantity (e.g. "500g" or "1 kg")
  const netQty = (product.netQuantity || "").trim().toLowerCase();
  if (netQty) {
    return cleanQuantityString(netQty);
  }

  // 3. unit (e.g. "500g", "1 kg", "per piece")
  const unit = (product.unit || "").trim().toLowerCase();
  if (unit && unit !== "per piece" && unit !== "piece" && unit !== "item") {
    const cleaned = cleanQuantityString(unit);
    if (cleaned) return cleaned;
  }

  // 4. Try extracting quantity from product name (e.g. "Mishra Pedha 500g", "Filter Coffee 250 g")
  const name = (product.name || "").trim().toLowerCase();
  const match = name.match(/(?:^|\s|\()(\d+(?:\.\d+)?\s*(?:kg|g|gm|gms|gram|grams|l|ml|ltr|litre|litres|pcs|pieces|pack|box|bunch))\b/i);
  if (match) {
    return cleanQuantityString(match[1]);
  }

  return unit ? cleanQuantityString(unit) : "";
}

/**
 * Creates a unique signature for an item based on exact name, quantity, and price.
 */
export function getProductDeduplicationKey(product: Product): string {
  if (!product) return "";
  const name = (product.name || "").trim().toLowerCase().replace(/\s+/g, " ");
  const quantity = normalizeProductQuantity(product);
  const price = Number(product.price).toFixed(2);
  return `${name}:::${quantity}:::${price}`;
}

/**
 * Filters out duplicate items with the exact name, quantity, and price in the user application.
 * When duplicates exist, retains the item with richer information (e.g., custom image, stock, tags).
 */
export function deduplicateProducts(products: Product[]): Product[] {
  if (!Array.isArray(products)) return [];

  const seenMap = new Map<string, Product>();

  for (const product of products) {
    if (!product || !product.name) continue;

    const key = getProductDeduplicationKey(product);
    const existing = seenMap.get(key);

    if (!existing) {
      seenMap.set(key, product);
    } else {
      // If duplicate exists, prefer the one with a non-default custom image, stock > 0, or tags
      const hasBetterImage =
        Boolean(product.imageUrl && !product.imageUrl.includes("unsplash.com/photo-1546069901") && (!existing.imageUrl || existing.imageUrl.includes("unsplash.com/photo-1546069901")));
      const hasBetterStock = (product.stock || 0) > (existing.stock || 0);
      const hasMoreDetails =
        Boolean((product.productType && !existing.productType) ||
        (product.quantityValue && !existing.quantityValue) ||
        ((product.tags?.length || 0) > (existing.tags?.length || 0)));

      if (hasBetterImage || (hasBetterStock && !existing.imageUrl) || hasMoreDetails) {
        seenMap.set(key, {
          ...existing,
          ...product,
          id: existing.id || product.id, // preserve stable identity
        });
      }
    }
  }

  return Array.from(seenMap.values());
}
