import { Router, Request, Response } from 'express';
import { getClientCount } from '../websocket';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'stats-api',
    wsClients: getClientCount(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;