import request from 'supertest';

// Mock environment and database before importing app
jest.mock('./config/env', () => ({
  env: {
    SUPABASE_URL: 'http://localhost:54321',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key-123',
  },
}));

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

import app from './app';

describe('App Authentication Integration', () => {
  it('should allow access to health endpoint without authentication', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toHaveProperty('status');
  });

  it('should require authentication for API routes', async () => {
    await request(app).get('/api/v1/test').expect(401);
  });

  it('should accept valid service role key for API routes', async () => {
    await request(app)
      .get('/api/v1/test')
      .set('Authorization', 'Bearer test-service-role-key-123')
      .expect(404); // Route doesn't exist, but auth passes
  });

  it('should reject invalid service role key for API routes', async () => {
    await request(app).get('/api/v1/test').set('Authorization', 'Bearer invalid-key').expect(403);
  });
});
