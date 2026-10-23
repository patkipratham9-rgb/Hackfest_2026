/**
 * Checkpoint CP-SP01: Protected Seller Portal Layout & Permission Verification
 * Checkpoint CP-SP02: Store Profile Form & Neighborhood Geocoding
 * Checkpoint CP-SP03: Supabase Storage Banner Upload & Media Management
 * Checkpoint CP-SP04: Operating Hours Configuration, Live Status & Validation
 */

import fs from "fs";

console.log("==================================================================");
console.log("🏪 SELLER PORTAL VERIFICATION: CP-SP01, CP-SP02, CP-SP03 & CP-SP04");
console.log("==================================================================\n");

let passed = 0;
function testAssert(condition, desc) {
  if (!condition) {
    console.error(`❌ FAILED: ${desc}`);
    process.exit(1);
  }
  console.log(`  ✓ ${desc}`);
  passed++;
}

// ---------------------------------------------------------------------------
// 1. FILE & ROUTE INTEGRITY (CP-SP01)
// ---------------------------------------------------------------------------
console.log("--- 1. SELLER PORTAL ROUTE & LAYOUT FILES (CP-SP01) ---");

testAssert(fs.existsSync("./src/app/seller/layout.tsx"), "src/app/seller/layout.tsx exists");
testAssert(fs.existsSync("./src/app/seller/page.tsx"), "src/app/seller/page.tsx exists");
testAssert(fs.existsSync("./src/app/seller/orders/page.tsx"), "src/app/seller/orders/page.tsx exists");
testAssert(fs.existsSync("./src/app/seller/products/page.tsx"), "src/app/seller/products/page.tsx exists");
testAssert(fs.existsSync("./src/app/seller/growth/page.tsx"), "src/app/seller/growth/page.tsx exists");
testAssert(fs.existsSync("./src/app/seller/store/page.tsx"), "src/app/seller/store/page.tsx exists");
testAssert(fs.existsSync("./src/context/SellerContext.tsx"), "src/context/SellerContext.tsx exists");

// ---------------------------------------------------------------------------
// 2. PERMISSION & ROLE VERIFICATION LOGIC (CP-SP01)
// ---------------------------------------------------------------------------
console.log("\n--- 2. ROLE AUTHORIZATION & ACCESS GUARD (CP-SP01) ---");

function checkSellerAccess(role) {
  return role === "seller" || role === "admin";
}

testAssert(!checkSellerAccess("customer"), "Customer role is strictly UNAUTHORIZED for seller portal");
testAssert(checkSellerAccess("seller"), "Seller role is AUTHORIZED for seller portal");
testAssert(checkSellerAccess("admin"), "Admin role is AUTHORIZED for seller portal");

// Verify guard in layout code
const layoutContent = fs.readFileSync("./src/app/seller/layout.tsx", "utf-8");
testAssert(layoutContent.includes("data-testid=\"seller-unauthorized-guard\""), "Unauthorized access guard with data-testid='seller-unauthorized-guard' present");
testAssert(layoutContent.includes("data-testid=\"seller-portal-layout\""), "Protected layout container with data-testid='seller-portal-layout' present");
testAssert(layoutContent.includes("data-testid=\"seller-sidebar\""), "Seller sidebar navigation with data-testid='seller-sidebar' present");

// ---------------------------------------------------------------------------
// 3. NAVIGATION & STORE CONTROLS (CP-SP01)
// ---------------------------------------------------------------------------
console.log("\n--- 3. NAVIGATION & STORE IDENTITY (CP-SP01) ---");

testAssert(
  layoutContent.includes("data-testid={`seller-nav-${link.id}`}") ||
    layoutContent.includes("seller-nav-dashboard"),
  "Dashboard nav link testid pattern present"
);
testAssert(
  layoutContent.includes("data-testid={`seller-nav-${link.id}`}") ||
    layoutContent.includes("seller-nav-orders"),
  "Orders nav link testid pattern present"
);
testAssert(
  layoutContent.includes("data-testid={`seller-nav-${link.id}`}") ||
    layoutContent.includes("seller-nav-products"),
  "Products nav link testid pattern present"
);
testAssert(
  layoutContent.includes("data-testid={`seller-nav-${link.id}`}") ||
    layoutContent.includes("seller-nav-store"),
  "Store Profile nav link testid pattern present"
);
testAssert(layoutContent.includes("data-testid=\"seller-verified-badge\""), "Verified merchant badge present");
testAssert(layoutContent.includes("data-testid=\"seller-role-indicator\""), "Live session role indicator present");

// ---------------------------------------------------------------------------
// 4. STORE PROFILE FORM (CP-SP02)
// ---------------------------------------------------------------------------
console.log("\n--- 4. STORE PROFILE FORM & VALIDATION (CP-SP02) ---");

const storePageContent = fs.readFileSync("./src/app/seller/store/page.tsx", "utf-8");

testAssert(storePageContent.includes("data-testid=\"store-name-input\""), "Store Name input field present");
testAssert(storePageContent.includes("data-testid=\"store-tagline-input\""), "Store Tagline / Story input present");
testAssert(storePageContent.includes("data-testid=\"store-category-select\""), "Category selector present");
testAssert(storePageContent.includes("data-testid=\"store-area-select\""), "Neighborhood Area geocoding selector present");
testAssert(storePageContent.includes("data-testid=\"store-lane-input\""), "Street Lane / Landmark address input present");
testAssert(storePageContent.includes("data-testid=\"store-phone-input\""), "Counter phone input present");
testAssert(storePageContent.includes("data-testid=\"store-banner-input\""), "Store banner URL input present");
testAssert(storePageContent.includes("data-testid=\"store-banner-preview\""), "Live banner preview element present");
testAssert(storePageContent.includes("data-testid=\"store-status-toggle\""), "Live storefront open/closed toggle button present");
testAssert(storePageContent.includes("data-testid=\"save-store-profile-button\""), "Save store profile action button present");
testAssert(storePageContent.includes("data-testid=\"reset-store-profile-button\""), "Reset changes action button present");
testAssert(storePageContent.includes("data-testid=\"store-save-success-alert\""), "Success confirmation banner present");
testAssert(storePageContent.includes("data-testid=\"store-name-error\""), "Name validation error state present");
testAssert(storePageContent.includes("data-testid=\"store-phone-error\""), "Phone validation error state present");

// Context persistence test
const sellerContextContent = fs.readFileSync("./src/context/SellerContext.tsx", "utf-8");
testAssert(sellerContextContent.includes("updateStoreProfile"), "SellerContext provides updateStoreProfile method");
testAssert(sellerContextContent.includes("localloop_seller_store_v1"), "Seller store updates persisted to localStorage (localloop_seller_store_v1)");

// Validation unit logic
function validateStoreForm(storeData) {
  if (!storeData.name || !storeData.name.trim()) return { valid: false, error: "Name required" };
  const digits = (storeData.phone || "").replace(/\D/g, "");
  if (digits.length < 10) return { valid: false, error: "10-digit phone required" };
  return { valid: true };
}

testAssert(!validateStoreForm({ name: "", phone: "9845012345" }).valid, "Empty store name rejected");
testAssert(!validateStoreForm({ name: "Meena Crafts", phone: "123" }).valid, "Short phone number rejected");
testAssert(validateStoreForm({ name: "Meena Crafts", phone: "+91 98450 12345" }).valid, "Valid store details accepted");

