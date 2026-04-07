import request from 'supertest';
import app from '../app';

const API_KEY = 'dev-key-001';

describe('Event API', () => {
  describe('GET /health', () => {
    it('should return 200 without API key', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.service).toBe('event-api');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeDefined();
    });
  });

  describe('POST /events — authentication', () => {
    it('should return 401 without API key', async () => {
      const res = await request(app)
        .post('/events')
        .send({ type: 'auth_failure', sourceIp: '1.2.3.4', timestamp: '2026-03-20T10:00:00Z' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Missing API key');
    });

    it('should return 403 with invalid API key', async () => {
      const res = await request(app)
        .post('/events')
        .set('X-API-Key', 'wrong-key')
        .send({ type: 'auth_failure', sourceIp: '1.2.3.4', timestamp: '2026-03-20T10:00:00Z' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Invalid API key');
    });
  });

  describe('POST /events — validation', () => {
    it('should return 400 for empty body', async () => {
      const res = await request(app)
        .post('/events')
        .set('X-API-Key', API_KEY)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Validation failed');
    });

    it('should return 400 for missing sourceIp', async () => {
      const res = await request(app)
        .post('/events')
        .set('X-API-Key', API_KEY)
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
        .set('X-API-Key', API_KEY)
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
        .set('X-API-Key', API_KEY)
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