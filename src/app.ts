import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { healthCheck } from './routes/health';
import { authenticateServiceRole } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import nodeRoutes from './routes/nodes';
import pathRoutes from './routes/paths';
import { specs } from './config/swagger';

const app = express();

app.use(express.json());

// Swagger documentation (public endpoint)
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customSiteTitle: 'PC Node Tree API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
    },
  }),
);

// Public health endpoint (no auth required)
app.get('/health', healthCheck);

// Protected API v1 routes (require service role authentication)
app.use('/api/v1', authenticateServiceRole);
app.use('/api/v1/nodes', nodeRoutes);
app.use('/api/v1/paths', pathRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