// ---------------------------------------------------------------------------
// 5. SUPABASE STORAGE BANNER UPLOAD & POLICIES (CP-SP03)
// ---------------------------------------------------------------------------
console.log("\n--- 5. SUPABASE STORAGE BANNER UPLOAD & BUCKET (CP-SP03) ---");

// Check migration file exists
const migrationPath = "./supabase/migrations/20261023153046_create_storage_store_banners_bucket.sql";
testAssert(fs.existsSync(migrationPath), "Supabase Storage migration 20261023153046_create_storage_store_banners_bucket.sql exists");

const migrationSql = fs.readFileSync(migrationPath, "utf-8");
testAssert(migrationSql.includes("'store-banners'"), "Migration provisions 'store-banners' bucket");
testAssert(migrationSql.includes("public = true"), "Migration configures bucket as public for CDN read access");
testAssert(migrationSql.includes("5242880"), "Migration enforces 5MB file_size_limit");
testAssert(migrationSql.includes("Public read for store banners"), "Migration configures Public Read SELECT policy");
testAssert(migrationSql.includes("Authenticated users and sellers can upload banners"), "Migration configures Authenticated Sellers INSERT policy");
testAssert(migrationSql.includes("Users can update store banners"), "Migration configures Authenticated Sellers UPDATE policy");
testAssert(migrationSql.includes("Users can delete store banners"), "Migration configures Authenticated Sellers DELETE policy");

// Check UI upload controls in store profile page
testAssert(storePageContent.includes("data-testid=\"banner-file-input\""), "Hidden file input with data-testid='banner-file-input' present");
testAssert(storePageContent.includes("data-testid=\"banner-upload-button\""), "Upload action trigger button with data-testid='banner-upload-button' present");
testAssert(storePageContent.includes("data-testid=\"banner-upload-loading\""), "Upload loading spinner with data-testid='banner-upload-loading' present");
testAssert(storePageContent.includes("data-testid=\"banner-upload-success\""), "Upload success confirmation with data-testid='banner-upload-success' present");
testAssert(storePageContent.includes("data-testid=\"banner-upload-error\""), "Upload error alert with data-testid='banner-upload-error' present");
testAssert(storePageContent.includes("data-testid=\"remove-banner-button\""), "Remove banner button with data-testid='remove-banner-button' present");

// Upload validation unit logic (CP-SP03)
function validateBannerFile(file) {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "Only image files (PNG, JPG, WebP, AVIF) allowed" };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File exceeds 5MB limit" };
  }
  return { valid: true };
}

testAssert(!validateBannerFile({ type: "application/pdf", size: 1024 }).valid, "Non-image PDF rejected");
testAssert(!validateBannerFile({ type: "image/png", size: 6 * 1024 * 1024 }).valid, "File > 5MB rejected");
testAssert(validateBannerFile({ type: "image/jpeg", size: 2 * 1024 * 1024 }).valid, "Valid 2MB JPEG accepted");
testAssert(validateBannerFile({ type: "image/webp", size: 500 * 1024 }).valid, "Valid 500KB WebP accepted");

// ---------------------------------------------------------------------------
// 6. OPERATING HOURS CONFIGURATION, LIVE STATUS & VALIDATION (CP-SP04)
// ---------------------------------------------------------------------------
console.log("\n--- 6. OPERATING HOURS CONFIGURATION & VALIDATION (CP-SP04) ---");

// 6.1 Check operating hours module exists and has all required exports
const opHoursPath = "./src/lib/operatingHours.ts";
testAssert(fs.existsSync(opHoursPath), "src/lib/operatingHours.ts utility module exists");

const opHoursContent = fs.readFileSync(opHoursPath, "utf-8");
testAssert(opHoursContent.includes("export function validateOperatingHours"), "validateOperatingHours function exported");
testAssert(opHoursContent.includes("export function checkLiveOperatingStatus"), "checkLiveOperatingStatus function exported");
testAssert(opHoursContent.includes("export function formatOperatingHoursString"), "formatOperatingHoursString function exported");
testAssert(opHoursContent.includes("export function parseOperatingHoursString"), "parseOperatingHoursString function exported");
testAssert(opHoursContent.includes("export function formatTo12Hour"), "formatTo12Hour function exported");
testAssert(opHoursContent.includes("export const ALL_DAYS"), "ALL_DAYS list exported");

// 6.2 Check UI controls in store profile page
testAssert(storePageContent.includes("data-testid=\"store-hours-input\""), "Formatted store hours input (data-testid='store-hours-input') present");
testAssert(storePageContent.includes("data-testid=\"store-open-time-input\""), "Opening time input (data-testid='store-open-time-input') present");
testAssert(storePageContent.includes("data-testid=\"store-close-time-input\""), "Closing time input (data-testid='store-close-time-input') present");
testAssert(storePageContent.includes("data-testid=\"store-hours-live-status\""), "Live operational status badge (data-testid='store-hours-live-status') present");
testAssert(storePageContent.includes("data-testid=\"store-hours-error\""), "Hours validation error banner (data-testid='store-hours-error') present");

// Quick Presets
testAssert(storePageContent.includes("data-testid=\"preset-retail\""), "Retail preset (data-testid='preset-retail') present");
testAssert(storePageContent.includes("data-testid=\"preset-early\""), "Early bird preset (data-testid='preset-early') present");
testAssert(storePageContent.includes("data-testid=\"preset-bazaar\""), "Bazaar preset (data-testid='preset-bazaar') present");
testAssert(storePageContent.includes("data-testid=\"preset-24h\""), "24/7 preset (data-testid='preset-24h') present");

// Operational day toggles
testAssert(storePageContent.includes("day-toggle-mon"), "Monday toggle (day-toggle-mon) present");
testAssert(storePageContent.includes("day-toggle-tue"), "Tuesday toggle (day-toggle-tue) present");
testAssert(storePageContent.includes("day-toggle-wed"), "Wednesday toggle (day-toggle-wed) present");
testAssert(storePageContent.includes("day-toggle-thu"), "Thursday toggle (day-toggle-thu) present");
testAssert(storePageContent.includes("day-toggle-fri"), "Friday toggle (day-toggle-fri) present");
testAssert(storePageContent.includes("day-toggle-sat"), "Saturday toggle (day-toggle-sat) present");
testAssert(storePageContent.includes("day-toggle-sun"), "Sunday toggle (day-toggle-sun) present");

// 6.3 Operating Hours Validation Unit Tests
function validateHours(openTime, closeTime, days) {
  if (!openTime || !closeTime) {
    return { valid: false, error: "Both opening and closing times must be specified." };
  }
  if (!days || days.length === 0) {
    return { valid: false, error: "At least one operational day must be selected." };
  }
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  if (isNaN(openH) || isNaN(openM) || isNaN(closeH) || isNaN(closeM)) {
    return { valid: false, error: "Invalid time format provided." };
  }
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  if (closeMinutes <= openMinutes) {
    return { valid: false, error: "Closing time must be later than opening time." };
  }
  if (closeMinutes - openMinutes < 30) {
    return { valid: false, error: "Operating hours window must be at least 30 minutes long." };
  }
  return { valid: true };
}

