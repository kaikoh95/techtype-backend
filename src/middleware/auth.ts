import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request {
  isAuthenticated: boolean;
}

export function authenticateServiceRole(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as AuthenticatedRequest;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: 'Unauthorized',
    });
    return;
  }

  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
    });
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  if (token !== env.SUPABASE_SERVICE_ROLE_KEY) {
    res.status(403).json({
      error: 'Forbidden',
    });
    return;
  }

  authReq.isAuthenticated = true;
  next();
}
