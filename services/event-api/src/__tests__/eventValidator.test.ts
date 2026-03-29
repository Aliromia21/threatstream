import { validateEvent } from '../validators/eventValidator';

describe('Event Validator', () => {
  // ---- Valid events ----
  describe('valid events', () => {
    it('should accept a valid auth_failure event', () => {
      const result = validateEvent({
        type: 'auth_failure',
        sourceIp: '192.168.1.100',
        timestamp: '2026-03-20T10:00:00Z',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept a valid port_scan event with metadata', () => {
      const result = validateEvent({
        type: 'port_scan',
        sourceIp: '10.0.0.1',
        timestamp: '2026-03-20T10:00:00Z',
        metadata: { port: 443, protocol: 'TCP' },
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept all valid event types', () => {
      const types = [
        'auth_failure', 'auth_success', 'port_scan',
        'suspicious_request', 'brute_force_detected', 'rate_limit_exceeded',
      ];

      types.forEach((type) => {
        const result = validateEvent({
          type,
          sourceIp: '10.0.0.1',
          timestamp: '2026-03-20T10:00:00Z',
        });
        expect(result.valid).toBe(true);
      });
    });
  });

  // ---- Missing fields ----
  describe('missing fields', () => {
    it('should reject when type is missing', () => {
      const result = validateEvent({
        sourceIp: '192.168.1.100',
        timestamp: '2026-03-20T10:00:00Z',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: type');
    });

    it('should reject when sourceIp is missing', () => {
      const result = validateEvent({
        type: 'auth_failure',
        timestamp: '2026-03-20T10:00:00Z',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: sourceIp');
    });

    it('should reject when timestamp is missing', () => {
      const result = validateEvent({
        type: 'auth_failure',
        sourceIp: '192.168.1.100',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: timestamp');
    });

    it('should report all missing fields at once', () => {
      const result = validateEvent({});

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ---- Invalid values ----
  describe('invalid values', () => {
    it('should reject invalid event type', () => {
      const result = validateEvent({
        type: 'hacking',
        sourceIp: '192.168.1.100',
        timestamp: '2026-03-20T10:00:00Z',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid event type');
    });

    it('should reject invalid IP address', () => {
      const result = validateEvent({
        type: 'auth_failure',
        sourceIp: '999.999.999.999',
        timestamp: '2026-03-20T10:00:00Z',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid IP address');
    });

    it('should reject invalid timestamp', () => {
      const result = validateEvent({
        type: 'auth_failure',
        sourceIp: '192.168.1.100',
        timestamp: 'not-a-date',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid timestamp');
    });

    it('should reject non-object metadata', () => {
      const result = validateEvent({
        type: 'auth_failure',
        sourceIp: '192.168.1.100',
        timestamp: '2026-03-20T10:00:00Z',
        metadata: 'not-an-object',
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('must be an object');
    });
  });

  // ---- Edge cases ----
  describe('edge cases', () => {
    it('should reject null body', () => {
      const result = validateEvent(null);
      expect(result.valid).toBe(false);
    });

    it('should reject array body', () => {
      const result = validateEvent([1, 2, 3]);
      expect(result.valid).toBe(false);
    });

    it('should reject string body', () => {
      const result = validateEvent('hello');
      expect(result.valid).toBe(false);
    });

    it('should accept valid IPv6 address', () => {
      const result = validateEvent({
        type: 'auth_failure',
        sourceIp: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        timestamp: '2026-03-20T10:00:00Z',
      });

      expect(result.valid).toBe(true);
    });
  });
});