"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useSeller } from "@/context/SellerContext";
import { ProductCategory, Product } from "@/types";
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
  const { activeStore, products, addProduct, updateProduct, deleteProduct } = useSeller();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

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

  // Filtered by search and category
  const filteredProducts = useMemo(() => {
    return storeProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.tags && product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCat =
        selectedCategory === "All" || product.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [storeProducts, searchQuery, selectedCategory]);

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
        updateProduct(editingProductId, {
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
        });
        setSuccessAlert(`Updated "${formData.name.trim()}" successfully!`);
      } else {
        // Add new product
        addProduct({
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
        });
        setSuccessAlert(`Added "${formData.name.trim()}" to catalog!`);
      }

      setIsSaving(false);
      setIsModalOpen(false);
      setTimeout(() => setSuccessAlert(""), 4000);
    }, 300);
  };

  // Handle Delete
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from your catalog?`)) {
      deleteProduct(id);
      setSuccessAlert(`Removed "${name}" from inventory.`);
      setTimeout(() => setSuccessAlert(""), 3500);
    }
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

                    {/* Stock Alert Badge */}
                    {isLowStock && (
                      <span
                        data-testid="low-stock-badge"
                        className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold shadow-xs"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Low Stock</span>
                      </span>
                    )}

                    {isOutOfStock && (
                      <span className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 border border-rose-300 text-rose-900 text-[10px] font-bold shadow-xs">
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
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-2 rounded-xl bg-cream-200 hover:bg-rose-100 text-rose-700 transition-colors"
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
                  <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-forest-950">
                    {editingProductId ? "Edit Product" : "Add New Product"}
                  </h2>
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
    </div>
  );
}
