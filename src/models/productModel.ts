import { pool } from '../config/db';

export async function findAllProducts() {
  const result = await pool.query(
    `SELECT *
     FROM products
     ORDER BY product_id ASC`
  );
  return result.rows;
}

export async function findProductById(productId: number) {
  const result = await pool.query(
    `SELECT *
     FROM products
     WHERE product_id = $1`,
    [productId]
  );
  return result.rows[0] ?? null;
}

export async function createProduct(name: string, price: number, quantity: number) {
  const result = await pool.query(
    `INSERT INTO products (name, price, quantity)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, price, quantity]
  );
  return result.rows[0];
}

export async function updateProduct(productId: number, name: string, price: number, quantity: number) {
  const result = await pool.query(
    `UPDATE products
     SET
         name = $1,
         price = $2,
         quantity = $3,
         updated_at = CURRENT_TIMESTAMP
     WHERE product_id = $4
     RETURNING *`,
    [name, price, quantity, productId]
  );
  return result.rows[0] ?? null;
}

export async function deleteProduct(productId: number) {
  const result = await pool.query(
    `DELETE FROM products
     WHERE product_id = $1
     RETURNING *`,
    [productId]
  );
  return result.rows[0] ?? null;
}
