/**
 * LocalLoop Personalized Recommendation Engine
 * Computes recommendations based on:
 * 1. User search queries (recent searched items)
 * 2. Recently viewed products (browsing history)
 * 3. Category interest affinity & bestselling neighborhood items
 */

import { Product } from "@/types";

const RECENT_SEARCHES_KEY = "localloop_recent_searches_v1";

/**
 * Record a user search query
 */
export function recordUserSearchQuery(query: string) {
  if (typeof window === "undefined" || !query || !query.trim()) return;
  try {
    const clean = query.trim().toLowerCase();
    if (!clean) return;
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    const searches: string[] = raw ? JSON.parse(raw) : [];
    const validSearches = Array.isArray(searches)
      ? searches.filter((s) => typeof s === "string" && s.trim().length > 0 && s.trim().toLowerCase() !== clean)
      : [];
    const filtered = [clean, ...validSearches].slice(0, 10);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  } catch {}
}

/**
 * Get saved recent search terms
 */
export function getSavedRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleanList = parsed
          .filter((s) => typeof s === "string" && s.trim().length > 0)
          .map((s) => s.trim().toLowerCase());
        return Array.from(new Set(cleanList));
      }
    }
  } catch {}
  return [];
}

/**
 * Compute personalized product recommendations
 */
export function computePersonalizedRecommendations(
  allProducts: Product[],
  recentlyViewed: Product[]
): {
  recommendations: Product[];
  recentSearches: string[];
  primaryInterestCategory: string;
} {
  const recentSearches = getSavedRecentSearches();

  // Determine top category from recently viewed products
  const categoryCounts: Record<string, number> = {};
  for (const p of recentlyViewed) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 2;
  }

  // Weight by recent searches
  for (const s of recentSearches) {
    for (const p of allProducts) {
      if (
        p.name.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(s)))
      ) {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      }
    }
  }

  // Find dominant interest category
  let topCategory = "Household";
  let maxWeight = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxWeight) {
      maxWeight = count;
      topCategory = cat;
    }
  }

  // Score candidate products
  const scored = allProducts.map((prod) => {
    let score = 0;

    // 1. Category affinity match
    if (prod.category === topCategory) {
      score += 40;
    }

    // 2. Search match
    for (const s of recentSearches) {
      if (prod.name.toLowerCase().includes(s)) score += 30;
      if (prod.description && prod.description.toLowerCase().includes(s)) score += 15;
    }

    // 3. Featured or bestseller boost
    if (prod.isBestseller) score += 20;

    // 4. In-stock penalty if zero
    if (prod.stock <= 0) score -= 50;

    return { product: prod, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return {
    recommendations: scored.map((s) => s.product).slice(0, 8),
    recentSearches,
    primaryInterestCategory: topCategory,
  };
}
