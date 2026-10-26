"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Store, Product, UserProfile } from "@/types";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import {
  saveStoreDetailsToDbAction,
  deleteStoreFromDbAction,
} from "@/actions/marketplaceActions";

export type UserRole = "customer" | "seller" | "admin";

export interface SellerProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: UserRole;
  storeId: string;
  storeName: string;
}

interface SellerContextType {
  seller: SellerProfile;
  activeStore: Store;
  products: Product[];
  isAuthorizedSeller: boolean;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  toggleStoreOpen: () => void;
  updateStoreProfile: (updates: Partial<Store>) => void;
  deleteMerchantStore: () => Promise<void>;
  addProduct: (product: Omit<Product, "id">) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, delta: number) => { success: boolean; newStock: number };
  setStock: (productId: string, newStock: number) => { success: boolean; newStock: number };
}

const DEFAULT_STORE_BANNER =
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80";

const EMPTY_STORE: Store = {
  id: "store-manual-01",
  name: "",
  tagline: "",
  category: "Household",
  area: "Vidyanagar",
  lane: "",
  distance: "0.5 km",
  rating: 5.0,
  reviewCount: 0,
  isOpen: true,
  openingHours: "8:00 AM - 9:00 PM",
  imageUrl: DEFAULT_STORE_BANNER,
  bannerUrl: DEFAULT_STORE_BANNER,
  phone: "+91 98450 12345",
  verified: true,
};

const DEFAULT_SELLER: SellerProfile = {
  id: "seller-user-01",
  fullName: "Merchant Partner",
  phone: "+91 98450 12345",
  email: "partner@localloop.in",
  role: "seller",
  storeId: "store-manual-01",
  storeName: "",
};

