-- =============================================================
-- schema.sql
-- Creates the "products" table for the Inventory Management API.
--
-- Run this script while connected to the "InventoryDB" database
-- (in pgAdmin: right-click InventoryDB > Query Tool, paste, run).
--
-- "IF NOT EXISTS" makes the script safe to run more than once:
-- if the table already exists, PostgreSQL simply skips it.
-- =============================================================

CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
