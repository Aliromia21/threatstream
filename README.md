# ThreatStream

> Real-time threat intelligence pipeline — Kafka, PostgreSQL, WebSockets, React.

A distributed system that ingests security events in real-time, streams them through Kafka, detects threats with pattern analysis, and displays live statistics on a cybersecurity dashboard.

## Architecture

```
┌──────────────┐    ┌─────────┐    ┌──────────┐    ┌─────────┐    ┌───────────┐
│  Simulator   │───▶│ Event   │───▶│  Kafka   │───▶│Consumer │───▶│PostgreSQL │
│  (threats)   │    │ API     │    │ (topics) │    │ Service │    │  (store)  │
└──────────────┘    └─────────┘    └──────────┘    └────┬────┘    └─────┬─────┘
                                                        │               │
                                                        ▼               ▼
                                                   ┌─────────┐    ┌──────────┐
                                                   │ Threat   │    │Stats API │──▶ WebSocket ──▶ Dashboard
                                                   │ Alerts   │    │ (read)   │
                                                   └─────────┘    └──────────┘
```

## Quick Start

```bash
docker compose up --build
```

## Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Streaming     | Apache Kafka                      |
| Database      | PostgreSQL 16                     |
| Backend       | Node.js, TypeScript, Express      |
| Frontend      | React, Vite, Tailwind, Recharts   |
| Real-time     | WebSockets                        |
| DevOps        | Docker, Docker Compose, GitHub Actions |

## Status

Under active development 
