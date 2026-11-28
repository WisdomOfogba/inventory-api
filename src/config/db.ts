import dotenv from 'dotenv';
import { Pool, types } from 'pg';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('ERROR: DATABASE_URL is not set.');
  console.error('Copy .env.example to .env and enter your PostgreSQL password.');
  process.exit(1);
}

types.setTypeParser(types.builtins.NUMERIC, (value: string) => parseFloat(value));

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (error: Error) => {
  console.error('Unexpected error on an idle PostgreSQL connection:', error.message);
});

export async function checkDatabaseConnection(): Promise<void> {
  const result = await pool.query('SELECT current_database() AS database_name');
  console.log(`Connected to PostgreSQL database "${result.rows[0].database_name}"`);
}
