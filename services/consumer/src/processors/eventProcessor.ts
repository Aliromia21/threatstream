import { pool } from '../database';
import { detectThreats } from './threatDetector';

interface KafkaEvent {
  id: string;
  type: string;
  sourceIp: string;
  targetEndpoint: string;
  timestamp: string;
  sessionId: string | null;
  userId: string | null;
  metadata: Record<string, unknown>;
  receivedAt: string;
}

export async function processEvent(event: KafkaEvent): Promise<void> {
  await insertRawEvent(event);
  await updateDailyStats(event);
  await updateAttackSource(event);

  // Threat detection — check for attack patterns
  await detectThreats(event);

  // Notify Stats API via PostgreSQL LISTEN/NOTIFY
  await pool.query("SELECT pg_notify('new_event', $1)", [event.type]);
}

async function insertRawEvent(event: KafkaEvent): Promise<void> {
  const query = `
    INSERT INTO events (event_id, type, source_ip, target_endpoint, session_id, user_id, metadata, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `;

  await pool.query(query, [
    event.id,
    event.type,
    event.sourceIp,
    event.targetEndpoint,
    event.sessionId,
    event.userId,
    JSON.stringify(event.metadata),
    event.timestamp,
  ]);
}

async function updateDailyStats(event: KafkaEvent): Promise<void> {
  const date = event.timestamp.split('T')[0];

  const columnMap: Record<string, string> = {
    auth_failure: 'auth_failures',
    auth_success: 'auth_successes',
    port_scan: 'port_scans',
    suspicious_request: 'suspicious_requests',
    rate_limit_exceeded: 'rate_limit_exceeded',
    brute_force_detected: 'threats_detected',
  };

  const column = columnMap[event.type];
  if (!column) return;

  const query = `
    INSERT INTO daily_stats (date, total_events, ${column}, updated_at)
    VALUES ($1, 1, 1, NOW())
    ON CONFLICT (date) DO UPDATE SET
      total_events = daily_stats.total_events + 1,
      ${column} = daily_stats.${column} + 1,
      updated_at = NOW()
  `;

  await pool.query(query, [date]);
}

async function updateAttackSource(event: KafkaEvent): Promise<void> {
  const date = event.timestamp.split('T')[0];

  const query = `
    INSERT INTO attack_sources (date, source_ip, event_count, last_event_type, last_seen_at)
    VALUES ($1, $2, 1, $3, NOW())
    ON CONFLICT (date, source_ip) DO UPDATE SET
      event_count = attack_sources.event_count + 1,
      last_event_type = $3,
      last_seen_at = NOW()
  `;

  await pool.query(query, [date, event.sourceIp, event.type]);
}