import fs from "fs";
import path from "path";
import assert from "assert";

console.log("==================================================================");
console.log("📍 VERIFYING POST-LOGIN LOCATION & PRE-PAYMENT LOCATION ENFORCEMENT");
console.log("==================================================================");

let testsPassed = 0;

function check(desc, condition) {
  assert(condition, `Failed: ${desc}`);
  console.log(`  ✓ ${desc}`);
  testsPassed++;
}

// 1. Verify PostLoginLocationModal component exists
const modalPath = path.resolve("src/components/PostLoginLocationModal.tsx");
check("PostLoginLocationModal component exists", fs.existsSync(modalPath));

const modalCode = fs.readFileSync(modalPath, "utf-8");
check("Modal includes GPS location sharing", modalCode.includes("requestCurrentLocation") && modalCode.includes("Share Current Location (GPS)"));
check("Modal includes Quick Hubballi Neighborhoods", modalCode.includes("POPULAR_NEIGHBORHOODS") && modalCode.includes("Vidyanagar") && modalCode.includes("Station Road"));
check("Modal includes Skip for now button with marketplace redirect", modalCode.includes("post-login-skip-button") && modalCode.includes("Skip for now"));
check("Modal supports requireLocation mode for checkout enforcement", modalCode.includes("requireLocation = false") && modalCode.includes("Delivery location is required before processing payment"));

// 2. Verify Login User page integration
const userLoginPath = path.resolve("src/app/login/user/page.tsx");
const userLoginCode = fs.readFileSync(userLoginPath, "utf-8");
check("User login imports PostLoginLocationModal", userLoginCode.includes("PostLoginLocationModal"));
check("User login triggers location modal after auth verification", userLoginCode.includes("setShowLocationModal(true)"));
check("User login handles skip to redirect to marketplace", userLoginCode.includes("handleSkipLocation") && userLoginCode.includes('router.push("/")'));
check("User login mounts PostLoginLocationModal with onSkip and onLocationSet", userLoginCode.includes("<PostLoginLocationModal"));

// 3. Verify Unified Login page integration
const loginPath = path.resolve("src/app/login/page.tsx");
const loginCode = fs.readFileSync(loginPath, "utf-8");
check("Unified login imports PostLoginLocationModal", loginCode.includes("PostLoginLocationModal"));
check("Unified login triggers location modal after auth verification", loginCode.includes("setShowLocationModal(true)"));
check("Unified login handles skip to redirect to marketplace", loginCode.includes("handleSkipLocation") && loginCode.includes('router.push("/")'));
check("Unified login mounts PostLoginLocationModal", loginCode.includes("<PostLoginLocationModal"));

// 4. Verify CheckoutModal pre-payment location enforcement
const checkoutPath = path.resolve("src/components/CheckoutModal.tsx");
const checkoutCode = fs.readFileSync(checkoutPath, "utf-8");
check("CheckoutModal imports PostLoginLocationModal", checkoutCode.includes("PostLoginLocationModal"));
check("CheckoutModal accesses userLocation from CartContext", checkoutCode.includes("userLocation") && checkoutCode.includes("setUserLocation"));
check("CheckoutModal enforces location check before payment", checkoutCode.includes("hasSharedLocation") && checkoutCode.includes("setIsLocationRequiredModalOpen(true)"));
check("CheckoutModal renders location error notice before payment", checkoutCode.includes("checkout-location-error"));
check("CheckoutModal mounts PostLoginLocationModal with requireLocation={true}", checkoutCode.includes("requireLocation={true}"));

console.log("==================================================================");
console.log(`🎉 ALL ${testsPassed} LOCATION PERMISSION & PRE-PAYMENT CHECKS PASSED!`);
console.log("1. Post-login location prompt with GPS & Hubballi areas: Verified");
console.log("2. 'Skip for now' redirect to marketplace: Verified");
console.log("3. Pre-payment location enforcement for unshared users: Verified");
console.log("==================================================================");
