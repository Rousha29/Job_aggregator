import { jest } from '@jest/globals';
import request from 'supertest';

jest.unstable_mockModule('node-cron', () => ({
  default: {
    schedule: jest.fn(() => ({ stop: jest.fn(), start: jest.fn() })),
  }
}));

jest.unstable_mockModule('../src/config/db.js', () => ({
  default: {
    query: jest.fn().mockResolvedValue({ rows: [] }),
  },
}));

const mockJwt = { sign: jest.fn(), verify: jest.fn() };
jest.unstable_mockModule('jsonwebtoken', () => ({ default: mockJwt, ...mockJwt }));

const mockBcrypt = { hash: jest.fn(), compare: jest.fn() };
jest.unstable_mockModule('bcrypt', () => ({ default: mockBcrypt, ...mockBcrypt }));

jest.unstable_mockModule('../src/services/hibp.js', () => ({
  checkPassword: jest.fn().mockResolvedValue(0)
}));

jest.unstable_mockModule('axios', () => ({
  default: { get: jest.fn(), post: jest.fn() }
}));

jest.unstable_mockModule('../src/controllers/import.controller.js', () => ({
  importOffers: jest.fn((req, res) => res.json({ success: true })),
  importLocalJSON: jest.fn((req, res) => res.json({ success: true }))
}));

const { default: pool } = await import('../src/config/db.js');
const { default: app } = await import('../src/app.js');
const { default: jwt } = await import('jsonwebtoken');
const { default: bcrypt } = await import('bcrypt');

describe('Security', () => {
  beforeEach(() => jest.clearAllMocks());

  // SEC-002 — Validation des entrées
  describe('SEC-002 — Validation des entrées', () => {
    it('bloque un mot de passe trop court (< 8 caractères)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nom: 'U', prenom: 'T', mail: 'u@t.com', password: 'court', confirmation: 'court' });
      expect(res.statusCode).toBe(400);
    });

    it('bloque un email mal formé', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nom: 'U', prenom: 'T', mail: 'pas-un-email', password: 'securepass', confirmation: 'securepass' });
      expect(res.statusCode).toBe(400);
    });

    it('ignore le champ role envoyé dans le body (pas d\'escalade de privilège)', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 'role-uuid' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'user-uuid', email: 'u@t.com', full_name: 'U T' }] });
      bcrypt.hash.mockResolvedValue('hashed');

      const res = await request(app)
        .post('/api/auth/register')
        .send({ nom: 'U', prenom: 'T', mail: 'u@t.com', password: 'securepass', confirmation: 'securepass', role: 'admin' });
      expect(res.statusCode).toBe(201);
    });
  });

  // SEC-008 — Auth requise sur les routes protégées
  describe('SEC-008 — Authentification requise', () => {
    it('retourne 401 sur /api/users/me sans token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.statusCode).toBe(401);
    });

    it('retourne 401 sur /api/offers/jobs sans token', async () => {
      const res = await request(app).get('/api/offers/jobs');
      expect(res.statusCode).toBe(401);
    });

    it('retourne 401 sur /api/favorites sans token', async () => {
      const res = await request(app).get('/api/favorites');
      expect(res.statusCode).toBe(401);
    });
  });

  // SEC-013 — Validation des filtres (actif après merge de feature/sec-013-v2)
  describe('SEC-013 — Validation des filtres', () => {
    beforeEach(() => {
      jwt.verify.mockReturnValue({ id: 'u', email: 'u@t.com', role: 'user' });
    });

    it('rejette size > 50', async () => {
      const res = await request(app)
        .get('/api/offers/jobs?size=999999')
        .set('Cookie', ['token=valid']);
      expect(res.statusCode).toBe(400);
    });

    it('rejette page négative', async () => {
      const res = await request(app)
        .get('/api/offers/jobs?page=-1')
        .set('Cookie', ['token=valid']);
      expect(res.statusCode).toBe(400);
    });

    it('rejette q de plus de 100 caractères', async () => {
      const res = await request(app)
        .get(`/api/offers/jobs?q=${'a'.repeat(101)}`)
        .set('Cookie', ['token=valid']);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('SEC-015 — Sync WeLoveDevs admin uniquement', () => {
    it('retourne 403 si l\'utilisateur n\'est pas admin', async () => {
      jwt.verify.mockReturnValue({ id: 'u', email: 'u@t.com', role: 'user' });

      const res = await request(app)
        .post('/api/offers/import')
        .set('Cookie', ['token=valid']);
      expect(res.statusCode).toBe(403);
    });

    it('retourne 401 sans token', async () => {
      const res = await request(app).post('/api/offers/import');
      expect(res.statusCode).toBe(401);
    });
  });
});
