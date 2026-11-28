import { pool, checkDatabaseConnection } from './config/db';
import app from './app';

const PORT = Number(process.env.PORT) || 5000;

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
