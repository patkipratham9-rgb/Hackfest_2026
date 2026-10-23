"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Store } from "@/types";
import { MOCK_STORES } from "@/data/mockData";

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
  isAuthorizedSeller: boolean;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  toggleStoreOpen: () => void;
  updateStoreProfile: (updates: Partial<Store>) => void;
}

const DEFAULT_SELLER: SellerProfile = {
  id: "seller-user-01",
  fullName: "Meena Kulkarni",
  phone: "+91 98450 12345",
  email: "meena.crafts@localloop.in",
  role: "seller",
  storeId: "store-1",
  storeName: "Meena's Diyas & Filter Coffee",
};

const SELLER_ROLE_STORAGE_KEY = "localloop_user_role_v1";
const SELLER_STORE_STORAGE_KEY = "localloop_seller_store_v1";

const SellerContext = createContext<SellerContextType | undefined>(undefined);

export function SellerProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRoleState] = useState<UserRole>("seller");
  const [activeStore, setActiveStore] = useState<Store>(MOCK_STORES[0]);
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
    setActiveStore((prev) => {
      const updated = {
        ...prev,
        ...updates,
      };
      try {
        localStorage.setItem(SELLER_STORE_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
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
        isAuthorizedSeller,
        userRole,
        setUserRole,
        toggleStoreOpen,
        updateStoreProfile,
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