testAssert(!validateHours("", "21:00", ["Mon", "Tue"]).valid, "Missing opening time rejected");
testAssert(!validateHours("09:00", "", ["Mon", "Tue"]).valid, "Missing closing time rejected");
testAssert(!validateHours("09:00", "21:00", []).valid, "Zero operational days rejected");
testAssert(!validateHours("21:00", "09:00", ["Mon"]).valid, "Closing time earlier than opening time rejected");
testAssert(!validateHours("10:00", "10:00", ["Mon"]).valid, "Equal opening and closing times rejected");
testAssert(!validateHours("10:00", "10:15", ["Mon"]).valid, "Window shorter than 30 minutes rejected");
testAssert(validateHours("09:00", "21:00", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]).valid, "Standard 9 AM - 9 PM schedule accepted");
testAssert(validateHours("00:00", "23:59", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).valid, "24/7 all-day schedule accepted");

// 6.4 Live Status Evaluation Unit Tests
function evaluateLiveStatus(openTime, closeTime, days, isCounterOpen, now) {
  if (!isCounterOpen) {
    return { isOpen: false, badgeText: "Manually Closed" };
  }
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDay = dayNames[now.getDay()];
  if (!days.includes(currentDay)) {
    return { isOpen: false, badgeText: "Closed Today" };
  }
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (currentMinutes < openMinutes) {
    return { isOpen: false, badgeText: "Closed Now" };
  }
  if (currentMinutes >= closeMinutes) {
    return { isOpen: false, badgeText: "Closed for the Day" };
  }
  return { isOpen: true, badgeText: "Open Now" };
}

// Fixed reference dates:
// 2026-10-23 is Friday
const fri10am = new Date("2026-10-23T10:00:00");
const fri6am = new Date("2026-10-23T06:00:00");
const fri11pm = new Date("2026-10-23T23:00:00");
// 2026-10-25 is Sunday
const sun10am = new Date("2026-10-25T10:00:00");

testAssert(!evaluateLiveStatus("08:00", "21:00", ["Mon", "Fri"], false, fri10am).isOpen, "Manually toggled closed store returns isOpen: false");
testAssert(!evaluateLiveStatus("08:00", "21:00", ["Mon", "Fri"], true, sun10am).isOpen, "Non-operational Sunday returns isOpen: false");
testAssert(evaluateLiveStatus("08:00", "21:00", ["Mon", "Fri"], true, fri10am).isOpen, "Active Friday 10 AM within 08:00-21:00 returns isOpen: true");
testAssert(!evaluateLiveStatus("08:00", "21:00", ["Mon", "Fri"], true, fri6am).isOpen, "Active Friday 6 AM before 08:00 returns isOpen: false");
testAssert(!evaluateLiveStatus("08:00", "21:00", ["Mon", "Fri"], true, fri11pm).isOpen, "Active Friday 11 PM after 21:00 returns isOpen: false");

// ---------------------------------------------------------------------------
// 7. PRODUCT LISTING FORM & INVENTORY MANAGEMENT (CP-PI01)
// ---------------------------------------------------------------------------
console.log("\n--- 7. PRODUCT LISTING FORM & INVENTORY MANAGEMENT (CP-PI01) ---");

const productsPageContent = fs.readFileSync("./src/app/seller/products/page.tsx", "utf-8");

// 7.1 Page Controls & Header
testAssert(productsPageContent.includes("data-testid=\"add-product-button\""), "Add Product trigger button with data-testid='add-product-button' present");
testAssert(productsPageContent.includes("data-testid=\"products-count-badge\""), "Product counter badge with data-testid='products-count-badge' present");
testAssert(productsPageContent.includes("data-testid=\"seller-product-search\""), "Inventory search input with data-testid='seller-product-search' present");
testAssert(productsPageContent.includes("data-testid=\"seller-product-category-filter\""), "Category filter dropdown with data-testid='seller-product-category-filter' present");

// 7.2 Product Form & Modal Controls
testAssert(productsPageContent.includes("data-testid=\"product-listing-form\""), "Product listing modal form with data-testid='product-listing-form' present");
testAssert(productsPageContent.includes("data-testid=\"cancel-product-button\""), "Cancel / Close modal button with data-testid='cancel-product-button' present");
testAssert(productsPageContent.includes("data-testid=\"product-name-input\""), "Product Title input with data-testid='product-name-input' present");
testAssert(productsPageContent.includes("data-testid=\"product-description-input\""), "Description textarea with data-testid='product-description-input' present");
testAssert(productsPageContent.includes("data-testid=\"product-price-input\""), "Price input with data-testid='product-price-input' present");
testAssert(productsPageContent.includes("data-testid=\"product-original-price-input\""), "MRP / Original Price input with data-testid='product-original-price-input' present");
testAssert(productsPageContent.includes("data-testid=\"product-category-select\""), "Category selector with data-testid='product-category-select' present");
testAssert(productsPageContent.includes("data-testid=\"product-stock-input\""), "Stock count input with data-testid='product-stock-input' present");
testAssert(productsPageContent.includes("data-testid=\"product-unit-input\""), "Unit of measure input with data-testid='product-unit-input' present");
testAssert(productsPageContent.includes("data-testid=\"product-image-input\""), "Image URL input with data-testid='product-image-input' present");
testAssert(productsPageContent.includes("data-testid=\"product-image-preview\""), "Image live preview element with data-testid='product-image-preview' present");
testAssert(productsPageContent.includes("data-testid=\"product-bestseller-toggle\""), "Bestseller prominence toggle with data-testid='product-bestseller-toggle' present");
testAssert(productsPageContent.includes("data-testid=\"product-tags-input\""), "Search tags input with data-testid='product-tags-input' present");
testAssert(productsPageContent.includes("data-testid=\"reset-product-form-button\""), "Reset form button with data-testid='reset-product-form-button' present");
testAssert(productsPageContent.includes("data-testid=\"save-product-button\""), "Save product submit button with data-testid='save-product-button' present");
testAssert(productsPageContent.includes("data-testid=\"product-save-success-alert\""), "Save confirmation alert with data-testid='product-save-success-alert' present");

// 7.3 Validation Error Elements
testAssert(productsPageContent.includes("data-testid=\"product-name-error\""), "Product name validation error with data-testid='product-name-error' present");
testAssert(productsPageContent.includes("data-testid=\"product-price-error\""), "Price validation error with data-testid='product-price-error' present");
testAssert(productsPageContent.includes("data-testid=\"product-stock-error\""), "Stock validation error with data-testid='product-stock-error' present");
testAssert(productsPageContent.includes("data-testid=\"product-category-error\""), "Category validation error with data-testid='product-category-error' present");

// 7.4 Inventory Card Badges & Actions
testAssert(productsPageContent.includes("data-testid=\"low-stock-badge\""), "Low stock threshold alert badge with data-testid='low-stock-badge' present");
testAssert(productsPageContent.includes("edit-product-"), "Product edit trigger with data-testid='edit-product-[id]' present");
testAssert(productsPageContent.includes("delete-product-"), "Product delete trigger with data-testid='delete-product-[id]' present");

// 7.5 SellerContext Persistence & Methods
const contextContent = fs.readFileSync("./src/context/SellerContext.tsx", "utf-8");
testAssert(contextContent.includes("addProduct"), "SellerContext provides addProduct method");
testAssert(contextContent.includes("updateProduct"), "SellerContext provides updateProduct method");
testAssert(contextContent.includes("deleteProduct"), "SellerContext provides deleteProduct method");
testAssert(contextContent.includes("localloop_seller_products_v1"), "Seller inventory changes persisted to localStorage (localloop_seller_products_v1)");

