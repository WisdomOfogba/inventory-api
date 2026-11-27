// =============================================================
// src/server.ts
// The starting point of the application.
//
// 1. Creates the Express app.
// 2. Registers the routes (/health and /api/products).
// 3. Checks the database connection.
// 4. Starts listening for HTTP requests.
// =============================================================

import express, { Request, Response, NextFunction } from 'express';
import { pool, checkDatabaseConnection } from './db'; // importing db.ts also loads .env
import productsRouter from './products';

const app = express();

// Read the port from .env, or use 5000 if PORT is not set.
const PORT = Number(process.env.PORT) || 5000;

// Allow Express to read JSON request bodies.
// After this, a JSON body like {"name":"HP Laptop"} is available as req.body.
app.use(express.json());

// -------------------------------------------------------------
// Health check: GET /health
// A quick way to confirm that the API is running.
// It deliberately does NOT return any database details.
// -------------------------------------------------------------
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Inventory API is running',
  });
});

// All product routes live in products.ts and start with /api/products.
app.use('/api/products', productsRouter);

// -------------------------------------------------------------
// Any other URL that did not match a route above -> 404.
// -------------------------------------------------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} was not found.` });
});

// -------------------------------------------------------------
// Error handler (Express recognises it because it has 4 parameters).
// The most common case for beginners is sending invalid JSON,
// e.g. a missing quote or a trailing comma in Postman.
// -------------------------------------------------------------
app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body contains invalid JSON.' });
  }

  console.error('Unexpected error:', error);
  return res.status(500).json({ error: 'An unexpected server error occurred.' });
});

// -------------------------------------------------------------
// Start the server - but only after the database check succeeds.
// -------------------------------------------------------------
async function startServer(): Promise<void> {
  try {
    await checkDatabaseConnection();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Could not connect to PostgreSQL:', message);
    console.error('Check that PostgreSQL is running and that DATABASE_URL in your .env file is correct.');
    await pool.end();
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Inventory API is running at http://localhost:${PORT}`);
    console.log(`Try: http://localhost:${PORT}/health`);
  });

  // For example, another program is already using the same port.
  server.on('error', async (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other program or change PORT in your .env file.`);
    } else {
      console.error('Server failed to start:', error.message);
    }
    await pool.end();
    process.exit(1);
  });
}

startServer();
