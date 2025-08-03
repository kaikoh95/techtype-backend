import express from 'express';
import { healthCheck } from './routes/health';

const app = express();

app.use(express.json());

app.get('/health', healthCheck);

export default app;