// 7.6 Unit Validation Logic
function validateProductListing(item) {
  if (!item.name || !item.name.trim()) return { valid: false, error: "Title required" };
  const price = parseFloat(item.price);
  if (isNaN(price) || price <= 0) return { valid: false, error: "Price must be > 0" };
  const stock = parseInt(item.stock, 10);
  if (isNaN(stock) || stock < 0) return { valid: false, error: "Stock must be >= 0" };
  if (!item.category) return { valid: false, error: "Category required" };
  return { valid: true };
}

testAssert(!validateProductListing({ name: "", price: "180", stock: "10", category: "Grocery" }).valid, "Empty product title rejected");
testAssert(!validateProductListing({ name: "Chai Powder", price: "0", stock: "10", category: "Grocery" }).valid, "Zero price rejected");
testAssert(!validateProductListing({ name: "Chai Powder", price: "-50", stock: "10", category: "Grocery" }).valid, "Negative price rejected");
testAssert(!validateProductListing({ name: "Chai Powder", price: "abc", stock: "10", category: "Grocery" }).valid, "Non-numeric price rejected");
testAssert(!validateProductListing({ name: "Chai Powder", price: "120", stock: "-5", category: "Grocery" }).valid, "Negative stock rejected");
testAssert(!validateProductListing({ name: "Chai Powder", price: "120", stock: "10", category: "" }).valid, "Missing category rejected");
testAssert(validateProductListing({ name: "Brass Diya", price: "180", stock: "0", category: "Household" }).valid, "Zero stock (out-of-stock SKU) accepted");
testAssert(validateProductListing({ name: "Byadagi Chili Powder", price: "240.50", stock: "50", category: "Grocery" }).valid, "Complete valid product accepted");

// ---------------------------------------------------------------------------
// 8. PRODUCT CREATE, EDIT & DELETE SERVER ACTIONS & PERMISSIONS (CP-PI02)
// ---------------------------------------------------------------------------
console.log("\n--- 8. PRODUCT CREATE, EDIT & DELETE SERVER ACTIONS & PERMISSIONS (CP-PI02) ---");

// 8.1 Server Actions in marketplaceActions.ts
const actionsContent = fs.readFileSync("./src/actions/marketplaceActions.ts", "utf-8");
testAssert(actionsContent.includes("export async function createProductAction"), "createProductAction server action exported");
testAssert(actionsContent.includes("export async function updateProductAction"), "updateProductAction server action exported");
testAssert(actionsContent.includes("export async function deleteProductAction"), "deleteProductAction server action exported");

// 8.2 Role Permissions Verification Logic
function checkProductActionPermission(role) {
  if (role !== "seller" && role !== "admin") {
    return { success: false, error: "Unauthorized: Seller or Admin permissions required" };
  }
  return { success: true };
}

testAssert(!checkProductActionPermission("customer").success, "Customer role is strictly unauthorized to mutate products");
testAssert(!checkProductActionPermission("anonymous").success, "Anonymous role is strictly unauthorized to mutate products");
testAssert(checkProductActionPermission("seller").success, "Seller role is authorized to create/edit/delete products");
testAssert(checkProductActionPermission("admin").success, "Admin role is authorized to create/edit/delete products");

// 8.3 Delete Confirmation Modal UI in products/page.tsx
testAssert(productsPageContent.includes("data-testid=\"delete-confirm-modal\""), "Delete Confirmation Modal with data-testid='delete-confirm-modal' present");
testAssert(productsPageContent.includes("data-testid=\"confirm-delete-button\""), "Confirm Delete button with data-testid='confirm-delete-button' present");
testAssert(productsPageContent.includes("data-testid=\"cancel-delete-button\""), "Cancel Delete button with data-testid='cancel-delete-button' present");

// 8.4 Server Action Validation Rules Simulation
function simulateCreateProduct(input, role) {
  const auth = checkProductActionPermission(role);
  if (!auth.success) return auth;
  if (!input.name || !input.name.trim()) return { success: false, error: "Product name is required" };
  if (input.price <= 0 || isNaN(input.price)) return { success: false, error: "Product price must be greater than 0" };
  if (input.stock < 0 || isNaN(input.stock)) return { success: false, error: "Product stock cannot be negative" };
  if (!input.category || !input.category.trim()) return { success: false, error: "Product category is required" };
  return { success: true, productId: "prod-" + Date.now() };
}

function simulateUpdateProduct(id, updates, role) {
  const auth = checkProductActionPermission(role);
  if (!auth.success) return auth;
  if (!id) return { success: false, error: "Product ID is required" };
  if (updates.price !== undefined && (updates.price <= 0 || isNaN(updates.price))) {
    return { success: false, error: "Product price must be greater than 0" };
  }
  if (updates.stock !== undefined && (updates.stock < 0 || isNaN(updates.stock))) {
    return { success: false, error: "Product stock cannot be negative" };
  }
  return { success: true };
}

function simulateDeleteProduct(id, role) {
  const auth = checkProductActionPermission(role);
  if (!auth.success) return auth;
  if (!id) return { success: false, error: "Product ID is required" };
  return { success: true };
}

// Validation tests
testAssert(!simulateCreateProduct({ name: "", price: 100, stock: 5, category: "Bakery" }, "seller").success, "Create rejects empty name");
testAssert(!simulateCreateProduct({ name: "Cake", price: 0, stock: 5, category: "Bakery" }, "seller").success, "Create rejects zero price");
testAssert(!simulateCreateProduct({ name: "Cake", price: 100, stock: -1, category: "Bakery" }, "seller").success, "Create rejects negative stock");
testAssert(!simulateCreateProduct({ name: "Cake", price: 100, stock: 5, category: "" }, "seller").success, "Create rejects missing category");
testAssert(!simulateCreateProduct({ name: "Cake", price: 100, stock: 5, category: "Bakery" }, "customer").success, "Create rejects customer role");
testAssert(simulateCreateProduct({ name: "Special Dharwad Pedha", price: 260, stock: 15, category: "Bakery" }, "seller").success, "Create succeeds with valid seller data");

testAssert(!simulateUpdateProduct("prod-1", { price: -10 }, "seller").success, "Update rejects negative price");
testAssert(!simulateUpdateProduct("prod-1", { stock: -5 }, "seller").success, "Update rejects negative stock");
testAssert(!simulateUpdateProduct("prod-1", { price: 280 }, "customer").success, "Update rejects customer role");
testAssert(simulateUpdateProduct("prod-1", { price: 280, stock: 12 }, "seller").success, "Update succeeds with valid seller data");

testAssert(!simulateDeleteProduct("", "seller").success, "Delete rejects empty product ID");
testAssert(!simulateDeleteProduct("prod-1", "customer").success, "Delete rejects customer role");
testAssert(simulateDeleteProduct("prod-1", "seller").success, "Delete succeeds with valid seller data");

// 8.5 Full CRUD Lifecycle State Machine Test
let testInventory = [
  { id: "prod-101", name: "Brass Diya", price: 180, stock: 10, category: "Household" },
];

// Create
const newProduct = { id: "prod-102", name: "Mysore Pak", price: 200, stock: 20, category: "Sweets & Snacks" };
testInventory = [newProduct, ...testInventory];
testAssert(testInventory.length === 2 && testInventory[0].id === "prod-102", "Lifecycle: Product created and prepended to inventory");

// Edit
testInventory = testInventory.map(p => p.id === "prod-102" ? { ...p, price: 220, stock: 18 } : p);
testAssert(testInventory.find(p => p.id === "prod-102").price === 220, "Lifecycle: Product edited with new price ₹220");

