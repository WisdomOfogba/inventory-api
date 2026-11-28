import express, { Request, Response } from 'express';
import productRoutes from './routes/productRoutes';
import { notFound, errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Inventory API is running',
  });
});

app.use('/api/products', productRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
