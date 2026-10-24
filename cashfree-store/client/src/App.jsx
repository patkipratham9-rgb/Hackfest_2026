import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;
const CASHFREE_MODE =
  import.meta.env.VITE_CASHFREE_MODE || "sandbox";

function money(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(amount);
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);

  const orderId = new URLSearchParams(
    window.location.search
  ).get("order_id");

  const cartItems = useMemo(
    () =>
      products
        .filter((product) => cart[product.id] > 0)
        .map((product) => ({
          ...product,
          quantity: cart[product.id]
        })),
    [products, cart]
  );

  const total = cartItems.reduce(
    (sum, item) => sum + item.price_paise * item.quantity,
    0
  );

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load products.");
        return response.json();
      })
      .then((data) => setProducts(data.products))
      .catch((error) => setMessage(error.message));
  }, []);

  async function checkPaymentStatus(id = orderId) {
    if (!id) return;

    setChecking(true);
    setMessage("Checking payment status…");

    try {
      const response = await fetch(
        `${API}/api/orders/${encodeURIComponent(id)}/status`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not verify payment.");
      }

      setPaymentResult(data);

      if (data.status === "PAID") {
        setMessage("Payment successful! Your order is confirmed.");
        setCart({});
      } else {
        setMessage(
          "Payment is not confirmed yet. You can check again shortly."
        );
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    if (orderId) {
      checkPaymentStatus(orderId);
    }
    // The status endpoint verifies against Cashfree, not the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  function updateQuantity(product, delta) {
    setCart((previous) => {
      const next = { ...previous };
      const current = next[product.id] || 0;
      const updated = current + delta;

      if (updated <= 0) {
        delete next[product.id];
      } else if (updated <= Math.min(product.stock, 10)) {
        next[product.id] = updated;
      }

      return next;
    });
  }

  async function startCheckout(event) {
    event.preventDefault();
    setMessage("");

    if (!cartItems.length) {
      setMessage("Please add a product to your cart.");
      return;
    }

    if (!window.Cashfree) {
      setMessage("Cashfree Checkout SDK did not load. Refresh and retry.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items: cartItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create order.");
      }

      const cashfree = window.Cashfree({
        mode: CASHFREE_MODE
      });

      const result = await cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_self"
      });

      if (result?.error) {
        setMessage(
          "Checkout could not start. Check your connection and retry."
        );
      }
    } catch (error) {
      setMessage(error.message || "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  if (orderId) {
    return (
      <main className="page narrow">
        <header className="brand">
          <span className="brand-mark">S</span>
          <span>Storefront</span>
        </header>

        <section className="panel result">
          <div className="result-icon">
            {paymentResult?.status === "PAID" ? "✓" : "₹"}
          </div>

          <h1>
            {paymentResult?.status === "PAID"
              ? "Payment successful"
              : "Payment status"}
          </h1>

          <p>{message || "Verifying your order…"}</p>

          {paymentResult && (
            <div className="order-summary">
              <p>
                <span>Order ID</span>
                <strong>{paymentResult.orderId}</strong>
              </p>
              <p>
                <span>Amount</span>
                <strong>{money(paymentResult.amount)}</strong>
              </p>
              <p>
                <span>Status</span>
                <strong>{paymentResult.status}</strong>
              </p>
            </div>
          )}

          <button
            className="primary"
            disabled={checking}
            onClick={() => checkPaymentStatus()}
          >
            {checking ? "Checking…" : "Refresh payment status"}
          </button>

          <p className="muted">
            Keep your order ID for customer support.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="brand">
        <span className="brand-mark">S</span>
        <span>Storefront</span>
        <span className="cart-pill">
          {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">THE EVERYDAY COLLECTION</p>
        <h1>Good things, delivered.</h1>
        <p>Discover your next favourite.</p>
      </section>

      {message && <div className="notice" role="status">{message}</div>}

      <div className="layout">
        <section>
          <h2>Our products</h2>

          <div className="products">
            {products.map((product, index) => (
              <article className="product-card" key={product.id}>
                <div className={`product-art art-${index % 3}`}>
                  {["✦", "◈", "◇"][index % 3]}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{money(product.price_paise / 100)}</p>
                  <button
                    className="secondary"
                    onClick={() => updateQuantity(product, 1)}
                  >
                    Add to cart
                  </button>
                  {cart[product.id] > 0 && (
                    <div className="quantity">
                      <button onClick={() => updateQuantity(product, -1)}>
                        −
                      </button>
                      <span>{cart[product.id]}</span>
                      <button onClick={() => updateQuantity(product, 1)}>
                        +
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="panel checkout-panel">
          <h2>Your order</h2>

          {cartItems.length === 0 ? (
            <p className="muted">Your cart is empty.</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <div className="line-item" key={item.id}>
                  <span>{item.name} × {item.quantity}</span>
                  <strong>
                    {money((item.price_paise * item.quantity) / 100)}
                  </strong>
                </div>
              ))}

              <div className="total">
                <span>Total</span>
                <strong>{money(total / 100)}</strong>
              </div>
            </>
          )}

          <form onSubmit={startCheckout}>
            <label>
              Full name
              <input
                required
                maxLength="100"
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                autoComplete="name"
              />
            </label>

            <label>
              Email
              <input
                required
                type="email"
                maxLength="254"
                value={customer.email}
                onChange={(e) =>
                  setCustomer({ ...customer, email: e.target.value })
                }
                autoComplete="email"
              />
            </label>

            <label>
              Indian mobile number
              <input
                required
                type="tel"
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength="10"
                placeholder="10-digit mobile number"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10)
                  })
                }
                autoComplete="tel"
              />
            </label>

            <button
              className="primary"
              type="submit"
              disabled={loading || cartItems.length === 0}
            >
              {loading ? "Preparing checkout…" : "Proceed to payment"}
            </button>
          </form>

          <p className="security-note">
            🔒 Payments are processed through Cashfree's hosted checkout.
          </p>
        </aside>
      </div>

      <footer>
        <p>Secure checkout · INR pricing · Customer support</p>
      </footer>
    </main>
  );
}
