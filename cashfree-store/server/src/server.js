require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const crypto = require("crypto");
const pool = require("./db");
const { getProducts } = require("./catalog");

const app = express();

const PORT = Number(process.env.PORT || 5000);
const API_VERSION = process.env.CASHFREE_API_VERSION || "2025-01-01";
const IS_PRODUCTION = process.env.CASHFREE_ENV === "production";

const CASHFREE_BASE = IS_PRODUCTION
  ? "https://api.cashfree.com/pg"
  : "https://sandbox.cashfree.com/pg";

if (
  !process.env.CASHFREE_APP_ID ||
  !process.env.CASHFREE_SECRET_KEY ||
  !process.env.DB_NAME ||
  !process.env.CLIENT_ORIGIN ||
  !process.env.API_BASE_URL
) {
  throw new Error("Missing required environment variables.");
}

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// Cashfree signs the exact raw request body.
// Register this route BEFORE express.json().
app.post(
  "/api/webhooks/cashfree",
  express.raw({ type: "application/json", limit: "1mb" }),
  handleCashfreeWebhook
);

app.use(express.json({ limit: "20kb" }));

async function cashfreeRequest(path, options = {}) {
  const response = await fetch(`${CASHFREE_BASE}${path}`, {
    ...options,
    headers: {
      "x-client-id": process.env.CASHFREE_APP_ID,
      "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      "x-api-version": API_VERSION,
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(options.headers || {})
    },
    signal: AbortSignal.timeout(15000)
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Invalid response from payment provider.");
  }

  if (!response.ok) {
    console.error("Cashfree API error:", response.status, data);
    const error = new Error("Payment provider request failed.");
    error.status = 502;
    throw error;
  }

  return data;
}

function validateCustomer(customer) {
  if (!customer || typeof customer !== "object") {
    return "Customer details are required.";
  }

  const name = String(customer.name || "").trim();
  const email = String(customer.email || "").trim();
  const phone = String(customer.phone || "").trim();

  if (name.length < 2 || name.length > 100) {
    return "Enter a valid customer name.";
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return "Enter a valid email address.";
  }

  if (!/^[6-9]\d{9}$/.test(phone)) {
    return "Enter a valid 10-digit Indian mobile number.";
  }

  return null;
}

function makeOrderId() {
  return `store_${crypto.randomBytes(12).toString("hex")}`;
}

// Get the public product list.
app.get("/api/products", async (req, res, next) => {
  try {
    res.json({ products: await getProducts() });
  } catch (error) {
    next(error);
  }
});

// Create an order from product IDs and quantities.
// Never accept prices or totals from the browser.
app.post("/api/orders", async (req, res, next) => {
  let connection;
  let orderId;
  let amountPaise;

  try {
    const customerError = validateCustomer(req.body.customer);
    if (customerError) {
      return res.status(400).json({ error: customerError });
    }

    const items = req.body.items;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 20
    ) {
      return res.status(400).json({
        error: "Provide between 1 and 20 cart items."
      });
    }

    const quantities = new Map();

    for (const item of items) {
      const id = Number(item.productId);
      const quantity = Number(item.quantity);

      if (
        !Number.isSafeInteger(id) ||
        id < 1 ||
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        quantity > 10
      ) {
        return res.status(400).json({
          error: "Invalid product or quantity."
        });
      }

      quantities.set(
        id,
        (quantities.get(id) || 0) + quantity
      );
    }

    for (const quantity of quantities.values()) {
      if (quantity > 10) {
        return res.status(400).json({
          error: "Maximum 10 units per product."
        });
      }
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const ids = [...quantities.keys()];
    const placeholders = ids.map(() => "?").join(",");

    const [products] = await connection.query(
      `SELECT id, name, price_paise, stock
       FROM products
       WHERE active = TRUE AND id IN (${placeholders})
       FOR UPDATE`,
      ids
    );

    if (products.length !== ids.length) {
      await connection.rollback();
      return res.status(400).json({
        error: "One or more products are unavailable."
      });
    }

    const byId = new Map(products.map((p) => [p.id, p]));
    const orderItems = [];
    amountPaise = 0;

    for (const [id, quantity] of quantities.entries()) {
      const product = byId.get(id);

      if (product.stock < quantity) {
        await connection.rollback();
        return res.status(409).json({
          error: `${product.name} does not have enough stock.`
        });
      }

      amountPaise += product.price_paise * quantity;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price_paise,
        quantity
      });
    }

    if (
      !Number.isSafeInteger(amountPaise) ||
      amountPaise <= 0 ||
      amountPaise > 100000000
    ) {
      await connection.rollback();
      return res.status(400).json({
        error: "Order total is outside the allowed range."
      });
    }

    orderId = makeOrderId();

    const customer = {
      name: String(req.body.customer.name).trim(),
      email: String(req.body.customer.email).trim(),
      phone: String(req.body.customer.phone).trim()
    };

    await connection.execute(
      `INSERT INTO orders
       (order_id, customer_name, customer_email,
        customer_phone, amount_paise, status)
       VALUES (?, ?, ?, ?, ?, 'CREATING')`,
      [
        orderId,
        customer.name,
        customer.email,
        customer.phone,
        amountPaise
      ]
    );

    for (const item of orderItems) {
      await connection.execute(
        `INSERT INTO order_items
         (order_id, product_id, product_name,
          unit_price_paise, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.name,
          item.price,
          item.quantity
        ]
      );
    }

    await connection.commit();
    connection.release();
    connection = null;

    const apiOrder = await cashfreeRequest("/orders", {
      method: "POST",
      headers: {
        "x-idempotency-key": crypto
          .createHash("sha256")
          .update(orderId)
          .digest("hex")
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amountPaise / 100,
        order_currency: "INR",
        customer_details: {
          customer_id: `cust_${crypto
            .createHash("sha256")
            .update(customer.email.toLowerCase())
            .digest("hex")
            .slice(0, 24)}`,
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone
        },
        order_meta: {
          return_url:
            `${process.env.CLIENT_ORIGIN}/payment-result?order_id=${orderId}`,
          notify_url:
            `${process.env.API_BASE_URL}/api/webhooks/cashfree`
        },
        order_note: "Online store purchase",
        order_tags: {
          source: "react-store"
        },
        order_expiry_time: new Date(
          Date.now() + 30 * 60 * 1000
        ).toISOString()
      })
    });

    if (!apiOrder.payment_session_id) {
      throw new Error("Payment session was not returned.");
    }

    await pool.execute(
      `UPDATE orders
       SET status = 'PENDING', payment_session_id = ?,
           cf_order_status = ?
       WHERE order_id = ? AND status = 'CREATING'`,
      [
        apiOrder.payment_session_id,
        apiOrder.order_status || "ACTIVE",
        orderId
      ]
    );

    res.status(201).json({
      orderId,
      amount: amountPaise / 100,
      currency: "INR",
      paymentSessionId: apiOrder.payment_session_id
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {}
      connection.release();
    }

    // If Cashfree order creation failed, mark the local order failed.
    // Network timeouts may be ambiguous; reconcile before retrying.
    if (orderId) {
      try {
        await pool.execute(
          `UPDATE orders
           SET status = 'FAILED'
           WHERE order_id = ? AND status = 'CREATING'`,
          [orderId]
        );
      } catch (dbError) {
        console.error("Order cleanup failed:", dbError.message);
      }
    }

    next(error);
  }
});

// Verify an order by querying Cashfree directly.
// Never trust the status supplied by the browser.
async function verifyAndUpdateOrder(orderId) {
  const [rows] = await pool.execute(
    `SELECT order_id, amount_paise, status
     FROM orders WHERE order_id = ?`,
    [orderId]
  );

  if (!rows.length) {
    const error = new Error("Order not found.");
    error.status = 404;
    throw error;
  }

  const local = rows[0];

  const providerOrder = await cashfreeRequest(
    `/orders/${encodeURIComponent(orderId)}`
  );

  if (
    providerOrder.order_id !== local.order_id ||
    providerOrder.order_currency !== "INR" ||
    Math.round(Number(providerOrder.order_amount) * 100) !==
      Number(local.amount_paise)
  ) {
    throw new Error("Payment order details do not match.");
  }

  // Cashfree's order status becomes PAID after successful payment.
  // Keep other statuses pending until they can be safely reconciled.
  if (providerOrder.order_status === "PAID") {
    await pool.execute(
      `UPDATE orders
       SET status = 'PAID', cf_order_status = 'PAID'
       WHERE order_id = ? AND status <> 'PAID'`,
      [orderId]
    );
  } else if (local.status !== "PAID") {
    await pool.execute(
      `UPDATE orders
       SET status = 'PENDING', cf_order_status = ?
       WHERE order_id = ? AND status <> 'PAID'`,
      [providerOrder.order_status || "ACTIVE", orderId]
    );
  }

  const [updated] = await pool.execute(
    `SELECT order_id, amount_paise, currency, status
     FROM orders WHERE order_id = ?`,
    [orderId]
  );

  return {
    orderId: updated[0].order_id,
    amount: Number(updated[0].amount_paise) / 100,
    currency: updated[0].currency,
    status: updated[0].status
  };
}

app.get("/api/orders/:orderId/status", async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    if (!/^store_[a-f0-9]{24}$/.test(orderId)) {
      return res.status(400).json({ error: "Invalid order ID." });
    }

    const result = await verifyAndUpdateOrder(orderId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Verify Cashfree's signature using the EXACT raw request body.
// Signature formula: Base64(HMAC-SHA256(timestamp + rawBody, secret)).
function verifyWebhookSignature(req) {
  const signature = req.get("x-webhook-signature");
  const timestamp = req.get("x-webhook-timestamp");

  if (!signature || !timestamp || !Buffer.isBuffer(req.body)) {
    return false;
  }

  const rawBody = req.body.toString("utf8");

  const expected = crypto
    .createHmac("sha256", process.env.CASHFREE_SECRET_KEY)
    .update(timestamp + rawBody, "utf8")
    .digest("base64");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function handleCashfreeWebhook(req, res) {
  try {
    if (!verifyWebhookSignature(req)) {
      return res.status(401).send("Invalid webhook signature.");
    }

    const event = JSON.parse(req.body.toString("utf8"));
    const orderId = event?.data?.order?.order_id;
    const paymentStatus = event?.data?.payment?.payment_status;

    if (
      typeof orderId !== "string" ||
      !/^store_[a-f0-9]{24}$/.test(orderId)
    ) {
      return res.status(400).send("Invalid order ID.");
    }

    // Do not treat a webhook payload alone as proof of payment.
    // Re-fetch the order from Cashfree and validate its amount.
    if (paymentStatus === "SUCCESS") {
      await verifyAndUpdateOrder(orderId);
    }

    // Acknowledge valid events, including non-success events.
    // Store event IDs and implement an inbox table in a larger
    // production deployment for durable deduplication.
    return res.status(200).send("OK");
  } catch (error) {
    console.error("Cashfree webhook processing failed:", error.message);
    return res.status(500).send("Webhook processing failed.");
  }
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((error, req, res, next) => {
  console.error("Request failed:", error.message);

  const status = Number.isInteger(error.status)
    ? error.status
    : 500;

  res.status(status).json({
    error: status >= 500
      ? "An unexpected error occurred. Please try again."
      : error.message
  });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
