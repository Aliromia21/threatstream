// Shared Event Types

export enum EventType {
  AUTH_FAILURE = 'auth_failure',
  AUTH_SUCCESS = 'auth_success',
  PORT_SCAN = 'port_scan',
  SUSPICIOUS_REQUEST = 'suspicious_request',
  BRUTE_FORCE_DETECTED = 'brute_force_detected',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
}

export enum SeverityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum KafkaTopic {
  AUTH_EVENTS = 'auth-events',
  NETWORK_EVENTS = 'network-events',
  THREAT_ALERTS = 'threat-alerts',
}

// Base event
export interface ThreatEvent {
  id: string;
  type: EventType;
  sourceIp: string;
  targetEndpoint: string;
  timestamp: string; // ISO 8601
  sessionId?: string;
  userId?: string;
  metadata: Record<string, unknown>;
}

// Auth-specific events
export interface AuthEvent extends ThreatEvent {
  type: EventType.AUTH_FAILURE | EventType.AUTH_SUCCESS;
  metadata: {
    username: string;
    userAgent: string;
    attemptNumber?: number;
  };
}

// Network-specific events
export interface NetworkEvent extends ThreatEvent {
  type: EventType.PORT_SCAN | EventType.SUSPICIOUS_REQUEST | EventType.RATE_LIMIT_EXCEEDED;
  metadata: {
    port?: number;
    protocol?: string;
    requestPath?: string;
    requestMethod?: string;
    responseCode?: number;
  };
}

// Classified threat
export interface ThreatAlert {
  id: string;
  detectedAt: string;
  severity: SeverityLevel;
  type: EventType;
  sourceIp: string;
  description: string;
  relatedEventIds: string[];
  metadata: Record<string, unknown>;
}

// Daily aggregated stats 
export interface DailyStats {
  date: string;
  totalEvents: number;
  authFailures: number;
  portScans: number;
  suspiciousRequests: number;
  threatsDetected: number;
  uniqueSourceIps: number;
}

// WebSocket message types
export enum WsMessageType {
  THREAT_UPDATE = 'threat_update',
  STATS_SNAPSHOT = 'stats_snapshot',
  NEW_ALERT = 'new_alert',
}

export interface WsMessage {
  type: WsMessageType;
  payload: unknown;
  timestamp: string;
}
