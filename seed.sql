-- =============================================================
-- seed.sql
-- Inserts five sample products into the "products" table.
--
-- Run schema.sql FIRST, then run this script while connected
-- to the "InventoryDB" database.
--
-- This script is safe to run more than once. Each sample product
-- is only inserted if a product with the same name does NOT
-- already exist, so running it again will not create duplicates.
-- =============================================================

INSERT INTO products (name, price, quantity)
SELECT sample.name, sample.price, sample.quantity
FROM (
    VALUES
        (1, 'HP Laptop',                    450000.00,  10),
        (2, 'Logitech Wireless Mouse',        8500.00,  50),
        (3, 'Samsung 24-inch Monitor',      120000.00,  15),
        (4, 'Mechanical Keyboard',           35000.00,  25),
        (5, 'SanDisk 64GB USB Flash Drive',   6000.00, 100)
) AS sample (sort_order, name, price, quantity)
WHERE NOT EXISTS (
    SELECT 1
    FROM products
    WHERE products.name = sample.name
)
-- Insert in the order listed above, so product IDs are predictable
-- on a fresh table (HP Laptop gets product_id 1, and so on).
ORDER BY sample.sort_order;

-- Show what is now in the table.
SELECT * FROM products ORDER BY product_id ASC;
