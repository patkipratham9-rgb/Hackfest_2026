/**
 * LocalLoop Real-Time User Notification System
 * Notifies shoppers when:
 * 1. A new local store registers in Hubballi
 * 2. A merchant adds a new product or replenishes stock
 * 3. An order status advances (placed -> packed -> ready)
 * 4. AI/ML generated personalized product recommendations
 */

export interface AppNotification {
  id: string;
  type: "new_store" | "new_product" | "order_status" | "recommendation";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  storeName?: string;
  productName?: string;
}

const NOTIFICATIONS_STORAGE_KEY = "localloop_user_notifications_v1";

/**
 * Get all notifications from localStorage
 */
export function getSavedNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Save / Add a new notification
 */
export function addNotification(
  notification: Omit<AppNotification, "id" | "timestamp" | "read">
): AppNotification {
  const newNotif: AppNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  if (typeof window !== "undefined") {
    try {
      const current = getSavedNotifications();
      const updated = [newNotif, ...current].slice(0, 30); // keep last 30
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("localloop:notifications_updated"));
    } catch (e) {
      console.warn("Failed to save notification:", e);
    }
  }

  return newNotif;
}

/**
 * Triggered when a merchant registers a new store
 */
export function notifyNewStore(storeName: string, area: string) {
  return addNotification({
    type: "new_store",
    title: "New Store Registered in Hubballi!",
    message: `"${storeName}" has joined LocalLoop in ${area}. Explore their fresh neighborhood catalog now!`,
    storeName,
    link: "/",
  });
}

/**
 * Triggered when a merchant lists a new product
 */
export function notifyNewProduct(productName: string, storeName: string, price: number) {
  return addNotification({
    type: "new_product",
    title: "New Arrival in Stock!",
    message: `"${productName}" is now available at ${storeName} for ₹${price}. Order for express counter pickup!`,
    productName,
    storeName,
    link: "/",
  });
}

/**
 * Mark a single notification as read
 */
export function markNotificationAsRead(id: string) {
  if (typeof window === "undefined") return;
  try {
    const current = getSavedNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("localloop:notifications_updated"));
  } catch {}
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsAsRead() {
  if (typeof window === "undefined") return;
  try {
    const current = getSavedNotifications();
    const updated = current.map((n) => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("localloop:notifications_updated"));
  } catch {}
}

/**
 * Clear all notifications
 */
export function clearAllNotifications() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    window.dispatchEvent(new Event("localloop:notifications_updated"));
  } catch {}
}
