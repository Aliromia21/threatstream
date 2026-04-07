import { Request, Response, NextFunction } from 'express';

// API Key Authentication Middleware
// Every request to POST /events must include an X-API-Key
// header. Without it, the request is rejected with 401.


const VALID_API_KEYS = new Set(
  (process.env.API_KEYS || 'dev-key-001,dev-key-002').split(',')
);

export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  // Skip auth for health check
  if (req.path === '/health') {
    next();
    return;
  }

  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (!apiKey) {
    res.status(401).json({
      error: 'Missing API key. Include X-API-Key header.',
      statusCode: 401,
    });
    return;
  }

  if (!VALID_API_KEYS.has(apiKey)) {
    res.status(403).json({
      error: 'Invalid API key.',
      statusCode: 403,
    });
    return;
  }

  next();
}