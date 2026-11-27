// =============================================================
// src/products.ts
// All product routes (CRUD) for the Inventory Management API.
//
// server.ts mounts this router at "/api/products", so:
//   router.get('/')     handles  GET  /api/products
//   router.get('/:id')  handles  GET  /api/products/5
//
// IMPORTANT: every SQL query that contains a value sent by the user
// uses placeholders ($1, $2, ...) and passes the values separately.
// This is called a "parameterized query" and it protects the
// database against SQL injection.
// =============================================================

import { Router, Request, Response } from 'express';
import { pool } from './db';

const router = Router();

// Limits that match the column types in schema.sql.
const MAX_NAME_LENGTH = 100; // name VARCHAR(100)
const MAX_PRICE = 99999999.99; // price NUMERIC(10, 2) -> 8 digits before the decimal point
const MAX_INTEGER = 2147483647; // largest value a PostgreSQL INTEGER / SERIAL can hold

// -------------------------------------------------------------
// Helper: turn the ":id" part of the URL into a positive integer.
// Returns null if the id is not a valid positive whole number.
// Examples: "5" -> 5,  "abc" -> null,  "-3" -> null,  "2.5" -> null
// -------------------------------------------------------------
function parseProductId(idText: string): number | null {
  // Only digits are allowed (no letters, minus signs or decimal points).
  if (!/^\d+$/.test(idText)) {
    return null;
  }

  const id = Number(idText);

  if (id < 1 || id > MAX_INTEGER) {
    return null;
  }

  return id;
}

// -------------------------------------------------------------
// Helper: check the JSON body for POST and PUT requests.
// Returns an error message if something is wrong, or null if the
// body is valid.
// -------------------------------------------------------------
function getProductValidationError(body: any): string | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'Request body must be a JSON object with name, price and quantity.';
  }

  const { name, price, quantity } = body;

  // ----- name -----
  if (name === undefined || name === null) {
    return 'name is required.';
  }
  if (typeof name !== 'string' || name.trim() === '') {
    return 'name must be a non-empty string.';
  }
  if (name.trim().length > MAX_NAME_LENGTH) {
    return `name must be at most ${MAX_NAME_LENGTH} characters long.`;
  }

  // ----- price -----
  if (price === undefined || price === null) {
    return 'price is required.';
  }
  if (typeof price !== 'number' || !Number.isFinite(price)) {
    return 'price must be a valid number, for example 450000 or 199.99.';
  }
  if (price < 0) {
    return 'price cannot be negative.';
  }
  if (price > MAX_PRICE) {
    return `price cannot be greater than ${MAX_PRICE}.`;
  }

  // ----- quantity -----
  if (quantity === undefined || quantity === null) {
    return 'quantity is required.';
  }
  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
    return 'quantity must be a whole number, for example 10.';
  }
  if (quantity < 0) {
    return 'quantity cannot be negative.';
  }
  if (quantity > MAX_INTEGER) {
    return `quantity cannot be greater than ${MAX_INTEGER}.`;
  }

  return null; // no problems found
}

// =============================================================
// A. CREATE PRODUCT
// POST /api/products
// Body: { "name": "HP Laptop", "price": 450000, "quantity": 10 }
// =============================================================
router.post('/', async (req: Request, res: Response) => {
  const validationError = getProductValidationError(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const name: string = req.body.name.trim();
  const price: number = req.body.price;
  const quantity: number = req.body.quantity;

  try {
    // $1, $2 and $3 are replaced safely by the values in the array.
    // RETURNING * sends back the new row, including its product_id.
    const result = await pool.query(
      `INSERT INTO products (name, price, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, price, quantity]
    );

    // 201 Created = a new record was created successfully.
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'An unexpected error occurred while creating the product.' });
  }
});

// =============================================================
// B. GET ALL PRODUCTS
// GET /api/products
// =============================================================
router.get('/', async (_req: Request, res: Response) => {
  try {
    // No user input here, so no placeholders are needed.
    const result = await pool.query(
      `SELECT *
       FROM products
       ORDER BY product_id ASC`
    );

    // result.rows is an array. It is simply [] when the table is empty.
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'An unexpected error occurred while fetching products.' });
  }
});

// =============================================================
// C. GET PRODUCT BY ID
// GET /api/products/:id
// =============================================================
router.get('/:id', async (req: Request, res: Response) => {
  const productId = parseProductId(req.params.id);
  if (productId === null) {
    return res.status(400).json({ error: 'Invalid product ID. The ID must be a positive whole number.' });
  }

  try {
    const result = await pool.query(
      `SELECT *
       FROM products
       WHERE product_id = $1`,
      [productId]
    );

    // No rows means no product has this ID.
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Product with ID ${productId} was not found.` });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ error: 'An unexpected error occurred while fetching the product.' });
  }
});

// =============================================================
// D. UPDATE PRODUCT (full update - all three fields are required)
// PUT /api/products/:id
// Body: { "name": "HP Laptop", "price": 430000, "quantity": 8 }
// =============================================================
router.put('/:id', async (req: Request, res: Response) => {
  const productId = parseProductId(req.params.id);
  if (productId === null) {
    return res.status(400).json({ error: 'Invalid product ID. The ID must be a positive whole number.' });
  }

  const validationError = getProductValidationError(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const name: string = req.body.name.trim();
  const price: number = req.body.price;
  const quantity: number = req.body.quantity;

  try {
    // updated_at is set to the current time so we know when the row last changed.
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

    // If no row matched the WHERE clause, nothing was updated.
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Product with ID ${productId} was not found.` });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'An unexpected error occurred while updating the product.' });
  }
});

// =============================================================
// E. DELETE PRODUCT
// DELETE /api/products/:id
// =============================================================
router.delete('/:id', async (req: Request, res: Response) => {
  const productId = parseProductId(req.params.id);
  if (productId === null) {
    return res.status(400).json({ error: 'Invalid product ID. The ID must be a positive whole number.' });
  }

  try {
    // RETURNING * gives us the row that was deleted, so we can show it.
    const result = await pool.query(
      `DELETE FROM products
       WHERE product_id = $1
       RETURNING *`,
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Product with ID ${productId} was not found.` });
    }

    return res.status(200).json({
      message: `Product with ID ${productId} was deleted successfully.`,
      product: result.rows[0],
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'An unexpected error occurred while deleting the product.' });
  }
});

export default router;
