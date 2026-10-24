# Cashfree Store — Full-Stack E-Commerce Integration

A production-ready e-commerce store with server-side pricing, MySQL transactional order processing, hosted Cashfree checkout, and cryptographically verified webhook notifications.

## Architecture

```
[ React + Vite Storefront ]  <--- Browser SDK (Cashfree.js v3) ---> [ Cashfree Hosted PG ]
          |                                                                    |
    Cart / Checkout API                                                        |
          v                                                                    |
[ Node.js + Express Server ] <---------- HMAC-SHA256 Webhook ------------------+
          |
  [ MySQL Database ]
(products, orders, items)
```

## Directory Structure

```
cashfree-store/
├── server/
│   ├── src/
│   │   ├── db.js          # MySQL connection pool
│   │   ├── catalog.js     # Server-side pricing & catalog truth
│   │   └── server.js      # Express API, Cashfree checkout, webhook verification
│   ├── schema.sql         # Database schema & product seed
│   ├── .env               # Server credentials & configuration
│   ├── .gitignore
│   └── package.json
└── client/
    ├── .env               # Client API URL and Cashfree mode
    ├── index.html         # Includes official Cashfree SDK v3
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx       # React DOM entrypoint
        ├── App.jsx        # Product catalog, cart, customer form, status check
        └── style.css      # Responsive styles & modern UI
```

---

## 1. Prerequisites

- **Node.js**: v20 or later (`node -v`)
- **MySQL**: 8.0+ running locally on port 3306

---

## 2. Database Initialization

From `cashfree-store/server/`:

```bash
# Log in to MySQL and run schema.sql:
mysql -u root -p < schema.sql
```

This creates:
- `products`: Product catalog with prices stored in paise (₹499 = `49900`).
- `orders`: Tracks order status (`CREATING`, `PENDING`, `PAID`, `FAILED`), Cashfree status, and session ID.
- `order_items`: Foreign-keyed items with frozen purchase prices.

---

## 3. Server Setup

```bash
cd cashfree-store/server
npm install
```

Configure your credentials in `server/.env`:
```env
CASHFREE_ENV=sandbox
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_API_VERSION=2025-01-01

DB_HOST=localhost
DB_PORT=3306
DB_USER=cashfree_app
DB_PASSWORD=your_password
DB_NAME=cashfree_store
```

Start the server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

Verify health check:
```bash
curl http://localhost:5000/health
# {"status":"ok"}
```

---

## 4. Client Setup

```bash
cd cashfree-store/client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 5. Webhook Security & Notifications

Cashfree webhook notifications are handled via `/api/webhooks/cashfree` with raw-body HMAC-SHA256 signature verification:

- `x-webhook-signature`: Base64 signature
- `x-webhook-timestamp`: Request timestamp
- Signature formula: `Base64(HMAC-SHA256(timestamp + rawBody, secret))`

In order creation, `notify_url` is automatically populated:
```javascript
order_meta: {
  return_url: `${process.env.CLIENT_ORIGIN}/payment-result?order_id=${orderId}`,
  notify_url: `${process.env.API_BASE_URL}/api/webhooks/cashfree`
}
```

---

## 6. Testing Checklist

- [x] Product prices and cart totals come strictly from the server/database.
- [x] Valid customer details create a transactional order record in MySQL.
- [x] Cashfree checkout launches using `paymentSessionId`.
- [x] Server-side verification (`/api/orders/:orderId/status`) queries Cashfree API directly.
- [x] HMAC-SHA256 webhook signatures are strictly verified.
- [x] Invalid product IDs or excessive quantities (>10) are rejected with 400.
