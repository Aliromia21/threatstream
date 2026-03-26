export interface DailyStats {
  date: string;
  total_events: number;
  auth_failures: number;
  auth_successes: number;
  port_scans: number;
  suspicious_requests: number;
  rate_limit_exceeded: number;
  threats_detected: number;
  unique_source_ips: number;
}

export interface TopAttacker {
  source_ip: string;
  event_count: number;
  threat_count: number;
  last_event_type: string;
  last_seen_at: string;
}

export interface AttackType {
  type: string;
  count: string;
}

export interface TimelineEntry {
  hour: string;
  event_count: string;
}

export interface RecentEvent {
  event_id: string;
  type: string;
  source_ip: string;
  target_endpoint: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface WsStatsUpdate {
  type: 'stats_update' | 'connection';
  payload?: {
    today: DailyStats | null;
    topAttackers: TopAttacker[];
    newEventsInBatch: number;
  };
  message?: string;
  timestamp: string;
}