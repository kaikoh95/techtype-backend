import request from 'supertest';

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
  let app: any;

  beforeEach(() => {
    // Clear module cache to get fresh app instance
    jest.resetModules();
  });

  it('should return 200 with healthy status when database is connected', async () => {
    app = require('./app').default;

    const response = await request(app).get('/health').expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
  });
});
