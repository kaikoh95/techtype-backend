import { Request, Response } from 'express';
import { supabase } from '../config/database';

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the application and database connectivity
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 database:
 *                   type: string
 *                   example: "connected"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "unhealthy"
 *                 database:
 *                   type: string
 *                   example: "disconnected"
 *                 error:
 *                   type: string
 *                   example: "Connection timeout"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 */
export const healthCheck = async (req: Request, res: Response) => {
  const timestamp = new Date().toISOString();

  try {
    // Simple database connection test
    const { error } = await supabase.from('nodes').select('*', { count: 'exact', head: true });

    if (error) {
      return res.status(503).json({
        status: 'unhealthy',
        timestamp,
      });
    }

    res.status(200).json({
      status: 'healthy',
      timestamp,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp,
    });
  }
};
