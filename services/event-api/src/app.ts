import express from 'express';
import cors from 'cors';

import healthRoutes from './routes/health';
import eventRoutes from './routes/events';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use(healthRoutes);
app.use(eventRoutes);

app.use(errorHandler);

export default app;