"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserAddress, UserRole, AddressType } from "@/types";
import {
  sanitizeInput,
  validatePhoneNumber,
  validateEmail,
  validateUserAddress,
  requestPhoneOtp,
  verifyPhoneOtp,
  generateSessionToken,
} from "@/lib/authSecurity";
import {
  saveUserProfileToDbAction,
  deleteUserAccountFromDbAction,
} from "@/actions/marketplaceActions";

export type AppMode = "shopper" | "merchant";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeAppMode: AppMode;
  setActiveAppMode: (mode: AppMode) => void;
  sendOtp: (phone: string) => { success: boolean; message: string; testOtp?: string; cooldownSeconds: number };
  signup: (data: {
    name: string;
    phone: string;
    email?: string;
    role?: UserRole;
    storeName?: string;
    initialAddress?: Omit<UserAddress, "id">;
  }) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  loginWithPhoneOtp: (phone: string, otp: string, role?: UserRole) => Promise<{ success: boolean; message: string }>;
  loginWithEmailPermission: (
    email: string,
    name: string,
    phone: string,
    permissions: boolean,
    role?: UserRole
  ) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<UserProfile>) => { success: boolean; error?: string };
  deleteAccount: () => Promise<{ success: boolean }>;
  addAddress: (address: Omit<UserAddress, "id">) => { success: boolean; address?: UserAddress; error?: string };
  updateAddress: (id: string, updates: Partial<UserAddress>) => { success: boolean; error?: string };
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AUTH_STORAGE_KEY = "localloop_auth_session_v1";
const APP_MODE_STORAGE_KEY = "localloop_app_mode_v1";

