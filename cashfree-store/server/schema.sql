CREATE DATABASE IF NOT EXISTS cashfree_store
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cashfree_store;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price_paise INT UNSIGNED NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(45) NOT NULL UNIQUE,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(254) NOT NULL,
  customer_phone VARCHAR(10) NOT NULL,
  amount_paise BIGINT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  status ENUM(
    'CREATING',
    'PENDING',
    'PAID',
    'FAILED'
  ) NOT NULL DEFAULT 'CREATING',
  cf_order_status VARCHAR(30) NULL,
  payment_session_id TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orders_status (status)
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(45) NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  unit_price_paise INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO products (id, name, price_paise, stock, active)
VALUES
  (1, 'Classic T-Shirt', 49900, 100, TRUE),
  (2, 'Everyday Backpack', 99900, 50, TRUE),
  (3, 'Running Shoes', 199900, 25, TRUE)
ON DUPLICATE KEY UPDATE id = VALUES(id);
