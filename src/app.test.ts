import request from 'supertest';
import type { Express } from 'express';

// Mock the Supabase client
jest.mock('./config/database', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        data: { count: 1 },
        error: null,
      }),
    }),
  },
}));

describe('Health Endpoint', () => {
  let app: Express;

  beforeEach(async () => {
    // Clear module cache to get fresh app instance
    jest.resetModules();
  });

  it('should return 200 with healthy status when database is connected', async () => {
    const appModule = await import('./app');
    app = appModule.default;

    const response = await request(app).get('/health').expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
  });
});
