import { Request, Response, NextFunction } from 'express';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} was not found.` });
}

export function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction) {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body contains invalid JSON.' });
  }

  console.error('Unexpected error:', error);
  return res.status(500).json({ error: 'An unexpected server error occurred.' });
}
