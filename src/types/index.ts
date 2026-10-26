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
  location?: string;
  shopTiming?: string;
  holidays?: string;
  businessType?: string;
  contactPhone?: string;
  panNumber?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankName?: string;
  pickupAddress?: string;
  returnAddress?: string;
  logoUrl?: string;
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
  productType?: string;
  quantityValue?: string;
  quantityUnit?: string;
  netQuantity?: string;
  availableSizes?: string;
  availableFormats?: string;
  aiGenerated?: boolean;
  aiApprovedAt?: string;
  aiApprovedBy?: string;
  storeDistance?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = "placed" | "packed" | "ready" | "completed" | "cancelled";
export type DeliveryOption = "delivery" | "pickup";

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
  avatarUrl: string;
  assignedAt: string;
  estimatedArrivalMins: number;
  estimatedArrivalTime: string;
  liveStatus: "assigned" | "reaching_store" | "out_for_delivery" | "arriving_shortly" | "delivered";
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  storeArea: string;
  storeLane: string;
  customerName: string;
  customerPhone: string;
  customerId?: string;
  userId?: string;
  customerEmail?: string;
  items: CartItem[];
  subtotal: number;
  gst?: number;
  platformFee: number;
  deliveryFee?: number;
  deliveryDistance?: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "upi" | "counter";
  paymentStatus: "paid" | "pending";
  pickupTime: string;
  pickupCode: string;
  deliveryOption?: DeliveryOption;
  deliveryAddress?: UserAddress | { label: string; street: string; locality: string; pincode: string; landmark?: string };
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  deliveryPartner?: DeliveryPartner;
  estimatedArrival?: string;
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

export interface TrafficSource {
  channel: string;
  visitors: number;
  percentage: number;
  iconName?: string;
}

export interface NeighborhoodTraffic {
  area: string;
  visitors: number;
  percentage: number;
}

export interface HourlyTrafficPoint {
  hour: string;
  visitors: number;
  isPeak?: boolean;
}

export interface DailyTrafficTrend {
  date: string;
  visitors: number;
  pageViews: number;
}

export interface TrafficMetrics {
  storeId: string;
  uniqueVisitors: number;
  totalSessions: number;
  avgSessionDuration: string;
  bounceRate: number; // percentage
  peakHour: string;
  sources: TrafficSource[];
  neighborhoods: NeighborhoodTraffic[];
  hourlyDistribution: HourlyTrafficPoint[];
  dailyTrend: DailyTrafficTrend[];
  timeframe: "today" | "7d" | "30d" | "all";
}

export type RecommendationCategory =
  | "pricing"
  | "inventory"
  | "marketing"
  | "operational"
  | "bundling";

export type RecommendationBadge =
  | "High Impact"
  | "Loyalty Driver"
  | "Operational Excellence"
  | "Quick Win";

export interface AIBusinessRecommendation {
  id: string;
  storeId: string;
  title: string;
  category: RecommendationCategory;
  badge: RecommendationBadge;
  metric: string;
  impact: string;
  reasoning: string;
  actionable: boolean;
  actionLabel?: string;
  actionPayload?: Record<string, any>;
  confidenceScore: number;
  createdAt: string;
  applied?: boolean;
  appliedAt?: string;
}

// ==========================================
// USER, ADDRESS, AUTH & APPLICATION PROFILES
// ==========================================

export type AddressType = "Primary" | "Home" | "Office" | "Others";

export interface UserAddress {
  id: string;
  label: AddressType;
  street: string;
  landmark?: string;
  locality: NeighborhoodArea | string;
  city: string; // "Hubballi-Dharwad"
  pincode: string;
  isDefault: boolean;
}

export type UserRole = "customer" | "seller" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  number: string; // 10-digit phone
  email?: string; // Optional email field
  role: UserRole;
  storeId?: string; // Associated merchant store (if seller)
  storeName?: string;
  addresses: UserAddress[];
  emailPermissionsGranted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token?: string;
  loginMethod?: "phone_otp" | "email_permission" | "guest";
}

