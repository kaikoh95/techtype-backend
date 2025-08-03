import { Request, Response, NextFunction } from 'express';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCreateNode(req: Request, res: Response, next: NextFunction): void {
  const errors: ValidationError[] = [];
  const { name, parentId } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Name is required and must be a non-empty string',
    });
  }

  if (parentId !== undefined && parentId !== null && typeof parentId !== 'string') {
    errors.push({
      field: 'parentId',
      message: 'Parent ID must be a string or null',
    });
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', errors });
    return;
  }

  next();
}

export function validateCreateProperty(req: Request, res: Response, next: NextFunction): void {
  const errors: ValidationError[] = [];
  const { key, value } = req.body;

  if (!key || typeof key !== 'string' || key.trim().length === 0) {
    errors.push({
      field: 'key',
      message: 'Key is required and must be a non-empty string',
    });
  }

  if (value === undefined || value === null || typeof value !== 'number' || isNaN(value)) {
    errors.push({
      field: 'value',
      message: 'Value is required and must be a valid number',
    });
  }

  if (errors.length > 0) {
    res.status(400).json({ error: 'Validation failed', errors });
    return;
  }

  next();
}

export function validateNodePath(req: Request, res: Response, next: NextFunction): void {
  const { q } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    res.status(400).json({
      error: 'Query parameter required',
      message: 'Path query parameter "q" is required',
    });
    return;
  }

  // Basic path validation - must not contain invalid characters
  if (q.includes('//') || q.startsWith('/') || q.endsWith('/')) {
    res.status(400).json({
      error: 'Invalid path format',
      message: 'Path must not start/end with "/" or contain "//"',
    });
    return;
  }

  next();
}
