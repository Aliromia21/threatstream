import { Client } from 'pg';
import { config } from '../config';
import { broadcast } from './index';
import { pool } from '../database';

// PostgreSQL LISTEN/NOTIFY → WebSocket Bridge


let listenClient: Client | null = null;

//collect notifications for 1 second, then broadcast once
let pendingEvents: number = 0;
let batchTimer: NodeJS.Timeout | null = null;
const BATCH_INTERVAL_MS = 1000;

export async function startNotificationListener(): Promise<void> {
  listenClient = new Client({
    host: config.dbHost,
    port: config.dbPort,
    database: config.dbName,
    user: config.dbUser,
    password: config.dbPassword,
  });

  await listenClient.connect();
  await listenClient.query('LISTEN new_event');
  console.log('[notifier] Listening for PostgreSQL notifications');

  listenClient.on('notification', (msg) => {
    pendingEvents++;

    if (!batchTimer) {
      batchTimer = setTimeout(async () => {
        await flushBatch();
      }, BATCH_INTERVAL_MS);
    }
  });

  listenClient.on('error', (error) => {
    console.error('[notifier] PostgreSQL listener error:', error);
  });
}

async function flushBatch(): Promise<void> {
  const eventCount = pendingEvents;
  pendingEvents = 0;
  batchTimer = null;

  if (eventCount === 0) return;

  try {
    // Fetch fresh stats from database
    const todayResult = await pool.query(
      'SELECT * FROM daily_stats WHERE date = CURRENT_DATE'
    );

    const topAttackersResult = await pool.query(`
      SELECT source_ip, event_count, last_event_type
      FROM attack_sources
      WHERE date = CURRENT_DATE
      ORDER BY event_count DESC
      LIMIT 5
    `);

    // Broadcast to all WebSocket clients
    broadcast({
      type: 'stats_update',
      payload: {
        today: todayResult.rows[0] || null,
        topAttackers: topAttackersResult.rows,
        newEventsInBatch: eventCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[notifier] Error fetching stats for broadcast:', error);
  }
}

export async function stopNotificationListener(): Promise<void> {
  if (listenClient) {
    await listenClient.end();
    console.log('[notifier] PostgreSQL listener stopped');
  }
}