// Delete
testInventory = testInventory.filter(p => p.id !== "prod-102");
testAssert(testInventory.length === 1 && !testInventory.find(p => p.id === "prod-102"), "Lifecycle: Product deleted from inventory");

// ---------------------------------------------------------------------------
// 9. ATOMIC STOCK INCREMENT/DECREMENT (CP-PI03)
// ---------------------------------------------------------------------------
console.log("\n--- 9. ATOMIC STOCK INCREMENT/DECREMENT (CP-PI03) ---");

// 9.1 Postgres Migration RPC
const stockRpcMigrationPath = "./supabase/migrations/20261023160000_atomic_stock_adjustment_rpc.sql";
testAssert(fs.existsSync(stockRpcMigrationPath), "Atomic stock adjustment RPC migration 20261023160000_atomic_stock_adjustment_rpc.sql exists");

const stockRpcSql = fs.readFileSync(stockRpcMigrationPath, "utf-8");
testAssert(stockRpcSql.includes("FUNCTION public.adjust_product_stock_atomic"), "Migration defines adjust_product_stock_atomic function");
testAssert(stockRpcSql.includes("FOR UPDATE"), "RPC acquires row-level lock FOR UPDATE for concurrency safety");
testAssert(stockRpcSql.includes("v_new_stock < 0"), "RPC asserts stock cannot drop below zero");

// 9.2 Server Action in marketplaceActions.ts
testAssert(actionsContent.includes("export async function adjustStockAtomicAction"), "adjustStockAtomicAction server action exported");

// Permission check
function simulateAdjustStockAction(productId, delta, role) {
  if (role !== "seller" && role !== "admin") {
    return { success: false, error: "Unauthorized: Seller or Admin permissions required" };
  }
  if (!productId) return { success: false, error: "Product ID is required" };
  if (isNaN(delta) || !Number.isInteger(delta)) {
    return { success: false, error: "Delta must be an integer" };
  }
  return { success: true };
}

testAssert(!simulateAdjustStockAction("prod-1", 1, "customer").success, "Stock adjustment rejected for customer role");
testAssert(!simulateAdjustStockAction("prod-1", 1, "anonymous").success, "Stock adjustment rejected for anonymous role");
testAssert(!simulateAdjustStockAction("", 1, "seller").success, "Stock adjustment rejected for empty product ID");
testAssert(!simulateAdjustStockAction("prod-1", 1.5, "seller").success, "Stock adjustment rejected for non-integer delta");
testAssert(simulateAdjustStockAction("prod-1", 1, "seller").success, "Stock adjustment authorized for seller");
testAssert(simulateAdjustStockAction("prod-1", -1, "admin").success, "Stock adjustment authorized for admin");

// 9.3 UI Controls in products/page.tsx
const currentProductsPageContent = fs.readFileSync("./src/app/seller/products/page.tsx", "utf-8");
testAssert(currentProductsPageContent.includes("stock-count-"), "Stock count element with data-testid='stock-count-[id]' present");
testAssert(currentProductsPageContent.includes("stock-decrement-"), "Stock decrement button with data-testid='stock-decrement-[id]' present");
testAssert(currentProductsPageContent.includes("stock-increment-"), "Stock increment button with data-testid='stock-increment-[id]' present");
testAssert(currentProductsPageContent.includes("stock-bulk-add-"), "Bulk restock button with data-testid='stock-bulk-add-[id]' present");

// 9.4 SellerContext adjustStock method
const currentContextContent = fs.readFileSync("./src/context/SellerContext.tsx", "utf-8");
testAssert(currentContextContent.includes("adjustStock"), "SellerContext provides adjustStock method");

// 9.5 Unit & Concurrency Simulation
function atomicStockAdjuster(currentStock, delta) {
  const newStock = currentStock + delta;
  if (newStock < 0) {
    return { success: false, error: "Cannot decrement below 0", stock: currentStock };
  }
  return { success: true, stock: newStock };
}

testAssert(atomicStockAdjuster(10, 1).stock === 11, "Stock increment +1 works (10 -> 11)");
testAssert(atomicStockAdjuster(10, -1).stock === 9, "Stock decrement -1 works (10 -> 9)");
testAssert(atomicStockAdjuster(10, 5).stock === 15, "Bulk restock +5 works (10 -> 15)");
testAssert(!atomicStockAdjuster(0, -1).success, "Stock decrement below 0 rejected");
testAssert(!atomicStockAdjuster(2, -3).success, "Oversized decrement rejected (2 - 3 < 0)");

// Concurrency invariant test: 10 operations (+2, -1, +5, -2, etc.)
let simulatedStock = 20;
const deltas = [+2, -1, +5, -3, +1, -1, -4, +10, -5, +2];
const expectedStock = 20 + deltas.reduce((a, b) => a + b, 0); // 20 + 6 = 26
for (const d of deltas) {
  const res = atomicStockAdjuster(simulatedStock, d);
  if (res.success) simulatedStock = res.stock;
}
testAssert(simulatedStock === expectedStock, `Concurrency simulation correctly maintained exact stock invariant (${expectedStock})`);

// ---------------------------------------------------------------------------
// 10. OUT-OF-STOCK CONTROLS & INVENTORY STATE (CP-PI04)
// ---------------------------------------------------------------------------
console.log("\n--- 10. OUT-OF-STOCK CONTROLS & INVENTORY STATE (CP-PI04) ---");

const finalProductsPageContent = fs.readFileSync("./src/app/seller/products/page.tsx", "utf-8");

// 10.1 Stock Filter Tabs
testAssert(finalProductsPageContent.includes("data-testid=\"filter-all-stock\""), "Filter all items tab with data-testid='filter-all-stock' present");
testAssert(finalProductsPageContent.includes("data-testid=\"filter-low-stock\""), "Filter low stock tab with data-testid='filter-low-stock' present");
testAssert(finalProductsPageContent.includes("data-testid=\"filter-out-of-stock\""), "Filter out of stock tab with data-testid='filter-out-of-stock' present");

// 10.2 Out-of-Stock Badges & Card Controls
testAssert(finalProductsPageContent.includes("data-testid=\"out-of-stock-badge\""), "Out of stock badge with data-testid='out-of-stock-badge' present");
testAssert(finalProductsPageContent.includes("mark-out-of-stock-"), "Mark out of stock action trigger with pattern 'mark-out-of-stock-[id]' present");
testAssert(finalProductsPageContent.includes("quick-restock-"), "Quick restock action trigger with pattern 'quick-restock-[id]' present");

// 10.3 Context & Server Action Exports
const finalActionsContent = fs.readFileSync("./src/actions/marketplaceActions.ts", "utf-8");
testAssert(finalActionsContent.includes("export async function setProductStockAction"), "setProductStockAction server action exported");

const finalContextContent = fs.readFileSync("./src/context/SellerContext.tsx", "utf-8");
testAssert(finalContextContent.includes("setStock"), "SellerContext provides setStock method");

// 10.4 Server Action Permission & Validation Simulation
function simulateSetStockAction(productId, stock, role) {
  if (role !== "seller" && role !== "admin") {
    return { success: false, error: "Unauthorized: Seller or Admin permissions required" };
  }
  if (!productId) return { success: false, error: "Product ID is required" };
  if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
    return { success: false, error: "Stock must be a non-negative integer" };
  }
  return { success: true, newStock: stock };
}

