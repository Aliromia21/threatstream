import { pool } from '../database';
import { detectThreats } from './threatDetector';

const BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 1000;

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

let eventBuffer: KafkaEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let totalFlushed = 0;

export async function addToBuffer(event: KafkaEvent): Promise<void> {
  eventBuffer.push(event);

  // Threat detection runs immediately, NOT batched
  await detectThreats(event);
  
  // Real-time notification, NOT batched
  await pool.query("SELECT pg_notify('new_event', $1)", [event.type]);

  // Flush if buffer full
  if (eventBuffer.length >= BATCH_SIZE) {
    await flush();
  }

  // Start timer if not running
  if (!flushTimer) {
    flushTimer = setTimeout(async () => {
      await flush();
    }, FLUSH_INTERVAL_MS);
  }
}

async function flush(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (eventBuffer.length === 0) return;

  const batch = [...eventBuffer];
  eventBuffer = [];

  try {
    await batchInsertEvents(batch);
    await batchUpdateDailyStats(batch);
    await batchUpdateAttackSources(batch);
    
    totalFlushed += batch.length;
    
    if (totalFlushed % 200 === 0) {
      console.log(`[batch] Flushed ${batch.length} events (total: ${totalFlushed})`);
    }
  } catch (error) {
    console.error(`[batch] Failed to flush ${batch.length} events:`, error);
  }
}

async function batchInsertEvents(batch: KafkaEvent[]): Promise<void> {
  if (batch.length === 0) return;

  const columns = '(event_id, type, source_ip, target_endpoint, session_id, user_id, metadata, timestamp)';
  const values: unknown[] = [];
  const placeholders: string[] = [];

  batch.forEach((event, i) => {
    const offset = i * 8;
    placeholders.push(
      `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`
    );
    values.push(
      event.id,
      event.type,
      event.sourceIp,
      event.targetEndpoint,
      event.sessionId,
      event.userId,
      JSON.stringify(event.metadata),
      event.timestamp
    );
  });

  const query = `INSERT INTO events ${columns} VALUES ${placeholders.join(', ')}`;
  await pool.query(query, values);
}

async function batchUpdateDailyStats(batch: KafkaEvent[]): Promise<void> {
  const counts: Record<string, Record<string, number>> = {};

  for (const event of batch) {
    const date = event.timestamp.split('T')[0];
    if (!counts[date]) counts[date] = {};
    counts[date][event.type] = (counts[date][event.type] || 0) + 1;
    counts[date]['total'] = (counts[date]['total'] || 0) + 1;
  }

  const columnMap: Record<string, string> = {
    auth_failure: 'auth_failures',
    auth_success: 'auth_successes',
    port_scan: 'port_scans',
    suspicious_request: 'suspicious_requests',
    rate_limit_exceeded: 'rate_limit_exceeded',
    brute_force_detected: 'threats_detected',
  };

  for (const [date, typeCounts] of Object.entries(counts)) {
    const setClauses: string[] = ['total_events = daily_stats.total_events + $2'];
    const insertColumns: string[] = ['date', 'total_events'];
    const insertValues: string[] = ['$1', '$2'];
    const values: unknown[] = [date, typeCounts['total'] || 0];

    let paramIndex = 3;
    for (const [type, count] of Object.entries(typeCounts)) {
      if (type === 'total') continue;
      const column = columnMap[type];
      if (!column) continue;

      insertColumns.push(column);
      insertValues.push(`$${paramIndex}`);
      setClauses.push(`${column} = daily_stats.${column} + $${paramIndex}`);
      values.push(count);
      paramIndex++;
    }

    setClauses.push('updated_at = NOW()');

    const query = `
      INSERT INTO daily_stats (${insertColumns.join(', ')}, updated_at)
      VALUES (${insertValues.join(', ')}, NOW())
      ON CONFLICT (date) DO UPDATE SET
        ${setClauses.join(', ')}
    `;

    await pool.query(query, values);
  }
}

async function batchUpdateAttackSources(batch: KafkaEvent[]): Promise<void> {
  const sources: Record<string, { count: number; lastType: string }> = {};

  for (const event of batch) {
    const date = event.timestamp.split('T')[0];
    const key = `${date}|${event.sourceIp}`;
    if (!sources[key]) {
      sources[key] = { count: 0, lastType: event.type };
    }
    sources[key].count++;
    sources[key].lastType = event.type;
  }

  for (const [key, data] of Object.entries(sources)) {
    const [date, sourceIp] = key.split('|');
    await pool.query(
      `INSERT INTO attack_sources (date, source_ip, event_count, last_event_type, last_seen_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (date, source_ip) DO UPDATE SET
         event_count = attack_sources.event_count + $3,
         last_event_type = $4,
         last_seen_at = NOW()`,
      [date, sourceIp, data.count, data.lastType]
    );
  }
}

export async function flushRemaining(): Promise<void> {
  if (eventBuffer.length > 0) {
    console.log(`[batch] Flushing remaining ${eventBuffer.length} events`);
    await flush();
  }
}

export function getBatchStats(): { buffered: number; totalFlushed: number } {
  return { buffered: eventBuffer.length, totalFlushed };
}