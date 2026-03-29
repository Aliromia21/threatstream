import { resetDetectorState } from '../processors/threatDetector';

jest.mock('../database', () => ({
  pool: {
    query: jest.fn().mockResolvedValue({ rows: [] }),
  },
}));

import { detectThreats } from '../processors/threatDetector';
import { pool } from '../database';

const mockQuery = pool.query as jest.Mock;

function makeAuthFailure(sourceIp: string): any {
  return {
    id: 'test-id',
    type: 'auth_failure',
    sourceIp,
    targetEndpoint: '/api/login',
    timestamp: new Date().toISOString(),
    metadata: { username: 'admin' },
  };
}

function makePortScan(sourceIp: string, port: number): any {
  return {
    id: 'test-id',
    type: 'port_scan',
    sourceIp,
    targetEndpoint: `port:${port}`,
    timestamp: new Date().toISOString(),
    metadata: { port, protocol: 'TCP' },
  };
}

describe('Threat Detector', () => {
  beforeEach(() => {
    resetDetectorState();
    mockQuery.mockClear();
  });

  describe('brute force detection', () => {
    it('should NOT alert below threshold (9 failures)', async () => {
      const ip = '10.0.0.1';

      for (let i = 0; i < 9; i++) {
        await detectThreats(makeAuthFailure(ip));
      }

      // No INSERT into threat_alerts
      const alertInserts = mockQuery.mock.calls.filter(
        (call: any) => call[0].includes('threat_alerts')
      );
      expect(alertInserts).toHaveLength(0);
    });

    it('should alert at threshold (10 failures from same IP)', async () => {
      const ip = '10.0.0.2';

      for (let i = 0; i < 10; i++) {
        await detectThreats(makeAuthFailure(ip));
      }

      const alertInserts = mockQuery.mock.calls.filter(
        (call: any) => call[0].includes('threat_alerts')
      );
      expect(alertInserts.length).toBeGreaterThan(0);
    });

    it('should NOT alert for different IPs', async () => {
      for (let i = 0; i < 5; i++) {
        await detectThreats(makeAuthFailure('10.0.0.3'));
        await detectThreats(makeAuthFailure('10.0.0.4'));
      }

      const alertInserts = mockQuery.mock.calls.filter(
        (call: any) => call[0].includes('threat_alerts')
      );
      expect(alertInserts).toHaveLength(0);
    });

    it('should NOT double-alert for same IP', async () => {
      const ip = '10.0.0.5';

      for (let i = 0; i < 20; i++) {
        await detectThreats(makeAuthFailure(ip));
      }

      const alertInserts = mockQuery.mock.calls.filter(
        (call: any) => call[0].includes('threat_alerts')
      );
      expect(alertInserts).toHaveLength(1);
    });

    it('should ignore non-auth events', async () => {
      await detectThreats({
        id: 'test',
        type: 'suspicious_request',
        sourceIp: '10.0.0.6',
        targetEndpoint: '/api/admin',
        timestamp: new Date().toISOString(),
        metadata: {},
      });

      const alertInserts = mockQuery.mock.calls.filter(
        (call: any) => call[0].includes('threat_alerts')
      );
      expect(alertInserts).toHaveLength(0);
    });
  });

  describe('port scan detection', () => {
    it('should NOT alert below threshold (7 ports)', async () => {
      const ip = '10.0.0.10';

      for (let port = 1; port <= 7; port++) {
        await detectThreats(makePortScan(ip, port));
      }

      const alertInserts = mockQuery.mock.calls.filter(
        (call: any) => call[0].includes('threat_alerts')
      );
      expect(alertInserts).toHaveLength(0);
    });

    it('should alert at threshold (8 unique ports from same IP)', async () => {
      const ip = '10.0.0.11';

      for (let port = 1; port <= 8; port++) {
        await detectThreats(makePortScan(ip, port));
      }

      const alertInserts = mockQuery.mock.calls.filter(
        (call: any) => call[0].includes('threat_alerts')
      );
      expect(alertInserts.length).toBeGreaterThan(0);
    });

    it('should NOT count duplicate ports', async () => {
      const ip = '10.0.0.12';

      for (let i = 0; i < 10; i++) {
        await detectThreats(makePortScan(ip, 80));
      }

      const alertInserts = mockQuery.mock.calls.filter(
        (call: any) => call[0].includes('threat_alerts')
      );
      expect(alertInserts).toHaveLength(0);
    });

    it('should NOT alert for different IPs', async () => {
      for (let port = 1; port <= 4; port++) {
        await detectThreats(makePortScan('10.0.0.13', port));
        await detectThreats(makePortScan('10.0.0.14', port + 100));
      }

      const alertInserts = mockQuery.mock.calls.filter(
        (call: any) => call[0].includes('threat_alerts')
      );
      expect(alertInserts).toHaveLength(0);
    });
  });
});