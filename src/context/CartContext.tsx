"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Product, Order, OrderStatus, NeighborhoodArea, DeliveryPartner } from "@/types";
import { placeOrderAtomicAction, updateOrderStatusAction } from "@/actions/marketplaceActions";
import { recordStoreAnalyticsEvent } from "@/lib/analyticsTracker";

export function createDefaultDeliveryPartner(orderTime = new Date()): DeliveryPartner {
  const arrivalTime = new Date(orderTime.getTime() + 25 * 60 * 1000);
  const formattedTime = arrivalTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const partners = [
    {
      name: "Ramesh Kulkarni",
      phone: "+91 98450 88219",
      vehicle: "Hero Electric Optima",
      vehicleNumber: "KA-25-EM-4821",
      rating: 4.9,
      totalDeliveries: 540,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Suresh Patil",
      phone: "+91 98450 77312",
      vehicle: "Ather 450X Gen 3",
      vehicleNumber: "KA-25-EU-9204",
      rating: 4.95,
      totalDeliveries: 420,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    },
    {
      name: "Ganesh Desai",
      phone: "+91 98450 66491",
      vehicle: "TVS iQube S",
      vehicleNumber: "KA-25-EV-3185",
      rating: 4.88,
      totalDeliveries: 610,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    },
  ];

  const chosen = partners[Math.floor(Math.random() * partners.length)];

  return {
    id: `dp-${Date.now()}`,
    name: chosen.name,
    phone: chosen.phone,
    vehicle: chosen.vehicle,
    vehicleNumber: chosen.vehicleNumber,
    rating: chosen.rating,
    totalDeliveries: chosen.totalDeliveries,
    avatarUrl: chosen.avatarUrl,
    assignedAt: orderTime.toISOString(),
    estimatedArrivalMins: 25,
    estimatedArrivalTime: formattedTime,
    liveStatus: "out_for_delivery",
  };
}


interface CartContextType {
  cart: CartItem[];
  isLoaded: boolean;
  orders: Order[];
  activeArea: NeighborhoodArea;
  setActiveArea: (area: NeighborhoodArea) => void;
  userLocation: string;
  setUserLocation: (location: string) => void;
  isLocating: boolean;
  requestCurrentLocation: () => Promise<{ success: boolean; location?: string; error?: string }>;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  recentlyViewed: Product[];
  addRecentlyViewed: (product: Product) => void;
  reorderOrder: (orderId: string) => boolean;
  getOrderById: (orderId: string) => Order | undefined;
  createOrder: (data: {
    customerName: string;
    customerPhone: string;
    pickupTime: string;
    paymentMethod: "upi" | "counter";
    deliveryOption?: "delivery" | "pickup";
    deliveryAddress?: any;
    cashfreeOrderId?: string;
    cashfreePaymentId?: string;
    paymentStatus?: "paid" | "pending";
    items?: CartItem[];
    deliveryFee?: number;
    deliveryDistance?: number;
    gst?: number;
  }) => Order | null;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    meta?: { packedAt?: string; readyAt?: string; shelfSlot?: string; packingNotes?: string }
  ) => void;
  totalItems: number;
  subtotal: number;
  gstAmount: number;
  platformFee: number;
  totalAmount: number;
  minBillAmount: number;
  isMinBillMet: boolean;
  reorderableCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "localloop_cart_v1";
