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
const { default: jwt } = await import('jsonwebtoken');

describe('Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  describe('GET /api/users/me', () => {
    it('should return user info if authenticated', async () => {
      jwt.verify.mockReturnValue({ id: 'user-uuid', email: 'test@example.com' });
      pool.query.mockResolvedValue({
        rows: [{
          id: 'user-uuid',
          email: 'test@example.com',
          full_name: 'Test User',
          created_at: '2023-01-01T00:00:00.000Z'
        }]
      });

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer valid_token');

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.full_name).toBe('Test User');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, email, full_name, created_at FROM users'),
        ['user-uuid']
      );
    });

    it('should return 401 if no token provided', async () => {
      const res = await request(app).get('/api/users/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should return 401 if token is invalid', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid token');
    });
  });
});
