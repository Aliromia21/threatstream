import {
  randomSuspiciousIp,
  randomUsername,
  randomUserAgent,
  timestamp,
} from './helpers';

// Brute Force Pattern
// Simulates a real brute force attack:
// Same IP sends 20-50 auth_failure events
// Always targeting /api/login
// Trying different usernames
// Events come in rapid bursts


export class BruteForcePattern {
  private ip: string;
  private eventsRemaining: number;
  private userAgent: string;

  constructor() {
    this.ip = randomSuspiciousIp();
    this.eventsRemaining = 20 + Math.floor(Math.random() * 30); // 20-50 events
    this.userAgent = randomUserAgent();
  }

  public hasMore(): boolean {
    return this.eventsRemaining > 0;
  }

  public nextEvent(): object {
    this.eventsRemaining--;

    return {
      type: 'auth_failure',
      sourceIp: this.ip,
      targetEndpoint: '/api/login',
      timestamp: timestamp(),
      metadata: {
        username: randomUsername(),
        userAgent: this.userAgent,
        attemptNumber: this.totalEvents() - this.eventsRemaining,
      },
    };
  }

  private totalEvents(): number {
    return 20 + Math.floor(Math.random() * 30);
  }
}