const ORDERS_STORAGE_KEY = "localloop_orders_v1";
const AREA_STORAGE_KEY = "localloop_area_v1";
const RECENT_STORAGE_KEY = "localloop_recent_v1";
const LOCATION_STORAGE_KEY = "localloop_user_location_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeArea, setActiveAreaState] = useState<NeighborhoodArea>("All");
  const [userLocation, setUserLocationState] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          const validItems: CartItem[] = parsed.filter(
            (item: any) =>
              item &&
              item.product &&
              typeof item.product.id === "string" &&
              typeof item.product.price === "number" &&
              typeof item.quantity === "number" &&
              item.quantity > 0
          );
          setCart(validItems);
        }
      }

      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        setOrders([]);
      }

      const savedArea = localStorage.getItem(AREA_STORAGE_KEY);
      if (savedArea) setActiveAreaState(savedArea as NeighborhoodArea);

      const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (savedLocation) setUserLocationState(savedLocation);

      const savedRecent = localStorage.getItem(RECENT_STORAGE_KEY);
      if (savedRecent) {
        setRecentlyViewed(JSON.parse(savedRecent));
      } else {
        setRecentlyViewed([]);
      }
    } catch (e) {
      console.warn("Storage sync error:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setUserLocation = (loc: string) => {
    setUserLocationState(loc);
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, loc);
    } catch {}
  };

  const requestCurrentLocation = async (): Promise<{ success: boolean; location?: string; error?: string }> => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return { success: false, error: "Geolocation is not supported by your browser." };
    }

    setIsLocating(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          const locStr = `Current GPS (${lat}° N, ${lng}° E • Hubballi)`;
          setUserLocation(locStr);
          resolve({ success: true, location: locStr });
        },
        (error) => {
          setIsLocating(false);
          let errorMsg = "Unable to retrieve your location.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = "Location access was denied. Please allow location in your browser or enter your address manually.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = "Location information is unavailable.";
          } else if (error.code === error.TIMEOUT) {
            errorMsg = "Location request timed out. Please try again or enter manually.";
          }
          resolve({ success: false, error: errorMsg });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // Save orders to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    }
  }, [orders, isLoaded]);

  // Save recently viewed to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentlyViewed));
    }
  }, [recentlyViewed, isLoaded]);

  const setActiveArea = (area: NeighborhoodArea) => {
    setActiveAreaState(area);
    localStorage.setItem(AREA_STORAGE_KEY, area);
  };

  const addRecentlyViewed = (product: Product) => {
    // Checkpoint CP-GC01: Track product view analytics event
    try {
      recordStoreAnalyticsEvent({
        storeId: product.storeId || "store-1",
        productId: product.id,
        productName: product.name,
        eventType: "product_view",
        metadata: { price: product.price, category: product.category },
      });
    } catch {
      // Non-blocking analytics tracking
    }

    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 10);
    });
  };

  const addToCart = (product: Product) => {
    addRecentlyViewed(product);

    // Checkpoint CP-GC01: Track cart addition analytics event
    try {
      recordStoreAnalyticsEvent({
        storeId: product.storeId || "store-1",
        productId: product.id,
        productName: product.name,
        eventType: "cart_add",
        metadata: { price: product.price },
      });
    } catch {
      // Non-blocking analytics tracking
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.warn("Error removing cart storage:", e);
    }
  };

  // One-tap reorder action
  const reorderOrder = (orderId: string): boolean => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.items.length === 0) return false;

    setCart((prev) => {
      const newCart = [...prev];
      targetOrder.items.forEach(({ product, quantity }) => {
        const existingIndex = newCart.findIndex((i) => i.product.id === product.id);
        if (existingIndex >= 0) {
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: newCart[existingIndex].quantity + quantity,
          };
        } else {
          newCart.push({ product, quantity });
        }
      });
      return newCart;
    });

    setIsCartOpen(true);
    return true;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const gstAmount = Math.round(subtotal * 0.05);
  const platformFee = totalItems > 0 ? 15 : 0;
  const minBillAmount = 599;
  const isMinBillMet = subtotal >= minBillAmount;
  const totalAmount = subtotal + gstAmount + platformFee;
  const reorderableCount = orders.length;

  const getOrderById = (orderId: string): Order | undefined => {
    const fromState = orders.find((o) => o.id === orderId);
    if (fromState) return fromState;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (raw) {
          const parsed: Order[] = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.find((o) => o.id === orderId);
          }
        }
      } catch (err) {
        console.warn("Error reading order from localStorage:", err);
      }
    }
    return undefined;
  };

  const createOrder = (data: {
    customerName: string;
    customerPhone: string;
    pickupTime: string;
    paymentMethod: "upi" | "counter";
    deliveryOption?: "delivery" | "pickup";
    deliveryAddress?: any;
    cashfreeOrderId?: string;
    cashfreePaymentId?: string;
    paymentStatus?: "paid" | "pending";
    items?: CartItem[];
    deliveryFee?: number;
    deliveryDistance?: number;
    gst?: number;
  }): Order | null => {
    const orderItems = data.items && data.items.length > 0 ? data.items : cart;
    if (orderItems.length === 0) return null;

    const primaryStoreName = orderItems[0].product.storeName;
    const primaryStoreId = orderItems[0].product.storeId;
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const pickupDigits = Math.floor(100 + Math.random() * 900);

    const orderSubtotal = data.items
      ? data.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      : subtotal;
    const orderGst = typeof data.gst === "number" ? data.gst : Math.round(orderSubtotal * 0.05);
    const orderPlatformFee = 15;
    const orderDeliveryFee = typeof data.deliveryFee === "number" ? data.deliveryFee : 0;
    const orderDeliveryDistance = typeof data.deliveryDistance === "number" ? data.deliveryDistance : 0;
    const orderTotal = orderSubtotal + orderGst + orderPlatformFee + orderDeliveryFee;

    const orderCreatedAt = new Date();
    const partner = createDefaultDeliveryPartner(orderCreatedAt);

    const newOrder: Order = {
      id: `ORD-LL-${orderNumber}`,
      storeId: primaryStoreId,
      storeName: primaryStoreName,
      storeArea: activeArea === "All" ? "Vidyanagar" : activeArea,
      storeLane: "Main Market Cross",
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      items: [...orderItems],
      subtotal: orderSubtotal,
      gst: orderGst,
      platformFee: orderPlatformFee,
      deliveryFee: orderDeliveryFee,
      deliveryDistance: orderDeliveryDistance,
      total: orderTotal,
      status: "placed",
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus || (data.paymentMethod === "upi" ? "paid" : "pending"),
      pickupTime: data.pickupTime,
      pickupCode: `LL-${pickupDigits}`,
      deliveryOption: data.deliveryOption || "pickup",
      deliveryAddress: data.deliveryAddress,
      cashfreeOrderId: data.cashfreeOrderId,
      cashfreePaymentId: data.cashfreePaymentId,
      deliveryPartner: partner,
      estimatedArrival: partner.estimatedArrivalTime,
      createdAt: orderCreatedAt.toISOString(),
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    // Checkpoint CP-GC01: Track order conversion analytics event
    try {
      recordStoreAnalyticsEvent({
        storeId: primaryStoreId || "store-1",
        eventType: "order_placed",
        metadata: {
          orderId: newOrder.id,
          total: orderTotal,
          itemsCount: orderItems.length,
          paymentMethod: data.paymentMethod,
        },
      });
    } catch {
      // Non-blocking analytics tracking
    }
    if (!data.items) {
      clearCart();
    }
    setIsCheckoutOpen(false);
    setIsCartOpen(false);

    // Call Supabase Postgres RPC atomic order creation asynchronously in background
    placeOrderAtomicAction({
      orderId: newOrder.id,
      storeId: primaryStoreId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      items: cart.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
        unit_price: i.product.price,
      })),
      subtotal,
      platformFee,
      total: totalAmount,
      paymentMethod: data.paymentMethod,
      pickupTime: data.pickupTime,
      pickupCode: newOrder.pickupCode,
    }).catch((err) => {
      console.warn("Supabase atomic order sync note:", err);
    });

    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    meta?: { packedAt?: string; readyAt?: string; shelfSlot?: string; packingNotes?: string }
  ) => {
    setOrders((prev) => {
      const updated = prev.map((ord) =>
        ord.id === orderId ? { ...ord, status, ...(meta || {}) } : ord
      );
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage sync error:", e);
      }
      return updated;
    });

    updateOrderStatusAction(orderId, status).catch((err) => {
      console.warn("Supabase status sync note:", err);
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoaded,
        orders,
        activeArea,
        setActiveArea,
        userLocation,
        setUserLocation,
        isLocating,
        requestCurrentLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isProfileOpen,
        setIsProfileOpen,
        recentlyViewed,
        addRecentlyViewed,
        reorderOrder,
        getOrderById,
        createOrder,
        updateOrderStatus,
        totalItems,
        subtotal,
        gstAmount,
        platformFee,
        totalAmount,
        minBillAmount,
        isMinBillMet,
        reorderableCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
