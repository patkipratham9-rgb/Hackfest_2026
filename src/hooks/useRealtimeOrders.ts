"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Order, OrderStatus } from "@/types";
import { RealtimeChannel } from "@supabase/supabase-js";

export type RealtimeConnectionState = "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "ERROR";

export interface UseRealtimeOrdersOptions {
  storeId?: string;
  storeName?: string;
  enabled?: boolean;
  onNewOrder?: (order: Order) => void;
  onStatusUpdate?: (orderId: string, newStatus: OrderStatus) => void;
}

/**
 * LocalLoop Realtime Subscriptions Hook
 * Checkpoint CP-OB02: Live Supabase CDC WebSocket stream for Orders
 */
export function useRealtimeOrders(options: UseRealtimeOrdersOptions = {}) {
  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>("CONNECTING");
  const [lastEvent, setLastEvent] = useState<{ type: string; timestamp: string; data?: any } | null>(null);
  const [chimeEnabled, setChimeEnabled] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Web Audio API chime for incoming real-time orders
  const playChime = useCallback(() => {
    if (!chimeEnabled || typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext policy suppression fallback
    }
  }, [chimeEnabled]);

  useEffect(() => {
    if (options.enabled === false) {
      setConnectionState("DISCONNECTED");
      return;
    }

    const channelName = options.storeId
      ? `orders-store-${options.storeId.substring(0, 8)}`
      : "orders-all-stream";

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: options.storeId ? `store_id=eq.${options.storeId}` : undefined,
        },
        (payload) => {
          const row = payload.new as any;
          playChime();
          setLastEvent({
            type: "INSERT",
            timestamp: new Date().toISOString(),
            data: row,
          });

          if (options.onNewOrder) {
            const mappedOrder: Order = {
              id: row.id,
              storeId: row.store_id,
              storeName: row.store_name || options.storeName || "Local Shop",
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
              createdAt: row.created_at || new Date().toISOString(),
            };
            options.onNewOrder(mappedOrder);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: options.storeId ? `store_id=eq.${options.storeId}` : undefined,
        },
        (payload) => {
          const row = payload.new as any;
          setLastEvent({
            type: "UPDATE",
            timestamp: new Date().toISOString(),
            data: row,
          });

          if (options.onStatusUpdate && row.id && row.status) {
            options.onStatusUpdate(row.id, row.status as OrderStatus);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionState("CONNECTED");
        } else if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
          setConnectionState("ERROR");
        } else if (status === "CLOSED") {
          setConnectionState("DISCONNECTED");
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [
    options.storeId,
    options.storeName,
    options.enabled,
    options.onNewOrder,
    options.onStatusUpdate,
    playChime,
  ]);

  // Method to manually broadcast or simulate a realtime event locally
  const broadcastSimulatedOrder = useCallback(
    (simulatedOrder: Order) => {
      playChime();
      setLastEvent({
        type: "INSERT_SIMULATED",
        timestamp: new Date().toISOString(),
        data: simulatedOrder,
      });
      if (options.onNewOrder) {
        options.onNewOrder(simulatedOrder);
      }
    },
    [playChime, options.onNewOrder]
  );

  return {
    connectionState,
    lastEvent,
    chimeEnabled,
    setChimeEnabled,
    playChime,
    broadcastSimulatedOrder,
  };
}
