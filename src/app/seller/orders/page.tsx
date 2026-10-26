"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSeller } from "@/context/SellerContext";
import { useCart } from "@/context/CartContext";
import { Order, OrderStatus, Product } from "@/types";

import {
  ShoppingBag,
  Clock,
  Package,
  CheckCircle2,
  ArrowRight,
  User,
  Phone,
  Search,
  Filter,
  Columns3,
  List,
  Sparkles,
  AlertCircle,
  KeyRound,
  X,
  Check,
  ShieldCheck,
  RotateCw,
  Volume2,
  VolumeX,
  Radio,
  Bell,
  Store,
  CheckSquare,
  Square,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { markOrderPackedAction, markOrderReadyAction, verifyAndCompleteOrderAction } from "@/actions/marketplaceActions";

export default function SellerOrdersPage() {
  const { activeStore, products } = useSeller();
  const { orders, updateOrderStatus, createOrder } = useCart();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // Checkpoint CP-OB03: Packing & Staging Modal States
  const [packingOrder, setPackingOrder] = useState<Order | null>(null);
  const [packedItemsCheck, setPackedItemsCheck] = useState<Record<string, boolean>>({});
  const [packingNotes, setPackingNotes] = useState("");

  const [stagingOrder, setStagingOrder] = useState<Order | null>(null);
  const [shelfSlot, setShelfSlot] = useState("Front Counter Shelf A1");
  const [notifyCustomerOnReady, setNotifyCustomerOnReady] = useState(true);

  // Checkpoint CP-OB02: Realtime Subscriptions State & Toast
  const [realtimeToast, setRealtimeToast] = useState<{ id: string; customer: string; amount: number } | null>(null);

  const { connectionState, chimeEnabled, setChimeEnabled, broadcastSimulatedOrder } = useRealtimeOrders({
    storeId: activeStore.id,
    storeName: activeStore.name,
    onNewOrder: (newOrder) => {
      setRealtimeToast({
        id: newOrder.id,
        customer: newOrder.customerName,
        amount: newOrder.total,
      });
      setSuccessToast(`Realtime Order Received: ${newOrder.id} from ${newOrder.customerName}!`);
    },
    onStatusUpdate: (orderId, newStatus) => {
      updateOrderStatus(orderId, newStatus);
    },
  });

  // Counter Code Verification Modal State
  const [verifyingOrder, setVerifyingOrder] = useState<Order | null>(null);
  const [verificationInput, setVerificationInput] = useState("");
  const [verificationError, setVerificationError] = useState("");

  // Action Success Toast
  const [successToast, setSuccessToast] = useState("");

  // Filter orders relevant to active store (or fallback to all orders for demonstration)
  const storeOrders = useMemo(() => {
    return orders.filter(
      (o) => o.storeId === activeStore.id || o.storeName === activeStore.name
    );
  }, [orders, activeStore]);

  const displayOrders = useMemo(() => {
    return storeOrders.length > 0 ? storeOrders : orders;
  }, [storeOrders, orders]);

  // Status-based breakdown for pipeline metrics
  const placedOrders = useMemo(
    () => displayOrders.filter((o) => o.status === "placed"),
    [displayOrders]
  );
  const packedOrders = useMemo(
    () => displayOrders.filter((o) => o.status === "packed"),
    [displayOrders]
  );
  const readyOrders = useMemo(
    () => displayOrders.filter((o) => o.status === "ready"),
    [displayOrders]
  );
  const completedOrders = useMemo(
    () => displayOrders.filter((o) => o.status === "completed"),
    [displayOrders]
  );

  const pendingCount = placedOrders.length + packedOrders.length + readyOrders.length;

  // Filtered orders based on search query and status tab
  const filteredOrders = useMemo(() => {
    return displayOrders.filter((order) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q) ||
        order.pickupCode.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [displayOrders, searchQuery, statusFilter]);

  // Checkpoint CP-OB03: Mark Order as Packed Action
  const handleMarkPacked = (order: Order, notes?: string) => {
    const packedAt = new Date().toISOString();
    updateOrderStatus(order.id, "packed", { packedAt, packingNotes: notes });
    markOrderPackedAction(order.id, { packingNotes: notes });
    setSuccessToast(`Order ${order.id} marked as Packed & Bagged!`);
    setPackingOrder(null);
  };

  const openPackModal = (order: Order) => {
    setPackingOrder(order);
    const initialChecks: Record<string, boolean> = {};
    order.items.forEach((item) => {
      initialChecks[item.product.id] = true;
    });
    setPackedItemsCheck(initialChecks);
    setPackingNotes("");
  };

  // Checkpoint CP-OB03: Mark Order Ready for Pickup Action
  const handleMarkReady = (order: Order, slot?: string) => {
    const readyAt = new Date().toISOString();
    const assignedSlot = slot || shelfSlot || "Front Counter Shelf A1";
    updateOrderStatus(order.id, "ready", { readyAt, shelfSlot: assignedSlot });
    markOrderReadyAction(order.id, { shelfSlot: assignedSlot, notifyCustomer: notifyCustomerOnReady });
    setSuccessToast(`Order ${order.id} is Ready at ${assignedSlot}! Customer arrival alert active.`);
    setStagingOrder(null);
  };

  const openReadyModal = (order: Order) => {
    setStagingOrder(order);
    setShelfSlot("Front Counter Shelf A1");
    setNotifyCustomerOnReady(true);
  };

  // Handle advancing state
  const handleAdvance = (order: Order) => {
    if (order.status === "placed") {
      handleMarkPacked(order);
    } else if (order.status === "packed") {
      handleMarkReady(order);
    } else if (order.status === "ready") {
      // Open verification modal for PIN release
      setVerifyingOrder(order);
      setVerificationInput("");
      setVerificationError("");
    }
  };

  // Verify PIN & mark completed
  const handleConfirmVerification = async () => {
    if (!verifyingOrder) return;

    const trimmed = verificationInput.trim().toUpperCase();
    const expected = verifyingOrder.pickupCode.toUpperCase();

    if (trimmed !== expected) {
      setVerificationError(
        `Invalid PIN. Counter token must match '${expected}'.`
      );
      return;
    }

    try {
      await verifyAndCompleteOrderAction(verifyingOrder.id, trimmed, {
        storeId: activeStore?.id,
        role: "seller",
      });
    } catch {
      // client-fallback
    }

    updateOrderStatus(verifyingOrder.id, "completed");
    setSuccessToast(`Pickup verified! Order ${verifyingOrder.id} marked as Completed.`);
    setVerifyingOrder(null);
  };

  // Quick PIN autofill for live demo presentations
  const handleAutofillPIN = () => {
    if (verifyingOrder) {
      setVerificationInput(verifyingOrder.pickupCode);
      setVerificationError("");
    }
  };

  // Simulate incoming new order for hackathon presentation
  const handleSimulateNewOrder = () => {
    const sampleProd: Product =
      products.length > 0
        ? products[Math.floor(Math.random() * products.length)]
        : {
            id: "prod-demo-1",
            storeId: activeStore.id,
            storeName: activeStore.name || "My Store",
            name: "Fresh Order Item",
            description: "Direct customer order",
            price: 150,
            category: "Household",
            stock: 10,
            unit: "1 pack",
            imageUrl: "",
          };
    const mockCustNames = [
      "Sunil Joshi",
      "Kavita Kulkarni",
      "Mahesh Hubballi",
      "Deepa Desai",
      "Anand Hiremath",
    ];
    const chosenName = mockCustNames[Math.floor(Math.random() * mockCustNames.length)];
    const randomPhone = `+91 ${Math.floor(90000 + Math.random() * 90000)} ${Math.floor(10000 + Math.random() * 90000)}`;
    const randomPin = `LL-${Math.floor(100 + Math.random() * 900)}`;

    createOrder({
      customerName: chosenName,
      customerPhone: randomPhone,
      pickupTime: "Today in 20 minutes",
      paymentMethod: "counter",
      items: [
        {
          product: {
            ...sampleProd,
            storeId: activeStore.id,
            storeName: activeStore.name,
          },
          quantity: 2,
        },
      ],
    });

    setSuccessToast(`Simulated incoming order from ${chosenName} (PIN: ${randomPin})!`);
  };

  // Status badge styling helper
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "placed":
        return {
          label: "1. Placed / Needs Packing",
          color: "bg-amber-100 text-amber-900 border-amber-300",
          dot: "bg-amber-500",
        };
      case "packed":
        return {
          label: "2. Packed & Staged",
          color: "bg-sky-100 text-sky-900 border-sky-300",
          dot: "bg-sky-500",
        };
      case "ready":
        return {
          label: "3. Ready at Counter",
          color: "bg-terracotta-100 text-terracotta-900 border-terracotta-300 animate-pulse",
          dot: "bg-terracotta-500",
        };
      case "completed":
        return {
          label: "4. Completed",
          color: "bg-emerald-100 text-emerald-900 border-emerald-300",
          dot: "bg-emerald-600",
        };
      default:
        return {
          label: status,
          color: "bg-cream-200 text-forest-700 border-cream-300",
          dot: "bg-forest-400",
        };
    }
  };

  // Render individual Order Card
  const renderOrderCard = (order: Order, idx?: number) => {
    const isCompleted = order.status === "completed";
    const statusMeta = getStatusBadge(order.status);

    return (
      <motion.div
        key={order.id || `seller-order-${idx}`}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        data-testid={`order-card-${order.id}`}
        className="p-4 sm:p-5 rounded-3xl bg-cream-50 border border-cream-300 space-y-3.5 shadow-warm flex flex-col justify-between hover:border-terracotta-300 transition-colors"
      >
        <div className="space-y-3">
          {/* Card Header: ID, Token & Status Badge */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span
                data-testid={`order-id-${order.id}`}
                className="font-mono font-bold text-xs text-forest-900 block"
              >
                {order.id}
              </span>
              <span suppressHydrationWarning className="text-[10px] text-forest-500">
                {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                data-testid={`pickup-code-${order.id}`}
                className="px-2 py-0.5 rounded-lg bg-terracotta-100 border border-terracotta-300 font-mono font-extrabold text-terracotta-800 text-[11px] flex items-center gap-1"
                title="Counter Verification PIN"
              >
                <KeyRound className="w-3 h-3 text-terracotta-600" />
                <span>{order.pickupCode}</span>
              </span>

              <span
                data-testid={`order-status-${order.id}`}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 shadow-2xs ${statusMeta.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                <span>{order.status}</span>
              </span>
            </div>
          </div>

          {/* Customer & Pickup Details Box */}
          <div className="p-3 rounded-2xl bg-cream-100 border border-cream-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span
                data-testid={`customer-name-${order.id}`}
                className="text-forest-900 font-bold flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-forest-600" />
                <span>{order.customerName}</span>
              </span>
              <a
                href={`tel:${order.customerPhone.replace(/\s+/g, "")}`}
                data-testid={`customer-phone-${order.id}`}
                className="text-terracotta-700 hover:text-terracotta-800 flex items-center gap-1 font-mono text-[11px] font-semibold"
              >
                <Phone className="w-3 h-3" />
                <span>{order.customerPhone}</span>
              </a>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-cream-200/80 text-[11px] text-forest-700">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-forest-500" />
                <span>Pickup Window:</span>
              </span>
              <strong
                data-testid={`pickup-time-${order.id}`}
                className="text-forest-900"
              >
                {order.pickupTime}
              </strong>
            </div>

            <div className="flex items-center justify-between text-[11px] text-forest-700">
              <span>Payment Mode:</span>
              <span className="font-semibold capitalize text-forest-800">
                {order.paymentMethod === "upi" ? "UPI Paid" : "Pay at Counter"}
              </span>
            </div>

            {/* Checkpoint CP-OB03: Packed & Shelf Slot Badges */}
            {order.status === "packed" && (
              <div
                data-testid={`order-packed-badge-${order.id}`}
                className="flex items-center justify-between text-[11px] text-sky-800 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200"
              >
                <span className="flex items-center gap-1 font-semibold">
                  <Package className="w-3 h-3 text-sky-600" />
                  <span>Reserved & Bagged</span>
                </span>
                <span className="font-mono text-[10px] text-sky-700 font-bold">Packed</span>
              </div>
            )}

            {order.status === "ready" && (
              <div
                data-testid={`order-shelf-slot-${order.id}`}
                className="flex items-center justify-between text-[11px] text-terracotta-800 bg-terracotta-50 px-2 py-1 rounded-lg border border-terracotta-200"
              >
                <span className="flex items-center gap-1 font-semibold">
                  <Store className="w-3 h-3 text-terracotta-600" />
                  <span>Counter Staging:</span>
                </span>
                <strong className="text-terracotta-900 font-bold text-[11px]">
                  {order.shelfSlot || "Front Counter Shelf A1"}
                </strong>
              </div>
            )}
          </div>

          {/* Ordered Line Items */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-forest-500 uppercase tracking-wider block">
              Items ({order.items.length})
            </span>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.product.id}-${idx}`}
                  className="text-xs flex justify-between text-forest-800 py-0.5 border-b border-cream-200/50 last:border-0"
                >
                  <span className="line-clamp-1 pr-2">
                    <strong className="text-forest-950 font-semibold">{item.quantity}×</strong> {item.product.name}
                  </span>
                  <span className="font-semibold shrink-0 text-forest-900">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-cream-200 flex justify-between font-bold text-xs text-forest-950">
              <span>Total Bill:</span>
              <span
                data-testid={`order-total-${order.id}`}
                className="text-terracotta-700 text-sm font-serif font-extrabold"
              >
                ₹{order.total}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar: Checkpoint CP-OB03 Packed and Ready Actions */}
        <div className="pt-3 border-t border-cream-200 flex items-center gap-2">
          {order.status === "placed" && (
            <div className="flex-1 flex items-center gap-1.5">
              <button
                type="button"
                data-testid={`mark-packed-${order.id}`}
                data-advance-order={`advance-order-btn-${order.id}`}
                onClick={() => handleMarkPacked(order)}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Mark as Packed"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Mark as Packed</span>
              </button>
              <button
                type="button"
                data-testid={`pack-checklist-btn-${order.id}`}
                onClick={() => openPackModal(order)}
                className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold cursor-pointer transition-colors"
                title="Verify items with packaging checklist"
              >
                <CheckSquare className="w-4 h-4 text-amber-700" />
              </button>
            </div>
          )}

          {order.status === "packed" && (
            <div className="flex-1 flex items-center gap-1.5">
              <button
                type="button"
                data-testid={`mark-ready-${order.id}`}
                data-advance-order={`advance-order-btn-${order.id}`}
                onClick={() => handleMarkReady(order)}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Mark Ready for Pickup"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mark Ready for Pickup</span>
              </button>
              <button
                type="button"
                data-testid={`stage-shelf-btn-${order.id}`}
                onClick={() => openReadyModal(order)}
                className="p-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 text-xs font-bold cursor-pointer transition-colors"
                title="Assign counter staging shelf"
              >
                <Store className="w-4 h-4 text-sky-700" />
              </button>
            </div>
          )}

          {order.status === "ready" && (
            <button
              type="button"
              data-testid={`mark-completed-${order.id}`}
              data-advance-order={`advance-order-btn-${order.id}`}
              onClick={() => handleAdvance(order)}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Verify Counter PIN and Complete Pickup"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify & Release Order</span>
            </button>
          )}

          {isCompleted && (
            <div className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center justify-center gap-1.5 select-none">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Order Completed</span>
            </div>
          )}

          <Link
            href={`/orders/${order.id}`}
            data-testid={`view-tracking-${order.id}`}
            className="p-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-800 text-xs font-semibold transition-colors shrink-0"
            title="View Live Customer Tracking Screen"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <title>Fulfillment Kanban Board • LocalLoop Partner</title>
      <meta
        name="description"
        content="Track and advance store orders across Placed, Packed, Ready, and Completed with counter PIN verification."
      />

      {/* Header & Pipeline Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-cream-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
              Counter Fulfillment Pipeline • CP-OB01 & CP-OB02
            </span>
            {pendingCount > 0 && (
              <span
                data-testid="pending-orders-badge"
                className="px-2 py-0.2 rounded-full bg-terracotta-500 text-white text-[10px] font-bold animate-pulse"
              >
                {pendingCount} Pending
              </span>
            )}
            {/* Checkpoint CP-OB02: Live Realtime Connection Badge */}
            <div
              data-testid="realtime-status-badge"
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border transition-colors ${
                connectionState === "CONNECTED"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : connectionState === "CONNECTING"
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : "bg-cream-200 border-cream-300 text-forest-700"
              }`}
              title={`Supabase Realtime Stream: ${connectionState}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  connectionState === "CONNECTED"
                    ? "bg-emerald-500 animate-pulse"
                    : connectionState === "CONNECTING"
                    ? "bg-amber-500 animate-ping"
                    : "bg-forest-400"
                }`}
              />
              <span>{connectionState === "CONNECTED" ? "Live Stream Active" : connectionState === "CONNECTING" ? "Connecting Stream..." : "Offline Fallback"}</span>
            </div>
          </div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-forest-950">
            Store Pickup Orders
          </h1>
          <p className="text-xs text-forest-600 mt-0.5">
            Manage incoming orders for <strong className="text-forest-900">{activeStore.name}</strong> ({activeStore.area}) across all fulfillment stages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Checkpoint CP-OB02: Audio Chime Toggle */}
          <button
            type="button"
            data-testid="realtime-chime-toggle"
            onClick={() => setChimeEnabled(!chimeEnabled)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              chimeEnabled
                ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                : "bg-cream-200 border-cream-300 text-forest-500"
            }`}
            title={chimeEnabled ? "Audio chime active for new orders" : "Audio chime muted"}
          >
            {chimeEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-700" /> : <VolumeX className="w-3.5 h-3.5 text-forest-500" />}
            <span className="text-[11px] font-semibold">{chimeEnabled ? "Chime On" : "Muted"}</span>
          </button>

          {/* Checkpoint CP-OB02: Broadcast Simulated Realtime Order */}
          <button
            type="button"
            data-testid="test-realtime-broadcast"
            onClick={() => {
              const randomOrderNumber = Math.floor(1000 + Math.random() * 9000);
              const randomPin = `LL-${Math.floor(100 + Math.random() * 900)}`;
              const fallbackProduct: Product = products.length > 0 ? products[0] : {
                id: "prod-sim-1",
                storeId: activeStore.id,
                storeName: activeStore.name || "My Store",
                name: "Store Item",
                description: "Counter purchase",
                price: 180,
                category: "Household",
                stock: 10,
                unit: "1 item",
                imageUrl: "",
              };

              const simOrder: Order = {
                id: `ORD-LL-${randomOrderNumber}`,
                storeId: activeStore.id,
                storeName: activeStore.name,
                storeArea: activeStore.area,
                storeLane: activeStore.lane,
                customerName: "Realtime Shopper",
                customerPhone: "+91 98451 99887",
                items: [
                  {
                    product: fallbackProduct,
                    quantity: 1,
                  },
                ],
                subtotal: fallbackProduct.price,
                platformFee: 15,
                total: fallbackProduct.price + 15,
                status: "placed",
                paymentMethod: "counter",
                paymentStatus: "pending",
                pickupTime: "In 15 minutes",
                pickupCode: randomPin,
                createdAt: new Date().toISOString(),
              };
              broadcastSimulatedOrder(simOrder);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-terracotta-100 hover:bg-terracotta-200 text-terracotta-900 border border-terracotta-300 font-bold text-xs transition-colors cursor-pointer"
            title="Broadcast simulated realtime WebSocket event"
          >
            <Radio className="w-3.5 h-3.5 text-terracotta-600 animate-pulse" />
            <span>Test Broadcast</span>
          </button>

          {/* Simulate New Order Button */}
          <button
            type="button"
            data-testid="simulate-order-button"
            onClick={handleSimulateNewOrder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-cream-100 font-bold text-xs shadow-warm transition-all cursor-pointer"
            title="Simulate incoming order for demo"
          >
            <Sparkles className="w-3.5 h-3.5 text-terracotta-400" />
            <span>Simulate Order</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-cream-200 p-0.5 rounded-xl border border-cream-300">
            <button
              type="button"
              data-testid="view-kanban-toggle"
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-cream-50 text-forest-950 shadow-xs"
                  : "text-forest-600 hover:text-forest-900"
              }`}
              title="Kanban Board View"
            >
              <Columns3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              data-testid="view-list-toggle"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-cream-50 text-forest-950 shadow-xs"
                  : "text-forest-600 hover:text-forest-900"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Checkpoint CP-OB02: Realtime Order Toast Notification */}
      <AnimatePresence>
        {realtimeToast && (
          <motion.div
            key="realtime-order-toast"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            data-testid="realtime-order-toast"
            className="p-4 rounded-2xl bg-amber-500 text-white shadow-xl flex items-center justify-between gap-3 border border-amber-600"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs">
                <p className="font-extrabold flex items-center gap-2">
                  <span>Realtime Order Received!</span>
                  <span className="font-mono bg-white/25 px-2 py-0.5 rounded-md text-[11px]">
                    {realtimeToast.id}
                  </span>
                </p>
                <p className="text-white/95 text-[11px] mt-0.5 font-medium">
                  {realtimeToast.customer} placed a pickup order for ₹{realtimeToast.amount}.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRealtimeToast(null)}
              className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs cursor-pointer transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            key="seller-success-toast"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-forest-800 text-cream-100 flex items-center justify-between gap-3 shadow-warm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <p className="text-xs font-bold">{successToast}</p>
            </div>
            <button
              onClick={() => setSuccessToast("")}
              className="text-xs font-bold text-cream-200 hover:text-white px-2 py-0.5"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pipeline Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300">
          <span className="text-[10px] font-bold text-forest-600 uppercase tracking-wider block">
            Total Orders
          </span>
          <span
            data-testid="metric-total-orders"
            className="font-serif font-extrabold text-xl text-forest-950"
          >
            {displayOrders.length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
            1. Needs Packing
          </span>
          <span
            data-testid="metric-placed-orders"
            className="font-serif font-extrabold text-xl text-amber-950"
          >
            {placedOrders.length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-300">
          <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
            2. In Packing
          </span>
          <span
            data-testid="metric-packed-orders"
            className="font-serif font-extrabold text-xl text-sky-950"
          >
            {packedOrders.length}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-terracotta-50 border border-terracotta-300">
          <span className="text-[10px] font-bold text-terracotta-800 uppercase tracking-wider block">
            3. Ready at Counter
          </span>
          <span
            data-testid="metric-ready-orders"
            className="font-serif font-extrabold text-xl text-terracotta-950"
          >
            {readyOrders.length}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            4. Completed
          </span>
          <span
            data-testid="metric-completed-orders"
            className="font-serif font-extrabold text-xl text-emerald-950"
          >
            {completedOrders.length}
          </span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-cream-50 p-3 rounded-2xl border border-cream-300">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-forest-500" />
          <input
            type="text"
            data-testid="order-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, customer, PIN..."
            className="w-full pl-9 pr-3.5 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            data-testid="filter-all-orders"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-forest-800 text-cream-100 shadow-xs"
                : "bg-cream-100 text-forest-700 hover:bg-cream-200 border border-cream-300"
            }`}
          >
            All ({displayOrders.length})
          </button>
          <button
            type="button"
            data-testid="filter-placed-orders"
            onClick={() => setStatusFilter("placed")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "placed"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300"
            }`}
          >
            Needs Packing ({placedOrders.length})
          </button>
          <button
            type="button"
            data-testid="filter-packed-orders"
            onClick={() => setStatusFilter("packed")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "packed"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-300"
            }`}
          >
            Packed ({packedOrders.length})
          </button>
          <button
            type="button"
            data-testid="filter-ready-orders"
            onClick={() => setStatusFilter("ready")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "ready"
                ? "bg-terracotta-500 text-white shadow-xs"
                : "bg-terracotta-50 text-terracotta-800 hover:bg-terracotta-100 border border-terracotta-300"
            }`}
          >
            Ready ({readyOrders.length})
          </button>
          <button
            type="button"
            data-testid="filter-completed-orders"
            onClick={() => setStatusFilter("completed")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === "completed"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300"
            }`}
          >
            Completed ({completedOrders.length})
          </button>
        </div>
      </div>

      {/* Main Order Pipeline: Kanban vs List View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {/* Column 1: Placed */}
          <div
            data-testid="kanban-col-placed"
            className="p-3.5 rounded-3xl bg-amber-50/50 border border-amber-200/80 space-y-3 min-h-[450px]"
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>1. Needs Packing</span>
              </div>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                {placedOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {placedOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-cream-50/60 border border-dashed border-amber-200 text-xs text-forest-400">
                  No new orders to pack.
                </div>
              ) : (
                placedOrders.map((order, idx) => renderOrderCard(order, idx))
              )}
            </div>
          </div>

          {/* Column 2: Packed */}
          <div
            data-testid="kanban-col-packed"
            className="p-3.5 rounded-3xl bg-sky-50/50 border border-sky-200/80 space-y-3 min-h-[450px]"
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-sky-900">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>2. Packing Staged</span>
              </div>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-sky-200 text-sky-900">
                {packedOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {packedOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-cream-50/60 border border-dashed border-sky-200 text-xs text-forest-400">
                  No orders currently in staging.
                </div>
              ) : (
                packedOrders.map((order, idx) => renderOrderCard(order, idx))
              )}
            </div>
          </div>

          {/* Column 3: Ready */}
          <div
            data-testid="kanban-col-ready"
            className="p-3.5 rounded-3xl bg-terracotta-50/50 border border-terracotta-200/80 space-y-3 min-h-[450px]"
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-terracotta-900">
                <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-ping" />
                <span>3. Ready at Counter</span>
              </div>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-terracotta-200 text-terracotta-900">
                {readyOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {readyOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-cream-50/60 border border-dashed border-terracotta-200 text-xs text-forest-400">
                  No orders awaiting customer pickup.
                </div>
              ) : (
                readyOrders.map((order, idx) => renderOrderCard(order, idx))
              )}
            </div>
          </div>

          {/* Column 4: Completed */}
          <div
            data-testid="kanban-col-completed"
            className="p-3.5 rounded-3xl bg-emerald-50/50 border border-emerald-200/80 space-y-3 min-h-[450px]"
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>4. Completed</span>
              </div>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                {completedOrders.length}
              </span>
            </div>

            <div className="space-y-3">
              {completedOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-cream-50/60 border border-dashed border-emerald-200 text-xs text-forest-400">
                  No completed orders yet.
                </div>
              ) : (
                completedOrders.slice(0, 10).map((order, idx) => renderOrderCard(order, idx))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-cream-50 border border-cream-300 space-y-2">
              <Package className="w-10 h-10 text-forest-400 mx-auto opacity-50" />
              <h3 className="font-serif font-bold text-base text-forest-950">
                No Orders Matching Criteria
              </h3>
              <p className="text-xs text-forest-600">
                Try clearing your search query or switching status filter tabs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order, idx) => renderOrderCard(order, idx))}
            </div>
          )}
        </div>
      )}

      {/* Counter Code PIN Verification Modal */}
      <AnimatePresence>
        {verifyingOrder && (
          <motion.div
            key="counter-verify-modal-wrapper"
            data-testid="counter-verify-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-cream-50 rounded-3xl border border-cream-300 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-cream-300">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-forest-950">
                      Verify Customer Pickup PIN
                    </h3>
                    <p className="text-[11px] text-forest-600">
                      Order: {verifyingOrder.id} • {verifyingOrder.customerName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="cancel-pickup-button"
                  onClick={() => setVerifyingOrder(null)}
                  className="p-1.5 rounded-lg text-forest-500 hover:text-forest-900 hover:bg-cream-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-forest-700">
                  Ask the customer to show their 5-character counter verification token from their order tracking screen:
                </p>

                <div className="p-3.5 rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-between">
                  <span className="text-xs text-forest-600 font-medium">Expected PIN for this order:</span>
                  <span className="font-mono font-extrabold text-sm text-terracotta-700 bg-cream-50 px-2 py-0.5 rounded-lg border border-cream-300">
                    {verifyingOrder.pickupCode}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                    Enter Customer Counter PIN
                  </label>
                  <input
                    type="text"
                    data-testid="verify-code-input"
                    value={verificationInput}
                    onChange={(e) => {
                      setVerificationInput(e.target.value.toUpperCase());
                      if (verificationError) setVerificationError("");
                    }}
                    placeholder={verifyingOrder.pickupCode}
                    className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-center font-mono font-extrabold text-base tracking-widest text-forest-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400 uppercase"
                  />
                  {verificationError && (
                    <p
                      data-testid="verify-code-error"
                      className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{verificationError}</span>
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleAutofillPIN}
                    className="text-[11px] font-bold text-terracotta-600 hover:text-terracotta-700 underline cursor-pointer"
                  >
                    Quick Autofill PIN (Demo Presentation Mode)
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-cream-300 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVerifyingOrder(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-testid="confirm-pickup-button"
                  onClick={handleConfirmVerification}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-warm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Pickup</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkpoint CP-OB03: Pack Order Checklist Modal */}
      <AnimatePresence>
        {packingOrder && (
          <motion.div
            key="pack-order-modal-wrapper"
            data-testid="pack-order-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-cream-50 rounded-3xl border border-cream-300 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-cream-300">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-forest-950">
                      Packing Checklist
                    </h3>
                    <p className="text-[11px] text-forest-600">
                      Order: {packingOrder.id} • {packingOrder.customerName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="cancel-pack-button"
                  onClick={() => setPackingOrder(null)}
                  className="p-1.5 rounded-lg text-forest-500 hover:text-forest-900 hover:bg-cream-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-forest-700">
                  Verify items into local packaging bag before marking packed:
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {packingOrder.items.map((item, idx) => {
                    const isChecked = !!packedItemsCheck[item.product.id];
                    return (
                      <div
                        key={item.product.id || `pack-item-${idx}`}
                        onClick={() =>
                          setPackedItemsCheck({
                            ...packedItemsCheck,
                            [item.product.id]: !isChecked,
                          })
                        }
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-amber-50/80 border-amber-300 text-amber-950"
                            : "bg-cream-100 border-cream-200 text-forest-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            data-testid={`pack-item-check-${item.product.id}`}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-amber-600 cursor-pointer"
                          />
                          <span className="font-semibold">
                            {item.quantity}× {item.product.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-forest-600">
                          ₹{item.product.price * item.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                    Packaging Notes (Optional)
                  </label>
                  <input
                    type="text"
                    data-testid="pack-notes-input"
                    value={packingNotes}
                    onChange={(e) => setPackingNotes(e.target.value)}
                    placeholder="e.g. Bagged with extra tissue wrap"
                    className="w-full px-3.5 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-cream-300 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPackingOrder(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-testid="confirm-pack-button"
                  onClick={() => handleMarkPacked(packingOrder, packingNotes)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-warm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>Confirm Packed</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkpoint CP-OB03: Ready Staging & Shelf Slot Modal */}
      <AnimatePresence>
        {stagingOrder && (
          <motion.div
            key="ready-order-modal-wrapper"
            data-testid="ready-order-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-cream-50 rounded-3xl border border-cream-300 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-cream-300">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-forest-950">
                      Stage for Counter Pickup
                    </h3>
                    <p className="text-[11px] text-forest-600">
                      Order: {stagingOrder.id} • PIN: {stagingOrder.pickupCode}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="cancel-ready-button"
                  onClick={() => setStagingOrder(null)}
                  className="p-1.5 rounded-lg text-forest-500 hover:text-forest-900 hover:bg-cream-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-forest-700">
                  Assign a counter staging shelf so customer service staff can locate the order in seconds:
                </p>

                <div>
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                    Pickup Staging Shelf / Slot
                  </label>
                  <select
                    data-testid="shelf-slot-input"
                    value={shelfSlot}
                    onChange={(e) => setShelfSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-bold focus:outline-none focus:ring-2 focus:ring-terracotta-400 cursor-pointer"
                  >
                    <option value="Front Counter Shelf A1">Front Counter Shelf A1 (Quick Pickup)</option>
                    <option value="Front Counter Shelf A2">Front Counter Shelf A2</option>
                    <option value="Shelf B2 (Sweets Section)">Shelf B2 (Sweets Section)</option>
                    <option value="Refrigerated Shelf 1 (Dairy/Chilled)">Refrigerated Shelf 1 (Dairy/Chilled)</option>
                    <option value="Staging Bin 3">Staging Bin 3</option>
                  </select>
                </div>

                <div className="p-3 rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-between text-xs">
                  <span className="font-medium text-forest-700">Send Customer Arrival Notice:</span>
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-forest-950">
                    <input
                      type="checkbox"
                      data-testid="notify-customer-checkbox"
                      checked={notifyCustomerOnReady}
                      onChange={(e) => setNotifyCustomerOnReady(e.target.checked)}
                      className="w-4 h-4 rounded text-terracotta-600"
                    />
                    <span>Notify on WhatsApp/SMS</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-cream-300 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStagingOrder(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  data-testid="confirm-ready-button"
                  onClick={() => handleMarkReady(stagingOrder, shelfSlot)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-warm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Notify & Stage</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
