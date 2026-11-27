// =============================================================
// src/db.ts
// Sets up ONE shared PostgreSQL connection pool for the whole app.
//
// Other files import `pool` from here and call `pool.query(...)`
// to run SQL. We never create a new connection for each request;
// the pool hands out existing connections and takes them back.
// =============================================================

import dotenv from 'dotenv';
import { Pool, types } from 'pg';

// Load the variables in the .env file into process.env.
// After this line, process.env.DATABASE_URL and process.env.PORT
// contain the values you typed into your .env file.
dotenv.config();

// Read the connection string, for example:
// postgresql://postgres:YOUR_PASSWORD@localhost:5432/InventoryDB
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Stop immediately with a helpful message instead of failing later
  // with a confusing error. We do NOT print the connection string
  // because it contains your password.
  console.error('ERROR: DATABASE_URL is not set.');
  console.error('Copy .env.example to .env and enter your PostgreSQL password.');
  process.exit(1);
}

// PostgreSQL NUMERIC values (our "price" column) are returned by the
// pg driver as strings, e.g. "450000.00", so that no precision is lost.
// For this workshop we convert them to normal JavaScript numbers so the
// API returns "price": 450000 instead of "price": "450000.00".
// (In real financial systems you would keep them as strings or use a
// decimal library, because JavaScript numbers are floating point.)
types.setTypeParser(types.builtins.NUMERIC, (value: string) => parseFloat(value));

// Create the connection pool.
// A pool keeps a small number of database connections open and reuses
// them, which is much faster than opening a new connection every time.
export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10, // at most 10 connections open at the same time
  idleTimeoutMillis: 30000, // close a connection after 30s of not being used
  connectionTimeoutMillis: 5000, // give up if connecting takes longer than 5s
});

// If a connection that is sitting idle in the pool breaks (for example,
// PostgreSQL is restarted), the pool emits an "error" event. Without this
// handler, Node.js would crash the whole application.
pool.on('error', (error: Error) => {
  console.error('Unexpected error on an idle PostgreSQL connection:', error.message);
});

// Checks that we can actually reach the database.
// server.ts calls this once at startup, BEFORE announcing that the API
// is running. If it fails, the error is thrown back to server.ts.
export async function checkDatabaseConnection(): Promise<void> {
  const result = await pool.query('SELECT current_database() AS database_name');
  console.log(`Connected to PostgreSQL database "${result.rows[0].database_name}"`);
}