const DEFAULT_ADDRESSES: UserAddress[] = [];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeAppMode, setActiveAppModeState] = useState<AppMode>("shopper");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.user) {
          setUser(parsed.user);
          setIsAuthenticated(Boolean(parsed.isAuthenticated));
        }
      }

      const savedMode = localStorage.getItem(APP_MODE_STORAGE_KEY);
      if (savedMode === "shopper" || savedMode === "merchant") {
        setActiveAppModeState(savedMode);
      }
    } catch (e) {
      console.warn("Failed to load auth session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save session changes
  const persistSession = (updatedUser: UserProfile | null, authState: boolean) => {
    try {
      if (updatedUser && authState) {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            isAuthenticated: true,
            user: updatedUser,
            token: generateSessionToken(updatedUser.id, updatedUser.role),
          })
        );
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to persist auth session:", e);
    }
  };

  const setActiveAppMode = (mode: AppMode) => {
    setActiveAppModeState(mode);
    try {
      localStorage.setItem(APP_MODE_STORAGE_KEY, mode);
    } catch {}
  };

  const sendOtp = (phone: string) => {
    return requestPhoneOtp(phone);
  };

  const signup = async (data: {
    name: string;
    phone: string;
    email?: string;
    role?: UserRole;
    storeName?: string;
    initialAddress?: Omit<UserAddress, "id">;
  }) => {
    const cleanName = sanitizeInput(data.name).trim();
    if (!cleanName) {
      return { success: false, message: "Please provide a valid full name." };
    }

    const phoneValidation = validatePhoneNumber(data.phone);
    if (!phoneValidation.valid) {
      return { success: false, message: phoneValidation.error || "Invalid phone number." };
    }

    let cleanEmail = "";
    if (data.email && data.email.trim() !== "") {
      const emailValidation = validateEmail(data.email);
      if (!emailValidation.valid) {
        return { success: false, message: emailValidation.error || "Invalid email address." };
      }
      cleanEmail = emailValidation.sanitized;
    }

    const role: UserRole = data.role || "customer";
    const initialAddresses: UserAddress[] = [];
    if (data.initialAddress && data.initialAddress.street) {
      initialAddresses.push({
        id: `addr_${Date.now()}`,
        label: data.initialAddress.label || "Primary",
        street: data.initialAddress.street,
        landmark: data.initialAddress.landmark || "",
        locality: data.initialAddress.locality || "Vidyanagar",
        city: data.initialAddress.city || "Hubballi-Dharwad",
        pincode: data.initialAddress.pincode || "580021",
        isDefault: true,
      });
    }

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: cleanName,
      number: phoneValidation.cleanNumber,
      email: cleanEmail || undefined,
      role,
      storeId: role === "seller" ? `store_${Date.now()}` : undefined,
      storeName: role === "seller" ? (data.storeName || `${cleanName}'s Store`) : undefined,
      addresses: initialAddresses,
      emailPermissionsGranted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUser(newUser);
    setIsAuthenticated(true);
    persistSession(newUser, true);

    if (role === "seller") {
      setActiveAppMode("merchant");
    } else {
      setActiveAppMode("shopper");
    }

    // Record new account in database
    saveUserProfileToDbAction({
      id: newUser.id,
      fullName: newUser.name,
      phone: newUser.number,
      email: newUser.email,
      addresses: newUser.addresses,
    }).catch(console.warn);

    return {
      success: true,
      message: role === "seller" ? "Merchant account created successfully!" : "Account created successfully! Welcome to LocalLoop.",
      user: newUser,
    };
  };

  const loginWithPhoneOtp = async (phone: string, otp: string, role: UserRole = "customer") => {
    const verification = verifyPhoneOtp(phone, otp);
    if (!verification.success) {
      return { success: false, message: verification.message };
    }

    const phoneValidation = validatePhoneNumber(phone);
    const existingAddresses = user?.addresses && user.addresses.length > 0 ? user.addresses : DEFAULT_ADDRESSES;

    const loggedInUser: UserProfile = {
      id: user?.id || `user_${Date.now()}`,
      name: user?.name || "Hubballi Shopper",
      number: phoneValidation.cleanNumber,
      email: user?.email,
      role,
      storeId: role === "seller" ? "store-1" : undefined,
      storeName: role === "seller" ? "Meena's Diyas & Filter Coffee" : undefined,
      addresses: existingAddresses,
      emailPermissionsGranted: Boolean(user?.emailPermissionsGranted),
      createdAt: user?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUser(loggedInUser);
    setIsAuthenticated(true);
    persistSession(loggedInUser, true);

    if (role === "seller") {
      setActiveAppMode("merchant");
    } else {
      setActiveAppMode("shopper");
    }

    return { success: true, message: "Welcome back to LocalLoop!" };
  };

  const loginWithEmailPermission = async (
    email: string,
    name: string,
    phone: string,
    permissions: boolean,
    role: UserRole = "customer"
  ) => {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return { success: false, message: emailValidation.error || "Invalid email" };
    }

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return { success: false, message: phoneValidation.error || "Invalid phone number" };
    }

    if (!permissions) {
      return { success: false, message: "Please grant consent for order notifications and digital receipts." };
    }

    const cleanName = sanitizeInput(name) || "LocalLoop User";

    const loggedInUser: UserProfile = {
      id: user?.id || `user_${Date.now()}`,
      name: cleanName,
      number: phoneValidation.cleanNumber,
      email: emailValidation.sanitized,
      role,
      storeId: role === "seller" ? "store-1" : undefined,
      storeName: role === "seller" ? "Meena's Diyas & Filter Coffee" : undefined,
      addresses: user?.addresses && user.addresses.length > 0 ? user.addresses : DEFAULT_ADDRESSES,
      emailPermissionsGranted: true,
      createdAt: user?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUser(loggedInUser);
    setIsAuthenticated(true);
    persistSession(loggedInUser, true);

    if (role === "seller") {
      setActiveAppMode("merchant");
    } else {
      setActiveAppMode("shopper");
    }

    return { success: true, message: "Signed in with email permissions successfully!" };
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, error: "Not logged in" };

    let cleanNumber = user.number;
    if (updates.number) {
      const pCheck = validatePhoneNumber(updates.number);
      if (!pCheck.valid) return { success: false, error: pCheck.error };
      cleanNumber = pCheck.cleanNumber;
    }

    let cleanEmail = user.email;
    if (updates.email !== undefined) {
      const eCheck = validateEmail(updates.email);
      if (!eCheck.valid) return { success: false, error: eCheck.error };
      cleanEmail = eCheck.sanitized;
    }

    const updated: UserProfile = {
      ...user,
      ...updates,
      name: updates.name ? sanitizeInput(updates.name) : user.name,
      number: cleanNumber,
      email: cleanEmail,
      updatedAt: new Date().toISOString(),
    };

    setUser(updated);
    persistSession(updated, true);

    // Record profile changes directly in Supabase database
    saveUserProfileToDbAction({
      id: updated.id,
      fullName: updated.name,
      phone: updated.number,
      email: updated.email,
      addresses: updated.addresses,
    }).catch((err) => console.warn("DB profile sync note:", err));

    return { success: true };
  };

  const deleteAccount = async (): Promise<{ success: boolean }> => {
    if (user?.id) {
      await deleteUserAccountFromDbAction(user.id);
    }
    logout();
    return { success: true };
  };

  const addAddress = (newAddr: Omit<UserAddress, "id">) => {
    if (!user) return { success: false, error: "Not logged in" };

    const validation = validateUserAddress(newAddr);
    if (!validation.valid || !validation.sanitizedAddress) {
      return { success: false, error: validation.error || "Invalid address" };
    }

    let updatedAddresses = [...user.addresses];
    // If set as default or this is the first address, reset others
    if (validation.sanitizedAddress.isDefault || updatedAddresses.length === 0) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
      validation.sanitizedAddress.isDefault = true;
    }

    updatedAddresses.push(validation.sanitizedAddress);

    const updatedUser: UserProfile = {
      ...user,
      addresses: updatedAddresses,
      updatedAt: new Date().toISOString(),
    };

    setUser(updatedUser);
    persistSession(updatedUser, true);
    return { success: true, address: validation.sanitizedAddress };
  };

  const updateAddress = (id: string, updates: Partial<UserAddress>) => {
    if (!user) return { success: false, error: "Not logged in" };

    const index = user.addresses.findIndex((a) => a.id === id);
    if (index === -1) return { success: false, error: "Address not found" };

    const merged = { ...user.addresses[index], ...updates };
    const validation = validateUserAddress(merged);
    if (!validation.valid || !validation.sanitizedAddress) {
      return { success: false, error: validation.error || "Invalid address" };
    }

    let updatedAddresses = [...user.addresses];
    if (validation.sanitizedAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    updatedAddresses[index] = validation.sanitizedAddress;

    const updatedUser: UserProfile = {
      ...user,
      addresses: updatedAddresses,
      updatedAt: new Date().toISOString(),
    };

    setUser(updatedUser);
    persistSession(updatedUser, true);
    return { success: true };
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    const remaining = user.addresses.filter((a) => a.id !== id);
    // If we deleted the default and others remain, make the first one default
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }

    const updatedUser: UserProfile = {
      ...user,
      addresses: remaining,
      updatedAt: new Date().toISOString(),
    };

    setUser(updatedUser);
    persistSession(updatedUser, true);
  };

  const setDefaultAddress = (id: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));

    const updatedUser: UserProfile = {
      ...user,
      addresses: updatedAddresses,
      updatedAt: new Date().toISOString(),
    };

    setUser(updatedUser);
    persistSession(updatedUser, true);
  };

  const switchRole = (role: UserRole) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      role,
      storeId: role === "seller" ? (user.storeId || "store-1") : user.storeId,
    };
    setUser(updated);
    persistSession(updated, true);

    if (role === "seller") {
      setActiveAppMode("merchant");
    } else {
      setActiveAppMode("shopper");
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    persistSession(null, false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        activeAppMode,
        setActiveAppMode,
        sendOtp,
        signup,
        loginWithPhoneOtp,
        loginWithEmailPermission,
        updateProfile,
        deleteAccount,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
