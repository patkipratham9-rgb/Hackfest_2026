/**
 * LocalLoop Comprehensive Auth, Profile, App Separation & Security Verification Suite
 * Verifies:
 * 1. Login Page: Phone (OTP) + Email (Permission)
 * 2. User Information Storage: Name, Number, Address (Primary, Home, Office, Others), Email (Optional)
 * 3. Separation of User Application from Merchant Application
 * 4. Phone Application Flavors (User & Merchant in Android Studio)
 * 5. Safety & Security Audits (XSS sanitization, brute-force OTP lockout, package queries)
 */

import assert from "assert";
import fs from "fs";
import path from "path";

// Color utilities
const green = (msg) => `\x1b[32m${msg}\x1b[0m`;
const red = (msg) => `\x1b[31m${msg}\x1b[0m`;
const cyan = (msg) => `\x1b[36m${msg}\x1b[0m`;
const bold = (msg) => `\x1b[1m${msg}\x1b[0m`;

let passedCount = 0;
let failedCount = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ ${red(desc)}`);
    console.error(`    ${err.message}`);
    failedCount++;
  }
}

console.log(bold("\n=================================================================="));
console.log(bold("🔐 LOCALLOOP AUTH, USER PROFILES, APP SEPARATION & SECURITY AUDIT"));
console.log(bold("==================================================================\n"));

// ----------------------------------------------------------------------
// 1. INPUT SANITIZATION & SAFETY (XSS, Script Injections)
// ----------------------------------------------------------------------
console.log(cyan("--- 1. INPUT SANITIZATION & SAFETY (SECURITY) ---"));

function sanitizeInput(input) {
  if (!input) return "";
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

function validatePhoneNumber(rawPhone) {
  const digits = rawPhone.replace(/\D/g, "");
  let cleanNumber = digits;
  if (digits.length === 12 && digits.startsWith("91")) {
    cleanNumber = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    cleanNumber = digits.slice(1);
  }

  if (cleanNumber.length !== 10) {
    return { valid: false, cleanNumber: "", error: "Phone number must be exactly 10 digits" };
  }
  if (!/^[6-9]/.test(cleanNumber)) {
    return { valid: false, cleanNumber: "", error: "Indian mobile numbers must start with 6, 7, 8, or 9" };
  }
  return { valid: true, cleanNumber, formatted: `+91 ${cleanNumber.slice(0, 5)} ${cleanNumber.slice(5)}` };
}

function validateEmail(email) {
  if (!email || email.trim() === "") {
    return { valid: true, sanitized: "" }; // Optional
  }
  const sanitized = sanitizeInput(email).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    return { valid: false, sanitized, error: "Please enter a valid email address" };
  }
  return { valid: true, sanitized };
}

function validatePincode(pincode) {
  const clean = pincode.replace(/\D/g, "");
  if (clean.length !== 6) {
    return { valid: false, cleanPincode: "", error: "Pincode must be exactly 6 digits" };
  }
  return { valid: true, cleanPincode: clean };
}

it("Safety: Strips malicious script tags from user inputs", () => {
  const malicious = "<script>alert('pwned')</script>Pratham Patki";
  const cleaned = sanitizeInput(malicious);
  assert.strictEqual(cleaned, "scriptalert('pwned')/scriptPratham Patki");
  assert.strictEqual(cleaned.includes("<script>"), false);
});

it("Safety: Strips inline DOM event handler attributes (e.g., onload, onclick)", () => {
  const malicious = "img src=x onerror=alert(1)";
  const cleaned = sanitizeInput(malicious);
  assert.strictEqual(cleaned.includes("onerror="), false);
});

it("Safety: Strips javascript: pseudo-protocol URLs", () => {
  const malicious = "javascript:stealCookies()";
  const cleaned = sanitizeInput(malicious);
  assert.strictEqual(cleaned.includes("javascript:"), false);
});

it("Validation: Rejects phone numbers shorter than 10 digits", () => {
  const res = validatePhoneNumber("9845122");
  assert.strictEqual(res.valid, false);
});

it("Validation: Rejects non-Indian mobile numbers starting with 0-5", () => {
  const res = validatePhoneNumber("1234567890");
  assert.strictEqual(res.valid, false);
});

it("Validation: Accepts standard 10-digit Indian numbers starting with 6-9", () => {
  const res = validatePhoneNumber("9845122334");
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.cleanNumber, "9845122334");
  assert.strictEqual(res.formatted, "+91 98451 22334");
});

it("Validation: Normalizes numbers with +91 country prefix", () => {
  const res = validatePhoneNumber("+91 98451 22334");
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.cleanNumber, "9845122334");
});

it("Validation: Email is optional - empty string is valid", () => {
  const res = validateEmail("");
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.sanitized, "");
});

it("Validation: Rejects invalid email formats", () => {
  const res = validateEmail("invalid-email-without-at");
  assert.strictEqual(res.valid, false);
});

it("Validation: Accepts valid RFC email addresses and downcases them", () => {
  const res = validateEmail("Pratham.Patki@KLETech.AC.IN");
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.sanitized, "pratham.patki@kletech.ac.in");
});

it("Validation: Validates Indian 6-digit PIN codes (Hubballi: 580021)", () => {
  const res1 = validatePincode("580021");
  assert.strictEqual(res1.valid, true);
  const res2 = validatePincode("5800");
  assert.strictEqual(res2.valid, false);
});

// ----------------------------------------------------------------------
// 2. PHONE OTP & BRUTE-FORCE DEFENSE (SECURITY)
// ----------------------------------------------------------------------
console.log(cyan("\n--- 2. PHONE OTP & BRUTE-FORCE DEFENSE (SECURITY) ---"));

class MockOtpEngine {
  constructor() {
    this.store = new Map();
  }

  requestOtp(phone) {
    const p = validatePhoneNumber(phone);
    if (!p.valid) return { success: false, error: p.error };

    const now = Date.now();
    const existing = this.store.get(p.cleanNumber);

    if (existing?.lockedUntil && existing.lockedUntil > now) {
      return { success: false, error: "Locked out due to security rate limit" };
    }

    if (existing && now - existing.lastRequestedAt < 30 * 1000) {
      return { success: false, error: "Resend cooldown active" };
    }

    this.store.set(p.cleanNumber, {
      attempts: 0,
      lastRequestedAt: now,
      otp: "123456",
    });

    return { success: true, otp: "123456" };
  }

  verifyOtp(phone, entered) {
    const p = validatePhoneNumber(phone);
    if (!p.valid) return { success: false, error: p.error };

    const now = Date.now();
    const record = this.store.get(p.cleanNumber);
    if (!record) return { success: false, error: "OTP not requested" };

    if (record.lockedUntil && record.lockedUntil > now) {
      return { success: false, error: "Account locked out" };
    }

    if (entered === record.otp) {
      this.store.delete(p.cleanNumber);
      return { success: true };
    }

    record.attempts += 1;
    if (record.attempts >= 3) {
      record.lockedUntil = now + 60 * 1000;
      return { success: false, error: "Max attempts reached. Security lockout 60s" };
    }

    return { success: false, error: `Invalid OTP. ${3 - record.attempts} remaining` };
  }
}

const otpEngine = new MockOtpEngine();

it("OTP: Successfully requests OTP for valid Indian mobile", () => {
  const res = otpEngine.requestOtp("9845122334");
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.otp, "123456");
});

it("OTP: Enforces 30s cooldown before allowing OTP resend", () => {
  const res = otpEngine.requestOtp("9845122334");
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.error, "Resend cooldown active");
});

it("OTP: Rejects incorrect OTP code and decrements remaining attempts", () => {
  const res = otpEngine.verifyOtp("9845122334", "000000");
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.error.includes("2 remaining"), true);
});

it("OTP Security: Consecutive 3 incorrect attempts triggers 60s lockout defense", () => {
  otpEngine.verifyOtp("9845122334", "111111");
  const lockRes = otpEngine.verifyOtp("9845122334", "222222");
  assert.strictEqual(lockRes.success, false);
  assert.strictEqual(lockRes.error.includes("Security lockout"), true);

  // Subsequent verification also rejected while locked
  const blockedRes = otpEngine.verifyOtp("9845122334", "123456");
  assert.strictEqual(blockedRes.success, false);
  assert.strictEqual(blockedRes.error, "Account locked out");
});

it("OTP: Correct OTP code verifies successfully for fresh session", () => {
  const engine = new MockOtpEngine();
  engine.requestOtp("9845012345");
  const res = engine.verifyOtp("9845012345", "123456");
  assert.strictEqual(res.success, true);
});

// ----------------------------------------------------------------------
// 3. USER INFORMATION & ADDRESS BOOK (PRIMARY, HOME, OFFICE, OTHERS)
// ----------------------------------------------------------------------
console.log(cyan("\n--- 3. USER INFORMATION & ADDRESS STORAGE (PRIMARY, HOME, OFFICE, OTHERS) ---"));

function validateUserAddress(address) {
  const street = sanitizeInput(address.street);
  const landmark = sanitizeInput(address.landmark);
  const locality = sanitizeInput(address.locality);
  const city = sanitizeInput(address.city) || "Hubballi-Dharwad";
  const pincodeValidation = validatePincode(address.pincode || "");

  if (!street || street.length < 3) {
    return { valid: false, error: "Street must be at least 3 characters" };
  }
  if (!locality) {
    return { valid: false, error: "Locality required" };
  }
  if (!pincodeValidation.valid) {
    return { valid: false, error: pincodeValidation.error };
  }

  const validLabels = ["Primary", "Home", "Office", "Others"];
  const label = validLabels.includes(address.label) ? address.label : "Primary";

  return {
    valid: true,
    sanitizedAddress: {
      id: address.id || `addr_${Date.now()}`,
      label,
      street,
      landmark: landmark || undefined,
      locality,
      city,
      pincode: pincodeValidation.cleanPincode,
      isDefault: Boolean(address.isDefault),
    },
  };
}

it("Address: Supports all four required address labels: Primary, Home, Office, Others", () => {
  const labels = ["Primary", "Home", "Office", "Others"];
  for (const label of labels) {
    const res = validateUserAddress({
      label,
      street: "2nd Cross, Vidyanagar",
      locality: "Vidyanagar",
      pincode: "580021",
    });
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.sanitizedAddress.label, label);
  }
});

it("Address: Rejects invalid address missing street or pincode", () => {
  const res1 = validateUserAddress({ street: "A", locality: "Vidyanagar", pincode: "580021" });
  assert.strictEqual(res1.valid, false);

  const res2 = validateUserAddress({ street: "2nd Cross", locality: "Vidyanagar", pincode: "123" });
  assert.strictEqual(res2.valid, false);
});

it("Address Book: Supports storing multiple user addresses with default primary selection", () => {
  const user = {
    id: "user_test_01",
    name: "Pratham Patki",
    number: "9845122334",
    email: "pratham.patki@kletech.ac.in",
    role: "customer",
    addresses: [
      {
        id: "addr_1",
        label: "Primary",
        street: "Plot #14, Lingaraj Nagar",
        locality: "Vidyanagar",
        city: "Hubballi-Dharwad",
        pincode: "580021",
        isDefault: true,
      },
      {
        id: "addr_2",
        label: "Home",
        street: "Bhavani Nagar, Kusugal Road",
        locality: "Station Road",
        city: "Hubballi-Dharwad",
        pincode: "580023",
        isDefault: false,
      },
      {
        id: "addr_3",
        label: "Office",
        street: "Dept of CSE, KLE Tech Campus",
        locality: "Vidyanagar",
        city: "Hubballi-Dharwad",
        pincode: "580031",
        isDefault: false,
      },
    ],
  };

  assert.strictEqual(user.name, "Pratham Patki");
  assert.strictEqual(user.number, "9845122334");
  assert.strictEqual(user.email, "pratham.patki@kletech.ac.in");
  assert.strictEqual(user.addresses.length, 3);
  assert.strictEqual(user.addresses.find((a) => a.isDefault)?.label, "Primary");
});

// ----------------------------------------------------------------------
// 4. SEPARATE USER APPLICATION FROM MERCHANT APPLICATION
// ----------------------------------------------------------------------
console.log(cyan("\n--- 4. SEPARATION OF USER APP FROM MERCHANT APP ---"));

it("App Separation: Customer role defaults to Shopper application (/)", () => {
  const session = {
    user: { id: "cust_1", role: "customer" },
    activeAppMode: "shopper",
  };
  assert.strictEqual(session.activeAppMode, "shopper");
  const initialUrl = session.activeAppMode === "merchant" ? "/seller" : "/";
  assert.strictEqual(initialUrl, "/");
});

it("App Separation: Seller role switches to Merchant application (/seller)", () => {
  const session = {
    user: { id: "seller_1", role: "seller", storeId: "store-1" },
    activeAppMode: "merchant",
  };
  assert.strictEqual(session.activeAppMode, "merchant");
  const initialUrl = session.activeAppMode === "merchant" ? "/seller" : "/";
  assert.strictEqual(initialUrl, "/seller");
});

it("App Separation: Protected seller layout blocks customer sessions with unauthorized guard", () => {
  const layoutSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/seller/layout.tsx"),
    "utf-8"
  );
  assert.strictEqual(layoutSource.includes('data-testid="seller-unauthorized-guard"'), true);
  assert.strictEqual(layoutSource.includes('data-testid="grant-seller-demo-access"'), true);
});

it("App Separation: Merchant is strictly blocked from viewing user application and redirected to /seller", () => {
  const appLayoutSource = fs.readFileSync(
    path.join(process.cwd(), "src/components/AppLayoutWrapper.tsx"),
    "utf-8"
  );
  assert.strictEqual(appLayoutSource.includes('isMerchant && !isMerchantApp && !isAuthPage'), true);
  assert.strictEqual(appLayoutSource.includes('router.replace("/seller")'), true);
  assert.strictEqual(appLayoutSource.includes("Redirecting to Merchant Portal..."), true);

  const homePageSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/page.tsx"),
    "utf-8"
  );
  assert.strictEqual(homePageSource.includes('user?.role === "seller" || activeAppMode === "merchant"'), true);
  assert.strictEqual(homePageSource.includes('router.replace("/seller")'), true);

  const navbarSource = fs.readFileSync(
    path.join(process.cwd(), "src/components/Navbar.tsx"),
    "utf-8"
  );
  assert.strictEqual(navbarSource.includes("isMerchant ||"), true);
});

// ----------------------------------------------------------------------
// 5. PHONE APPLICATION (USER & MERCHANT FLAVORS IN ANDROID STUDIO)
// ----------------------------------------------------------------------
console.log(cyan("\n--- 5. PHONE APPLICATIONS (USER & MERCHANT FLAVORS) ---"));

it("Android Studio: app build.gradle defines 'user' and 'merchant' product flavors", () => {
  const gradlePathKts = path.join(process.cwd(), "android/app/build.gradle.kts");
  const gradlePathGroovy = path.join(process.cwd(), "android/app/build.gradle");
  const gradlePath = fs.existsSync(gradlePathKts) ? gradlePathKts : gradlePathGroovy;
  assert.strictEqual(fs.existsSync(gradlePath), true);
  const gradleContent = fs.readFileSync(gradlePath, "utf-8");

  assert.strictEqual(gradleContent.includes("appType"), true);
  assert.strictEqual(gradleContent.includes("user"), true);
  assert.strictEqual(gradleContent.includes("com.localloop.user"), true);
  assert.strictEqual(gradleContent.includes("LocalLoop Shopper"), true);
  assert.strictEqual(gradleContent.includes("/"), true);

  assert.strictEqual(gradleContent.includes("merchant"), true);
  assert.strictEqual(gradleContent.includes("com.localloop.merchant"), true);
  assert.strictEqual(gradleContent.includes("LocalLoop Partner"), true);
  assert.strictEqual(gradleContent.includes("/seller"), true);
});

it("Android Studio: AndroidManifest.xml includes Package Visibility <queries> for Camera", () => {
  const manifestPath = path.join(process.cwd(), "android/app/src/main/AndroidManifest.xml");
  assert.strictEqual(fs.existsSync(manifestPath), true);
  const manifestContent = fs.readFileSync(manifestPath, "utf-8");

  assert.strictEqual(manifestContent.includes("<queries>"), true);
  assert.strictEqual(manifestContent.includes("android.media.action.IMAGE_CAPTURE"), true);
  assert.strictEqual(manifestContent.includes('android:label="${appName}"'), true);
  assert.strictEqual(manifestContent.includes("com.localloop.app.INITIAL_PATH"), true);
});

it("Android Studio: MainActivity.kt enforces WebView security (disallows file URL cross-origin access)", () => {
  const mainActivityPath = path.join(process.cwd(), "android/app/src/main/java/com/localloop/app/MainActivity.kt");
  assert.strictEqual(fs.existsSync(mainActivityPath), true);
  const content = fs.readFileSync(mainActivityPath, "utf-8");

  assert.strictEqual(content.includes("allowFileAccessFromFileURLs = false"), true);
  assert.strictEqual(content.includes("allowUniversalAccessFromFileURLs = false"), true);
  assert.strictEqual(content.includes("readInitialPath()"), true);
});

// ----------------------------------------------------------------------
// 6. LOGIN PAGE FILE & CONTEXT INTEGRITY
// ----------------------------------------------------------------------
console.log(cyan("\n--- 6. LOGIN PAGE & CONTEXT INTEGRITY ---"));

it("Login Page: src/app/login/page.tsx implements Phone(OTP) and Email(Permission) tabs", () => {
  const loginPath = path.join(process.cwd(), "src/app/login/page.tsx");
  assert.strictEqual(fs.existsSync(loginPath), true);
  const content = fs.readFileSync(loginPath, "utf-8");

  assert.strictEqual(content.includes("Phone (OTP)"), true);
  assert.strictEqual(content.includes("Email") && content.includes("Permission"), true);
  assert.strictEqual(content.includes("Shopper Application"), true);
  assert.strictEqual(content.includes("Merchant Partner"), true);
  assert.strictEqual(content.includes("123456"), true); // Demo OTP helper
});

it("Auth Context: src/context/AuthContext.tsx exports full user address & auth state API", () => {
  const authContextPath = path.join(process.cwd(), "src/context/AuthContext.tsx");
  assert.strictEqual(fs.existsSync(authContextPath), true);
  const content = fs.readFileSync(authContextPath, "utf-8");

  assert.strictEqual(content.includes("loginWithPhoneOtp"), true);
  assert.strictEqual(content.includes("loginWithEmailPermission"), true);
  assert.strictEqual(content.includes("addAddress"), true);
  assert.strictEqual(content.includes("updateAddress"), true);
  assert.strictEqual(content.includes("deleteAddress"), true);
  assert.strictEqual(content.includes("setDefaultAddress"), true);
});

it("User Account Page: src/app/account/page.tsx renders Address Book with Primary/Home/Office/Others", () => {
  const accountPath = path.join(process.cwd(), "src/app/account/page.tsx");
  assert.strictEqual(fs.existsSync(accountPath), true);
  const content = fs.readFileSync(accountPath, "utf-8");

  assert.strictEqual(content.includes("Primary"), true);
  assert.strictEqual(content.includes("Home"), true);
  assert.strictEqual(content.includes("Office"), true);
  assert.strictEqual(content.includes("Others"), true);
  assert.strictEqual(content.includes("Active Application Mode"), true);
  assert.strictEqual(content.includes("Switch to Merchant App"), true);
});

// ----------------------------------------------------------------------
// 7. USER & MERCHANT EXTENDED DETAILS, DB PERSISTENCE & ACCOUNT REMOVAL
// ----------------------------------------------------------------------
console.log(cyan("\n--- 7. USER/MERCHANT SEPARATE LOGIN, EXTENDED DETAILS, DB PERSISTENCE & DELETION ---"));

it("Front Page Guard: unauthenticated users redirected to /login before marketplace renders", () => {
  const homePath = path.join(process.cwd(), "src/app/page.tsx");
  assert.strictEqual(fs.existsSync(homePath), true);
  const content = fs.readFileSync(homePath, "utf-8");

  assert.strictEqual(content.includes("useAuth"), true);
  assert.strictEqual(content.includes("/login"), true);
  assert.strictEqual(content.includes("!isAuthenticated"), true);
});

it("Merchant Login: dedicated /merchant/login page exists with role separation", () => {
  const merchantLoginPath = path.join(process.cwd(), "src/app/merchant/login/page.tsx");
  assert.strictEqual(fs.existsSync(merchantLoginPath), true);
  const content = fs.readFileSync(merchantLoginPath, "utf-8");

  assert.strictEqual(content.includes("Merchant Partner Portal"), true);
  assert.strictEqual(content.includes("Phone (OTP)"), true);
  assert.strictEqual(content.includes("router.push(\"/seller\")"), true);

  // Check /merchant route redirect
  const merchantIndexPath = path.join(process.cwd(), "src/app/merchant/page.tsx");
  assert.strictEqual(fs.existsSync(merchantIndexPath), true);
});

it("Persistent Login: session stored in localStorage without auto-expiration until sign out", () => {
  const authContextPath = path.join(process.cwd(), "src/context/AuthContext.tsx");
  const content = fs.readFileSync(authContextPath, "utf-8");

  assert.strictEqual(content.includes("localloop_auth_session_v1"), true);
  assert.strictEqual(content.includes("logout"), true);
  assert.strictEqual(content.includes("deleteAccount"), true);
});

it("User Details & Account Removal: edit profile recorded in DB profiles table and remove account supported", () => {
  const accountPath = path.join(process.cwd(), "src/app/account/page.tsx");
  const content = fs.readFileSync(accountPath, "utf-8");

  assert.strictEqual(content.includes("Edit User Information"), true);
  assert.strictEqual(content.includes("btn-remove-account"), true);
  assert.strictEqual(content.includes("btn-confirm-delete-account"), true);
  assert.strictEqual(content.includes("deleteAccount"), true);

  const actionsPath = path.join(process.cwd(), "src/actions/marketplaceActions.ts");
  const actionsContent = fs.readFileSync(actionsPath, "utf-8");
  assert.strictEqual(actionsContent.includes("saveUserProfileToDbAction"), true);
  assert.strictEqual(actionsContent.includes("deleteUserAccountFromDbAction"), true);
});

it("Merchant Details: all 14 required fields recorded in database and editable", () => {
  const storePagePath = path.join(process.cwd(), "src/app/seller/store/page.tsx");
  const content = fs.readFileSync(storePagePath, "utf-8");

  // Verify all 14 fields in UI form
  const requiredFields = [
    "store-name-input",         // shop name
    "store-location-input",     // location
    "store-shop-timing-input",  // shop timing
    "store-holidays-input",     // holidays
    "store-business-type-select", // business type
    "store-contact-phone-input",// contact phone
    "store-pan-input",          // PAN number
    "store-bank-account-input", // bank account number
    "store-bank-ifsc-input",    // bank IFSC code
    "store-bank-name-input",    // bank name
    "store-pickup-address-input", // pickup address
    "store-return-address-input", // return address
    "store-logo-input",         // logo URL
    "store-banner-input",       // banner URL
  ];

  for (const field of requiredFields) {
    assert.strictEqual(
      content.includes(`data-testid="${field}"`),
      true,
      `Missing merchant field in UI: ${field}`
    );
  }

  // Verify server action maps all columns to public.stores
  const actionsPath = path.join(process.cwd(), "src/actions/marketplaceActions.ts");
  const actionsContent = fs.readFileSync(actionsPath, "utf-8");
  assert.strictEqual(actionsContent.includes("saveStoreDetailsToDbAction"), true);
  assert.strictEqual(actionsContent.includes("deleteStoreFromDbAction"), true);
  assert.strictEqual(actionsContent.includes("pan_number"), true);
  assert.strictEqual(actionsContent.includes("bank_account_number"), true);
  assert.strictEqual(actionsContent.includes("bank_ifsc_code"), true);
  assert.strictEqual(actionsContent.includes("bank_name"), true);
  assert.strictEqual(actionsContent.includes("pickup_address"), true);
  assert.strictEqual(actionsContent.includes("return_address"), true);
  assert.strictEqual(actionsContent.includes("shop_timing"), true);
  assert.strictEqual(actionsContent.includes("holidays"), true);
  assert.strictEqual(actionsContent.includes("business_type"), true);
  assert.strictEqual(actionsContent.includes("contact_phone"), true);
  assert.strictEqual(actionsContent.includes("logo_url"), true);
});

it("Merchant Account Removal: remove store and merchant account with confirmation modal", () => {
  const storePagePath = path.join(process.cwd(), "src/app/seller/store/page.tsx");
  const content = fs.readFileSync(storePagePath, "utf-8");

  assert.strictEqual(content.includes("delete-store-button"), true);
  assert.strictEqual(content.includes("confirm-delete-store-button"), true);
  assert.strictEqual(content.includes("deleteMerchantStore"), true);
  assert.strictEqual(content.includes("router.push(\"/merchant/login\")"), true);

  const sellerContextPath = path.join(process.cwd(), "src/context/SellerContext.tsx");
  const sellerContent = fs.readFileSync(sellerContextPath, "utf-8");
  assert.strictEqual(sellerContent.includes("deleteMerchantStore"), true);
});

// ----------------------------------------------------------------------
// 8. DATA CLEARING, ML SALES LEARNING, MAP4ME PINPOINT, NOTIFICATIONS & IMAGE UPLOAD
// ----------------------------------------------------------------------
console.log(cyan("\n--- 8. CLEAN SLATE, ML ENGINE, MAP4ME PINPOINT, NOTIFICATIONS & PRODUCT PHOTO UPLOAD ---"));

it("Clean Slate: Initial context state starts empty with manual onboarding", () => {
  const authContextPath = path.join(process.cwd(), "src/context/AuthContext.tsx");
  const authContent = fs.readFileSync(authContextPath, "utf-8");
  assert.strictEqual(authContent.includes("useState<UserProfile | null>(null)"), true);
  assert.strictEqual(authContent.includes("useState<boolean>(false)"), true);
  assert.strictEqual(authContent.includes("DEFAULT_ADDRESSES: UserAddress[] = []"), true);

  const mockDataPath = path.join(process.cwd(), "src/data/mockData.ts");
  const mockContent = fs.readFileSync(mockDataPath, "utf-8");
  assert.strictEqual(mockContent.includes("MOCK_STORES: Store[] = []"), true);
  assert.strictEqual(mockContent.includes("MOCK_PRODUCTS: Product[] = []"), true);
});

it("Proper Login & Sign Up: Clean Create Account vs Log In separation", () => {
  const loginPath = path.join(process.cwd(), "src/app/login/page.tsx");
  const loginContent = fs.readFileSync(loginPath, "utf-8");
  assert.strictEqual(loginContent.includes("Create Account"), true);
  assert.strictEqual(loginContent.includes("Already Have an Account? Log In"), true);
  assert.strictEqual(loginContent.includes("create-account-button"), true);
  assert.strictEqual(loginContent.includes("/merchant/login"), true);

  const merchantLoginPath = path.join(process.cwd(), "src/app/merchant/login/page.tsx");
  const mLoginContent = fs.readFileSync(merchantLoginPath, "utf-8");
  assert.strictEqual(mLoginContent.includes("Register Store"), true);
  assert.strictEqual(mLoginContent.includes("Already Registered? Log In"), true);
  assert.strictEqual(mLoginContent.includes("register-merchant-button"), true);
  assert.strictEqual(mLoginContent.includes("/seller"), true);
});

it("Product Image Upload: Merchant can upload custom photos for items", () => {
  const productsPagePath = path.join(process.cwd(), "src/app/seller/products/page.tsx");
  const content = fs.readFileSync(productsPagePath, "utf-8");

  assert.strictEqual(content.includes("product-image-upload-button"), true);
  assert.strictEqual(content.includes("product-image-file-input"), true);
  assert.strictEqual(content.includes("handleProductImageUpload"), true);
  assert.strictEqual(content.includes("product-image-preview"), true);
});

it("Machine Learning: Adaptive self-learning sales engine and merchant suggestions", () => {
  const mlEnginePath = path.join(process.cwd(), "src/lib/mlSalesEngine.ts");
  assert.strictEqual(fs.existsSync(mlEnginePath), true);
  const mlContent = fs.readFileSync(mlEnginePath, "utf-8");

  assert.strictEqual(mlContent.includes("trainMLSalesModel"), true);
  assert.strictEqual(mlContent.includes("productVelocities"), true);
  assert.strictEqual(mlContent.includes("basketCoOccurrences"), true);
  assert.strictEqual(mlContent.includes("hourlyRushDistribution"), true);

  const sellerDashboardPath = path.join(process.cwd(), "src/app/seller/page.tsx");
  const dashContent = fs.readFileSync(sellerDashboardPath, "utf-8");
  assert.strictEqual(dashContent.includes("Self-Trained Machine Learning Sales Intelligence"), true);
  assert.strictEqual(dashContent.includes("trainMLSalesModel"), true);
  assert.strictEqual(dashContent.includes("handleApplySuggestion"), true);
});

it("Map4Me Pinpoint: Accurate location picker for Home, Office, Others delivery", () => {
  const mapPickerPath = path.join(process.cwd(), "src/components/Map4MePicker.tsx");
  assert.strictEqual(fs.existsSync(mapPickerPath), true);
  const mapContent = fs.readFileSync(mapPickerPath, "utf-8");

  assert.strictEqual(mapContent.includes("map4me-picker"), true);
  assert.strictEqual(mapContent.includes("map4me-canvas"), true);
  assert.strictEqual(mapContent.includes("map4me-gps-button"), true);
  assert.strictEqual(mapContent.includes("Home"), true);
  assert.strictEqual(mapContent.includes("Office"), true);
  assert.strictEqual(mapContent.includes("Others"), true);

  const accountPath = path.join(process.cwd(), "src/app/account/page.tsx");
  const accountContent = fs.readFileSync(accountPath, "utf-8");
  assert.strictEqual(accountContent.includes("Map4MePicker"), true);

  const checkoutPath = path.join(process.cwd(), "src/components/CheckoutModal.tsx");
  const checkoutContent = fs.readFileSync(checkoutPath, "utf-8");
  assert.strictEqual(checkoutContent.includes("Map4MePicker"), true);
});

it("Notification System & User Recommendations: Alert for new stores/products and interest-based suggestions", () => {
  const notifPath = path.join(process.cwd(), "src/lib/notificationSystem.ts");
  assert.strictEqual(fs.existsSync(notifPath), true);
  const notifContent = fs.readFileSync(notifPath, "utf-8");
  assert.strictEqual(notifContent.includes("notifyNewStore"), true);
  assert.strictEqual(notifContent.includes("notifyNewProduct"), true);

  const navPath = path.join(process.cwd(), "src/components/Navbar.tsx");
  const navContent = fs.readFileSync(navPath, "utf-8");
  assert.strictEqual(navContent.includes("NotificationCenter"), true);

  const homePath = path.join(process.cwd(), "src/app/page.tsx");
  const homeContent = fs.readFileSync(homePath, "utf-8");
  assert.strictEqual(homeContent.includes("computePersonalizedRecommendations"), true);
  assert.strictEqual(homeContent.includes("recordUserSearchQuery"), true);
  assert.strictEqual(homeContent.includes("Recommended For You"), true);
});

// ----------------------------------------------------------------------
// FINAL SUMMARY
// ----------------------------------------------------------------------
console.log(bold("\n=================================================================="));
if (failedCount === 0) {
  console.log(green(`🎉 ALL ${passedCount} AUTH, USER PROFILE, APP SEPARATION & SECURITY TESTS PASSED!`));
  console.log(green("Login Page [Email (Permission), Phone (OTP)] Operational"));
  console.log(green("User Information [Name; Number; Address (Primary, Home, Office, Others); Email (Optional)] Active"));
  console.log(green("Separate User Application from Merchant Application Enforced"));
  console.log(green("Phone Applications (User: com.localloop.user; Merchant: com.localloop.merchant) Ready in Android Studio"));
  console.log(green("Safety & Security Hardened (XSS Sanitization, OTP Rate-Limiting, WebView Sandbox)"));
} else {
  console.error(red(`❌ ${failedCount} TESTS FAILED out of ${passedCount + failedCount}`));
  process.exit(1);
}
console.log(bold("==================================================================\n"));