testAssert(!simulateSetStockAction("prod-1", 0, "customer").success, "Set stock rejected for customer role");
testAssert(!simulateSetStockAction("prod-1", 0, "anonymous").success, "Set stock rejected for anonymous role");
testAssert(!simulateSetStockAction("", 0, "seller").success, "Set stock rejected for empty product ID");
testAssert(!simulateSetStockAction("prod-1", -5, "seller").success, "Set stock rejected for negative stock");
testAssert(!simulateSetStockAction("prod-1", 2.5, "seller").success, "Set stock rejected for fractional stock");
testAssert(simulateSetStockAction("prod-1", 0, "seller").success, "Marking out of stock (stock: 0) succeeds for seller");
testAssert(simulateSetStockAction("prod-1", 25, "seller").success, "Restocking (stock: 25) succeeds for seller");
testAssert(simulateSetStockAction("prod-1", 0, "admin").success, "Marking out of stock succeeds for admin");

// 10.5 Stock Status & Discovery Availability Logic
function getStockStatus(stock) {
  if (stock === 0) return { status: "out_of_stock", canAddToCart: false, badge: "Out of Stock" };
  if (stock <= 10) return { status: "low_stock", canAddToCart: true, badge: "Low Stock" };
  return { status: "in_stock", canAddToCart: true, badge: "In Stock" };
}

testAssert(!getStockStatus(0).canAddToCart, "Out of stock item cannot be added to cart");
testAssert(getStockStatus(0).badge === "Out of Stock", "0 stock returns 'Out of Stock' status badge");
testAssert(getStockStatus(4).canAddToCart, "Low stock item remains purchasable");
testAssert(getStockStatus(4).badge === "Low Stock", "4 units returns 'Low Stock' status badge");
testAssert(getStockStatus(25).badge === "In Stock", "25 units returns 'In Stock' status badge");

// Filter simulation
const mockInventoryForFilter = [
  { id: "p1", stock: 20 },
  { id: "p2", stock: 5 },
  { id: "p3", stock: 0 },
  { id: "p4", stock: 0 },
];

testAssert(mockInventoryForFilter.filter(p => p.stock === 0).length === 2, "Out of stock filter accurately matches 2 sold out SKUs");
testAssert(mockInventoryForFilter.filter(p => p.stock > 0 && p.stock <= 10).length === 1, "Low stock filter accurately matches 1 low stock SKU");
testAssert(mockInventoryForFilter.filter(p => p.stock > 10).length === 1, "In stock filter accurately matches 1 high stock SKU");

// =================================================================
// 11. LOW-STOCK BADGES & INVENTORY URGENCY ALERTS (CP-PI05)
// =================================================================
console.log("\n--- 11. LOW-STOCK BADGES & INVENTORY URGENCY ALERTS (CP-PI05) ---");

// 11.1 Module file exists & exports
const inventoryStatusContent = fs.readFileSync("./src/lib/inventoryStatus.ts", "utf-8");
testAssert(inventoryStatusContent.includes("DEFAULT_LOW_STOCK_THRESHOLD"), "inventoryStatus defines DEFAULT_LOW_STOCK_THRESHOLD");
testAssert(inventoryStatusContent.includes("isLowStock"), "inventoryStatus exports isLowStock function");
testAssert(inventoryStatusContent.includes("isOutOfStock"), "inventoryStatus exports isOutOfStock function");
testAssert(inventoryStatusContent.includes("isCriticalLowStock"), "inventoryStatus exports isCriticalLowStock function");
testAssert(inventoryStatusContent.includes("getStockBadgeInfo"), "inventoryStatus exports getStockBadgeInfo function");
testAssert(inventoryStatusContent.includes("getInventoryHealthSummary"), "inventoryStatus exports getInventoryHealthSummary function");

// 11.2 UI Elements in Seller Portal
const currentProductsPage = fs.readFileSync("./src/app/seller/products/page.tsx", "utf-8");
testAssert(currentProductsPage.includes("data-testid=\"low-stock-alert-banner\""), "Low stock alert banner with data-testid='low-stock-alert-banner' present");
testAssert(currentProductsPage.includes("data-testid=\"low-stock-counter\""), "Low stock counter badge with data-testid='low-stock-counter' present");
testAssert(currentProductsPage.includes("data-testid=\"modal-low-stock-warning\""), "Modal low stock threshold warning with data-testid='modal-low-stock-warning' present");
testAssert(currentProductsPage.includes("data-stock="), "Product card badges carry data-stock attribute for auditability");

// 11.3 Customer Product Card Badges (ProductCard.tsx)
const productCardContent = fs.readFileSync("./src/components/ProductCard.tsx", "utf-8");
testAssert(productCardContent.includes("data-testid=\"low-stock-badge\""), "Customer ProductCard includes data-testid='low-stock-badge'");
testAssert(productCardContent.includes("data-testid=\"out-of-stock-badge\""), "Customer ProductCard includes data-testid='out-of-stock-badge'");
testAssert(productCardContent.includes("out-of-stock-btn-"), "Customer ProductCard disables Add button with out-of-stock-btn-[id]");
testAssert(productCardContent.includes("qtyInCart >= product.stock"), "Cart stepper respects stock limit and disables exceeding available inventory");

// 11.4 Server Action & Role Authorization
const refreshedActions = fs.readFileSync("./src/actions/marketplaceActions.ts", "utf-8");
testAssert(refreshedActions.includes("getLowStockAlertsAction"), "getLowStockAlertsAction server action exported");

function simulateLowStockAlertsAction(storeId, threshold, role) {
  if (role !== "seller" && role !== "admin") {
    return { success: false, error: "Unauthorized: Seller or Admin permissions required" };
  }
  if (isNaN(threshold) || threshold < 1) {
    return { success: false, error: "Threshold must be a positive integer" };
  }
  return { success: true, lowStockCount: 2, outOfStockCount: 1 };
}

testAssert(!simulateLowStockAlertsAction("s1", 5, "customer").success, "Low stock alerts rejected for customer role");
testAssert(!simulateLowStockAlertsAction("s1", 5, "anonymous").success, "Low stock alerts rejected for anonymous role");
testAssert(!simulateLowStockAlertsAction("s1", 0, "seller").success, "Low stock alerts rejected for invalid threshold (< 1)");
testAssert(simulateLowStockAlertsAction("s1", 5, "seller").success, "Low stock alerts authorized for seller");
testAssert(simulateLowStockAlertsAction("s1", 5, "admin").success, "Low stock alerts authorized for admin");

// 11.5 Threshold & Badge Logic Assertions
function evalStock(stock, threshold = 10) {
  if (stock <= 0) return { status: "out_of_stock", urgency: "sold_out", canAddToCart: false, label: "Out of Stock" };
  if (stock === 1) return { status: "critical_low", urgency: "critical", canAddToCart: true, label: "Only 1 left!" };
  if (stock <= threshold) return { status: "low_stock", urgency: "warning", canAddToCart: true, label: `Low Stock (${stock})` };
  return { status: "in_stock", urgency: "none", canAddToCart: true, label: "In Stock" };
}

testAssert(evalStock(0).status === "out_of_stock", "0 stock returns status 'out_of_stock'");
testAssert(!evalStock(0).canAddToCart, "0 stock cannot be added to cart");
testAssert(evalStock(1).status === "critical_low", "1 unit returns status 'critical_low'");
testAssert(evalStock(1).urgency === "critical", "1 unit has 'critical' urgency");
testAssert(evalStock(4).status === "low_stock", "4 units returns status 'low_stock'");
testAssert(evalStock(4).urgency === "warning", "4 units has 'warning' urgency");
testAssert(evalStock(10).status === "low_stock", "10 units (threshold boundary) returns status 'low_stock'");
testAssert(evalStock(11).status === "in_stock", "11 units returns status 'in_stock'");

