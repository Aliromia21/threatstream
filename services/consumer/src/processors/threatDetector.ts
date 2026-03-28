import { pool } from '../database';


interface EventWindow {
  timestamps: number[];
  ports?: Set<number>;
}

const authFailureWindows = new Map<string, EventWindow>();
const portScanWindows = new Map<string, EventWindow>();

const alertedBruteForce = new Set<string>();
const alertedPortScan = new Set<string>();

// Thresholds
const BRUTE_FORCE_THRESHOLD = 10;
const BRUTE_FORCE_WINDOW_MS = 2 * 60 * 1000;

const PORT_SCAN_THRESHOLD = 8;
const PORT_SCAN_WINDOW_MS = 60 * 1000; 

const CLEANUP_INTERVAL_MS = 30 * 1000;

interface ThreatEvent {
  id: string;
  type: string;
  sourceIp: string;
  targetEndpoint: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export async function detectThreats(event: ThreatEvent): Promise<void> {
  if (event.type === 'auth_failure') {
    await checkBruteForce(event);
  }

  if (event.type === 'port_scan') {
    await checkPortScan(event);
  }
}

// Brute Force Detection
async function checkBruteForce(event: ThreatEvent): Promise<void> {
  const now = Date.now();
  const ip = event.sourceIp;

  let window = authFailureWindows.get(ip);
  if (!window) {
    window = { timestamps: [] };
    authFailureWindows.set(ip, window);
  }

  window.timestamps.push(now);

  const cutoff = now - BRUTE_FORCE_WINDOW_MS;
  window.timestamps = window.timestamps.filter((t) => t > cutoff);

  if (window.timestamps.length >= BRUTE_FORCE_THRESHOLD && !alertedBruteForce.has(ip)) {
    alertedBruteForce.add(ip);

    console.log(`[threat] BRUTE FORCE detected from ${ip} — ${window.timestamps.length} failures in 2 min`);

    await createAlert({
      type: 'brute_force_detected',
      severity: 'high',
      sourceIp: ip,
      description: `Brute force attack: ${window.timestamps.length} auth failures from ${ip} in 2 minutes`,
      metadata: {
        failureCount: window.timestamps.length,
        windowMinutes: 2,
        threshold: BRUTE_FORCE_THRESHOLD,
      },
    });

    setTimeout(() => {
      alertedBruteForce.delete(ip);
    }, 5 * 60 * 1000);
  }
}

// Port Scan Detection
async function checkPortScan(event: ThreatEvent): Promise<void> {
  const now = Date.now();
  const ip = event.sourceIp;
  const port = (event.metadata as { port?: number }).port;

  if (!port) return;

  let window = portScanWindows.get(ip);
  if (!window) {
    window = { timestamps: [], ports: new Set() };
    portScanWindows.set(ip, window);
  }

  window.timestamps.push(now);
  window.ports!.add(port);

  const cutoff = now - PORT_SCAN_WINDOW_MS;
  window.timestamps = window.timestamps.filter((t) => t > cutoff);

  if (window.timestamps.length === 0) {
    window.ports!.clear();
  }

  if (window.ports!.size >= PORT_SCAN_THRESHOLD && !alertedPortScan.has(ip)) {
    alertedPortScan.add(ip);

    console.log(`[threat] PORT SCAN detected from ${ip} — ${window.ports!.size} unique ports in 1 min`);

    await createAlert({
      type: 'port_scan',
      severity: 'medium',
      sourceIp: ip,
      description: `Port scan: ${window.ports!.size} unique ports scanned from ${ip} in 1 minute`,
      metadata: {
        uniquePorts: window.ports!.size,
        windowMinutes: 1,
        threshold: PORT_SCAN_THRESHOLD,
      },
    });

    setTimeout(() => {
      alertedPortScan.delete(ip);
    }, 3 * 60 * 1000);
  }
}

// Create Alert in PostgreSQL
interface AlertData {
  type: string;
  severity: string;
  sourceIp: string;
  description: string;
  metadata: Record<string, unknown>;
}

async function createAlert(alert: AlertData): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO threat_alerts (type, severity, source_ip, description, metadata, detected_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [alert.type, alert.severity, alert.sourceIp, alert.description, JSON.stringify(alert.metadata)]
    );

    await pool.query(
      `INSERT INTO daily_stats (date, total_events, threats_detected, updated_at)
       VALUES (CURRENT_DATE, 0, 1, NOW())
       ON CONFLICT (date) DO UPDATE SET
         threats_detected = daily_stats.threats_detected + 1,
         updated_at = NOW()`
    );
  } catch (error) {
    console.error('[threat] Failed to create alert:', error);
  }
}

export function startCleanupTimer(): void {
  setInterval(() => {
    const now = Date.now();

    for (const [ip, window] of authFailureWindows) {
      window.timestamps = window.timestamps.filter((t) => t > now - BRUTE_FORCE_WINDOW_MS);
      if (window.timestamps.length === 0) {
        authFailureWindows.delete(ip);
      }
    }

    for (const [ip, window] of portScanWindows) {
      window.timestamps = window.timestamps.filter((t) => t > now - PORT_SCAN_WINDOW_MS);
      if (window.timestamps.length === 0) {
        portScanWindows.delete(ip);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}

export function getDetectorStats(): { trackedIps: number; alerts: number } {
  return {
    trackedIps: authFailureWindows.size + portScanWindows.size,
    alerts: alertedBruteForce.size + alertedPortScan.size,
  };
}