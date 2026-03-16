-- PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Raw events
CREATE TABLE events (
    id              BIGSERIAL PRIMARY KEY,
    event_id        UUID NOT NULL DEFAULT gen_random_uuid(),
    type            VARCHAR(50) NOT NULL,
    source_ip       VARCHAR(45) NOT NULL,       
    target_endpoint VARCHAR(500),
    session_id      VARCHAR(100),
    user_id         VARCHAR(100),
    metadata        JSONB DEFAULT '{}',
    severity        VARCHAR(20),
    timestamp       TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


CREATE INDEX idx_events_type ON events (type);
CREATE INDEX idx_events_source_ip ON events (source_ip);
CREATE INDEX idx_events_timestamp ON events (timestamp);
CREATE INDEX idx_events_event_id ON events (event_id);

-- 2. Daily stats

CREATE TABLE daily_stats (
    date                DATE PRIMARY KEY,
    total_events        INTEGER DEFAULT 0,
    auth_failures       INTEGER DEFAULT 0,
    auth_successes      INTEGER DEFAULT 0,
    port_scans          INTEGER DEFAULT 0,
    suspicious_requests INTEGER DEFAULT 0,
    rate_limit_exceeded INTEGER DEFAULT 0,
    threats_detected    INTEGER DEFAULT 0,
    unique_source_ips   INTEGER DEFAULT 0,
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Attack sessions 
CREATE TABLE sessions (
    session_id      VARCHAR(100) PRIMARY KEY,
    source_ip       VARCHAR(45) NOT NULL,
    started_at      TIMESTAMPTZ NOT NULL,
    last_seen_at    TIMESTAMPTZ NOT NULL,
    event_count     INTEGER DEFAULT 0,
    event_types     VARCHAR(50)[] DEFAULT '{}',  
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_sessions_source_ip ON sessions (source_ip);
CREATE INDEX idx_sessions_active ON sessions (is_active) WHERE is_active = TRUE;

-- 4. Attack sources 
CREATE TABLE attack_sources (
    date            DATE NOT NULL,
    source_ip       VARCHAR(45) NOT NULL,
    event_count     INTEGER DEFAULT 0,
    threat_count    INTEGER DEFAULT 0,
    last_event_type VARCHAR(50),
    last_seen_at    TIMESTAMPTZ,
    PRIMARY KEY (date, source_ip)
);

-- 5. Threat alerts 
CREATE TABLE threat_alerts (
    id              BIGSERIAL PRIMARY KEY,
    alert_id        UUID NOT NULL DEFAULT gen_random_uuid(),
    type            VARCHAR(50) NOT NULL,
    severity        VARCHAR(20) NOT NULL,
    source_ip       VARCHAR(45) NOT NULL,
    description     TEXT,
    related_events  UUID[] DEFAULT '{}',       
    metadata        JSONB DEFAULT '{}',
    detected_at     TIMESTAMPTZ NOT NULL,
    resolved_at     TIMESTAMPTZ,
    is_resolved     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_severity ON threat_alerts (severity);
CREATE INDEX idx_alerts_detected_at ON threat_alerts (detected_at);
CREATE INDEX idx_alerts_resolved ON threat_alerts (is_resolved) WHERE is_resolved = FALSE;
