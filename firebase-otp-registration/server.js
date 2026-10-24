require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.FIREBASE_PROJECT_ID) {
  console.warn(
    "⚠️ FIREBASE_PROJECT_ID is missing from .env. Please set it before verifying live tokens."
  );
}

// Initialize Firebase Admin SDK
try {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || "YOUR_FIREBASE_PROJECT_ID",
  });
} catch (initErr) {
  console.warn(
    "⚠️ Firebase Admin initialization notice:",
    initErr.message,
    "\nMake sure GOOGLE_APPLICATION_CREDENTIALS points to your service account key file."
  );
}

const auth = getAuth();
const db = getFirestore();

app.disable("x-powered-by");

// Security Headers with CSP configured for Firebase SDK and reCAPTCHA
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://www.gstatic.com",
          "https://www.google.com",
          "https://www.google.com/recaptcha/",
          "https://apis.google.com",
        ],
        frameSrc: [
          "'self'",
          "https://www.google.com",
          "https://www.google.com/recaptcha/",
          "https://recaptcha.google.com",
          "https://*.firebaseapp.com",
        ],
        connectSrc: [
          "'self'",
          "https://*.googleapis.com",
          "https://*.firebaseio.com",
          "https://identitytoolkit.googleapis.com",
          "https://securetoken.googleapis.com",
        ],
        imgSrc: ["'self'", "data:", "https://www.gstatic.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

app.use(express.json({ limit: "10kb" }));

// Rate limit: 30 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});
app.use("/api", apiLimiter);

app.use(express.static(path.join(__dirname, "public")));

/**
 * Middleware: Verify Firebase ID Token and enforce verified phone number
 * (Includes Backend Correction A: verify against Firebase user record)
 */
async function requireFirebaseUser(req, res, next) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (.+)$/);
  if (!match) {
    return res.status(401).json({ message: "Please verify your phone number first." });
  }

  try {
    // Check revocation as well as token validity
    const decoded = await auth.verifyIdToken(match[1], true);

    // Backend Correction A: Confirm token matches Firebase user record
    const firebaseRecord = await auth.getUser(decoded.uid);
    if (
      !firebaseRecord.phoneNumber ||
      firebaseRecord.phoneNumber !== decoded.phone_number
    ) {
      return res.status(403).json({ message: "A verified phone number is required." });
    }

    req.firebaseUser = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Your session is invalid or expired. Please sign in again.",
    });
  }
}

/**
 * Registration endpoint
 */
app.post("/api/register", requireFirebaseUser, async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ message: "Name must contain 2 to 80 characters." });
    }

    // Identity comes from the verified Firebase token,
    // never from a client-supplied UID or phone number.
    const { uid, phone_number: phone } = req.firebaseUser;
    const userRef = db.collection("registrations").doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.status(409).json({ message: "This phone account is already registered." });
    }

    await userRef.create({
      uid,
      name,
      phone,
      phoneVerified: true,
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      message: "Registration successful!",
      user: { name, phone },
    });
  } catch (error) {
    if (error.code === 6 || error.code === "already-exists") {
      return res.status(409).json({ message: "This account is already registered." });
    }
    console.error("Registration error:", error.message);
    return res.status(500).json({ message: "Registration could not be completed." });
  }
});

/**
 * User Profile endpoint
 */
app.get("/api/me", requireFirebaseUser, async (req, res) => {
  try {
    const snapshot = await db.collection("registrations").doc(req.firebaseUser.uid).get();
    if (!snapshot.exists) {
      return res.status(404).json({ message: "Registration profile not found." });
    }
    const data = snapshot.data();
    return res.json({
      name: data.name,
      phone: data.phone,
      phoneVerified: data.phoneVerified,
    });
  } catch (error) {
    console.error("Profile error:", error.message);
    return res.status(500).json({ message: "Unable to load your profile." });
  }
});

/**
 * Backend Correction B: Express 5 compatible fallback route
 */
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
