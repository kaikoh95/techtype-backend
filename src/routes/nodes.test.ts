import request from 'supertest';

// Mock environment and database before importing app
jest.mock('../config/env', () => ({
  env: {
    SUPABASE_URL: 'http://localhost:54321',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key-123',
  },
}));

// Mock Supabase database
const mockSupabase = {
  from: jest.fn(),
};

jest.mock('../config/database', () => ({
  supabase: mockSupabase,
}));

import app from '../app';

describe('Node API Endpoints', () => {
  const validAuthHeader = 'Bearer test-service-role-key-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/nodes', () => {
    it('should create a root node successfully', async () => {
      const mockNode = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'TestPC',
        parent_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockNode,
              error: null,
            }),
          }),
        }),
      });

      const response = await request(app)
        .post('/api/v1/nodes')
        .set('Authorization', validAuthHeader)
        .send({ name: 'TestPC' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockNode);
    });

    it('should create a child node successfully', async () => {
      const mockNode = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'ChildNode',
        parent_id: '123e4567-e89b-12d3-a456-426614174000',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockNode,
              error: null,
            }),
          }),
        }),
      });

      const response = await request(app)
        .post('/api/v1/nodes')
        .set('Authorization', validAuthHeader)
        .send({
          name: 'ChildNode',
          parentId: '123e4567-e89b-12d3-a456-426614174000',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockNode);
    });

    it('should return 400 for missing name', async () => {
      await request(app)
        .post('/api/v1/nodes')
        .set('Authorization', validAuthHeader)
        .send({})
        .expect(400);
    });

    it('should return 400 for empty name', async () => {
      await request(app)
        .post('/api/v1/nodes')
        .set('Authorization', validAuthHeader)
        .send({ name: '   ' })
        .expect(400);
    });

    it('should return 409 for duplicate name error', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: {
                message: 'duplicate key value violates unique constraint',
              },
            }),
          }),
        }),
      });

      await request(app)
        .post('/api/v1/nodes')
        .set('Authorization', validAuthHeader)
        .send({ name: 'DuplicateName' })
        .expect(409);
    });
  });

  describe('POST /api/v1/nodes/:nodeId/properties', () => {
    it('should add property to node successfully', async () => {
      const mockProperty = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        node_id: '123e4567-e89b-12d3-a456-426614174000',
        key: 'Temperature',
        value: 45.5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Mock node exists check
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'nodes') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: '123e4567-e89b-12d3-a456-426614174000' },
                  error: null,
                }),
              }),
            }),
          };
        } else if (table === 'properties') {
          return {
            upsert: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: mockProperty,
                  error: null,
                }),
              }),
            }),
          };
        }
      });

      const response = await request(app)
        .post('/api/v1/nodes/123e4567-e89b-12d3-a456-426614174000/properties')
        .set('Authorization', validAuthHeader)
        .send({ key: 'Temperature', value: 45.5 })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProperty);
    });

    it('should return 404 for non-existent node', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      });

      await request(app)
        .post('/api/v1/nodes/non-existent-id/properties')
        .set('Authorization', validAuthHeader)
        .send({ key: 'Temperature', value: 45.5 })
        .expect(404);
    });

    it('should return 400 for missing key', async () => {
      await request(app)
        .post('/api/v1/nodes/123e4567-e89b-12d3-a456-426614174000/properties')
        .set('Authorization', validAuthHeader)
        .send({ value: 45.5 })
        .expect(400);
    });

    it('should return 400 for invalid value', async () => {
      await request(app)
        .post('/api/v1/nodes/123e4567-e89b-12d3-a456-426614174000/properties')
        .set('Authorization', validAuthHeader)
        .send({ key: 'Temperature', value: 'invalid' })
        .expect(400);
    });
  });

  describe('GET /api/v1/paths?q=path', () => {
    it('should return node subtree for valid node path', async () => {
      const mockRootNode = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'AlphaPC',
        parent_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Mock the database calls in sequence
      mockSupabase.from
        .mockReturnValueOnce({
          // First call: find root node 'AlphaPC'
          select: () => ({
            eq: () => ({
              is: () => ({
                single: jest.fn().mockResolvedValue({
                  data: mockRootNode,
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          // Second call: get properties for AlphaPC node
          select: () => ({
            eq: jest.fn().mockResolvedValue({
              data: [
                {
                  key: 'Height',
                  value: 450.0,
                  node_id: '123e4567-e89b-12d3-a456-426614174000',
                },
              ],
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          // Third call: get children for AlphaPC node
          select: () => ({
            eq: () => ({
              order: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        });

      const response = await request(app)
        .get('/api/v1/paths?q=AlphaPC')
        .set('Authorization', validAuthHeader)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.type).toBe('node');
      expect(response.body.data.name).toBe('AlphaPC');
    });

    it('should return property value for valid property path', async () => {
      const mockRootNode = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'AlphaPC',
        parent_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockProperty = {
        id: 'prop-123',
        node_id: '123e4567-e89b-12d3-a456-426614174000',
        key: 'Height',
        value: 450.0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Mock the database calls in sequence
      mockSupabase.from
        .mockReturnValueOnce({
          // First call: find root node 'AlphaPC'
          select: () => ({
            eq: () => ({
              is: () => ({
                single: jest.fn().mockResolvedValue({
                  data: mockRootNode,
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          // Second call: try to find child node 'Height' (will fail)
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'Not found' },
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          // Third call: find property 'Height'
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: jest.fn().mockResolvedValue({
                  data: mockProperty,
                  error: null,
                }),
              }),
            }),
          }),
        });

      const response = await request(app)
        .get('/api/v1/paths?q=AlphaPC/Height')
        .set('Authorization', validAuthHeader)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.type).toBe('property');
      expect(response.body.data.key).toBe('Height');
      expect(response.body.data.value).toBe(450.0);
    });

    it('should return nested node subtree for valid nested path', async () => {
      const mockRootNode = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'AlphaPC',
        parent_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockProcessingNode = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Processing',
        parent_id: '123e4567-e89b-12d3-a456-426614174000',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Mock the database calls in sequence
      mockSupabase.from
        .mockReturnValueOnce({
          // First call: find root node 'AlphaPC'
          select: () => ({
            eq: () => ({
              is: () => ({
                single: jest.fn().mockResolvedValue({
                  data: mockRootNode,
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          // Second call: find child node 'Processing'
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: jest.fn().mockResolvedValue({
                  data: mockProcessingNode,
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          // Third call: get properties for Processing node
          select: () => ({
            eq: jest.fn().mockResolvedValue({
              data: [
                {
                  key: 'RAM',
                  value: 32000.0,
                  node_id: '123e4567-e89b-12d3-a456-426614174001',
                },
              ],
              error: null,
            }),
          }),
        })
        .mockReturnValueOnce({
          // Fourth call: get children for Processing node
          select: () => ({
            eq: () => ({
              order: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        });

      const response = await request(app)
        .get('/api/v1/paths?q=AlphaPC/Processing')
        .set('Authorization', validAuthHeader)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.type).toBe('node');
      expect(response.body.data.name).toBe('Processing');
    });

    it('should return error for property path with children', async () => {
      const mockRootNode = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'AlphaPC',
        parent_id: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockProperty = {
        id: 'prop-123',
        node_id: '123e4567-e89b-12d3-a456-426614174000',
        key: 'Height',
        value: 450.0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Set up sequential mock responses
      let callCount = 0;
      mockSupabase.from.mockImplementation((table: string) => {
        callCount++;

        if (callCount === 1 && table === 'nodes') {
          // First call: find root node 'AlphaPC'
          return {
            select: () => ({
              eq: () => ({
                is: () => ({
                  single: jest.fn().mockResolvedValue({
                    data: mockRootNode,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        } else if (callCount === 2 && table === 'nodes') {
          // Second call: try to find child node 'Height' under AlphaPC (should fail)
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Not found' },
                  }),
                }),
              }),
            }),
          };
        } else if (callCount === 3 && table === 'properties') {
          // Third call: find property 'Height' under AlphaPC (should succeed)
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  single: jest.fn().mockResolvedValue({
                    data: mockProperty,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }

        // Default fallback for any other calls
        return {
          select: () => ({
            eq: () => ({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        };
      });

      const response = await request(app)
        .get('/api/v1/paths?q=AlphaPC/Height/abc/def')
        .set('Authorization', validAuthHeader)
        .expect(404);

      expect(response.body.message).toContain('cannot have child elements');
    });

    it('should return 400 for missing query parameter', async () => {
      await request(app).get('/api/v1/paths').set('Authorization', validAuthHeader).expect(400);
    });

    it('should return 400 for invalid path format', async () => {
      await request(app)
        .get('/api/v1/paths?q=/invalid/path/')
        .set('Authorization', validAuthHeader)
        .expect(400);
    });

    it('should return 404 for non-existent path', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            }),
          }),
        }),
      });

      await request(app)
        .get('/api/v1/paths?q=NonExistentNode')
        .set('Authorization', validAuthHeader)
        .expect(404);
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      await request(app).post('/api/v1/nodes').send({ name: 'Test' }).expect(401);
      await request(app)
        .post('/api/v1/nodes/123/properties')
        .send({ key: 'test', value: 1 })
        .expect(401);
      await request(app).get('/api/v1/paths?q=Test').expect(401);
    });
  });
});
