import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool({
  host: config.dbHost,
  port: config.dbPort,
  database: config.dbName,
  user: config.dbUser,
  password: config.dbPassword,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[database] Unexpected pool error:', err);
});

export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log('[database] Connected to PostgreSQL');
    client.release();
  } catch (error) {
    console.error('[database] Failed to connect:', error);
    throw error;
  }
}

export { pool };