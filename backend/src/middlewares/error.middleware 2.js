import { AppError } from '../errors/AppError.js';

export const errorMiddleware = (err, req, res, next) => {
  console.error(`[Erreur] ${req.method} ${req.url} →`, err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.code && { code: err.code })
    });
  }

  const isDev = process.env.NODE_ENV !== 'production';

  return res.status(500).json({
    error: 'Erreur interne du serveur',
    ...(isDev && { stack: err.stack })
  });
};
