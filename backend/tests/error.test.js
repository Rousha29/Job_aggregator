import request from 'supertest';
import express from 'express';
import { AppError } from '../src/errors/AppError.js';
import { errorMiddleware } from '../src/middlewares/error.middleware.js';

// Mini app de test avec deux routes qui déclenchent des erreurs
const app = express();

app.get('/test-app-error', (req, res, next) => {
  next(new AppError(404, 'Not found'));
});

app.get('/test-generic-error', (req, res, next) => {
  next(new Error('Something crashed'));
});

app.use(errorMiddleware);

// Tests
describe('Error Middleware', () => {
  it('AppError → renvoie le bon status et message', async () => {
    const res = await request(app).get('/test-app-error');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Not found');
  });

  it('Erreur générique → renvoie 500 avec message générique', async () => {
    const res = await request(app).get('/test-generic-error');
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Erreur interne du serveur');
  });
});
