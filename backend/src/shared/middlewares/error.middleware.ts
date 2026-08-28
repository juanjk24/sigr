import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/response';

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `Ruta ${req.originalUrl} no encontrada` });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, error: err.message });
  }

  if (err instanceof Error) {
    return res.status(500).json({ success: false, error: err.message });
  }

  return res.status(500).json({ success: false, error: 'Error interno del servidor' });
};
