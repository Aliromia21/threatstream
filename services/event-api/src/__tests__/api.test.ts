import request from 'supertest';
import app from '../app';

describe('Event API', () => {
  describe('GET /health', () => {
    it('should return 200 with service info', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.service).toBe('event-api');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeDefined();
    });
  });

  describe('POST /events', () => {
    it('should return 400 for empty body', async () => {
      const res = await request(app)
        .post('/events')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Validation failed');
    });

    it('should return 400 for missing sourceIp', async () => {
      const res = await request(app)
        .post('/events')
        .send({
          type: 'auth_failure',
          timestamp: '2026-03-20T10:00:00Z',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('sourceIp');
    });

    it('should return 400 for invalid event type', async () => {
      const res = await request(app)
        .post('/events')
        .send({
          type: 'invalid_type',
          sourceIp: '192.168.1.1',
          timestamp: '2026-03-20T10:00:00Z',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid event type');
    });

    it('should return 400 for invalid IP', async () => {
      const res = await request(app)
        .post('/events')
        .send({
          type: 'auth_failure',
          sourceIp: '999.999.999.999',
          timestamp: '2026-03-20T10:00:00Z',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid IP');
    });
  });
});