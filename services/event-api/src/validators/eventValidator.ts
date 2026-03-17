const VALID_EVENT_TYPES = [
  'auth_failure',
  'auth_success',
  'port_scan',
  'suspicious_request',
  'brute_force_detected',
  'rate_limit_exceeded',
] as const;

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

interface IncomingEvent {
  type?: string;
  sourceIp?: string;
  targetEndpoint?: string;
  timestamp?: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export function validateEvent(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, errors: ['Request body must be a JSON object'] };
  }

  const event = body as IncomingEvent;

  if (!event.type) {
    errors.push('Missing required field: type');
  } else if (!VALID_EVENT_TYPES.includes(event.type as typeof VALID_EVENT_TYPES[number])) {
    errors.push(
      `Invalid event type: "${event.type}". Must be one of: ${VALID_EVENT_TYPES.join(', ')}`
    );
  }

  if (!event.sourceIp) {
    errors.push('Missing required field: sourceIp');
  } else if (!isValidIp(event.sourceIp)) {
    errors.push(`Invalid IP address: "${event.sourceIp}"`);
  }

  if (!event.timestamp) {
    errors.push('Missing required field: timestamp');
  } else if (!isValidTimestamp(event.timestamp)) {
    errors.push(`Invalid timestamp: "${event.timestamp}". Must be ISO 8601 format`);
  }

  if (event.metadata !== undefined && typeof event.metadata !== 'object') {
    errors.push('Field "metadata" must be an object');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isValidIp(ip: string): boolean {
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4.test(ip)) {
    return ip.split('.').every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  if (ip.includes(':')) {
    return /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/.test(ip);
  }

  return false;
}

function isValidTimestamp(timestamp: string): boolean {
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}