export type NeighborhoodArea =
  | "All"
  | "Vidyanagar"
  | "Gokul Road"
  | "CBT"
  | "Station Road"
  | "Unkal Lake";

export type ProductCategory =
  | "All"
  | "Grocery"
  | "Bakery"
  | "Produce"
  | "Household"
  | "Sweets & Snacks"
  | "Handloom & Crafts"
  | "Filter Coffee & Tea"
  | "Fresh Produce"
  | "Spices & Pantry";

export interface Store {
  id: string;
  name: string;
  tagline: string;
  category: ProductCategory;
  area: NeighborhoodArea;
  lane: string;
  distance: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  openingHours: string;
  imageUrl: string;
  bannerUrl: string;
  phone: string;
  verified: boolean;
}

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  stock: number;
  unit: string;
  imageUrl: string;
  isBestseller?: boolean;
  tags?: string[];
  aiGenerated?: boolean;
  aiApprovedAt?: string;
  aiApprovedBy?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = "placed" | "packed" | "ready" | "completed" | "cancelled";

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  storeArea: string;
  storeLane: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  platformFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "upi" | "counter";
  paymentStatus: "paid" | "pending";
  pickupTime: string;
  pickupCode: string;
  createdAt: string;
  packedAt?: string;
  readyAt?: string;
  shelfSlot?: string;
  packingNotes?: string;
}

export type AnalyticsEventType =
  | "store_view"
  | "product_view"
  | "cart_add"
  | "cart_remove"
  | "checkout_start"
  | "order_placed"
  | "search_query";

export interface StoreAnalyticsEvent {
  id: string;
  storeId: string;
  productId?: string;
  productName?: string;
  eventType: AnalyticsEventType;
  sessionId?: string;
  customerId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface StoreAnalyticsSummary {
  storeId: string;
  storeName?: string;
  totalStoreViews: number;
  totalProductViews: number;
  totalCartAdds: number;
  totalOrdersPlaced: number;
  conversionRate: number; // percentage (orders / storeViews * 100)
  cartConversionRate: number; // percentage (orders / cartAdds * 100)
  topProducts: Array<{
    productId: string;
    productName: string;
    views: number;
    cartAdds: number;
    orders: number;
    conversionRate: number;
  }>;
  recentEvents: StoreAnalyticsEvent[];
  timeframe: "today" | "7d" | "30d" | "all";
}
