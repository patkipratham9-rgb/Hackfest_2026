const pool = require("./db");

async function getProducts() {
  const [rows] = await pool.execute(
    `SELECT id, name, price_paise, stock
     FROM products
     WHERE active = TRUE AND stock > 0
     ORDER BY id`
  );

  return rows.map((product) => ({
    id: product.id,
    name: product.name,
    pricePaise: product.price_paise,
    stock: product.stock
  }));
}

module.exports = { getProducts };
