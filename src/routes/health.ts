import { Request, Response } from 'express';
import { supabase } from '../config/database';

export const healthCheck = async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();
  
  try {
    // Simple database connection test
    const { error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .limit(1);

    if (error) {
      return res.status(503).json({
        status: 'unhealthy',
        database: 'disconnected',
        timestamp,
        error: error.message
      });
    }

    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'error',
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};