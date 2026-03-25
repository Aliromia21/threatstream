import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../database';

const router = Router();

// O(1) — one row lookup, no counting millions of events.

router.get('/stats/today', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      'SELECT * FROM daily_stats WHERE date = CURRENT_DATE'
    );

    if (result.rows.length === 0) {
      res.json({
        date: new Date().toISOString().split('T')[0],
        total_events: 0,
        auth_failures: 0,
        auth_successes: 0,
        port_scans: 0,
        suspicious_requests: 0,
        rate_limit_exceeded: 0,
        threats_detected: 0,
        unique_source_ips: 0,
      });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Returns one row per day, ordered chronologically.
router.get('/stats/week', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(`
      SELECT * FROM daily_stats
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY date ASC
    `);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});


// Returns the top 10 IPs by event count for today.
router.get('/stats/top-attackers', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(`
      SELECT source_ip, event_count, threat_count, last_event_type, last_seen_at
      FROM attack_sources
      WHERE date = CURRENT_DATE
      ORDER BY event_count DESC
      LIMIT 10
    `);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Queries the raw events table with GROUP BY.

router.get('/stats/attack-types', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(`
      SELECT type, COUNT(*) as count
      FROM events
      WHERE timestamp >= CURRENT_DATE
      GROUP BY type
      ORDER BY count DESC
    `);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});


// generate_series fills in hours with zero events so the
// chart doesn't have gaps.

router.get('/stats/timeline', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(`
      WITH hours AS (
        SELECT generate_series(
          date_trunc('hour', NOW() - INTERVAL '24 hours'),
          date_trunc('hour', NOW()),
          '1 hour'::interval
        ) AS hour
      )
      SELECT
        h.hour,
        COALESCE(COUNT(e.id), 0) AS event_count
      FROM hours h
      LEFT JOIN events e ON date_trunc('hour', e.timestamp) = h.hour
      GROUP BY h.hour
      ORDER BY h.hour ASC
    `);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});


router.get('/stats/recent-events', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(`
      SELECT event_id, type, source_ip, target_endpoint, metadata, timestamp
      FROM events
      ORDER BY timestamp DESC
      LIMIT 20
    `);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});


router.get('/stats/alerts', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(`
      SELECT alert_id, type, severity, source_ip, description, detected_at, is_resolved
      FROM threat_alerts
      ORDER BY detected_at DESC
      LIMIT 20
    `);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;