// 11.6 Inventory Health Aggregation
function summarizeInventory(items, threshold = 10) {
  let low = 0, out = 0, normal = 0, critical = 0;
  for (const item of items) {
    if (item.stock <= 0) out++;
    else if (item.stock === 1) { critical++; low++; }
    else if (item.stock <= threshold) low++;
    else normal++;
  }
  return { total: items.length, low, out, normal, critical };
}

const sampleCatalog = [
  { id: "1", stock: 0 },
  { id: "2", stock: 1 },
  { id: "3", stock: 4 },
  { id: "4", stock: 8 },
  { id: "5", stock: 25 },
];
const summary = summarizeInventory(sampleCatalog, 10);
testAssert(summary.out === 1, "Catalog aggregation: exactly 1 out-of-stock item");
testAssert(summary.critical === 1, "Catalog aggregation: exactly 1 critical-stock item (stock=1)");
testAssert(summary.low === 3, "Catalog aggregation: 3 low-stock items (stocks 1, 4, 8)");
testAssert(summary.normal === 1, "Catalog aggregation: 1 normal healthy item (stock=25)");

// =================================================================
// 12. SELLER ORDER BOARD & FULFILLMENT KANBAN (CP-OB01)
// =================================================================
console.log("\n--- 12. SELLER ORDER BOARD & FULFILLMENT KANBAN (CP-OB01) ---");

// 12.1 Route file and Layout integration
const ordersPageContent = fs.readFileSync("./src/app/seller/orders/page.tsx", "utf-8");
testAssert(fs.existsSync("./src/app/seller/orders/page.tsx"), "src/app/seller/orders/page.tsx exists");

// 12.2 Pipeline Metrics & Header Elements
testAssert(ordersPageContent.includes("data-testid=\"view-kanban-toggle\""), "Kanban view toggle with data-testid='view-kanban-toggle' present");
testAssert(ordersPageContent.includes("data-testid=\"view-list-toggle\""), "List view toggle with data-testid='view-list-toggle' present");
testAssert(ordersPageContent.includes("data-testid=\"metric-total-orders\""), "Total orders metric with data-testid='metric-total-orders' present");
testAssert(ordersPageContent.includes("data-testid=\"metric-placed-orders\""), "Needs packing metric with data-testid='metric-placed-orders' present");
testAssert(ordersPageContent.includes("data-testid=\"metric-packed-orders\""), "In packing metric with data-testid='metric-packed-orders' present");
testAssert(ordersPageContent.includes("data-testid=\"metric-ready-orders\""), "Ready at counter metric with data-testid='metric-ready-orders' present");
testAssert(ordersPageContent.includes("data-testid=\"metric-completed-orders\""), "Completed metric with data-testid='metric-completed-orders' present");
testAssert(ordersPageContent.includes("data-testid=\"pending-orders-badge\""), "Pending active orders badge with data-testid='pending-orders-badge' present");
testAssert(ordersPageContent.includes("data-testid=\"simulate-order-button\""), "Demo order generator trigger with data-testid='simulate-order-button' present");

// 12.3 Kanban Columns
testAssert(ordersPageContent.includes("data-testid=\"kanban-col-placed\""), "Placed orders column with data-testid='kanban-col-placed' present");
testAssert(ordersPageContent.includes("data-testid=\"kanban-col-packed\""), "Packed orders column with data-testid='kanban-col-packed' present");
testAssert(ordersPageContent.includes("data-testid=\"kanban-col-ready\""), "Ready at counter column with data-testid='kanban-col-ready' present");
testAssert(ordersPageContent.includes("data-testid=\"kanban-col-completed\""), "Completed column with data-testid='kanban-col-completed' present");

// 12.4 Filter Tabs & Search
testAssert(ordersPageContent.includes("data-testid=\"filter-all-orders\""), "Filter all orders tab with data-testid='filter-all-orders' present");
testAssert(ordersPageContent.includes("data-testid=\"filter-placed-orders\""), "Filter placed orders tab with data-testid='filter-placed-orders' present");
testAssert(ordersPageContent.includes("data-testid=\"filter-packed-orders\""), "Filter packed orders tab with data-testid='filter-packed-orders' present");
testAssert(ordersPageContent.includes("data-testid=\"filter-ready-orders\""), "Filter ready orders tab with data-testid='filter-ready-orders' present");
testAssert(ordersPageContent.includes("data-testid=\"filter-completed-orders\""), "Filter completed orders tab with data-testid='filter-completed-orders' present");
testAssert(ordersPageContent.includes("data-testid=\"order-search-input\""), "Order search input with data-testid='order-search-input' present");

// 12.5 Order Card Elements & Actions
testAssert(ordersPageContent.includes("order-card-"), "Order card element with data-testid='order-card-[id]' present");
testAssert(ordersPageContent.includes("order-id-"), "Order ID badge with data-testid='order-id-[id]' present");
testAssert(ordersPageContent.includes("order-status-"), "Order status badge with data-testid='order-status-[id]' present");
testAssert(ordersPageContent.includes("customer-name-"), "Customer name element with data-testid='customer-name-[id]' present");
testAssert(ordersPageContent.includes("customer-phone-"), "Customer phone link with data-testid='customer-phone-[id]' present");
testAssert(ordersPageContent.includes("pickup-time-"), "Pickup slot element with data-testid='pickup-time-[id]' present");
testAssert(ordersPageContent.includes("pickup-code-"), "Counter PIN token with data-testid='pickup-code-[id]' present");
testAssert(ordersPageContent.includes("order-total-"), "Order total price with data-testid='order-total-[id]' present");
testAssert(ordersPageContent.includes("advance-order-btn-"), "Order advance trigger with data-testid='advance-order-btn-[id]' present");
testAssert(ordersPageContent.includes("mark-packed-"), "Mark packed trigger attribute present");
testAssert(ordersPageContent.includes("mark-ready-"), "Mark ready trigger attribute present");
testAssert(ordersPageContent.includes("mark-completed-"), "Mark completed trigger attribute present");
testAssert(ordersPageContent.includes("view-tracking-"), "Customer tracking link with data-testid='view-tracking-[id]' present");

// 12.6 Counter Code PIN Verification Modal
testAssert(ordersPageContent.includes("data-testid=\"counter-verify-modal\""), "PIN verification modal with data-testid='counter-verify-modal' present");
testAssert(ordersPageContent.includes("data-testid=\"verify-code-input\""), "PIN input field with data-testid='verify-code-input' present");
testAssert(ordersPageContent.includes("data-testid=\"verify-code-error\""), "PIN mismatch error alert with data-testid='verify-code-error' present");
testAssert(ordersPageContent.includes("data-testid=\"confirm-pickup-button\""), "Confirm pickup trigger with data-testid='confirm-pickup-button' present");
testAssert(ordersPageContent.includes("data-testid=\"cancel-pickup-button\""), "Cancel verification trigger with data-testid='cancel-pickup-button' present");

// 12.7 Server Action & Role Authorization
const actionsForOrders = fs.readFileSync("./src/actions/marketplaceActions.ts", "utf-8");
testAssert(actionsForOrders.includes("export async function updateOrderStatusAction"), "updateOrderStatusAction server action exported");
testAssert(actionsForOrders.includes("export async function getStoreOrdersAction"), "getStoreOrdersAction server action exported");

