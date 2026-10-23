"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Product, Order, OrderStatus, NeighborhoodArea } from "@/types";
import { placeOrderAtomicAction, updateOrderStatusAction } from "@/actions/marketplaceActions";
import { recordStoreAnalyticsEvent } from "@/lib/analyticsTracker";


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
    items?: CartItem[];
  }) => Order | null;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    meta?: { packedAt?: string; readyAt?: string; shelfSlot?: string; packingNotes?: string }
  ) => void;
  totalItems: number;
  subtotal: number;
  platformFee: number;
  totalAmount: number;
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
  const platformFee = totalItems > 0 ? 15 : 0;
  const totalAmount = subtotal + platformFee;
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
    items?: CartItem[];
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
    const orderPlatformFee = 15;
    const orderTotal = orderSubtotal + orderPlatformFee;

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
      platformFee: orderPlatformFee,
      total: orderTotal,
      status: "placed",
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === "upi" ? "paid" : "pending",
      pickupTime: data.pickupTime,
      pickupCode: `LL-${pickupDigits}`,
      createdAt: new Date().toISOString(),
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
        platformFee,
        totalAmount,
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
