import express from 'express';
import cors from 'cors';

import healthRoutes from './routes/health';
import statsRoutes from './routes/stats';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRoutes);
app.use(statsRoutes);

app.use(errorHandler);

export default app;