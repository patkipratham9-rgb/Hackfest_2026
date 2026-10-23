"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Product, Order, OrderStatus, NeighborhoodArea } from "@/types";
import { placeOrderAtomicAction, updateOrderStatusAction } from "@/actions/marketplaceActions";
import { MOCK_PRODUCTS } from "@/data/mockData";

interface CartContextType {
  cart: CartItem[];
  orders: Order[];
  activeArea: NeighborhoodArea;
  setActiveArea: (area: NeighborhoodArea) => void;
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
  createOrder: (data: {
    customerName: string;
    customerPhone: string;
    pickupTime: string;
    paymentMethod: "upi" | "counter";
  }) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeArea, setActiveAreaState] = useState<NeighborhoodArea>("All");
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        const initialOrder1: Order = {
          id: "ORD-LL-8921",
          storeId: "11111111-1111-1111-1111-111111111111",
          storeName: "Meena's Diyas & Filter Coffee",
          storeArea: "Vidyanagar",
          storeLane: "2nd Cross, Near KIMS Circle",
          customerName: "Pratham Patki",
          customerPhone: "+91 98451 22334",
          items: [
            {
              product: MOCK_PRODUCTS[0],
              quantity: 2,
            },
            {
              product: MOCK_PRODUCTS[1],
              quantity: 1,
            },
          ],
          subtotal: 600,
          platformFee: 15,
          total: 615,
          status: "completed",
          paymentMethod: "upi",
          paymentStatus: "paid",
          pickupTime: "Today at 5:30 PM",
          pickupCode: "LL-482",
          createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        };

        const initialOrder2: Order = {
          id: "ORD-LL-5412",
          storeId: "22222222-2222-2222-2222-222222222222",
          storeName: "Mishra Authentic Dharwad Pedha",
          storeArea: "Station Road",
          storeLane: "Opp. Railway Station Gate 2",
          customerName: "Pratham Patki",
          customerPhone: "+91 98451 22334",
          items: [
            {
              product: MOCK_PRODUCTS[3],
              quantity: 1,
            },
            {
              product: MOCK_PRODUCTS[4],
              quantity: 2,
            },
          ],
          subtotal: 480,
          platformFee: 15,
          total: 495,
          status: "packed",
          paymentMethod: "upi",
          paymentStatus: "paid",
          pickupTime: "Today at 7:00 PM",
          pickupCode: "LL-719",
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        };

        const seeded = [initialOrder2, initialOrder1];
        setOrders(seeded);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(seeded));
      }

      const savedArea = localStorage.getItem(AREA_STORAGE_KEY);
      if (savedArea) setActiveAreaState(savedArea as NeighborhoodArea);

      const savedRecent = localStorage.getItem(RECENT_STORAGE_KEY);
      if (savedRecent) {
        setRecentlyViewed(JSON.parse(savedRecent));
      } else {
        // Seed initial recently explored items
        const initialRecent = [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1], MOCK_PRODUCTS[3], MOCK_PRODUCTS[5]];
        setRecentlyViewed(initialRecent);
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(initialRecent));
      }
    } catch (e) {
      console.warn("Storage sync error:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

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
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 10);
    });
  };

  const addToCart = (product: Product) => {
    addRecentlyViewed(product);
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

  const createOrder = (data: {
    customerName: string;
    customerPhone: string;
    pickupTime: string;
    paymentMethod: "upi" | "counter";
  }): Order | null => {
    if (cart.length === 0) return null;

    const primaryStoreName = cart[0].product.storeName;
    const primaryStoreId = cart[0].product.storeId;
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const pickupDigits = Math.floor(100 + Math.random() * 900);

    const newOrder: Order = {
      id: `ORD-LL-${orderNumber}`,
      storeId: primaryStoreId,
      storeName: primaryStoreName,
      storeArea: activeArea === "All" ? "Vidyanagar" : activeArea,
      storeLane: "Main Market Cross",
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      items: [...cart],
      subtotal,
      platformFee,
      total: totalAmount,
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
    clearCart();
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

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );

    updateOrderStatusAction(orderId, status).catch((err) => {
      console.warn("Supabase status sync note:", err);
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orders,
        activeArea,
        setActiveArea,
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
