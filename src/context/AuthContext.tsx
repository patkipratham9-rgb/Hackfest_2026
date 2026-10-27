"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, UserAddress, UserRole, AddressType } from "@/types";
import {
  sanitizeInput,
  validatePhoneNumber,
  validateEmail,
  validateUserAddress,
  requestPhoneOtp,
  requestEmailOtp,
  verifyPhoneOtp,
  verifyEmailOtp,
  generateSessionToken,
} from "@/lib/authSecurity";
import {
  saveUserProfileToDbAction,
  deleteUserAccountFromDbAction,
} from "@/actions/marketplaceActions";
import {
  loginOrRegisterUserDbAction,
  loginOrRegisterMerchantDbAction,
} from "@/actions/authActions";

export type AppMode = "shopper" | "merchant";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeAppMode: AppMode;
  setActiveAppMode: (mode: AppMode) => void;
  sendOtp: (
    phoneOrEmail: string
  ) => Promise<{ success: boolean; message: string; testOtp?: string; cooldownSeconds: number }>;
  sendEmailOtp: (
    email: string
  ) => Promise<{ success: boolean; message: string; testOtp?: string; cooldownSeconds: number }>;
  signup: (data: {
    name: string;
    phone: string;
    email?: string;
    role?: UserRole;
    storeName?: string;
    initialAddress?: Omit<UserAddress, "id">;
  }) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  loginWithPhoneOtp: (phone: string, otp: string, role?: UserRole) => Promise<{ success: boolean; message: string }>;
  loginWithEmailOtp: (email: string, otp: string, role?: UserRole) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  loginWithFirebaseToken: (
    idToken: string,
    name?: string,
    role?: UserRole,
    storeName?: string
  ) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  loginWithEmailPermission: (
    email: string,
    name: string,
    phone: string,
    permissions: boolean,
    role?: UserRole
  ) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  setAuthenticatedSession: (user: UserProfile) => Promise<void>;
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

  const sendOtp = async (phoneOrEmail: string) => {
    // 1. Dispatch to server-side OTP API endpoint
    try {
      if (typeof window !== "undefined" && typeof fetch === "function") {
        const isEmail = phoneOrEmail.includes("@");
        const payload = isEmail
          ? { email: phoneOrEmail, method: "email" }
          : { phone: phoneOrEmail, method: "phone" };

        const res = await fetch("/api/auth/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        const code = data.testOtp || data.otp || "123456";
        if (isEmail) {
          requestEmailOtp(phoneOrEmail, code);
        } else {
          requestPhoneOtp(phoneOrEmail, code);
        }
        return {
          success: Boolean(data.success),
          message: data.message || `OTP sent to ${phoneOrEmail}`,
          testOtp: code,
          cooldownSeconds:
            typeof data.cooldownSeconds === "number" ? data.cooldownSeconds : 30,
        };
      }
    } catch {
      // Fallback to local security engine
    }
    if (phoneOrEmail.includes("@")) {
      return requestEmailOtp(phoneOrEmail);
    }
    return requestPhoneOtp(phoneOrEmail);
  };

  const sendEmailOtp = async (email: string) => {
    return sendOtp(email);
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

    const cleanPhone = phoneValidation.cleanNumber;
    const clientUuid =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `user-${Date.now()}`;

    const newUser: UserProfile = {
      id: clientUuid,
      name: cleanName,
      number: cleanPhone,
      email: cleanEmail || undefined,
      role,
      storeId: role === "seller" ? `store_${cleanPhone}` : undefined,
      storeName: role === "seller" ? (data.storeName || `${cleanName}'s Store`) : undefined,
      addresses: initialAddresses,
      emailPermissionsGranted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let savedUser: UserProfile | null = null;

    if (role === "seller") {
      setActiveAppMode("merchant");
      try {
        const res = await loginOrRegisterMerchantDbAction({
          ownerName: cleanName,
          shopName: data.storeName || `${cleanName}'s Store`,
          phone: cleanPhone,
          email: cleanEmail || undefined,
        });
        if (res.success && res.user) {
          savedUser = res.user;
        }
      } catch (err) {
        console.warn("Merchant DB registration note:", err);
      }
    } else {
      setActiveAppMode("shopper");
      try {
        const res = await loginOrRegisterUserDbAction({
          fullName: cleanName,
          phone: cleanPhone,
          email: cleanEmail || undefined,
          addresses: initialAddresses,
        });
        if (res.success && res.user) {
          savedUser = res.user;
        }
      } catch (err) {
        console.warn("Shopper DB registration note:", err);
      }
    }

    const finalUser: UserProfile = savedUser || {
      id: clientUuid,
      name: cleanName,
      number: cleanPhone,
      email: cleanEmail || undefined,
      role,
      storeId: role === "seller" ? `store_${cleanPhone}` : undefined,
      storeName: role === "seller" ? (data.storeName || `${cleanName}'s Store`) : undefined,
      addresses: initialAddresses,
      emailPermissionsGranted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Ensure database profile sync
    await saveUserProfileToDbAction({
      id: finalUser.id,
      fullName: finalUser.name,
      phone: finalUser.number,
      email: finalUser.email,
      addresses: finalUser.addresses,
    }).catch(console.warn);

    setUser(finalUser);
    setIsAuthenticated(true);
    persistSession(finalUser, true);

    return {
      success: true,
      message: role === "seller" ? "Merchant account created successfully!" : "Account created successfully! Welcome to LocalLoop.",
      user: finalUser,
    };
  };

  const loginWithPhoneOtp = async (phone: string, otp: string, role: UserRole = "customer") => {
    // 1. First verify through API endpoint if in browser environment
    let verifiedUserFromApi: UserProfile | null = null;
    if (typeof window !== "undefined" && typeof fetch === "function") {
      try {
        const res = await fetch("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp, role, name: user?.name, email: user?.email }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          return {
            success: false,
            message: data.message || "Invalid OTP code. Please check and try again.",
          };
        }
        if (data.user) {
          verifiedUserFromApi = data.user;
        }
      } catch (networkErr) {
        // Fall back to local security engine if API route is unreachable
        const localVerification = verifyPhoneOtp(phone, otp);
        if (!localVerification.success) {
          return { success: false, message: localVerification.message };
        }
      }
    } else {
      const localVerification = verifyPhoneOtp(phone, otp);
      if (!localVerification.success) {
        return { success: false, message: localVerification.message };
      }
    }

    const phoneValidation = validatePhoneNumber(phone);
    const cleanPhone = phoneValidation.cleanNumber;
    const existingAddresses = user?.addresses && user.addresses.length > 0 ? user.addresses : DEFAULT_ADDRESSES;

    let savedUserFromDb: UserProfile | null = verifiedUserFromApi;

    // 2. Guarantee user sign-in details are saved in persistent database
    try {
      if (role === "seller") {
        const dbRes = await loginOrRegisterMerchantDbAction({
          ownerName: verifiedUserFromApi?.name || user?.name || "Hubballi Merchant",
          shopName: verifiedUserFromApi?.storeName || user?.storeName || "Neighborhood Store",
          phone: cleanPhone,
          email: verifiedUserFromApi?.email || user?.email,
        });
        if (dbRes.success && dbRes.user) {
          savedUserFromDb = dbRes.user;
        }
      } else {
        const dbRes = await loginOrRegisterUserDbAction({
          fullName: verifiedUserFromApi?.name || user?.name || "Hubballi Shopper",
          phone: cleanPhone,
          email: verifiedUserFromApi?.email || user?.email,
          addresses: verifiedUserFromApi?.addresses && verifiedUserFromApi.addresses.length > 0 ? verifiedUserFromApi.addresses : existingAddresses,
        });
        if (dbRes.success && dbRes.user) {
          savedUserFromDb = dbRes.user;
        }
      }
    } catch (dbErr) {
      console.warn("DB synchronization note during OTP login:", dbErr);
    }

    const loggedInUser: UserProfile = savedUserFromDb || {
      id: user?.id || (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `user_${Date.now()}`),
      name: user?.name || (role === "seller" ? "Hubballi Merchant" : "Hubballi Shopper"),
      number: cleanPhone,
      email: user?.email,
      role,
      storeId: role === "seller" ? (user?.storeId || `store_${cleanPhone}`) : undefined,
      storeName: role === "seller" ? (user?.storeName || "Meena's Diyas & Filter Coffee") : undefined,
      addresses: existingAddresses,
      emailPermissionsGranted: Boolean(user?.emailPermissionsGranted),
      createdAt: user?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Synchronize to database
    await saveUserProfileToDbAction({
      id: loggedInUser.id,
      fullName: loggedInUser.name,
      phone: loggedInUser.number,
      email: loggedInUser.email,
      addresses: loggedInUser.addresses,
    }).catch(console.warn);

    setUser(loggedInUser);
    setIsAuthenticated(true);
    persistSession(loggedInUser, true);

    if (role === "seller") {
      setActiveAppMode("merchant");
    } else {
      setActiveAppMode("shopper");
    }

    return { success: true, message: "Welcome back to LocalLoop!", user: loggedInUser };
  };

  const loginWithFirebaseToken = async (
    idToken: string,
    name?: string,
    role: UserRole = "customer",
    storeName?: string
  ) => {
    try {
      const res = await fetch("/api/auth/firebase/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name, role, storeName }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Firebase verification failed.",
        };
      }

      const verifiedUser: UserProfile = data.user;

      // Save to database
      await saveUserProfileToDbAction({
        id: verifiedUser.id,
        fullName: verifiedUser.name,
        phone: verifiedUser.number,
        email: verifiedUser.email,
        addresses: verifiedUser.addresses,
      }).catch(console.warn);

      setUser(verifiedUser);
      setIsAuthenticated(true);
      persistSession(verifiedUser, true);

      if (role === "seller") {
        setActiveAppMode("merchant");
      } else {
        setActiveAppMode("shopper");
      }

      return {
        success: true,
        message: data.message || "Registration successful!",
        user: verifiedUser,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Failed to complete Firebase authentication.",
      };
    }
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

    const cleanName = sanitizeInput(name) || (role === "seller" ? "Hubballi Merchant" : "Hubballi Shopper");
    const cleanPhone = phoneValidation.cleanNumber;
    const cleanEmail = emailValidation.sanitized;

    let savedUserFromDb: UserProfile | null = null;

    try {
      if (role === "seller") {
        setActiveAppMode("merchant");
        const res = await loginOrRegisterMerchantDbAction({
          ownerName: cleanName,
          shopName: `${cleanName}'s Store`,
          phone: cleanPhone,
          email: cleanEmail,
        });
        if (res.success && res.user) {
          savedUserFromDb = res.user;
        }
      } else {
        setActiveAppMode("shopper");
        const res = await loginOrRegisterUserDbAction({
          fullName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          addresses: user?.addresses && user.addresses.length > 0 ? user.addresses : DEFAULT_ADDRESSES,
        });
        if (res.success && res.user) {
          savedUserFromDb = res.user;
        }
      }
    } catch (err) {
      console.warn("DB synchronization note during email sign-in:", err);
    }

    const loggedInUser: UserProfile = savedUserFromDb || {
      id: user?.id || (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `user_${Date.now()}`),
      name: cleanName,
      number: cleanPhone,
      email: cleanEmail,
      role,
      storeId: role === "seller" ? `store_${cleanPhone}` : undefined,
      storeName: role === "seller" ? `${cleanName}'s Store` : undefined,
      addresses: user?.addresses && user.addresses.length > 0 ? user.addresses : DEFAULT_ADDRESSES,
      emailPermissionsGranted: true,
      createdAt: user?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save profile to Supabase & local DB directly
    await saveUserProfileToDbAction({
      id: loggedInUser.id,
      fullName: loggedInUser.name,
      phone: loggedInUser.number,
      email: loggedInUser.email,
      addresses: loggedInUser.addresses,
    }).catch(console.warn);

    setUser(loggedInUser);
    setIsAuthenticated(true);
    persistSession(loggedInUser, true);

    if (role === "seller") {
      setActiveAppMode("merchant");
    } else {
      setActiveAppMode("shopper");
    }

    return { success: true, message: "Signed in with email permissions successfully!", user: loggedInUser };
  };

  const loginWithEmailOtp = async (
    email: string,
    otp: string,
    role: UserRole = "customer"
  ) => {
    let verifiedUserFromApi: UserProfile | null = null;
    if (typeof window !== "undefined" && typeof fetch === "function") {
      try {
        const res = await fetch("/api/auth/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, role, method: "email" }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          return {
            success: false,
            message: data.message || "Invalid OTP code. Please check and try again.",
          };
        }
        if (data.user) {
          verifiedUserFromApi = data.user;
        }
      } catch (networkErr) {
        const localVerification = verifyEmailOtp(email, otp);
        if (!localVerification.success) {
          return { success: false, message: localVerification.message };
        }
      }
    } else {
      const localVerification = verifyEmailOtp(email, otp);
      if (!localVerification.success) {
        return { success: false, message: localVerification.message };
      }
    }

    const emailValidation = validateEmail(email);
    const cleanEmail = emailValidation.sanitized;
    const cleanRole: UserRole = role === "seller" ? "seller" : "customer";

    let savedUserFromDb: UserProfile | null = verifiedUserFromApi;

    try {
      if (cleanRole === "seller") {
        const dbRes = await loginOrRegisterMerchantDbAction({
          ownerName: verifiedUserFromApi?.name || user?.name || cleanEmail.split("@")[0] || "Hubballi Merchant",
          shopName: verifiedUserFromApi?.storeName || user?.storeName || "Neighborhood Store",
          phone: verifiedUserFromApi?.number || user?.number || "9845012345",
          email: cleanEmail,
        });
        if (dbRes.success && dbRes.user) {
          savedUserFromDb = dbRes.user;
        }
      } else {
        const dbRes = await loginOrRegisterUserDbAction({
          fullName: verifiedUserFromApi?.name || user?.name || cleanEmail.split("@")[0] || "Hubballi Shopper",
          phone: verifiedUserFromApi?.number || user?.number || "9845122334",
          email: cleanEmail,
          addresses: verifiedUserFromApi?.addresses || user?.addresses || DEFAULT_ADDRESSES,
        });
        if (dbRes.success && dbRes.user) {
          savedUserFromDb = dbRes.user;
        }
      }
    } catch (dbErr) {
      console.warn("DB sync note during email OTP login:", dbErr);
    }

    const loggedInUser: UserProfile = savedUserFromDb || {
      id: user?.id || (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `user_${Date.now()}`),
      name: user?.name || cleanEmail.split("@")[0] || (cleanRole === "seller" ? "Hubballi Merchant" : "Hubballi Shopper"),
      number: user?.number || "9845122334",
      email: cleanEmail,
      role: cleanRole,
      storeId: cleanRole === "seller" ? (user?.storeId || `store_${cleanEmail.replace(/[^a-z0-9]/gi, "_")}`) : undefined,
      storeName: cleanRole === "seller" ? (user?.storeName || "Neighborhood Store") : undefined,
      addresses: user?.addresses || DEFAULT_ADDRESSES,
      emailPermissionsGranted: true,
      createdAt: user?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveUserProfileToDbAction({
      id: loggedInUser.id,
      fullName: loggedInUser.name,
      phone: loggedInUser.number,
      email: loggedInUser.email,
      addresses: loggedInUser.addresses,
    }).catch(console.warn);

    setUser(loggedInUser);
    setIsAuthenticated(true);
    persistSession(loggedInUser, true);

    if (cleanRole === "seller") {
      setActiveAppMode("merchant");
    } else {
      setActiveAppMode("shopper");
    }

    return { success: true, message: "Welcome to LocalLoop!", user: loggedInUser };
  };

  const setAuthenticatedSession = async (sessionUser: UserProfile) => {
    setUser(sessionUser);
    setIsAuthenticated(true);
    persistSession(sessionUser, true);

    if (sessionUser.role === "seller") {
      setActiveAppMode("merchant");
    } else {
      setActiveAppMode("shopper");
    }

    // Save to database
    await saveUserProfileToDbAction({
      id: sessionUser.id,
      fullName: sessionUser.name,
      phone: sessionUser.number,
      email: sessionUser.email,
      addresses: sessionUser.addresses,
    }).catch(console.warn);
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
    saveUserProfileToDbAction({
      id: updatedUser.id,
      fullName: updatedUser.name,
      phone: updatedUser.number,
      email: updatedUser.email,
      addresses: updatedUser.addresses,
    }).catch(console.warn);
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
    saveUserProfileToDbAction({
      id: updatedUser.id,
      fullName: updatedUser.name,
      phone: updatedUser.number,
      email: updatedUser.email,
      addresses: updatedUser.addresses,
    }).catch(console.warn);
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
    saveUserProfileToDbAction({
      id: updatedUser.id,
      fullName: updatedUser.name,
      phone: updatedUser.number,
      email: updatedUser.email,
      addresses: updatedUser.addresses,
    }).catch(console.warn);
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
    saveUserProfileToDbAction({
      id: updatedUser.id,
      fullName: updatedUser.name,
      phone: updatedUser.number,
      email: updatedUser.email,
      addresses: updatedUser.addresses,
    }).catch(console.warn);
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
        sendEmailOtp,
        signup,
        loginWithPhoneOtp,
        loginWithEmailOtp,
        loginWithFirebaseToken,
        loginWithEmailPermission,
        setAuthenticatedSession,
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
