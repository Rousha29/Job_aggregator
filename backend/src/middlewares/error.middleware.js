export const errorMiddleware = (err, req, res, next) => {

  console.error(`[Erreur] ${req.method} ${req.url} →`, err.message);

  const isDev = process.env.NODE_ENV !== 'production';

  const status = err.status || 500;

  return res.status(status).json({
    error: err.message || 'Erreur interne du serveur',
    // La stack technique n'est visible qu'en développement
    ...(isDev && { stack: err.stack }),
  });
};