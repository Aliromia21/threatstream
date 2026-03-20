import { Router, Request, Response } from 'express';
import { isProducerConnected } from '../kafka';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  const kafkaConnected = isProducerConnected();

  const status = kafkaConnected ? 'ok' : 'degraded';
  const statusCode = kafkaConnected ? 200 : 503;

  res.status(statusCode).json({
    status,
    service: 'event-api',
    kafka: kafkaConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;