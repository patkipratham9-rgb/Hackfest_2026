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
