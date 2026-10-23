"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useSeller } from "@/context/SellerContext";
import { ProductCategory, Product } from "@/types";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  adjustStockAtomicAction,
  setProductStockAction,
  generateProductListingAction,
  approveAIProductListingAction,
} from "@/actions/marketplaceActions";
import type { ProductListingDraft } from "@/lib/aiProvider";
import {
  Package,
  Plus,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Search,
  X,
  Save,
  RotateCcw,
  Check,
  Tag,
  Layers,
  Image as ImageIcon,
  DollarSign,
  AlertCircle,
  Archive,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Grocery",
  "Bakery",
  "Produce",
  "Household",
  "Sweets & Snacks",
  "Handloom & Crafts",
  "Filter Coffee & Tea",
  "Fresh Produce",
  "Spices & Pantry",
];

const DEFAULT_FORM_STATE = {
  id: "",
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  category: "Household" as ProductCategory,
  stock: "20",
  unit: "per piece",
  imageUrl: "https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=600&auto=format&fit=crop&q=80",
  isBestseller: false,
  tags: "local, artisanal, hubballi",
};

export default function SellerProductsPage() {
  const {
    activeStore,
    products,
    userRole,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    setStock,
  } = useSeller();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  // Checkpoint CP-PI02: Delete confirmation state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Checkpoint CP-AI02 & CP-AI04: AI Listing Helper & Approval State
  const [showAiHelper, setShowAiHelper] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiDraft, setAiDraft] = useState<ProductListingDraft | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [editedPreviewDraft, setEditedPreviewDraft] = useState<ProductListingDraft | null>(null);
  const [isAiApproved, setIsAiApproved] = useState(false);

  const handleGenerateAiDraft = async () => {
    if (!aiNotes.trim()) return;
    setIsGeneratingAi(true);
    try {
      const res = await generateProductListingAction({
        notes: aiNotes.trim(),
        categoryHint: formData.category,
        storeName: activeStore?.name,
        role: userRole,
      });
      if (res.success && res.draft) {
        setAiDraft(res.draft);
        setEditedPreviewDraft({ ...res.draft });
        setIsApprovalModalOpen(true);
      }
    } catch {
      // client fallback
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleApproveDraft = async () => {
    const draftToApprove = editedPreviewDraft || aiDraft;
    if (!draftToApprove) return;

    try {
      await approveAIProductListingAction(draftToApprove, {
        role: userRole,
        storeId: activeStore?.id,
      });
    } catch {
      // fallback
    }

    setFormData((prev) => ({
      ...prev,
      name: draftToApprove.title,
      description: draftToApprove.description,
      category: (draftToApprove.category as ProductCategory) || prev.category,
      unit: draftToApprove.unit || prev.unit,
      price: String(draftToApprove.suggestedPrice || prev.price || 150),
      tags: draftToApprove.tags.join(", "),
    }));

    setIsAiApproved(true);
    setIsApprovalModalOpen(false);
    setAiDraft(null);
    setShowAiHelper(false);
    setSuccessAlert(`Approved & Applied AI Listing: "${draftToApprove.title}"`);
    setTimeout(() => setSuccessAlert(""), 3500);
  };

  const handleRejectDraft = () => {
    setIsApprovalModalOpen(false);
    setEditedPreviewDraft(null);
    setAiDraft(null);
    setSuccessAlert("AI Draft discarded. You can write custom details or re-generate with new notes.");
    setTimeout(() => setSuccessAlert(""), 3000);
  };

  const handleApplyAiDraft = () => {
    handleApproveDraft();
  };

  // Checkpoint CP-PI03: Atomic stock adjustment handler
  const handleAdjustStock = (productId: string, delta: number) => {
    const result = adjustStock(productId, delta);
    if (!result.success) {
      setSuccessAlert("Cannot decrement stock below zero.");
      setTimeout(() => setSuccessAlert(""), 3000);
      return;
    }
    // Background server action
    adjustStockAtomicAction(productId, delta, userRole).catch(console.warn);
  };

  // Checkpoint CP-PI04: Out-of-Stock and Restock handlers
  const handleMarkOutOfStock = (productId: string, name: string) => {
    setStock(productId, 0);
    setProductStockAction(productId, 0, userRole).catch(console.warn);
    setSuccessAlert(`Marked "${name}" as Out of Stock.`);
    setTimeout(() => setSuccessAlert(""), 3500);
  };

  const handleQuickRestock = (productId: string, name: string, qty: number = 10) => {
    setStock(productId, qty);
    setProductStockAction(productId, qty, userRole).catch(console.warn);
    setSuccessAlert(`Restocked "${name}" with ${qty} units.`);
    setTimeout(() => setSuccessAlert(""), 3500);
  };

  // Validation errors & feedback
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [successAlert, setSuccessAlert] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Products belonging to active store (or matching storeId / storeName)
  const storeProducts = useMemo(() => {
    return products.filter(
      (p) => p.storeId === activeStore.id || p.storeName === activeStore.name
    );
  }, [products, activeStore.id, activeStore.name]);

  // Filtered by search, category, and stock status (CP-PI04)
  const filteredProducts = useMemo(() => {
    return storeProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.tags && product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCat =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "out_of_stock" && product.stock === 0) ||
        (stockFilter === "low_stock" && product.stock > 0 && product.stock <= 10) ||
        (stockFilter === "in_stock" && product.stock > 10);

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [storeProducts, searchQuery, selectedCategory, stockFilter]);

  // Open modal for new product
  const handleOpenAdd = () => {
    setEditingProductId(null);
    setFormData(DEFAULT_FORM_STATE);
    setErrors({});
    setIsModalOpen(true);
  };

  // Open modal to edit product
  const handleOpenEdit = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      category: product.category,
      stock: String(product.stock),
      unit: product.unit || "per piece",
      imageUrl: product.imageUrl || "",
      isBestseller: !!product.isBestseller,
      tags: product.tags ? product.tags.join(", ") : "",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product title is required.";
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Enter a valid positive price (₹ > 0).";
    }

    const stockNum = parseInt(formData.stock, 10);
    if (formData.stock === "" || isNaN(stockNum) || stockNum < 0) {
      newErrors.stock = "Stock must be a non-negative number (≥ 0).";
    }

    if (!formData.category) {
      newErrors.category = "Please select a product category.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);

    const parsedPrice = parseFloat(formData.price);
    const parsedOriginalPrice = formData.originalPrice
      ? parseFloat(formData.originalPrice)
      : undefined;
    const parsedStock = parseInt(formData.stock, 10);
    const parsedTags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setTimeout(() => {
      if (editingProductId) {
        // Update existing product
        const updates = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parsedPrice,
          originalPrice: parsedOriginalPrice,
          category: formData.category,
          stock: parsedStock,
          unit: formData.unit.trim() || "per piece",
          imageUrl: formData.imageUrl.trim() || DEFAULT_FORM_STATE.imageUrl,
          isBestseller: formData.isBestseller,
          tags: parsedTags,
        };
        updateProduct(editingProductId, updates);
        updateProductAction(editingProductId, updates, userRole).catch(console.warn);
        setSuccessAlert(`Updated "${formData.name.trim()}" successfully!`);
      } else {
        // Add new product
        const newProduct = {
          storeId: activeStore.id,
          storeName: activeStore.name,
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parsedPrice,
          originalPrice: parsedOriginalPrice,
          category: formData.category,
          stock: parsedStock,
          unit: formData.unit.trim() || "per piece",
          imageUrl: formData.imageUrl.trim() || DEFAULT_FORM_STATE.imageUrl,
          isBestseller: formData.isBestseller,
          tags: parsedTags,
        };
        addProduct(newProduct);
        createProductAction(newProduct, userRole).catch(console.warn);
        setSuccessAlert(`Added "${formData.name.trim()}" to catalog!`);
      }

      setIsSaving(false);
      setIsModalOpen(false);
      setTimeout(() => setSuccessAlert(""), 4000);
    }, 300);
  };

  // Handle Delete (CP-PI02)
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const toDelete = productToDelete;
    setProductToDelete(null);
    deleteProduct(toDelete.id);
    deleteProductAction(toDelete.id, userRole).catch(console.warn);
    setSuccessAlert(`Removed "${toDelete.name}" from catalog.`);
    setTimeout(() => setSuccessAlert(""), 4000);
  };

  // Handle Reset Form
  const handleResetForm = () => {
    if (editingProductId) {
      const orig = products.find((p) => p.id === editingProductId);
      if (orig) handleOpenEdit(orig);
    } else {
      setFormData(DEFAULT_FORM_STATE);
      setErrors({});
    }
  };

  return (
    <div className="space-y-6">
      <title>Product Catalog &amp; AI Helper • LocalLoop Partner</title>
      <meta
        name="description"
        content="Manage products, atomic stock counts, out-of-stock badges, and AI-assisted catalog autofill."
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-300">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-600">
              Catalog & Inventory • Checkpoint CP-PI01
            </span>
            <span
              data-testid="products-count-badge"
              className="text-[10px] font-bold uppercase tracking-wider text-forest-800 bg-forest-100 border border-forest-200 px-2 py-0.5 rounded-full"
            >
              {storeProducts.length} Products Listed
            </span>
          </div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-forest-950 mt-1">
            Store Inventory & Catalog
          </h1>
          <p className="text-xs text-forest-600 mt-0.5">
            Manage your artisanal listings, stock counters, unit pricing, and product presentations at {activeStore.name}
          </p>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            data-testid="add-product-button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-cream-100 font-bold text-xs shadow-warm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-terracotta-400 stroke-[3]" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {successAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            data-testid="product-save-success-alert"
            className="p-4 rounded-2xl bg-forest-800 text-cream-100 flex items-center justify-between gap-3 shadow-warm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="text-xs">
                <p className="font-bold">{successAlert}</p>
                <p className="text-cream-200 text-[11px]">
                  Catalog is synchronized in real-time across customer discovery and counter checkout.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSuccessAlert("")}
              className="text-xs font-bold text-cream-200 hover:text-white px-2 py-1"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkpoint CP-PI05: Low-Stock Alert Banner for Seller */}
      {storeProducts.filter((p) => p.stock > 0 && p.stock <= 10).length > 0 && (
        <div
          data-testid="low-stock-alert-banner"
          className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-200 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <p className="font-bold text-xs flex items-center gap-1.5">
                <span>Low Stock Inventory Alert</span>
                <span
                  data-testid="low-stock-counter"
                  className="px-1.5 py-0.5 rounded-full bg-amber-200 border border-amber-300 text-amber-900 text-[10px] font-extrabold"
                >
                  {storeProducts.filter((p) => p.stock > 0 && p.stock <= 10).length} SKUs Low
                </span>
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Handcrafted inventory is running low on {storeProducts.filter((p) => p.stock > 0 && p.stock <= 10).map((p) => p.name).slice(0, 2).join(", ")}. Restock to prevent missed customer orders.
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="view-low-stock-btn"
            onClick={() => setStockFilter("low_stock")}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
          >
            Filter Low Stock
          </button>
        </div>
      )}

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-cream-50 p-3 rounded-2xl border border-cream-300">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-forest-500" />
          <input
            type="text"
            data-testid="seller-product-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, story, tags..."
            className="w-full pl-9 pr-3.5 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-forest-700 whitespace-nowrap">Category:</span>
          <select
            data-testid="seller-product-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-semibold focus:outline-none focus:ring-2 focus:ring-terracotta-400 cursor-pointer"
          >
            <option value="All">All Categories ({storeProducts.length})</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Checkpoint CP-PI04: Stock Availability Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          data-testid="filter-all-stock"
          onClick={() => setStockFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            stockFilter === "all"
              ? "bg-forest-800 text-cream-100 shadow-xs"
              : "bg-cream-100 text-forest-700 hover:bg-cream-200 border border-cream-300"
          }`}
        >
          All Items ({storeProducts.length})
        </button>

        <button
          type="button"
          data-testid="filter-low-stock"
          onClick={() => setStockFilter("low_stock")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            stockFilter === "low_stock"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Low Stock ({storeProducts.filter((p) => p.stock > 0 && p.stock <= 10).length})</span>
        </button>

        <button
          type="button"
          data-testid="filter-out-of-stock"
          onClick={() => setStockFilter("out_of_stock")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            stockFilter === "out_of_stock"
              ? "bg-rose-700 text-white shadow-xs"
              : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-300"
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Out of Stock ({storeProducts.filter((p) => p.stock === 0).length})</span>
        </button>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-cream-50 border border-cream-300 space-y-3">
          <Package className="w-12 h-12 text-forest-400 mx-auto opacity-50" />
          <h3 className="font-serif font-bold text-lg text-forest-950">No Products Found</h3>
          <p className="text-xs text-forest-600 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== "All"
              ? "No items match your active search or category filters. Clear filters to browse all inventory."
              : "You haven't added any products to your catalog yet. Click below to add your first handcrafted item."}
          </p>
          {(searchQuery || selectedCategory !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="px-4 py-2 rounded-xl bg-cream-200 text-forest-800 text-xs font-bold hover:bg-cream-300"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const isLowStock = product.stock > 0 && product.stock <= 10;
            const isOutOfStock = product.stock === 0;

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-3xl bg-cream-50 border border-cream-300 space-y-3 shadow-xs flex flex-col justify-between hover:border-terracotta-300 transition-colors"
              >
                <div className="space-y-2.5">
                  {/* Image & Badges */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-cream-200 border border-cream-300 group">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="350px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-forest-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}

                    {/* Category Tag Badge */}
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-forest-950/80 text-cream-100 text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
                      {product.category}
                    </span>

                    {/* Stock Alert Badge (Checkpoint CP-PI05) */}
                    {isLowStock && (
                      <span
                        data-testid="low-stock-badge"
                        data-stock={product.stock}
                        className={`absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs ${
                          product.stock === 1
                            ? "bg-amber-100 border border-amber-400 text-amber-950 ring-1 ring-amber-400 animate-pulse"
                            : "bg-amber-100 border border-amber-300 text-amber-900"
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>{product.stock === 1 ? "Only 1 left!" : `Low Stock (${product.stock})`}</span>
                      </span>
                    )}

                    {isOutOfStock && (
                      <span
                        data-testid="out-of-stock-badge"
                        data-stock={product.stock}
                        className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 border border-rose-300 text-rose-900 text-[10px] font-bold shadow-xs"
                      >
                        <Archive className="w-3 h-3 text-rose-600" />
                        <span>Out of Stock</span>
                      </span>
                    )}

                    {product.isBestseller && (
                      <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-terracotta-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        <span>Bestseller</span>
                      </span>
                    )}

                    {product.aiGenerated && (
                      <span
                        data-testid="ai-approved-badge"
                        className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>AI Approved</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-sm text-forest-950 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-forest-500 line-clamp-2 mt-0.5">
                      {product.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold text-forest-700 bg-cream-200 px-1.5 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Checkpoint CP-PI03 & CP-PI04: Stock Controls & Out-of-Stock Actions */}
                  <div className="p-2.5 rounded-2xl bg-cream-100 border border-cream-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-forest-700 uppercase tracking-wider">
                          Stock:
                        </span>
                        <span
                          data-testid={`stock-count-${product.id}`}
                          className={`font-mono font-bold text-xs ${
                            product.stock === 0
                              ? "text-rose-600 font-extrabold"
                              : isLowStock
                              ? "text-amber-700"
                              : "text-forest-900"
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={product.stock <= 0}
                          data-testid={`stock-decrement-${product.id}`}
                          onClick={() => handleAdjustStock(product.id, -1)}
                          className="w-7 h-7 rounded-lg bg-cream-200 hover:bg-cream-300 disabled:opacity-40 disabled:cursor-not-allowed text-forest-800 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          title="Decrement stock (-1)"
                        >
                          -
                        </button>

                        <button
                          type="button"
                          data-testid={`stock-increment-${product.id}`}
                          onClick={() => handleAdjustStock(product.id, 1)}
                          className="w-7 h-7 rounded-lg bg-forest-800 hover:bg-forest-900 text-cream-100 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          title="Increment stock (+1)"
                        >
                          +
                        </button>

                        <button
                          type="button"
                          data-testid={`stock-bulk-add-${product.id}`}
                          onClick={() => handleAdjustStock(product.id, 5)}
                          className="px-2 h-7 rounded-lg bg-terracotta-100 hover:bg-terracotta-200 text-terracotta-800 font-bold text-[10px] flex items-center justify-center transition-colors cursor-pointer"
                          title="Bulk Restock (+5)"
                        >
                          +5
                        </button>
                      </div>
                    </div>

                    {/* CP-PI04: Out-of-Stock / Restock Quick Action Bar */}
                    <div className="pt-1.5 border-t border-cream-200/80 flex items-center justify-end">
                      {product.stock > 0 ? (
                        <button
                          type="button"
                          data-testid={`mark-out-of-stock-${product.id}`}
                          onClick={() => handleMarkOutOfStock(product.id, product.name)}
                          className="text-[10px] font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 py-0.5 px-1.5 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Instantly mark SKU out of stock"
                        >
                          <Archive className="w-3 h-3" />
                          <span>Mark Out of Stock</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          data-testid={`quick-restock-${product.id}`}
                          onClick={() => handleQuickRestock(product.id, product.name, 10)}
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 py-0.5 px-1.5 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Reactivate SKU with 10 units"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Quick Restock (+10)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer with Price & Actions */}
                <div className="pt-3 border-t border-cream-200 flex items-end justify-between text-xs">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif font-extrabold text-lg text-terracotta-700">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[11px] text-forest-400 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-forest-500 font-medium block">
                      Unit: {product.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      data-testid={`edit-product-${product.id}`}
                      onClick={() => handleOpenEdit(product)}
                      className="p-2 rounded-xl bg-cream-200 hover:bg-forest-100 text-forest-800 transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-forest-700" />
                    </button>
                    <button
                      type="button"
                      data-testid={`delete-product-${product.id}`}
                      onClick={() => setProductToDelete(product)}
                      className="p-2 rounded-xl bg-cream-200 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Product Listing & Editing Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-forest-950/70 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              data-testid="product-listing-form"
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-cream-50 rounded-3xl border border-cream-300 shadow-2xl p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-cream-300">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-600 block">
                    {editingProductId ? "Update Existing SKU" : "New Inventory Listing"}
                  </span>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-forest-950">
                      {editingProductId ? "Edit Product" : "Add New Product"}
                    </h2>
                    {isAiApproved && (
                      <span
                        data-testid="ai-approved-badge"
                        className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>AI Approved</span>
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="cancel-product-button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-4">
                {/* Checkpoint CP-AI02: AI Listing Helper Assistant Banner */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-forest-950 to-forest-900 text-cream-100 border border-forest-800 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-terracotta-500/20 text-terracotta-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-cream-50 flex items-center gap-1.5">
                          <span>AI Listing Helper</span>
                          <span className="text-[9px] font-mono uppercase bg-terracotta-500 text-white px-1.5 py-0.5 rounded font-bold">
                            Gemini
                          </span>
                        </span>
                        <p className="text-[10px] text-cream-400">
                          Paste messy merchant notes & let AI draft title, heritage story, and tags
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      data-testid="ai-listing-helper-trigger"
                      onClick={() => setShowAiHelper(!showAiHelper)}
                      className="text-[11px] font-bold text-terracotta-300 hover:text-terracotta-200 underline cursor-pointer"
                    >
                      {showAiHelper ? "Hide Assistant" : "✨ Autofill with AI"}
                    </button>
                  </div>

                  {showAiHelper && (
                    <div className="pt-2 border-t border-forest-800/80 space-y-2.5">
                      <textarea
                        rows={2}
                        data-testid="ai-notes-input"
                        value={aiNotes}
                        onChange={(e) => setAiNotes(e.target.value)}
                        placeholder="e.g. Authentic Dharwad Pedha 500g box made with pure milk khawa and green cardamom simmered slow"
                        className="w-full px-3 py-2 bg-forest-900/90 border border-forest-700 rounded-xl text-xs text-cream-100 font-medium placeholder-cream-500 focus:outline-none focus:ring-1 focus:ring-terracotta-400"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-cream-400">
                          Autofills title, storytelling, unit, category & tags
                        </span>
                        <button
                          type="button"
                          data-testid="generate-listing-btn"
                          disabled={isGeneratingAi || !aiNotes.trim()}
                          onClick={handleGenerateAiDraft}
                          className="px-3 py-1.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-50 text-white font-bold text-xs shadow-warm flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          {isGeneratingAi ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                              <span>Generating Draft...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Generate Listing</span>
                            </>
                          )}
                        </button>
                      </div>

                      {aiDraft && (
                        <div
                          data-testid="ai-draft-preview"
                          className="p-3 rounded-xl bg-forest-900 border border-terracotta-500/40 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-terracotta-300 uppercase tracking-wide">
                                AI Draft ({aiDraft.category})
                              </span>
                              <span
                                data-testid="ai-validation-badge"
                                className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono text-[9px] font-bold flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                                <span>Validated Schema v1.0</span>
                              </span>
                            </div>
                            <button
                              type="button"
                              data-testid="apply-ai-draft-btn"
                              onClick={handleApplyAiDraft}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              <span>Apply to Form</span>
                            </button>
                          </div>
                          <p className="font-bold text-cream-100">{aiDraft.title}</p>
                          <p className="text-[11px] text-cream-300 line-clamp-2">
                            {aiDraft.description}
                          </p>
                          <div className="flex flex-wrap gap-1 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-forest-800 text-cream-300 font-mono">
                              ₹{aiDraft.suggestedPrice}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-forest-800 text-cream-300 font-mono">
                              {aiDraft.unit}
                            </span>
                            {aiDraft.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-forest-800 text-cream-400"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Name */}
                <div>
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    data-testid="product-name-input"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    placeholder="e.g. Hand-poured Brass-Rim Clay Diyas (Set of 4)"
                    className={`w-full px-3.5 py-2.5 bg-cream-100 border rounded-xl text-xs text-forest-950 font-semibold focus:outline-none transition-colors ${
                      errors.name
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-300"
                        : "border-cream-300 focus:ring-2 focus:ring-terracotta-400"
                    }`}
                  />
                  {errors.name && (
                    <p
                      data-testid="product-name-error"
                      className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                    Artisanal Description & Heritage Notes
                  </label>
                  <textarea
                    rows={3}
                    data-testid="product-description-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe how it is crafted, materials used, ingredients, or usage instructions..."
                    className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>

                {/* Pricing & Units Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      data-testid="product-price-input"
                      value={formData.price}
                      onChange={(e) => {
                        setFormData({ ...formData, price: e.target.value });
                        if (errors.price) setErrors({ ...errors, price: "" });
                      }}
                      placeholder="180"
                      className={`w-full px-3.5 py-2.5 bg-cream-100 border rounded-xl text-xs text-forest-950 font-bold focus:outline-none transition-colors ${
                        errors.price
                          ? "border-rose-400 focus:ring-2 focus:ring-rose-300"
                          : "border-cream-300 focus:ring-2 focus:ring-terracotta-400"
                      }`}
                    />
                    {errors.price && (
                      <p
                        data-testid="product-price-error"
                        className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.price}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                      MRP / Original Price (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      data-testid="product-original-price-input"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, originalPrice: e.target.value })
                      }
                      placeholder="220"
                      className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                      Unit of Measure
                    </label>
                    <input
                      type="text"
                      data-testid="product-unit-input"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="per piece / 500g"
                      className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>
                </div>

                {/* Category & Stock Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                      Catalog Category *
                    </label>
                    <select
                      data-testid="product-category-select"
                      value={formData.category}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          category: e.target.value as ProductCategory,
                        });
                        if (errors.category) setErrors({ ...errors, category: "" });
                      }}
                      className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400 cursor-pointer"
                    >
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p
                        data-testid="product-category-error"
                        className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.category}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                      Initial Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      data-testid="product-stock-input"
                      value={formData.stock}
                      onChange={(e) => {
                        setFormData({ ...formData, stock: e.target.value });
                        if (errors.stock) setErrors({ ...errors, stock: "" });
                      }}
                      placeholder="20"
                      className={`w-full px-3.5 py-2.5 bg-cream-100 border rounded-xl text-xs text-forest-950 font-bold focus:outline-none transition-colors ${
                        errors.stock
                          ? "border-rose-400 focus:ring-2 focus:ring-rose-300"
                          : "border-cream-300 focus:ring-2 focus:ring-terracotta-400"
                      }`}
                    />
                    {errors.stock && (
                      <p
                        data-testid="product-stock-error"
                        className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.stock}</span>
                      </p>
                    )}
                    {/* Checkpoint CP-PI05: Low-Stock Threshold Warning in Modal */}
                    {formData.stock !== "" && parseInt(formData.stock, 10) > 0 && parseInt(formData.stock, 10) <= 10 && (
                      <p
                        data-testid="modal-low-stock-warning"
                        className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>Stock &le; 10 triggers low-stock badges for shoppers & dashboard alerts.</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Product Image URL & Live Preview */}
                <div>
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                    Product Image URL
                  </label>
                  <input
                    type="url"
                    data-testid="product-image-input"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                  {formData.imageUrl && (
                    <div
                      data-testid="product-image-preview"
                      className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-cream-300 bg-cream-200"
                    >
                      <Image
                        src={formData.imageUrl}
                        alt="Product Preview"
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Tags & Bestseller Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                      Search Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      data-testid="product-tags-input"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="handmade, organic, brass"
                      className="w-full px-3.5 py-2.5 bg-cream-100 border border-cream-300 rounded-xl text-xs text-forest-950 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                      Storefront Prominence
                    </label>
                    <button
                      type="button"
                      data-testid="product-bestseller-toggle"
                      onClick={() =>
                        setFormData({ ...formData, isBestseller: !formData.isBestseller })
                      }
                      className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formData.isBestseller
                          ? "bg-terracotta-100 border border-terracotta-400 text-terracotta-900"
                          : "bg-cream-100 border border-cream-300 text-forest-700 hover:bg-cream-200"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
                        <span>Featured Bestseller</span>
                      </span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                          formData.isBestseller ? "bg-terracotta-600 text-white" : "bg-cream-300"
                        }`}
                      >
                        {formData.isBestseller && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-cream-300">
                  <button
                    type="button"
                    data-testid="reset-product-form-button"
                    onClick={handleResetForm}
                    className="px-3.5 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-800 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    data-testid="save-product-button"
                    className="px-5 py-2 rounded-xl bg-forest-800 hover:bg-forest-900 text-cream-100 text-xs font-bold transition-all shadow-warm flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                  >
                    {isSaving ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving SKU...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-terracotta-400" />
                        <span>{editingProductId ? "Update Product" : "Save to Catalog"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal (CP-PI02) */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="absolute inset-0 bg-forest-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              data-testid="delete-confirm-modal"
              className="relative w-full max-w-sm bg-cream-50 rounded-3xl border border-cream-300 shadow-2xl p-6 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="font-serif font-extrabold text-xl text-forest-950">
                  Delete Product SKU?
                </h3>
                <p className="text-xs text-forest-600 mt-1">
                  Are you sure you want to remove <span className="font-bold text-forest-900">&quot;{productToDelete.name}&quot;</span> from your catalog? This will unlist it from shopper discovery immediately.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  data-testid="cancel-delete-button"
                  onClick={() => setProductToDelete(null)}
                  className="w-1/2 px-4 py-2.5 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  data-testid="confirm-delete-button"
                  onClick={handleConfirmDelete}
                  className="w-1/2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-warm cursor-pointer"
                >
                  Delete SKU
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Checkpoint CP-AI04: AI Listing Preview & Seller Approval Modal */}
      <AnimatePresence>
        {isApprovalModalOpen && editedPreviewDraft && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleRejectDraft}
              className="absolute inset-0 bg-forest-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              data-testid="ai-approval-modal"
              className="relative w-full max-w-lg bg-cream-50 rounded-3xl border border-cream-300 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-cream-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-terracotta-100 text-terracotta-700 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-600 block">
                      AI Preview & Merchant Verification
                    </span>
                    <h3 className="font-serif font-extrabold text-lg text-forest-950">
                      Approve AI Listing
                    </h3>
                  </div>
                </div>

                <span
                  data-testid="ai-validation-badge"
                  className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono text-[10px] font-bold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Schema Validated</span>
                </span>
              </div>

              {/* Review & Edit Fields */}
              <div className="space-y-3 text-xs">
                {/* Title */}
                <div>
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    data-testid="ai-preview-title"
                    value={editedPreviewDraft.title}
                    onChange={(e) =>
                      setEditedPreviewDraft({ ...editedPreviewDraft, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-forest-950 font-bold focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                    Heritage Description
                  </label>
                  <textarea
                    rows={3}
                    data-testid="ai-preview-description"
                    value={editedPreviewDraft.description}
                    onChange={(e) =>
                      setEditedPreviewDraft({ ...editedPreviewDraft, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl text-forest-900 font-medium focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>

                {/* Grid: Price, Category, Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                      Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      data-testid="ai-preview-price"
                      value={editedPreviewDraft.suggestedPrice}
                      onChange={(e) =>
                        setEditedPreviewDraft({
                          ...editedPreviewDraft,
                          suggestedPrice: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl font-bold font-mono text-forest-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      data-testid="ai-preview-category"
                      value={editedPreviewDraft.category}
                      onChange={(e) =>
                        setEditedPreviewDraft({ ...editedPreviewDraft, category: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl font-semibold text-forest-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                      Packaging Unit
                    </label>
                    <input
                      type="text"
                      data-testid="ai-preview-unit"
                      value={editedPreviewDraft.unit}
                      onChange={(e) =>
                        setEditedPreviewDraft({ ...editedPreviewDraft, unit: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-cream-100 border border-cream-300 rounded-xl font-semibold text-forest-950 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>
                </div>

                {/* Tags Preview */}
                <div>
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                    Generated Search Tags
                  </label>
                  <div
                    data-testid="ai-preview-tags"
                    className="flex flex-wrap gap-1.5 p-2 bg-cream-100 border border-cream-200 rounded-xl"
                  >
                    {editedPreviewDraft.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-cream-200 text-forest-800 font-semibold text-[11px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Highlights Preview */}
                <div>
                  <label className="text-[11px] font-bold text-forest-800 uppercase tracking-wider block mb-1">
                    Selling Highlights
                  </label>
                  <ul
                    data-testid="ai-preview-highlights"
                    className="space-y-1 list-disc list-inside p-2.5 bg-cream-100 border border-cream-200 rounded-xl text-forest-800 font-medium"
                  >
                    {editedPreviewDraft.highlights.map((h, idx) => (
                      <li key={idx} className="line-clamp-1">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-cream-300">
                <button
                  type="button"
                  data-testid="reject-ai-listing-btn"
                  onClick={handleRejectDraft}
                  className="w-1/2 py-2.5 px-3 rounded-xl bg-cream-200 hover:bg-cream-300 text-forest-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Discard Draft
                </button>

                <button
                  type="button"
                  data-testid="approve-ai-listing-btn"
                  onClick={handleApproveDraft}
                  className="w-1/2 py-2.5 px-3 rounded-xl bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs shadow-warm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Use Listing</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
