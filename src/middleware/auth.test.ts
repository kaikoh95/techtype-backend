import { Response, NextFunction } from 'express';
import { authenticateServiceRole, AuthenticatedRequest } from './auth';

// Mock environment
jest.mock('../config/env', () => ({
  env: {
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key-123',
  },
}));

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should return 401 when no authorization header is provided', () => {
    authenticateServiceRole(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when authorization header does not start with Bearer', () => {
    mockRequest.headers = {
      authorization: 'Basic invalid-token',
    };

    authenticateServiceRole(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 when bearer token does not match service role key', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token',
    };

    authenticateServiceRole(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Forbidden',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next() when valid service role key is provided', () => {
    mockRequest.headers = {
      authorization: 'Bearer test-service-role-key-123',
    };

    authenticateServiceRole(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      mockNext,
    );

    expect(mockRequest.isAuthenticated).toBe(true);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should handle empty bearer token', () => {
    mockRequest.headers = {
      authorization: 'Bearer ',
    };

    authenticateServiceRole(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      mockNext,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