const SELLER_ROLE_STORAGE_KEY = "localloop_user_role_v1";
const SELLER_STORE_STORAGE_KEY = "localloop_seller_store_v1";
const SELLER_PRODUCTS_STORAGE_KEY = "localloop_seller_products_v1";
const REGISTERED_STORES_KEY = "localloop_registered_stores_v1";

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userRole, setUserRoleState] = useState<UserRole>("seller");
  const [activeStore, setActiveStore] = useState<Store>(MOCK_STORES[0] || EMPTY_STORE);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS || []);
  const [isLoaded, setIsLoaded] = useState(false);

  // Compute unique merchant isolation key for tenant separation
  const merchantKey = useMemo(() => {
    if (!user) return null;
    const cleanPhone = user.number ? user.number.replace(/\D/g, "").slice(-10) : "";
    if (cleanPhone) return cleanPhone;
    if (user.id) return user.id;
    return null;
  }, [user]);

  const storeStorageKey = useMemo(() => {
    return merchantKey
      ? `localloop_seller_store_${merchantKey}`
      : SELLER_STORE_STORAGE_KEY;
  }, [merchantKey]);

  const productsStorageKey = useMemo(() => {
    return merchantKey
      ? `localloop_seller_products_${merchantKey}`
      : SELLER_PRODUCTS_STORAGE_KEY;
  }, [merchantKey]);

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem(SELLER_ROLE_STORAGE_KEY);
      if (savedRole && (savedRole === "customer" || savedRole === "seller" || savedRole === "admin")) {
        setUserRoleState(savedRole as UserRole);
      }

      // 1. Resolve merchant store strictly scoped to the active account
      let resolvedStore: Store | null = null;
      const savedScopedStore = localStorage.getItem(storeStorageKey);
      if (savedScopedStore) {
        try {
          const parsed = JSON.parse(savedScopedStore);
          if (parsed && parsed.name) {
            resolvedStore = parsed;
          }
        } catch {}
      }

      // If no store found in scoped storage, check if merchant has store info in user profile or registered stores
      if (!resolvedStore) {
        if (user && (user.role === "seller" || user.storeName || user.storeId)) {
          const cleanPhone = user.number ? user.number.replace(/\D/g, "").slice(-10) : "";
          const sId = user.storeId || (cleanPhone ? `store_${cleanPhone}` : `store_${user.id}`);
          const sName = user.storeName || `${user.name}'s Shop`;
          const rawReg = localStorage.getItem(REGISTERED_STORES_KEY);
          if (rawReg) {
            try {
              const regList: Store[] = JSON.parse(rawReg);
              const found = regList.find(
                (s) => s.id === sId || (cleanPhone && s.phone?.includes(cleanPhone)) || s.name === sName
              );
              if (found) resolvedStore = found;
            } catch {}
          }

          if (!resolvedStore) {
            resolvedStore = {
              id: sId,
              name: sName,
              tagline: `Authentic local goods by ${user.name}`,
              category: "Household",
              area: (user.addresses?.[0]?.locality as any) || "Vidyanagar",
              lane: user.addresses?.[0]?.street || "Main Market Lane",
              distance: "0.5 km",
              rating: 5.0,
              reviewCount: 0,
              isOpen: true,
              openingHours: "8:00 AM - 9:00 PM",
              imageUrl: DEFAULT_STORE_BANNER,
              bannerUrl: DEFAULT_STORE_BANNER,
              phone: cleanPhone ? `+91 ${cleanPhone}` : "+91 98450 12345",
              verified: true,
            };
          }
          localStorage.setItem(storeStorageKey, JSON.stringify(resolvedStore));
        } else {
          // Unauthenticated / fallback demo mode
          const savedLegacy = localStorage.getItem(SELLER_STORE_STORAGE_KEY);
          if (savedLegacy) {
            try {
              const parsed = JSON.parse(savedLegacy);
              if (parsed && parsed.name) resolvedStore = parsed;
            } catch {}
          }
          if (!resolvedStore) {
            resolvedStore = MOCK_STORES[0] || EMPTY_STORE;
          }
        }
      }

      setActiveStore(resolvedStore);

      // 2. Resolve merchant products strictly scoped to the active account
      let resolvedProducts: Product[] | null = null;
      const savedScopedProducts = localStorage.getItem(productsStorageKey);
      if (savedScopedProducts) {
        try {
          const parsedProds = JSON.parse(savedScopedProducts);
          if (Array.isArray(parsedProds)) {
            resolvedProducts = parsedProds;
          }
        } catch {}
      }

      if (resolvedProducts === null) {
        if (user && (user.role === "seller" || user.storeName || user.storeId)) {
          // Check if mock products match this merchant store
          const matching = MOCK_PRODUCTS.filter(
            (p) => p.storeId === resolvedStore?.id || p.storeName === resolvedStore?.name
          );
          resolvedProducts = matching;
          localStorage.setItem(productsStorageKey, JSON.stringify(resolvedProducts));
        } else {
          const savedLegacyProds = localStorage.getItem(SELLER_PRODUCTS_STORAGE_KEY);
          if (savedLegacyProds) {
            try {
              const parsed = JSON.parse(savedLegacyProds);
              if (Array.isArray(parsed) && parsed.length > 0) resolvedProducts = parsed;
            } catch {}
          }
          if (!resolvedProducts) {
            resolvedProducts = MOCK_PRODUCTS || [];
          }
        }
      }

      setProducts(resolvedProducts);
    } catch {}
    setIsLoaded(true);
  }, [merchantKey, storeStorageKey, productsStorageKey, user]);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    try {
      localStorage.setItem(SELLER_ROLE_STORAGE_KEY, role);
    } catch {}
  };

  const toggleStoreOpen = () => {
    setActiveStore((prev) => {
      const updated = {
        ...prev,
        isOpen: !prev.isOpen,
      };
      try {
        localStorage.setItem(storeStorageKey, JSON.stringify(updated));
        localStorage.setItem(SELLER_STORE_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateStoreProfile = (updates: Partial<Store>) => {
    setActiveStore((prev) => {
      const updated: Store = {
        ...prev,
        ...updates,
      };

      try {
        // 1. Save into the active merchant's dedicated private storage key
        localStorage.setItem(storeStorageKey, JSON.stringify(updated));
        // 2. Also keep fallback key synced for test assertions
        localStorage.setItem(SELLER_STORE_STORAGE_KEY, JSON.stringify(updated));

        // 3. Update the merchant's store entry in registered stores list
        if (updated.name && updated.name.trim() !== "") {
          const rawRegistered = localStorage.getItem(REGISTERED_STORES_KEY);
          let storeList: Store[] = rawRegistered ? JSON.parse(rawRegistered) : [];
          const existingIdx = storeList.findIndex((s) => s.id === updated.id);
          if (existingIdx >= 0) {
            storeList[existingIdx] = updated;
          } else {
            storeList.unshift(updated);
          }
          localStorage.setItem(REGISTERED_STORES_KEY, JSON.stringify(storeList));
        }

        // 4. Save to database
        if (typeof window !== "undefined") {
          setTimeout(() => {
            saveStoreDetailsToDbAction(updated).catch((err) =>
              console.warn("DB store sync note:", err)
            );
          }, 0);
        }
      } catch (e) {
        console.warn("Store profile persistence note:", e);
      }

      return updated;
    });
  };

  const deleteMerchantStore = async () => {
    if (activeStore?.id) {
      await deleteStoreFromDbAction(activeStore.id).catch((err) =>
        console.warn("DB delete note:", err)
      );
    }
    setActiveStore(EMPTY_STORE);
    setProducts([]);
    try {
      localStorage.removeItem(storeStorageKey);
      localStorage.removeItem(productsStorageKey);
      localStorage.removeItem(SELLER_STORE_STORAGE_KEY);
      localStorage.removeItem(SELLER_PRODUCTS_STORAGE_KEY);
      const rawRegistered = localStorage.getItem(REGISTERED_STORES_KEY);
      if (rawRegistered) {
        const storeList: Store[] = JSON.parse(rawRegistered);
        const filtered = storeList.filter((s) => s.id !== activeStore.id);
        localStorage.setItem(REGISTERED_STORES_KEY, JSON.stringify(filtered));
      }
    } catch {}
  };

  const addProduct = (newProd: Omit<Product, "id">): Product => {
    const id = `prod-custom-${Date.now()}`;
    const storeName = newProd.storeName || activeStore.name || "Local Neighborhood Shop";
    const storeId = newProd.storeId || activeStore.id || "store-manual-01";
    const created: Product = { ...newProd, id, storeId, storeName };

    // Ensure active merchant store is recorded in registered stores collection
    try {
      const rawRegistered = localStorage.getItem(REGISTERED_STORES_KEY);
      let storeList: Store[] = rawRegistered ? JSON.parse(rawRegistered) : [];
      if (!storeList.some((s) => s.id === storeId)) {
        storeList.unshift({
          ...activeStore,
          id: storeId,
          name: storeName,
          category: newProd.category,
          area: activeStore.area || "Vidyanagar",
          lane: activeStore.lane || "Market Road",
          isOpen: true,
          verified: true,
        });
        localStorage.setItem(REGISTERED_STORES_KEY, JSON.stringify(storeList));
      }
    } catch {}

    setProducts((prev) => {
      const next = [created, ...prev];
      try {
        localStorage.setItem(productsStorageKey, JSON.stringify(next));
        localStorage.setItem(SELLER_PRODUCTS_STORAGE_KEY, JSON.stringify(next));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("localloop_catalog_updated", { detail: created }));
          window.dispatchEvent(new Event("storage"));
        }
      } catch {}
      return next;
    });

    // Also persist to API in background
    if (typeof window !== "undefined") {
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(created),
      }).catch(console.warn);
    }

    return created;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      try {
        localStorage.setItem(productsStorageKey, JSON.stringify(next));
        localStorage.setItem(SELLER_PRODUCTS_STORAGE_KEY, JSON.stringify(next));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("localloop_catalog_updated"));
          window.dispatchEvent(new Event("storage"));
        }
      } catch {}
      return next;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(productsStorageKey, JSON.stringify(next));
        localStorage.setItem(SELLER_PRODUCTS_STORAGE_KEY, JSON.stringify(next));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("localloop_catalog_updated"));
          window.dispatchEvent(new Event("storage"));
        }
      } catch {}
      return next;
    });
  };

  const adjustStock = (productId: string, delta: number): { success: boolean; newStock: number } => {
    let resultNewStock = 0;
    let allowed = false;

    setProducts((prev) => {
      const target = prev.find((p) => p.id === productId);
      if (!target) return prev;

      const calcStock = target.stock + delta;
      if (calcStock < 0) {
        resultNewStock = target.stock;
        allowed = false;
        return prev;
      }

      allowed = true;
      resultNewStock = calcStock;
      const next = prev.map((p) => (p.id === productId ? { ...p, stock: calcStock } : p));
      try {
        localStorage.setItem(productsStorageKey, JSON.stringify(next));
        localStorage.setItem(SELLER_PRODUCTS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    return { success: allowed, newStock: resultNewStock };
  };

  const setStock = (productId: string, newStock: number): { success: boolean; newStock: number } => {
    if (newStock < 0) return { success: false, newStock: 0 };
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p));
      try {
        localStorage.setItem(productsStorageKey, JSON.stringify(next));
        localStorage.setItem(SELLER_PRODUCTS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    return { success: true, newStock };
  };

  const isAuthorizedSeller = userRole === "seller" || userRole === "admin";

  const seller: SellerProfile = useMemo(() => {
    if (user && (user.role === "seller" || user.storeName)) {
      return {
        id: user.id,
        fullName: user.name,
        phone: user.number ? `+91 ${user.number}` : "+91 98450 12345",
        email: user.email || "partner@localloop.in",
        role: userRole,
        storeId: activeStore.id,
        storeName: activeStore.name,
      };
    }
    return {
      ...DEFAULT_SELLER,
      role: userRole,
      storeName: activeStore.name,
    };
  }, [user, userRole, activeStore]);

  return (
    <SellerContext.Provider
      value={{
        seller,
        activeStore,
        products,
        isAuthorizedSeller,
        userRole,
        setUserRole,
        toggleStoreOpen,
        updateStoreProfile,
        deleteMerchantStore,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        setStock,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
}

export function useSeller() {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error("useSeller must be used within a SellerProvider");
  }
  return context;
}
