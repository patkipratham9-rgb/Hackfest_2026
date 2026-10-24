# Firebase Phone OTP Registration System

Production-ready phone number verification and user registration application built with **Firebase Authentication (Phone OTP)**, **Cloud Firestore**, and an **Express.js** backend secured with **Helmet** and **express-rate-limit**.

---

## 1. Project Structure

```text
firebase-otp-registration/
├── public/
│   ├── index.html        # Clean registration card with reCAPTCHA & OTP input
│   ├── style.css         # Modern, accessible responsive styling
│   └── app.js           # Firebase Web SDK client, reCAPTCHA, and token verification
├── .env                  # Environment variables (PORT, FIREBASE_PROJECT_ID)
├── .gitignore            # Excludes node_modules, .env, service accounts, and logs
├── firestore.rules       # Cloud Firestore security rules (client lock down)
├── package.json          # Node.js project manifest & dependencies
├── server.js             # Express server with Firebase Admin token verification
└── README.md             # Complete setup, architecture & security checklist
```

---

## 2. Firebase Console Setup

1. **Create Project**: Go to [Firebase Console](https://console.firebase.google.com/) and create or select your project.
2. **Add Web App**:
   - Register a Web App under Project Settings.
   - Copy your `apiKey`, `authDomain`, `projectId`, and `appId` into `public/app.js`.
3. **Enable Phone Authentication**:
   - Navigate to **Authentication** → **Sign-in method** → click **Phone** → toggle **Enable** → **Save**.
4. **SMS Region Policy**:
   - Under Authentication Settings, ensure SMS region policy allows countries you support (e.g., India `+91`).
5. **Authorized Domains**:
   - Add your production domain in **Authentication** → **Settings** → **Authorized domains**.
   - Note: For local development with real SMS, use custom local domain mapping or Firebase test numbers.
6. **Phone Number Testing (Safe Development)**:
   - Add test phone numbers (e.g. `+919876543210` with test code `123456`) in **Authentication** → **Phone numbers for testing**.
   - This avoids carrier SMS costs, quota depletion, and throttling during dev/testing.

---

## 3. Server Service Account Setup

1. In Firebase Console, open **Project Settings** → **Service accounts**.
2. Click **Generate new private key** and download the JSON key.
3. Save the JSON file **outside** the public repository directory (e.g., `~/.credentials/service-account.json`).
4. Set the environment variable:
   - **macOS / Linux**:
     ```bash
     export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/service-account.json"
     ```
   - **Windows (PowerShell)**:
     ```powershell
     $env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\service-account.json"
     ```

---

## 4. Installation & Local Execution

Inside the `firebase-otp-registration` folder:

```bash
cd firebase-otp-registration
npm install
npm run dev
```

Visit **http://localhost:3000** in your web browser.

---

## 5. Key Architecture & Backend Corrections Included

### A. Strict Phone Record Verification (`server.js`)
Instead of only reading claims from the JWT, the backend performs live verification against Firebase Authentication:
```javascript
const decoded = await auth.verifyIdToken(match[1], true);
const firebaseRecord = await auth.getUser(decoded.uid);
if (!firebaseRecord.phoneNumber || firebaseRecord.phoneNumber !== decoded.phone_number) {
  return res.status(403).json({ message: "A verified phone number is required." });
}
```
This guarantees revoked, modified, or mismatched tokens are immediately blocked.

### B. Express 5 Compatible Fallback Route
Uses RegExp pattern matching to prevent Express path-to-regexp deprecation warnings:
```javascript
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
```

### C. Helmet CSP for Firebase & reCAPTCHA
Preconfigured with directives for `https://www.gstatic.com` and `https://www.google.com/recaptcha/` to allow reCAPTCHA v2 / enterprise without breaking Strict-Transport-Security or CSP policies.

---

## 6. Firestore Security Rules

Publish in **Firestore Database** → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /registrations/{userId} {
      allow read, write: if false; // All writes occur via server Admin SDK
    }
  }
}
```

---

## 7. Security Checklist Before Production Deployment

- [ ] **Revocation Check**: `auth.verifyIdToken(token, true)` is enabled to reject revoked tokens immediately.
- [ ] **Service Account Isolation**: Service account JSON is never stored in source control or exposed to the frontend.
- [ ] **Rate Limiting**: `express-rate-limit` is active on `/api` (30 requests / 15 minutes).
- [ ] **Payload Limits**: `express.json({ limit: "10kb" })` prevents JSON body exhaustion attacks.
- [ ] **reCAPTCHA Protection**: reCAPTCHA container is rendered and verified on every SMS trigger.
- [ ] **Phone Number Normalization**: International E.164 formatting (`+91...`) is strictly enforced on client and server.
- [ ] **Database Integrity**: Document ID matches the verified `uid` to guarantee single-record idempotency (`409 Conflict` on duplicate registrations).
- [ ] **Firestore Lockdown**: Direct browser read/write to `/registrations` is completely blocked (`allow read, write: if false;`).
- [ ] **SMS Quotas**: SMS spending limits and alerts are set in Google Cloud Platform / Firebase Console.
