"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Store, Product } from "@/types";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockData";
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
  imageUrl: "",
  bannerUrl: "",
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
  const [userRole, setUserRoleState] = useState<UserRole>("seller");
  const [activeStore, setActiveStore] = useState<Store>(MOCK_STORES[0] || EMPTY_STORE);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS || []);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedRole = localStorage.getItem(SELLER_ROLE_STORAGE_KEY);
      if (savedRole && (savedRole === "customer" || savedRole === "seller" || savedRole === "admin")) {
        setUserRoleState(savedRole as UserRole);
      }

      const savedStore = localStorage.getItem(SELLER_STORE_STORAGE_KEY);
      if (savedStore) {
        const parsed = JSON.parse(savedStore);
        if (parsed && parsed.name) {
          setActiveStore((prev) => ({ ...prev, ...parsed }));
        }
      }

      const savedProducts = localStorage.getItem(SELLER_PRODUCTS_STORAGE_KEY);
      if (savedProducts) {
        const parsedProds = JSON.parse(savedProducts);
        if (Array.isArray(parsedProds) && parsedProds.length > 0) {
          setProducts(parsedProds);
        }
      }
    } catch {}
    setIsLoaded(true);
  }, []);

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
        localStorage.setItem(SELLER_STORE_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateStoreProfile = (updates: Partial<Store>) => {
    setActiveStore((prev) => ({
      ...prev,
      ...updates,
    }));

    try {
      const raw = localStorage.getItem(SELLER_STORE_STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : activeStore;
      const updated: Store = {
        ...current,
        ...updates,
      };

      localStorage.setItem(SELLER_STORE_STORAGE_KEY, JSON.stringify(updated));

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

      // Record store details in Supabase database outside of React state reducer
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
    const created: Product = { ...newProd, id };

    // Ensure active merchant store is recorded in registered stores collection
    try {
      const storeName = newProd.storeName || activeStore.name || "Local Neighborhood Shop";
      const storeId = newProd.storeId || activeStore.id || "store-manual-01";
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
        localStorage.setItem(SELLER_PRODUCTS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    return { success: true, newStock };
  };

  const isAuthorizedSeller = userRole === "seller" || userRole === "admin";

  const seller: SellerProfile = {
    ...DEFAULT_SELLER,
    role: userRole,
    storeName: activeStore.name,
  };

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
