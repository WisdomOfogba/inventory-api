# Inventory Management API (Workshop Project)

A simple, beginner-friendly **REST API** for managing products in an inventory.
It lets you **create, read, update and delete** (CRUD) product records stored in a **PostgreSQL** database.

The project is built with **Node.js**, **Express**, **TypeScript** and the **`pg`** PostgreSQL driver.
It uses **raw SQL** (no ORM such as Prisma or Sequelize), so you can see exactly which SQL query runs for every API request.

---

## Table of Contents

1. [What You Will Learn](#1-what-you-will-learn)
2. [Project Structure](#2-project-structure)
3. [Prerequisites](#3-prerequisites)
4. [Clone the Repository](#4-clone-the-repository)
5. [Install Dependencies](#5-install-dependencies)
6. [Create the Database](#6-create-the-database)
7. [Create the products Table](#7-create-the-products-table)
8. [Seed Sample Data](#8-seed-sample-data)
9. [Configure Environment Variables](#9-configure-environment-variables)
10. [Run the Application](#10-run-the-application)
11. [Build for Production](#11-build-for-production)
12. [API Endpoints](#12-api-endpoints)
13. [Test with Postman](#13-test-with-postman)
14. [Verify Changes in the Database](#14-verify-changes-in-the-database)
15. [Understanding the Database Table](#15-understanding-the-database-table)
16. [Learning Notes](#16-learning-notes)
17. [Troubleshooting](#17-troubleshooting)

---

## 1. What You Will Learn

- Connecting a Node.js application to PostgreSQL
- Configuring environment variables with a `.env` file
- Creating and using a PostgreSQL **connection pool**
- Running SQL queries from TypeScript with `pool.query()`
- Writing **parameterized queries** (and why they prevent SQL injection)
- Building REST API endpoints with Express
- Performing CRUD operations
- Handling errors and returning the right **HTTP status codes**
- Testing endpoints with **Postman**

---

## 2. Project Structure

```
inventory-api/
│
├── src/
│   ├── server.ts         # Starts the Express app, registers routes, checks the database
│   ├── db.ts             # Creates the shared PostgreSQL connection pool
│   └── products.ts       # All product routes (CRUD) and their SQL queries
│
├── .env.example          # Template for your .env file (no real password!)
├── .gitignore            # Files Git should ignore (node_modules, dist, .env ...)
├── package.json          # Project info, scripts and dependencies
├── package-lock.json     # Exact dependency versions (keeps installs consistent)
├── tsconfig.json         # TypeScript compiler settings
├── schema.sql            # SQL that creates the products table
├── seed.sql              # SQL that inserts 5 sample products
├── postman_collection.json  # Ready-made Postman requests
└── README.md             # This file
```

When you run `npm run build`, TypeScript creates a `dist/` folder with the compiled JavaScript. You never edit `dist/` by hand, and it is not committed to Git.

---

## 3. Prerequisites

Install the following tools before you start:

| Tool | Why you need it | Download |
|------|-----------------|----------|
| **Node.js** (version 18 or newer, LTS recommended) | Runs the JavaScript/TypeScript application | https://nodejs.org |
| **npm** | Installs packages. It is included with Node.js | (comes with Node.js) |
| **PostgreSQL** (version 13 or newer) | The relational database that stores the products | https://www.postgresql.org/download/ |
| **pgAdmin 4** | A graphical tool to manage PostgreSQL and run SQL | Usually included with the PostgreSQL installer, or https://www.pgadmin.org |
| **Git** | Downloads (clones) the project | https://git-scm.com |
| **VS Code** | Code editor | https://code.visualstudio.com |
| **Postman** | Sends test requests to the API | https://www.postman.com/downloads/ |

> **Remember your PostgreSQL password!** The PostgreSQL installer asks you to choose a password for the `postgres` user. You will need it later.

Check that Node.js, npm and Git are installed by opening a terminal (PowerShell on Windows, Terminal on macOS/Linux) and running:

```bash
node -v
npm -v
git --version
```

Each command should print a version number.

---

## 4. Clone the Repository

Replace the URL below with the real repository URL given to you by your instructor:

```bash
git clone https://github.com/YOUR-USERNAME/inventory-api.git
cd inventory-api
```

Open the folder in VS Code:

```bash
code .
```

(If `code .` does not work, open VS Code and use **File > Open Folder...** instead.)

---

## 5. Install Dependencies

Inside the `inventory-api` folder, run:

```bash
npm install
```

This reads `package.json` and downloads all required packages into a `node_modules` folder:

| Package | Purpose |
|---------|---------|
| `express` | Web framework for creating the API routes |
| `pg` | PostgreSQL driver: lets Node.js talk to PostgreSQL |
| `dotenv` | Loads settings from the `.env` file |
| `typescript` | The TypeScript compiler (`tsc`) |
| `tsx` | Runs TypeScript directly during development and restarts on changes |
| `@types/...` | Type definitions so TypeScript understands Express, pg and Node.js |

---

## 6. Create the Database

The database must be called **`InventoryDB`**.

### Option A: Using pgAdmin 4 (recommended for beginners)

1. Open **pgAdmin 4**.
2. In the left panel, expand **Servers** and click your PostgreSQL server (for example *PostgreSQL 16*). Enter your password if asked.
3. Right-click **Databases** > **Create** > **Database...**
4. In **Database**, type exactly: `InventoryDB`
5. Leave **Owner** as `postgres` and click **Save**.

### Option B: Using SQL

Open the Query Tool on the default `postgres` database (right-click **postgres** > **Query Tool**) and run:

```sql
CREATE DATABASE "InventoryDB";
```

### Important: database names and capital letters

PostgreSQL converts unquoted names to lowercase. That means:

- `CREATE DATABASE InventoryDB;` (no quotes) actually creates a database called `inventorydb`.
- `CREATE DATABASE "InventoryDB";` (with double quotes) creates a database called exactly `InventoryDB`.

pgAdmin keeps the name exactly as you typed it, so Option A also creates `InventoryDB`.

Whatever name you end up with, you **must use exactly the same name** (same capital letters) at the end of `DATABASE_URL` in your `.env` file (see Step 9). If they do not match, you will get the error `database "..." does not exist`.

---

## 7. Create the products Table

1. In pgAdmin, expand **Databases** and click **InventoryDB**.
2. Right-click **InventoryDB** > **Query Tool**.
   (Make sure the Query Tool tab title says `InventoryDB`, not `postgres`!)
3. Click the **Open File** icon (folder icon) and select `schema.sql` from the project folder.
   Or open `schema.sql` in VS Code, copy everything and paste it into the Query Tool.
4. Click **Execute** (the ▶ play button) or press **F5**.
5. You should see `CREATE TABLE` in the Messages panel.

To see the table: expand **InventoryDB > Schemas > public > Tables** (right-click **Tables** > **Refresh** if it does not appear).

`schema.sql` uses `CREATE TABLE IF NOT EXISTS`, so running it again is safe.

---

## 8. Seed Sample Data

1. In the same Query Tool (connected to **InventoryDB**), open or paste the contents of `seed.sql`.
2. Click **Execute** / press **F5**.
3. The result panel shows the five sample products.

`seed.sql` is **safe to run more than once**. It only inserts a sample product if a product with the same name does not already exist, so running it again will not create duplicates.

Optional, using the command line instead of pgAdmin (if `psql` is on your PATH):

```bash
psql -U postgres -d InventoryDB -f schema.sql
psql -U postgres -d InventoryDB -f seed.sql
```

---

## 9. Configure Environment Variables

The application reads its settings from a file called `.env`. This file contains your **password**, so it is listed in `.gitignore` and must **never** be committed to Git or shared.

### Step 1: Copy `.env.example` to `.env`

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
```

**Windows (Command Prompt):**

```cmd
copy .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

(You can also copy the file in VS Code: right-click `.env.example` > Copy, paste it, then rename the copy to `.env`.)

### Step 2: Edit `.env`

Open `.env` in VS Code. It looks like this:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/InventoryDB
```

Replace `YOUR_PASSWORD` with **your own** PostgreSQL password and save the file.

### Step 3: Check every part of DATABASE_URL

```
postgresql://postgres:YOUR_PASSWORD@localhost:5432/InventoryDB
             ───┬───  ──────┬──────  ───┬───── ─┬── ─────┬─────
              user       password      host    port   database name
```

| Part | Default | Check |
|------|---------|-------|
| user | `postgres` | The PostgreSQL user you log in with |
| password | — | The password you chose when installing PostgreSQL |
| host | `localhost` | PostgreSQL is running on your own computer |
| port | `5432` | The PostgreSQL port. In pgAdmin: right-click your server > **Properties** > **Connection** |
| database | `InventoryDB` | Must match the database name **exactly**, including capital letters |

> **Special characters in your password:** if your password contains characters such as `@`, `#`, `/`, `:` or `%`, they must be URL-encoded in `DATABASE_URL`. For example `@` becomes `%40`, `#` becomes `%23`. A password of `my@pass` is written as `my%40pass`.

`PORT=5000` is the port the API listens on. If you remove it, the API still uses **5000** by default.

---

## 10. Run the Application

```bash
npm run dev
```

If everything is set up correctly, you will see:

```
Connected to PostgreSQL database "InventoryDB"
Inventory API is running at http://localhost:5000
Try: http://localhost:5000/health
```

Open http://localhost:5000/health in your browser. You should see:

```json
{ "status": "ok", "message": "Inventory API is running" }
```

`npm run dev` uses `tsx watch`, which **automatically restarts** the server every time you save a `.ts` file. Press **Ctrl + C** in the terminal to stop it.

If the database connection fails, the server prints a clear error and stops instead of starting. See [Troubleshooting](#17-troubleshooting).

---

## 11. Build for Production

```bash
npm run build
npm start
```

- `npm run build` runs the TypeScript compiler (`tsc`), which converts `src/*.ts` into JavaScript files in `dist/`.
- `npm start` runs the compiled app with `node dist/server.js`.

| Script | Command it runs | Use it when |
|--------|-----------------|-------------|
| `npm run dev` | `tsx watch src/server.ts` | Developing (auto-restart on save) |
| `npm run build` | `tsc` | Compiling TypeScript to JavaScript |
| `npm start` | `node dist/server.js` | Running the compiled app |

---

## 12. API Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Description | Success code |
|--------|----------|-------------|--------------|
| GET | `/health` | Check the API is running | 200 |
| POST | `/api/products` | Create a product | 201 |
| GET | `/api/products` | Get all products | 200 |
| GET | `/api/products/:id` | Get one product | 200 |
| PUT | `/api/products/:id` | Update a product (all fields required) | 200 |
| DELETE | `/api/products/:id` | Delete a product | 200 |

### Create a product

`POST /api/products`

Request body:

```json
{
  "name": "HP Laptop",
  "price": 450000,
  "quantity": 10
}
```

Response **201 Created**:

```json
{
  "product_id": 6,
  "name": "HP Laptop",
  "price": 450000,
  "quantity": 10,
  "created_at": "2026-01-15T09:30:00.000Z",
  "updated_at": "2026-01-15T09:30:00.000Z"
}
```

SQL that runs:

```sql
INSERT INTO products (name, price, quantity)
VALUES ($1, $2, $3)
RETURNING *;
```

### Get all products

`GET /api/products` returns **200 OK** with an array of products (an empty array `[]` if the table is empty).

```sql
SELECT * FROM products ORDER BY product_id ASC;
```

### Get one product

`GET /api/products/1` returns **200 OK** with the product, **400** if the ID is not a positive whole number, or **404** if no product has that ID.

```sql
SELECT * FROM products WHERE product_id = $1;
```

### Update a product

`PUT /api/products/1` replaces **all** product fields, so `name`, `price` and `quantity` are all required:

```json
{
  "name": "HP Laptop 15",
  "price": 430000,
  "quantity": 8
}
```

Returns **200 OK** with the updated product (notice `updated_at` changes), **400** for invalid input or **404** if the product does not exist.

```sql
UPDATE products
SET
    name = $1,
    price = $2,
    quantity = $3,
    updated_at = CURRENT_TIMESTAMP
WHERE product_id = $4
RETURNING *;
```

### Delete a product

`DELETE /api/products/1` returns **200 OK**:

```json
{
  "message": "Product with ID 1 was deleted successfully.",
  "product": { "product_id": 1, "name": "HP Laptop", "...": "..." }
}
```

Returns **400** for an invalid ID or **404** if the product does not exist.

```sql
DELETE FROM products WHERE product_id = $1 RETURNING *;
```

### Validation rules

| Field | Rule |
|-------|------|
| `name` | Required, text, not empty, at most 100 characters (spaces at the start/end are removed) |
| `price` | Required, a JSON **number** (not text like `"450000"`), 0 or more, at most 99,999,999.99. Stored with 2 decimal places |
| `quantity` | Required, a whole number, 0 or more |
| `:id` (in the URL) | A positive whole number, e.g. `1`, `25` |

### Error responses

Every error uses the same JSON shape:

```json
{ "error": "price cannot be negative." }
```

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Product found, updated or deleted |
| 201 | Created | Product created |
| 400 | Bad Request | Missing field, negative price, invalid ID, invalid JSON |
| 404 | Not Found | No product with that ID, or unknown URL |
| 500 | Internal Server Error | Something unexpected, e.g. the database stopped. Details are logged in the terminal, not sent to the client |

### A note about `price`

PostgreSQL `NUMERIC` values are normally returned by the `pg` driver as **strings** (e.g. `"450000.00"`) to avoid losing precision. In `src/db.ts` we tell `pg` to convert them into JavaScript numbers, so the API returns `"price": 450000`. This keeps the workshop simple. Real financial systems usually keep money values as strings or use a decimal library, because JavaScript numbers are floating point.

---

## 13. Test with Postman

### Import the collection

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag in `postman_collection.json` from the project folder (or click **files** and select it).
4. A collection called **Inventory Management API Workshop** appears in the left sidebar.

### Run the requests

Make sure the API is running (`npm run dev`), then click each request and press **Send**, **in this order**:

| # | Request | Expected result |
|---|---------|-----------------|
| 1 | Health Check | 200, `"status": "ok"` |
| 2 | Create Product | 201, the new product. **Its ID is saved automatically** |
| 3 | Get All Products | 200, list including your new product |
| 4 | Get Product By ID | 200, the product created in step 2 |
| 5 | Update Product | 200, the product with new values and a new `updated_at` |
| 6 | Delete Product | 200, a success message and the deleted product |
| 7 | Invalid Product ID | 400, uses ID `abc` |
| 8 | Non-existent Product | 404, uses ID `999999` |

### How the product ID is reused

The collection has two **collection variables** (click the collection name > **Variables** tab):

- `baseUrl` = `http://localhost:5000`. Change it if your API runs on another port.
- `productId`. It is empty at first. Request **2. Create Product** has a script (in its **Scripts > Post-response** tab, called **Tests** in older Postman versions) that saves the new `product_id` into this variable. Requests 4, 5 and 6 use it in their URL as `{{productId}}`.

So always run **2. Create Product** before 4, 5 and 6. If you run **6. Delete Product** twice, the second time returns **404** because the product is already gone. Run **2** again to create a fresh one.

Each request also contains small automatic tests. After you press **Send**, open the **Test Results** tab at the bottom to see whether they passed. You can run all 8 requests at once with the collection's **Run** button.

### Try your own invalid requests

Open **2. Create Product**, change the body and send it again:

```json
{ "name": "", "price": 100, "quantity": 1 }       // 400: name must be a non-empty string
{ "name": "Pen", "price": -5, "quantity": 1 }     // 400: price cannot be negative
{ "name": "Pen", "price": 100, "quantity": 2.5 }  // 400: quantity must be a whole number
{ "name": "Pen", "price": 100 }                   // 400: quantity is required
```

(Postman does not allow `//` comments inside a JSON body. They are only here to explain each example.)

---

## 14. Verify Changes in the Database

The API and pgAdmin look at the **same** database, so every change you make through Postman is visible in pgAdmin.

In pgAdmin, open the Query Tool on **InventoryDB** and run:

```sql
SELECT * FROM products;
```

Try this:

1. Create a product in Postman, then run the query above. The new row is there.
2. Update it in Postman and run the query again. `name`, `price`, `quantity` and `updated_at` have changed.
3. Delete it in Postman and run the query again. The row is gone.

You can also right-click the **products** table > **View/Edit Data** > **All Rows**.

---

## 15. Understanding the Database Table

```sql
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### What is a primary key?

A **primary key** is a column whose value **uniquely identifies each row**. No two products can have the same `product_id`, and it can never be empty (NULL). When the API receives `GET /api/products/3`, it uses the primary key to find exactly one product. PostgreSQL also creates an index on the primary key, which makes these lookups fast.

### Why is product_id generated automatically?

`SERIAL` tells PostgreSQL to create a **sequence**, a counter that gives each new row the next number (1, 2, 3, ...). This means:

- The client never has to choose an ID, so two users cannot accidentally pick the same one.
- That is why the POST body only contains `name`, `price` and `quantity`.
- `RETURNING *` in the INSERT query sends back the generated `product_id`.

Note: IDs are **not reused**. If you delete product 6, the next product gets 7, not 6. This is normal.

### Why can't name be empty?

`NOT NULL` means every product **must** have a name. A product with no name would be useless in an inventory. `VARCHAR(100)` limits the name to 100 characters. The API also rejects names that are empty or only spaces (`""` or `"   "`) before they reach the database.

### Why do price and quantity have constraints?

- `NUMERIC(10, 2)` stores exact decimal numbers with up to 10 digits in total, 2 of them after the decimal point (max 99,999,999.99). `NUMERIC` is exact, which matters for money.
- `CHECK (price >= 0)`: a product cannot cost a negative amount.
- `CHECK (quantity >= 0)`: you cannot have fewer than zero items in stock.
- `INTEGER` means quantity is a whole number (you cannot have 2.5 laptops).
- `DEFAULT 0`: if no quantity is given in an INSERT, it becomes 0.

These rules live **in the database**, so the data stays correct even if someone inserts rows with pgAdmin or another program. The API checks the same rules first so it can return friendly `400` error messages.

### What do the timestamp columns represent?

- `created_at`: when the product was **first inserted**. It is set automatically by `DEFAULT CURRENT_TIMESTAMP` and never changes.
- `updated_at`: when the product was **last changed**. It starts equal to `created_at`, and our UPDATE query sets it to `CURRENT_TIMESTAMP` every time the product is updated.
- `TIMESTAMPTZ` means "timestamp with time zone". PostgreSQL stores the exact moment in time, and the API returns it in UTC (the `Z` at the end of `"2026-01-15T09:30:00.000Z"`).

---

## 16. Learning Notes

### How the three TypeScript files work together

```
 Postman / Browser
        │  HTTP request (e.g. GET /api/products/1)
        ▼
 ┌──────────────┐   app.use('/api/products', productsRouter)
 │  server.ts   │ ─────────────────────────────────────────────┐
 └──────────────┘                                              ▼
   - creates the Express app                           ┌───────────────┐
   - parses JSON bodies                                │  products.ts  │
   - /health route                                     └───────────────┘
   - checks the DB, then starts listening                - validates input
                                                         - runs SQL with pool.query()
                                                         - sends JSON + status code
                                                               │
                                                               ▼
                                                       ┌───────────────┐
                                                       │     db.ts     │
                                                       └───────────────┘
                                                         - loads .env
                                                         - creates ONE connection pool
                                                               │
                                                               ▼
                                                         PostgreSQL (InventoryDB)
```

1. **`db.ts`** loads `.env`, reads `DATABASE_URL` and creates a single shared connection pool. It exports `pool` and a `checkDatabaseConnection()` function.
2. **`products.ts`** imports `pool` and defines the five CRUD routes. Each route validates the input, runs one SQL query and sends back JSON with a status code.
3. **`server.ts`** creates the Express app, turns on JSON parsing, adds `/health`, connects the products router at `/api/products`, checks the database connection and only then starts listening on the port.

### What is a connection pool?

Opening a new database connection is slow: the client has to connect over the network, log in and set up a session. A **connection pool** opens a few connections and **keeps them ready**. When a request needs the database, it borrows a connection from the pool, runs its query and gives it back.

Without a pool, 100 requests would open 100 connections. With our pool (`max: 10`), at most 10 connections are used and reused. This is faster, and it protects PostgreSQL from too many connections.

That is why `db.ts` creates the pool **once**, and every route imports the same `pool`.

### What does `pool.query()` do?

```ts
const result = await pool.query('SELECT * FROM products WHERE product_id = $1', [productId]);
```

`pool.query()`:

1. borrows a connection from the pool,
2. sends the SQL and the values to PostgreSQL,
3. waits for the answer (that is why we use `await`),
4. returns the connection to the pool,
5. gives you a `result` object.

The most useful part of `result` is **`result.rows`**, an array of JavaScript objects (one per row) whose keys are the column names (`product_id`, `name`, `price`, ...). `result.rowCount` tells you how many rows were affected.

If the query fails (e.g. the database is down), `pool.query()` throws an error. That is why each route has a `try { ... } catch (error) { ... }` block that logs the details on the server and returns a general `500` message to the client.

### What are parameterized queries?

A parameterized query keeps the **SQL code** and the **user's data** separate:

```ts
// ✅ CORRECT: parameterized query
await pool.query('SELECT * FROM products WHERE product_id = $1', [id]);
```

`$1`, `$2`, ... are **placeholders**. The values go in a separate array. PostgreSQL receives the SQL and the values separately and **always treats the values as data**, never as SQL code.

```ts
// ❌ WRONG: never build SQL by inserting user input into the string
await pool.query(`SELECT * FROM products WHERE product_id = ${id}`);
```

### Why parameterized queries prevent SQL injection

**SQL injection** is an attack where a user sends input that is actually SQL code. Imagine the wrong version above with this input as `id`:

```
1; DROP TABLE products;
```

The string would become:

```sql
SELECT * FROM products WHERE product_id = 1; DROP TABLE products;
```

The database would run **both** statements and delete the whole table.

With a parameterized query, PostgreSQL treats the entire input as one value. It would just look for a product whose ID equals that strange text, and nothing dangerous happens. In this project, if someone creates a product with the name `x'); DROP TABLE products; --`, it is simply stored as a product called `x'); DROP TABLE products; --`.

**Rule:** every value that comes from a user (URL, body, query string) must go through a placeholder. Every query in `src/products.ts` follows this rule.

### How CRUD maps to HTTP methods and SQL

| CRUD operation | HTTP method | Endpoint | SQL statement | Success code |
|----------------|-------------|----------|---------------|--------------|
| **C**reate | POST | `/api/products` | `INSERT` | 201 Created |
| **R**ead (all) | GET | `/api/products` | `SELECT` | 200 OK |
| **R**ead (one) | GET | `/api/products/:id` | `SELECT ... WHERE` | 200 OK |
| **U**pdate | PUT | `/api/products/:id` | `UPDATE ... WHERE` | 200 OK |
| **D**elete | DELETE | `/api/products/:id` | `DELETE ... WHERE` | 200 OK |

`PUT` means "replace the whole resource", which is why all three fields are required. (A partial update would normally use `PATCH`, which this project does not include.)

### Why database credentials must remain private

Your `DATABASE_URL` contains your database **password**. Anyone who has it can read, change or delete all of your data. So:

- Keep it in `.env`, which is listed in `.gitignore` so Git never commits it.
- Commit `.env.example` instead. It shows the format with a placeholder password.
- Never paste your real `.env` into chat groups, screenshots or forums.
- The app never prints `DATABASE_URL`, and the `/health` endpoint and error responses never reveal database details.
- If you ever commit a password by accident, **change the password** in PostgreSQL. Deleting the file afterwards is not enough, because it stays in the Git history.

Check what Git will commit with `git status`. `.env` should **not** appear in the list.

---

## 17. Troubleshooting

When the app cannot start, it prints the reason in the terminal. Find the message below.

### PostgreSQL is not running

```
Could not connect to PostgreSQL: connect ECONNREFUSED 127.0.0.1:5432
```

The PostgreSQL server is not running (or is on another port).

- **Windows:** press `Win + R`, type `services.msc`, find **postgresql-x64-16** (your version number may differ), right-click > **Start**.
- **macOS (Homebrew):** `brew services start postgresql@16`
- **macOS (Postgres.app):** open Postgres.app and click **Start**.
- **Linux:** `sudo systemctl start postgresql`

If PostgreSQL uses another port, update the port in `DATABASE_URL`.

### Incorrect password

```
Could not connect to PostgreSQL: password authentication failed for user "postgres"
```

The password in `.env` is wrong. Check that it is the same password you use to log in to pgAdmin, that you replaced `YOUR_PASSWORD` completely, and that special characters are URL-encoded (see Step 9). Save `.env` and restart the app.

### Database does not exist

```
Could not connect to PostgreSQL: database "inventorydb" does not exist
```

Either you have not created the database yet (Step 6), or the name in `DATABASE_URL` does not match exactly. Check the capital letters: `InventoryDB` and `inventorydb` are different names. In pgAdmin, look at the exact name under **Databases**.

### `relation "products" does not exist`

The API starts, but requests return `500` and the terminal shows `relation "products" does not exist`. You have not run `schema.sql`, or you ran it while connected to the wrong database (e.g. `postgres`). Run `schema.sql` in the Query Tool of **InventoryDB** (Step 7).

### Port 5000 is already in use

```
Port 5000 is already in use. Stop the other program or change PORT in your .env file.
```

Another program (maybe another copy of this API in a different terminal) is using port 5000.

- Stop the other terminal with **Ctrl + C**, or
- Change `PORT=5001` in `.env`, restart, and set `baseUrl` in Postman to `http://localhost:5001`.

> **macOS note:** the AirPlay Receiver often uses port 5000. Turn it off in **System Settings > General > AirDrop & Handoff**, or use another port.

To find what is using the port:

- **Windows (PowerShell):** `netstat -ano | findstr :5000`
- **macOS / Linux:** `lsof -i :5000`

### npm dependencies have not been installed

```
'tsx' is not recognized as an internal or external command
sh: tsx: command not found
Cannot find module 'express'
```

Run `npm install` in the project folder (the folder that contains `package.json`) and try again.

### `npm start` fails with `Cannot find module '.../dist/server.js'`

You need to compile first: run `npm run build`, then `npm start`. (For development, use `npm run dev`, which needs no build.)

### `DATABASE_URL is not set`

```
ERROR: DATABASE_URL is not set.
```

The `.env` file is missing, empty or has the wrong name. Make sure it is called exactly `.env` (not `.env.txt` or `env`) and sits in the project root next to `package.json`. On Windows, enable **View > File name extensions** in File Explorer to see the real name.

### Invalid request body

```json
{ "error": "Request body contains invalid JSON." }
```

The JSON in Postman has a syntax error. Common mistakes: a trailing comma (`"quantity": 10,}`), single quotes instead of double quotes, or missing quotes around field names.

```json
{ "error": "price must be a valid number, for example 450000 or 199.99." }
```

The JSON is valid but a value is wrong. Read the message: it tells you which field to fix. Also check that in Postman you selected **Body > raw > JSON** (this sets the `Content-Type: application/json` header). If the body is sent as *Text*, the API cannot read it and reports `name is required.`

### API cannot connect to PostgreSQL

If you see `Could not connect to PostgreSQL: ...`, check these in order:

1. Is PostgreSQL running? (Can you connect with pgAdmin?)
2. Does `.env` exist in the project root, and is it saved?
3. Is the password correct?
4. Is the port correct (usually `5432`)?
5. Does the database name match exactly (`InventoryDB`)?
6. Did you restart the app after changing `.env`? (`tsx watch` only restarts when `.ts` files change, so press **Ctrl + C** and run `npm run dev` again.)

### Requests return 500 after the app was running fine

PostgreSQL probably stopped. The terminal running the API shows the detailed error. Start PostgreSQL again, and the next request will work. You don't need to restart the API, because the pool reconnects automatically.

---

Happy coding! 🎉
