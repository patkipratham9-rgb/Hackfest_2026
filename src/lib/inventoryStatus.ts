/**
 * LocalLoop Inventory Health & Stock Status Utility
 * Checkpoint CP-PI05: Low-Stock Badges & Inventory Urgency Indicators
 */

import { Product } from "@/types";

export const DEFAULT_LOW_STOCK_THRESHOLD = 10;
export const BUYER_URGENCY_THRESHOLD = 5;
export const CRITICAL_LOW_STOCK_THRESHOLD = 1;

export type StockHealthStatus = "in_stock" | "low_stock" | "critical_low" | "out_of_stock";

export interface StockBadgeInfo {
  status: StockHealthStatus;
  label: string;
  urgency: "none" | "warning" | "critical" | "sold_out";
  badgeText: string;
  canAddToCart: boolean;
  colorClass: {
    bg: string;
    border: string;
    text: string;
    icon: string;
    badge: string;
  };
}

/**
 * Checks whether a given stock count is zero or negative.
 */
export function isOutOfStock(stock: number): boolean {
  return stock <= 0;
}

/**
 * Checks whether a given stock count falls within the low-stock alert window (1 to threshold).
 */
export function isLowStock(stock: number, threshold: number = DEFAULT_LOW_STOCK_THRESHOLD): boolean {
  return stock > 0 && stock <= threshold;
}

/**
 * Checks whether a given stock count is at critical single-unit scarcity (exactly 1).
 */
export function isCriticalLowStock(stock: number): boolean {
  return stock === 1;
}

/**
 * Evaluates comprehensive badge presentation and buyer urgency metadata for a given SKU.
 */
export function getStockBadgeInfo(
  stock: number,
  threshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): StockBadgeInfo {
  if (stock <= 0) {
    return {
      status: "out_of_stock",
      label: "Out of Stock",
      urgency: "sold_out",
      badgeText: "Out of Stock",
      canAddToCart: false,
      colorClass: {
        bg: "bg-rose-50",
        border: "border-rose-300",
        text: "text-rose-900",
        icon: "text-rose-600",
        badge: "bg-rose-100 border-rose-300 text-rose-900",
      },
    };
  }

  if (stock === 1) {
    return {
      status: "critical_low",
      label: "Only 1 left!",
      urgency: "critical",
      badgeText: "Only 1 unit remaining!",
      canAddToCart: true,
      colorClass: {
        bg: "bg-amber-100",
        border: "border-amber-400",
        text: "text-amber-950",
        icon: "text-amber-700",
        badge: "bg-amber-100 border-amber-400 text-amber-950 animate-pulse",
      },
    };
  }

  if (stock <= threshold) {
    return {
      status: "low_stock",
      label: "Low Stock",
      urgency: "warning",
      badgeText: `Only ${stock} left`,
      canAddToCart: true,
      colorClass: {
        bg: "bg-amber-50",
        border: "border-amber-300",
        text: "text-amber-900",
        icon: "text-amber-600",
        badge: "bg-amber-100 border-amber-300 text-amber-900",
      },
    };
  }

  return {
    status: "in_stock",
    label: "In Stock",
    urgency: "none",
    badgeText: "In Stock",
    canAddToCart: true,
    colorClass: {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      text: "text-emerald-900",
      icon: "text-emerald-600",
      badge: "bg-emerald-100 border-emerald-300 text-emerald-900",
    },
  };
}

/**
 * Returns all products that have low stock (<= threshold and > 0).
 */
export function getLowStockProducts(
  products: Product[],
  threshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): Product[] {
  return products.filter((p) => isLowStock(p.stock, threshold));
}

/**
 * Returns all products that are completely out of stock.
 */
export function getOutOfStockProducts(products: Product[]): Product[] {
  return products.filter((p) => isOutOfStock(p.stock));
}

/**
 * Generates an aggregated inventory health summary across all catalog products.
 */
export function getInventoryHealthSummary(
  products: Product[],
  threshold: number = DEFAULT_LOW_STOCK_THRESHOLD
) {
  let inStockCount = 0;
  let lowStockCount = 0;
  let criticalCount = 0;
  let outOfStockCount = 0;

  for (const product of products) {
    if (product.stock <= 0) {
      outOfStockCount++;
    } else if (product.stock === 1) {
      criticalCount++;
      lowStockCount++; // Critical stock is also within low stock
    } else if (product.stock <= threshold) {
      lowStockCount++;
    } else {
      inStockCount++;
    }
  }

  return {
    total: products.length,
    inStockCount,
    lowStockCount,
    criticalCount,
    outOfStockCount,
    healthyRatio: products.length > 0 ? (inStockCount / products.length) : 1,
  };
}