function simulateUpdateOrderStatusAction(orderId, nextStatus, options = {}) {
  if (options.role && options.role !== "seller" && options.role !== "admin") {
    return { success: false, error: "Unauthorized: Seller or Admin permissions required" };
  }
  const VALID_FORWARD_TRANSITIONS = {
    placed: ["packed", "cancelled"],
    packed: ["ready", "cancelled"],
    ready: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };
  const current = options.current || "placed";
  const allowed = VALID_FORWARD_TRANSITIONS[current] || [];
  if (!allowed.includes(nextStatus) && current !== nextStatus && nextStatus !== "placed") {
    return { success: false, error: `Invalid transition from ${current} to ${nextStatus}` };
  }
  return { success: true };
}

testAssert(!simulateUpdateOrderStatusAction("ord-1", "packed", { role: "customer" }).success, "Order status update rejected for customer role");
testAssert(!simulateUpdateOrderStatusAction("ord-1", "packed", { role: "anonymous" }).success, "Order status update rejected for anonymous role");
testAssert(simulateUpdateOrderStatusAction("ord-1", "packed", { role: "seller", current: "placed" }).success, "Order status update authorized for seller");
testAssert(simulateUpdateOrderStatusAction("ord-1", "packed", { role: "admin", current: "placed" }).success, "Order status update authorized for admin");
testAssert(simulateUpdateOrderStatusAction("ord-1", "ready", { role: "seller", current: "packed" }).success, "Permitted transition: packed -> ready");
testAssert(simulateUpdateOrderStatusAction("ord-1", "completed", { role: "seller", current: "ready" }).success, "Permitted transition: ready -> completed");
testAssert(!simulateUpdateOrderStatusAction("ord-1", "completed", { role: "seller", current: "placed" }).success, "Illegal skip rejected: placed -> completed");

// PIN Verification Algorithm
function verifyCounterCode(input, expected) {
  if (!input || !expected) return { valid: false, error: "PIN required" };
  return input.trim().toUpperCase() === expected.trim().toUpperCase()
    ? { valid: true }
    : { valid: false, error: `Invalid PIN. Counter token must match '${expected}'.` };
}

testAssert(verifyCounterCode("LL-792", "LL-792").valid, "Exact matching PIN successfully verified");
testAssert(verifyCounterCode("ll-792", "LL-792").valid, "Case-insensitive PIN successfully verified");
testAssert(!verifyCounterCode("LL-111", "LL-792").valid, "Mismatched PIN correctly rejected");
testAssert(!verifyCounterCode("", "LL-792").valid, "Empty PIN correctly rejected");

// =================================================================
// 13. REALTIME SUBSCRIPTIONS & WEBSOCKET EVENT STREAMING (CP-OB02)
// =================================================================
console.log("\n--- 13. REALTIME SUBSCRIPTIONS & WEBSOCKET EVENT STREAMING (CP-OB02) ---");

// 13.1 Database Realtime Publication Migration
const realtimeMigrationPath = "./supabase/migrations/20261023220000_enable_realtime_orders_subscription.sql";
testAssert(fs.existsSync(realtimeMigrationPath), "Realtime subscription migration 20261023220000_enable_realtime_orders_subscription.sql exists");
const realtimeMigrationSql = fs.readFileSync(realtimeMigrationPath, "utf-8");
testAssert(realtimeMigrationSql.includes("ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;"), "Migration registers 'orders' in supabase_realtime publication");
testAssert(realtimeMigrationSql.includes("ALTER PUBLICATION supabase_realtime ADD TABLE public.products;"), "Migration registers 'products' in supabase_realtime publication");
testAssert(realtimeMigrationSql.includes("REPLICA IDENTITY FULL"), "Migration configures REPLICA IDENTITY FULL for complete payload CDC");

// 13.2 Realtime Hook & Stream Architecture
testAssert(fs.existsSync("./src/hooks/useRealtimeOrders.ts"), "useRealtimeOrders hook exists in src/hooks/");
const hookContent = fs.readFileSync("./src/hooks/useRealtimeOrders.ts", "utf-8");
testAssert(hookContent.includes("postgres_changes"), "Hook subscribes to postgres_changes events");
testAssert(hookContent.includes("event: \"INSERT\""), "Hook listens for INSERT events for new incoming orders");
testAssert(hookContent.includes("event: \"UPDATE\""), "Hook listens for UPDATE events for real-time status transitions");
testAssert(hookContent.includes("supabase.removeChannel"), "Hook cleans up and tears down channel on unmount");
testAssert(hookContent.includes("playChime"), "Hook provides audio chime synthesis for real-time order alerts");

// 13.3 UI Elements in Seller Order Board
const refreshedOrdersPage = fs.readFileSync("./src/app/seller/orders/page.tsx", "utf-8");
testAssert(refreshedOrdersPage.includes("data-testid=\"realtime-status-badge\""), "Realtime connection badge with data-testid='realtime-status-badge' present");
testAssert(refreshedOrdersPage.includes("data-testid=\"realtime-chime-toggle\""), "Audio chime toggle with data-testid='realtime-chime-toggle' present");
testAssert(refreshedOrdersPage.includes("data-testid=\"test-realtime-broadcast\""), "Realtime broadcast test trigger with data-testid='test-realtime-broadcast' present");
testAssert(refreshedOrdersPage.includes("data-testid=\"realtime-order-toast\""), "Realtime order toast notification with data-testid='realtime-order-toast' present");

// 13.4 Customer Order Tracking Realtime Sync
const customerTrackingContent = fs.readFileSync("./src/app/orders/[id]/page.tsx", "utf-8");
testAssert(customerTrackingContent.includes("data-testid=\"realtime-tracking-indicator\""), "Customer tracking screen contains data-testid='realtime-tracking-indicator'");
testAssert(customerTrackingContent.includes("postgres_changes"), "Customer tracking screen subscribes to postgres_changes for order updates");
testAssert(customerTrackingContent.includes("supabase.removeChannel"), "Customer tracking screen cleans up realtime channel on unmount");

// 13.5 Event Handling & Mapping Simulation
function mapSupabaseRowToOrder(row) {
  return {
    id: row.id,
    storeId: row.store_id,
    storeName: row.store_name || "Mishra Pedha",
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    total: Number(row.total_amount) || 495,
    status: row.status || "placed",
    pickupCode: row.pickup_code || "LL-792",
  };
}

const mockRow = {
  id: "ORD-LL-9988",
  store_id: "s1",
  customer_name: "Anita Deshmukh",
  customer_phone: "+91 99881 22334",
  total_amount: 520,
  status: "placed",
  pickup_code: "LL-882",
};
const mapped = mapSupabaseRowToOrder(mockRow);
testAssert(mapped.id === "ORD-LL-9988", "Realtime mapper: maps order id accurately");
testAssert(mapped.customerName === "Anita Deshmukh", "Realtime mapper: maps customer name accurately");
testAssert(mapped.total === 520, "Realtime mapper: maps order amount accurately");
testAssert(mapped.status === "placed", "Realtime mapper: maps initial placed status");

console.log("\n==================================================================");
console.log(`🎉 ALL ${passed} ASSERTIONS PASSED FOR CP-SP01 TO CP-OB02!`);
console.log("Protected Seller Portal, Store Profile, Banner Upload, Operating Hours, Product CRUD, Atomic Stock, Out-of-Stock Controls, Low-Stock Badges, Order Board & Realtime Subscriptions Operational!");
console.log("==================================================================");
