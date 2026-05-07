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

// Mock axios
jest.unstable_mockModule('axios', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
  }
}));

// Mock import controller to avoid importing microservices
jest.unstable_mockModule('../src/controllers/import.controller.js', () => ({
  importOffers: jest.fn((req, res) => res.json({ success: true, inserted: 0, skipped: 0 }))
}));

const { default: app } = await import('../src/app.js');

describe('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('backend');
  });
});