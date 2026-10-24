import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Replace these placeholders with your Firebase Web App config.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const form = document.getElementById("registrationForm");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const otpInput = document.getElementById("otp");
const otpSection = document.getElementById("otpSection");
const sendBtn = document.getElementById("sendOtpBtn");
const verifyBtn = document.getElementById("verifyBtn");
const status = document.getElementById("status");
const successPanel = document.getElementById("successPanel");
const profile = document.getElementById("profile");
const logoutBtn = document.getElementById("logoutBtn");

let recaptchaVerifier = null;
let confirmationResult = null;
let verifiedUser = null;
let busy = false;

function showMessage(message) {
  status.textContent = message;
}

function setBusy(value) {
  busy = value;
  sendBtn.disabled = value;
  verifyBtn.disabled = value;
}

function resetRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  document.getElementById("recaptcha-container").replaceChildren();
}

function normalizePhone(value) {
  // The input must already contain a country code.
  // Remove formatting spaces, parentheses and hyphens.
  return value.replace(/[\s()-]/g, "");
}

function validPhone(value) {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

async function sendOTP() {
  if (busy) return;
  const phone = normalizePhone(phoneInput.value);

  if (!nameInput.reportValidity()) return;
  if (!phoneInput.reportValidity()) return;

  if (!validPhone(phone)) {
    showMessage("Enter a valid international phone number.");
    return;
  }

  if (auth.currentUser) {
    await signOut(auth);
  }

  confirmationResult = null;
  verifiedUser = null;
  otpSection.hidden = true;
  successPanel.hidden = true;
  showMessage("Preparing phone verification...");
  setBusy(true);

  try {
    resetRecaptcha();
    recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "normal",
    });
    await recaptchaVerifier.render();

    confirmationResult = await signInWithPhoneNumber(
      auth,
      phone,
      recaptchaVerifier
    );

    otpSection.hidden = false;
    otpInput.value = "";
    otpInput.required = true;
    otpInput.focus();
    showMessage("OTP sent. Check your phone for the verification code.");
  } catch (error) {
    console.error("OTP send failed:", error.code);
    const messages = {
      "auth/invalid-phone-number": "The phone number is invalid.",
      "auth/too-many-requests": "Too many attempts. Please try later.",
      "auth/quota-exceeded": "The SMS quota has been exceeded.",
      "auth/captcha-check-failed": "reCAPTCHA failed. Please try again.",
    };
    showMessage(
      messages[error.code] ||
        "Unable to send OTP. Check your Firebase settings and try again."
    );
    confirmationResult = null;
    resetRecaptcha();
  } finally {
    setBusy(false);
  }
}

async function verifyAndRegister(event) {
  event.preventDefault();
  if (busy) return;

  if (!confirmationResult && !verifiedUser) {
    showMessage("Please request an OTP first.");
    return;
  }

  const name = nameInput.value.trim();
  const phone = normalizePhone(phoneInput.value);
  const otp = otpInput.value.trim();

  if (name.length < 2 || name.length > 80) {
    showMessage("Name must contain 2 to 80 characters.");
    return;
  }

  if (!validPhone(phone)) {
    showMessage("Enter a valid international phone number.");
    return;
  }

  if (!verifiedUser && !/^\d{6}$/.test(otp)) {
    showMessage("Enter the six-digit OTP.");
    return;
  }

  setBusy(true);
  showMessage("Verifying your details...");

  try {
    // Confirm the OTP only once. If registration fails afterward,
    // retain the authenticated user so registration can be retried.
    if (!verifiedUser) {
      const result = await confirmationResult.confirm(otp);
      verifiedUser = result.user;
      confirmationResult = null;
    }

    if (verifiedUser.phoneNumber !== phone) {
      throw new Error("PHONE_MISMATCH");
    }

    const idToken = await verifiedUser.getIdToken();
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ name }),
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || "Registration failed.");
      return;
    }

    form.hidden = true;
    successPanel.hidden = false;
    profile.textContent = `Welcome, ${data.user.name}! Your phone ${data.user.phone} is verified.`;
    showMessage(data.message);
  } catch (error) {
    console.error("Verification failed:", error.code || error.message);
    const messages = {
      "auth/invalid-verification-code": "Incorrect OTP. Please check the code.",
      "auth/code-expired": "Your OTP has expired. Request a new code.",
      PHONE_MISMATCH: "The verified phone number does not match the form.",
    };
    showMessage(
      messages[error.code || error.message] || "Verification failed. Please try again."
    );
  } finally {
    setBusy(false);
  }
}

sendBtn.addEventListener("click", sendOTP);
form.addEventListener("submit", verifyAndRegister);

logoutBtn.addEventListener("click", async () => {
  if (busy) return;
  try {
    await signOut(auth);
    confirmationResult = null;
    verifiedUser = null;
    otpSection.hidden = true;
    successPanel.hidden = true;
    form.hidden = false;
    otpInput.value = "";
    otpInput.required = false;
    resetRecaptcha();
    showMessage("You have signed out.");
  } catch {
    showMessage("Unable to sign out. Please try again.");
  }
});
