import { z } from 'zod';

const VALID_TYPES = [
  'auth_failure',
  'auth_success',
  'port_scan',
  'suspicious_request',
  'rate_limit_exceeded',
  'brute_force_detected',
] as const;

export const eventSchema = z.object({
  type: z.enum(VALID_TYPES, {
    message: 'Invalid event type',
  }),

  sourceIp: z.string({
    message: 'Missing required field: sourceIp',
  }).refine(
    (ip) => {
      const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (ipv4.test(ip)) {
        return ip.split('.').every((n) => parseInt(n) <= 255);
      }
      const ipv6 = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      return ipv6.test(ip);
    },
    { message: 'Invalid IP address format' }
  ),

  timestamp: z.string({
    message: 'Missing required field: timestamp',
  }).refine(
    (ts) => !isNaN(Date.parse(ts)),
    { message: 'Invalid timestamp format' }
  ),

  targetEndpoint: z.string().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ValidatedEvent = z.infer<typeof eventSchema>;