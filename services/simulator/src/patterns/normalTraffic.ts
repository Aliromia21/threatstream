import {
  randomNormalIp,
  randomSuspiciousIp,
  randomEndpoint,
  randomUsername,
  randomUserAgent,
  timestamp,
} from './helpers';

// Normal Traffic Pattern
// Simulates everyday traffic: mostly successful logins,
// occasional failures, random page visits. 

export function generateNormalEvent(): object {
  const roll = Math.random();

  if (roll < 0.4) {
    // 40% — successful auth
    return {
      type: 'auth_success',
      sourceIp: randomNormalIp(),
      targetEndpoint: '/api/login',
      timestamp: timestamp(),
      metadata: {
        username: randomUsername(),
        userAgent: randomUserAgent(),
      },
    };
  }

  if (roll < 0.6) {
    // 20% — failed auth (typo, wrong password — normal)
    return {
      type: 'auth_failure',
      sourceIp: randomNormalIp(),
      targetEndpoint: '/api/login',
      timestamp: timestamp(),
      metadata: {
        username: randomUsername(),
        userAgent: randomUserAgent(),
      },
    };
  }

  if (roll < 0.85) {
    // 25% — suspicious request (404s, weird paths)
    return {
      type: 'suspicious_request',
      sourceIp: Math.random() < 0.5 ? randomNormalIp() : randomSuspiciousIp(),
      targetEndpoint: randomEndpoint(),
      timestamp: timestamp(),
      metadata: {
        requestMethod: 'GET',
        responseCode: Math.random() < 0.5 ? 404 : 403,
        requestPath: randomEndpoint(),
      },
    };
  }

  // 15% — rate limit exceeded
  return {
    type: 'rate_limit_exceeded',
    sourceIp: randomSuspiciousIp(),
    targetEndpoint: randomEndpoint(),
    timestamp: timestamp(),
    metadata: {
      requestMethod: 'POST',
      responseCode: 429,
    },
  };
}