import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { UserProfile, UserRole } from "@/types";

export interface StoredUserProfile {
  id: string;
  name: string;
  number: string;
  email?: string;
  role: UserRole;
  storeId?: string;
  storeName?: string;
  addresses: any[];
  emailPermissionsGranted: boolean;
  createdAt: string;
  updatedAt: string;
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "localloop_users.json");

// Ensure data directory exists
function ensureDbFile(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Notice initializing user DB file:", err);
  }
}

// Read all users from disk
function readUsers(): StoredUserProfile[] {
  try {
    ensureDbFile();
    if (!fs.existsSync(DB_FILE)) return [];
    const content = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(content || "{}");
    return Array.isArray(parsed.users) ? parsed.users : [];
  } catch (err) {
    console.warn("Notice reading users DB:", err);
    return [];
  }
}

// Write users atomically to disk
function writeUsers(users: StoredUserProfile[]): void {
  try {
    ensureDbFile();
    const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify({ users, updatedAt: new Date().toISOString() }, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.warn("Notice saving users DB:", err);
  }
}

/**
 * Validate standard UUID syntax
 */
export function isValidUuid(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id.trim());
}

/**
 * Generate a deterministic RFC 4122 v4 compliant UUID from a phone number
 */
export function phoneToUuid(phone: string): string {
  const clean = (phone || "").replace(/\D/g, "").slice(-10);
  const hash = crypto.createHash("sha256").update(`localloop_user_${clean}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Resolve or generate a valid UUID for a user session
 */
export function ensureValidUserUuid(id?: string, phone?: string): string {
  if (id && isValidUuid(id)) {
    return id;
  }
  if (phone) {
    return phoneToUuid(phone);
  }
  return crypto.randomUUID();
}

/**
 * Find user by phone number (last 10 digits)
 */
export function findUserByPhone(phone: string): StoredUserProfile | null {
  const clean = (phone || "").replace(/\D/g, "").slice(-10);
  if (!clean) return null;
  const users = readUsers();
  return users.find((u) => u.number.replace(/\D/g, "").slice(-10) === clean) || null;
}

/**
 * Find user by email
 */
export function findUserByEmail(email: string): StoredUserProfile | null {
  if (!email || !email.trim()) return null;
  const cleanEmail = email.trim().toLowerCase();
  const users = readUsers();
  return users.find((u) => u.email && u.email.toLowerCase() === cleanEmail) || null;
}

/**
 * Find user by ID or Phone
 */
export function findUserByIdOrPhone(idOrPhone: string): StoredUserProfile | null {
  if (!idOrPhone) return null;
  const users = readUsers();
  const cleanPhone = idOrPhone.replace(/\D/g, "").slice(-10);
  return users.find((u) => u.id === idOrPhone || (cleanPhone && u.number.replace(/\D/g, "").slice(-10) === cleanPhone)) || null;
}

/**
 * Save or update user profile in local persistent database
 */
export function upsertStoredUser(data: {
  id?: string;
  name: string;
  number: string;
  email?: string;
  role?: UserRole;
  storeId?: string;
  storeName?: string;
  addresses?: any[];
}): StoredUserProfile {
  const cleanPhone = (data.number || "").replace(/\D/g, "").slice(-10);
  const validId = ensureValidUserUuid(data.id, cleanPhone);
  const users = readUsers();

  const existingIndex = users.findIndex(
    (u) => u.id === validId || (cleanPhone && u.number.replace(/\D/g, "").slice(-10) === cleanPhone)
  );

  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    const existing = users[existingIndex];
    const updated: StoredUserProfile = {
      ...existing,
      id: validId,
      name: data.name ? data.name.trim() : existing.name,
      number: cleanPhone || existing.number,
      email: data.email !== undefined ? data.email?.trim() || undefined : existing.email,
      role: data.role || existing.role || "customer",
      storeId: data.storeId || existing.storeId,
      storeName: data.storeName || existing.storeName,
      addresses: Array.isArray(data.addresses) ? data.addresses : existing.addresses || [],
      emailPermissionsGranted: true,
      updatedAt: now,
    };
    users[existingIndex] = updated;
    writeUsers(users);
    return updated;
  }

  const newUser: StoredUserProfile = {
    id: validId,
    name: data.name.trim(),
    number: cleanPhone,
    email: data.email?.trim() || undefined,
    role: data.role || "customer",
    storeId: data.storeId,
    storeName: data.storeName,
    addresses: Array.isArray(data.addresses) ? data.addresses : [],
    emailPermissionsGranted: true,
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  writeUsers(users);
  return newUser;
}

/**
 * Delete user profile from persistent database
 */
export function deleteStoredUser(id: string): boolean {
  if (!id) return false;
  const users = readUsers();
  const filtered = users.filter((u) => u.id !== id && u.number !== id);
  if (filtered.length !== users.length) {
    writeUsers(filtered);
    return true;
  }
  return false;
}
