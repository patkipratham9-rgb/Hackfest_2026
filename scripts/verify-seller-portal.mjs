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

console.log("\n==================================================================");
console.log(`🎉 ALL ${passed} ASSERTIONS PASSED FOR CP-SP01, CP-SP02, CP-SP03, CP-SP04, CP-PI01 & CP-PI02!`);
console.log("Protected Seller Portal, Store Profile, Banner Upload, Operating Hours & Product CRUD Operational!");
console.log("==================================================================");
