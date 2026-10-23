import { Order, OrderStatus } from "@/types";

/**
 * LocalLoop Order Authorization & Realtime Security Module
 * Checkpoint CP-OB04: Realtime and Authorization Guards
 */

export const ALLOWED_SELLER_ROLES = ["seller", "admin"] as const;
export type AllowedSellerRole = (typeof ALLOWED_SELLER_ROLES)[number];

export const VALID_ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  placed: ["packed", "cancelled"],
  packed: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

/**
 * 1. Role-based authorization checker
 * Enforces that only sellers or admins can perform store and order management actions.
 */
export function checkRoleAuthorization(
  role?: string,
  allowedRoles: readonly string[] = ALLOWED_SELLER_ROLES
): { authorized: boolean; error?: string } {
  if (!role) {
    return {
      authorized: false,
      error: "Authentication required: Session is anonymous or missing role",
    };
  }
  if (!allowedRoles.includes(role)) {
    return {
      authorized: false,
      error: `Forbidden: Role '${role}' lacks merchant permissions (required: ${allowedRoles.join(" or ")})`,
    };
  }
  return { authorized: true };
}

/**
 * 2. Multi-tenant store isolation checker
 * Ensures sellers can only view, pack, stage, and complete orders for their own store.
 * Platform admins bypass this check for global oversight.
 */
export function validateStoreTenantAccess(options: {
  callerRole?: string;
  callerStoreId?: string;
  targetStoreId?: string;
}): { authorized: boolean; error?: string } {
  const roleCheck = checkRoleAuthorization(options.callerRole);
  if (!roleCheck.authorized) return roleCheck;

  // Admins have tenant-wide supervisor authority
  if (options.callerRole === "admin") {
    return { authorized: true };
  }

  // If both store IDs are specified, they must match exactly
  if (options.callerStoreId && options.targetStoreId && options.callerStoreId !== options.targetStoreId) {
    return {
      authorized: false,
      error: `Forbidden: Seller belonging to store '${options.callerStoreId}' cannot mutate order belonging to store '${options.targetStoreId}'`,
    };
  }

  return { authorized: true };
}

/**
 * 3. Order status transition state machine validator
 * Enforces sequential order progression: placed -> packed -> ready -> completed.
 * Blocks illegal skips and preventing mutating terminal states.
 */
export function validateOrderStatusTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus
): { valid: boolean; error?: string } {
  if (currentStatus === targetStatus) {
    return { valid: true };
  }

  // Terminal states cannot transition backwards or mutate
  if (currentStatus === "completed") {
    return {
      valid: false,
      error: `Illegal transition: Order is already in terminal 'completed' status and cannot revert to '${targetStatus}'`,
    };
  }

  if (currentStatus === "cancelled") {
    return {
      valid: false,
      error: `Illegal transition: Order has been cancelled and cannot transition to '${targetStatus}'`,
    };
  }

  const allowedNext = VALID_ORDER_STATUS_FLOW[currentStatus] || [];
  if (!allowedNext.includes(targetStatus)) {
    return {
      valid: false,
      error: `Illegal transition: Cannot jump directly from '${currentStatus}' to '${targetStatus}'. Order must follow: placed -> packed -> ready -> completed.`,
    };
  }

  return { valid: true };
}

/**
 * 4. In-person counter verification PIN validator
 * Enforces that orders in 'ready' status require a matching counter PIN before marking 'completed'.
 */
export function verifyPickupPin(
  expectedPin?: string,
  enteredPin?: string
): { valid: boolean; error?: string } {
  if (!enteredPin || !enteredPin.trim()) {
    return {
      valid: false,
      error: "Counter pickup PIN is required to complete this order",
    };
  }

  if (!expectedPin || !expectedPin.trim()) {
    return {
      valid: false,
      error: "Order record is missing expected pickup verification code",
    };
  }

  const normalizedExpected = expectedPin.trim().toUpperCase();
  const normalizedEntered = enteredPin.trim().toUpperCase();

  if (normalizedExpected !== normalizedEntered) {
    return {
      valid: false,
      error: `Invalid PIN: '${normalizedEntered}' does not match counter token '${normalizedExpected}'`,
    };
  }

  return { valid: true };
}

/**
 * 5. Realtime channel subscription validator
 * Validates channel naming format and ensures proper tenant filtering.
 */
export function validateRealtimeChannel(
  channelName: string,
  options?: { storeId?: string; role?: string }
): { valid: boolean; channel: string; error?: string } {
  if (!channelName || !channelName.trim()) {
    return { valid: false, channel: "", error: "Realtime channel name cannot be empty" };
  }

  // Admin or all-stream global overview
  if (channelName === "orders-all-stream") {
    if (options?.role && options.role !== "admin" && options.role !== "seller") {
      return {
        valid: false,
        channel: channelName,
        error: "Global realtime stream is restricted to authorized merchants and admins",
      };
    }
    return { valid: true, channel: channelName };
  }

  // Store-scoped channel pattern: orders-store-[storeIdPrefix]
  if (channelName.startsWith("orders-store-")) {
    const channelStorePrefix = channelName.replace("orders-store-", "");
    if (options?.storeId && !options.storeId.startsWith(channelStorePrefix) && options.role !== "admin") {
      return {
        valid: false,
        channel: channelName,
        error: `Unauthorized to subscribe to foreign store realtime channel: ${channelName}`,
      };
    }
    return { valid: true, channel: channelName };
  }

  // Customer tracking channel pattern: order-[orderId]
  if (channelName.startsWith("order-")) {
    return { valid: true, channel: channelName };
  }

  return { valid: true, channel: channelName };
}

/**
 * 6. Realtime CDC row payload parser & mapper
 * Converts raw Supabase postgres_changes payload into a strongly-typed Order object.
 */
export function mapRealtimeOrderPayload(row: any, fallbackStoreName: string = "Local Shop"): Order {
  return {
    id: row.id || `ORD-${Date.now()}`,
    storeId: row.store_id || "s1",
    storeName: row.store_name || fallbackStoreName,
    storeArea: row.store_area || "Vidyanagar",
    storeLane: row.store_lane || "Main Market Cross",
    customerName: row.customer_name || "Customer",
    customerPhone: row.customer_phone || "+91 98451 22334",
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal) || 0,
    platformFee: Number(row.platform_fee) || 15,
    total: Number(row.total_amount || row.total) || 0,
    status: (row.status as OrderStatus) || "placed",
    paymentMethod: row.payment_method || "counter",
    paymentStatus: row.payment_status || "pending",
    pickupTime: row.pickup_time || "In 20 minutes",
    pickupCode: row.pickup_code || "LL-100",
    packedAt: row.packed_at || undefined,
    readyAt: row.ready_at || undefined,
    shelfSlot: row.shelf_slot || undefined,
    packingNotes: row.packing_notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}
