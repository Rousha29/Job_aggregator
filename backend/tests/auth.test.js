import { jest } from '@jest/globals';
import request from 'supertest';

// Mock node-cron to prevent cron jobs from running during tests
jest.unstable_mockModule('node-cron', () => ({
  default: {
    schedule: jest.fn(() => ({
      stop: jest.fn(),
      start: jest.fn(),
    })),
  }
}));

// Mock modules
jest.unstable_mockModule('../src/config/db.js', () => ({
  default: {
    query: jest.fn().mockResolvedValue({ rows: [] }),
  },
}));

const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
};
jest.unstable_mockModule('bcrypt', () => ({
  default: mockBcrypt,
  ...mockBcrypt
}));

const mockJwt = {
  sign: jest.fn(),
  verify: jest.fn(),
};
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: mockJwt,
  ...mockJwt
}));

// Mock axios
jest.unstable_mockModule('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
  }
}));

// Mock import controller to avoid importing microservices
jest.unstable_mockModule('../src/controllers/import.controller.js', () => ({
  importOffers: jest.fn((req, res) => res.json({ success: true, inserted: 0, skipped: 0 })),
  importLocalJSON: jest.fn((req, res) => res.json({ success: true, inserted: 0, skipped: 0 }))
}));

// Import after mocking
const { default: pool } = await import('../src/config/db.js');
const { default: app } = await import('../src/app.js');
const { default: bcrypt } = await import('bcrypt');
const { default: jwt } = await import('jsonwebtoken');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nom: 'Test' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Missing fields');
    });

    it('should return 400 if passwords do not match', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nom: 'User',
          prenom: 'Test',
          mail: 'test@example.com',
          password: 'password123',
          confirmation: 'password456'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Passwords do not match');
    });

    it('should register a user successfully', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // Check user exists
      pool.query.mockResolvedValueOnce({ rows: [{ id: 'role-uuid' }] }); // Get role
      bcrypt.hash.mockResolvedValue('hashed_password');
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'user-uuid', email: 'test@example.com', full_name: 'Test User' }]
      }); // Insert user

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nom: 'User',
          prenom: 'Test',
          mail: 'test@example.com',
          password: 'password123',
          confirmation: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User created');
      expect(res.body.user.email).toBe('test@example.com');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 and a token on successful login', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 'user-uuid',
          email: 'test@example.com',
          password_hash: 'hashed_password'
        }]
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fake_token');

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBe('fake_token');
    });

    it('should return 401 if credentials are invalid', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // User not found

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });
});
