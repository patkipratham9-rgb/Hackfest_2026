"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Product, Order, OrderStatus, NeighborhoodArea } from "@/types";
import { placeOrderAtomicAction, updateOrderStatusAction } from "@/actions/marketplaceActions";

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "localloop_cart_v1";
const ORDERS_STORAGE_KEY = "localloop_orders_v1";
const AREA_STORAGE_KEY = "localloop_area_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeArea, setActiveAreaState] = useState<NeighborhoodArea>("All");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
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
        const initialOrder: Order = {
          id: "ORD-LL-8921",
          storeId: "11111111-1111-1111-1111-111111111111",
          storeName: "Meena's Diyas & Filter Coffee",
          storeArea: "Vidyanagar",
          storeLane: "2nd Cross, Near KIMS Circle",
          customerName: "Pratham Patki",
          customerPhone: "+91 98451 22334",
          items: [
            {
              product: {
                id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                storeId: "11111111-1111-1111-1111-111111111111",
                storeName: "Meena's Diyas & Filter Coffee",
                name: "Hand-poured Brass-Rim Clay Diyas (Set of 4)",
                description: "Crafted by hand using red river clay",
                price: 180,
                category: "Handloom & Crafts",
                stock: 8,
                unit: "set of 4",
                imageUrl: "https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=600&auto=format&fit=crop&q=80",
              },
              quantity: 2,
            },
            {
              product: {
                id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                storeId: "11111111-1111-1111-1111-111111111111",
                storeName: "Meena's Diyas & Filter Coffee",
                name: "Artisanal Filter Coffee Powder (80:20 Roast)",
                description: "Freshly roasted Chikmagalur plantation peaberry",
                price: 240,
                category: "Filter Coffee & Tea",
                stock: 14,
                unit: "250g pack",
                imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80",
              },
              quantity: 1,
            },
          ],
          subtotal: 600,
          platformFee: 15,
          total: 615,
          status: "packed",
          paymentMethod: "upi",
          paymentStatus: "paid",
          pickupTime: "Today at 5:30 PM",
          pickupCode: "LL-482",
          createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        };
        setOrders([initialOrder]);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([initialOrder]));
      }

      const savedArea = localStorage.getItem(AREA_STORAGE_KEY);
      if (savedArea) setActiveAreaState(savedArea as NeighborhoodArea);
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

  const setActiveArea = (area: NeighborhoodArea) => {
    setActiveAreaState(area);
    localStorage.setItem(AREA_STORAGE_KEY, area);
  };

  const addToCart = (product: Product) => {
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

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const platformFee = totalItems > 0 ? 15 : 0;
  const totalAmount = subtotal + platformFee;

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
      console.warn("Supabase atomic order background sync note:", err);
    });

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );

    // Sync status with Supabase
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
        createOrder,
        updateOrderStatus,
        totalItems,
        subtotal,
        platformFee,
        totalAmount,
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
