/**
 * LocalLoop Store Analytics Engine (CP-GC01)
 * Real-time event tracking, validation, aggregation, and funnel metrics
 * for Hyperlocal Merchant Growth Coach
 */

import {
  AnalyticsEventType,
  StoreAnalyticsEvent,
  StoreAnalyticsSummary,
} from "@/types";

export const VALID_EVENT_TYPES: AnalyticsEventType[] = [
  "store_view",
  "product_view",
  "cart_add",
  "cart_remove",
  "checkout_start",
  "order_placed",
  "search_query",
];

export const LOCAL_STORAGE_ANALYTICS_KEY = "localloop_analytics_events_v1";

// In-memory events repository for server actions and isomorphic client execution
const memoryEventsStore: StoreAnalyticsEvent[] = [];

/**
 * Hubballi Local Baseline Seed Events
 * Provides rich historical data across storefront visits, product interest,
 * cart additions, and order conversions.
 */
export const SEED_ANALYTICS_EVENTS: StoreAnalyticsEvent[] = [
  {
    id: "evt-seed-001",
    storeId: "store-1",
    eventType: "store_view",
    sessionId: "sess-vdy-101",
    metadata: { area: "Vidyanagar", referrer: "category_bakery" },
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "evt-seed-002",
    storeId: "store-1",
    productId: "p1",
    productName: "Dharwad Pedha (500g)",
    eventType: "product_view",
    sessionId: "sess-vdy-101",
    metadata: { price: 280, category: "Sweets & Snacks" },
    createdAt: new Date(Date.now() - 3600000 * 47).toISOString(),
  },
  {
    id: "evt-seed-003",
    storeId: "store-1",
    productId: "p1",
    productName: "Dharwad Pedha (500g)",
    eventType: "cart_add",
    sessionId: "sess-vdy-101",
    metadata: { price: 280, quantity: 2 },
    createdAt: new Date(Date.now() - 3600000 * 46).toISOString(),
  },
  {
    id: "evt-seed-004",
    storeId: "store-1",
    eventType: "checkout_start",
    sessionId: "sess-vdy-101",
    metadata: { total: 560, paymentMethod: "upi" },
    createdAt: new Date(Date.now() - 3600000 * 45).toISOString(),
  },
  {
    id: "evt-seed-005",
    storeId: "store-1",
    eventType: "order_placed",
    sessionId: "sess-vdy-101",
    metadata: { orderId: "ORD-LL-9011", total: 575, paymentMethod: "upi" },
    createdAt: new Date(Date.now() - 3600000 * 44).toISOString(),
  },
  {
    id: "evt-seed-006",
    storeId: "store-1",
    eventType: "store_view",
    sessionId: "sess-cbt-102",
    metadata: { area: "CBT", referrer: "search_pedha" },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "evt-seed-007",
    storeId: "store-1",
    productId: "p2",
    productName: "Bikaneri Bhujia (250g)",
    eventType: "product_view",
    sessionId: "sess-cbt-102",
    metadata: { price: 120 },
    createdAt: new Date(Date.now() - 3600000 * 23).toISOString(),
  },
  {
    id: "evt-seed-008",
    storeId: "store-1",
    productId: "p2",
    productName: "Bikaneri Bhujia (250g)",
    eventType: "cart_add",
    sessionId: "sess-cbt-102",
    metadata: { price: 120, quantity: 1 },
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
  {
    id: "evt-seed-009",
    storeId: "store-1",
    eventType: "order_placed",
    sessionId: "sess-cbt-102",
    metadata: { orderId: "ORD-LL-9012", total: 135, paymentMethod: "counter" },
    createdAt: new Date(Date.now() - 3600000 * 21).toISOString(),
  },
  {
    id: "evt-seed-010",
    storeId: "store-1",
    productId: "p1",
    productName: "Dharwad Pedha (500g)",
    eventType: "product_view",
    sessionId: "sess-unk-103",
    metadata: { price: 280 },
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "evt-seed-011",
    storeId: "store-1",
    productId: "p1",
    productName: "Dharwad Pedha (500g)",
    eventType: "cart_add",
    sessionId: "sess-unk-103",
    metadata: { price: 280, quantity: 1 },
    createdAt: new Date(Date.now() - 3600000 * 11).toISOString(),
  },
  {
    id: "evt-seed-012",
    storeId: "store-1",
    eventType: "store_view",
    sessionId: "sess-unk-103",
    metadata: { area: "Unkal Lake" },
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: "evt-seed-013",
    storeId: "store-1",
    eventType: "order_placed",
    sessionId: "sess-unk-103",
    metadata: { orderId: "ORD-LL-9013", total: 295, paymentMethod: "upi" },
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: "evt-seed-014",
    storeId: "store-1",
    eventType: "store_view",
    sessionId: "sess-gkl-104",
    metadata: { area: "Gokul Road" },
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "evt-seed-015",
    storeId: "store-1",
    productId: "p1",
    productName: "Dharwad Pedha (500g)",
    eventType: "product_view",
    sessionId: "sess-gkl-104",
    metadata: { price: 280 },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "evt-seed-016",
    storeId: "store-1",
    productId: "p1",
    productName: "Dharwad Pedha (500g)",
    eventType: "cart_add",
    sessionId: "sess-gkl-104",
    metadata: { price: 280, quantity: 1 },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

/**
 * Validates an incoming analytics event payload
 */
export function validateAnalyticsEventPayload(payload: any): {
  valid: boolean;
  error?: string;
  sanitized?: Partial<StoreAnalyticsEvent>;
} {
  if (!payload || typeof payload !== "object") {
    return { valid: false, error: "Payload must be a valid JSON object" };
  }

  if (!payload.storeId || typeof payload.storeId !== "string" || !payload.storeId.trim()) {
    return { valid: false, error: "storeId is required and must be a non-empty string" };
  }

  if (!payload.eventType || !VALID_EVENT_TYPES.includes(payload.eventType as AnalyticsEventType)) {
    return {
      valid: false,
      error: `Invalid eventType '${payload.eventType}'. Must be one of: ${VALID_EVENT_TYPES.join(", ")}`,
    };
  }

  const sanitized: Partial<StoreAnalyticsEvent> = {
    storeId: payload.storeId.trim(),
    eventType: payload.eventType as AnalyticsEventType,
    productId: payload.productId && typeof payload.productId === "string" ? payload.productId.trim() : undefined,
    productName: payload.productName && typeof payload.productName === "string" ? payload.productName.trim() : undefined,
    sessionId: payload.sessionId && typeof payload.sessionId === "string" ? payload.sessionId.trim() : undefined,
    customerId: payload.customerId && typeof payload.customerId === "string" ? payload.customerId.trim() : undefined,
    metadata: payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {},
    createdAt: payload.createdAt && typeof payload.createdAt === "string" ? payload.createdAt : new Date().toISOString(),
  };

  return { valid: true, sanitized };
}

/**
 * Records a store analytics event into memory, localStorage, and async database
 */
export function recordStoreAnalyticsEvent(
  payload: any
): { success: boolean; event?: StoreAnalyticsEvent; error?: string } {
  const validation = validateAnalyticsEventPayload(payload);
  if (!validation.valid || !validation.sanitized) {
    return { success: false, error: validation.error };
  }

  const event: StoreAnalyticsEvent = {
    id: payload.id || `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    storeId: validation.sanitized.storeId!,
    eventType: validation.sanitized.eventType!,
    productId: validation.sanitized.productId,
    productName: validation.sanitized.productName,
    sessionId: validation.sanitized.sessionId,
    customerId: validation.sanitized.customerId,
    metadata: validation.sanitized.metadata || {},
    createdAt: validation.sanitized.createdAt || new Date().toISOString(),
  };

  // Add to in-memory store
  memoryEventsStore.unshift(event);

  // Sync with browser localStorage if running on client
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_ANALYTICS_KEY);
      const existing: StoreAnalyticsEvent[] = raw ? JSON.parse(raw) : [];
      existing.unshift(event);
      // Keep most recent 500 events
      window.localStorage.setItem(
        LOCAL_STORAGE_ANALYTICS_KEY,
        JSON.stringify(existing.slice(0, 500))
      );
    } catch {
      // LocalStorage access may fail in private mode
    }
  }

  return { success: true, event };
}

/**
 * Retrieves all analytics events for a store, with optional filters
 */
export function getStoreAnalyticsEvents(
  storeId: string,
  options?: {
    timeframe?: "today" | "7d" | "30d" | "all";
    limit?: number;
    eventType?: AnalyticsEventType;
  }
): StoreAnalyticsEvent[] {
  let allEvents = [...memoryEventsStore];

  // Merge client localStorage events if present
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_ANALYTICS_KEY);
      if (raw) {
        const localEvents: StoreAnalyticsEvent[] = JSON.parse(raw);
        const seenIds = new Set(allEvents.map((e) => e.id));
        for (const le of localEvents) {
          if (!seenIds.has(le.id)) {
            allEvents.push(le);
            seenIds.add(le.id);
          }
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Include baseline seeds if empty or matching store
  const seenIds = new Set(allEvents.map((e) => e.id));
  for (const seed of SEED_ANALYTICS_EVENTS) {
    if (!seenIds.has(seed.id) && (seed.storeId === storeId || storeId === "store-1" || !storeId)) {
      allEvents.push(seed);
      seenIds.add(seed.id);
    }
  }

  // Filter by storeId
  let filtered = allEvents.filter(
    (e) => e.storeId === storeId || (!e.storeId && storeId === "store-1")
  );

  // Filter by eventType
  if (options?.eventType) {
    filtered = filtered.filter((e) => e.eventType === options.eventType);
  }

  // Filter by timeframe
  if (options?.timeframe && options.timeframe !== "all") {
    const now = Date.now();
    let cutoff = 0;
    if (options.timeframe === "today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      cutoff = todayStart.getTime();
    } else if (options.timeframe === "7d") {
      cutoff = now - 7 * 24 * 3600 * 1000;
    } else if (options.timeframe === "30d") {
      cutoff = now - 30 * 24 * 3600 * 1000;
    }
    filtered = filtered.filter((e) => new Date(e.createdAt).getTime() >= cutoff);
  }

  // Sort newest first
  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (options?.limit && options.limit > 0) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

/**
 * Calculates a complete Store Analytics Summary with conversion funnels
 * and SKU performance metrics.
 */
export function calculateStoreAnalyticsSummary(
  storeId: string,
  timeframe: "today" | "7d" | "30d" | "all" = "7d",
  customEvents?: StoreAnalyticsEvent[]
): StoreAnalyticsSummary {
  const events = customEvents || getStoreAnalyticsEvents(storeId, { timeframe });

  let totalStoreViews = 0;
  let totalProductViews = 0;
  let totalCartAdds = 0;
  let totalOrdersPlaced = 0;

  const productStats: Record<
    string,
    { productId: string; productName: string; views: number; cartAdds: number; orders: number }
  > = {};

  for (const event of events) {
    switch (event.eventType) {
      case "store_view":
        totalStoreViews++;
        break;
      case "product_view":
        totalProductViews++;
        if (event.productId) {
          if (!productStats[event.productId]) {
            productStats[event.productId] = {
              productId: event.productId,
              productName: event.productName || `Product #${event.productId}`,
              views: 0,
              cartAdds: 0,
              orders: 0,
            };
          }
          productStats[event.productId].views++;
        }
        break;
      case "cart_add":
        totalCartAdds++;
        if (event.productId) {
          if (!productStats[event.productId]) {
            productStats[event.productId] = {
              productId: event.productId,
              productName: event.productName || `Product #${event.productId}`,
              views: 0,
              cartAdds: 0,
              orders: 0,
            };
          }
          productStats[event.productId].cartAdds++;
        }
        break;
      case "order_placed":
        totalOrdersPlaced++;
        break;
    }
  }

  // Calculate conversion rates
  const conversionRate =
    totalStoreViews > 0
      ? Number(((totalOrdersPlaced / totalStoreViews) * 100).toFixed(1))
      : 0;

  const cartConversionRate =
    totalCartAdds > 0
      ? Number(((totalOrdersPlaced / totalCartAdds) * 100).toFixed(1))
      : 0;

  // Build top products list sorted by interest (views + cartAdds)
  const topProducts = Object.values(productStats)
    .map((p) => ({
      ...p,
      conversionRate:
        p.views > 0 ? Number(((p.cartAdds / p.views) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.cartAdds * 2 + b.views - (a.cartAdds * 2 + a.views))
    .slice(0, 5);

  return {
    storeId,
    totalStoreViews,
    totalProductViews,
    totalCartAdds,
    totalOrdersPlaced,
    conversionRate,
    cartConversionRate,
    topProducts,
    recentEvents: events.slice(0, 10),
    timeframe,
  };
}
