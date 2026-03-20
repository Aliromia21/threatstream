import { randomSuspiciousIp, timestamp } from './helpers';

// Port Scan Pattern
// Simulates a network port scan:
// Same IP hits sequential ports
// Common ports first (22, 23, 80, 443, 3306, 5432, 8080)
// Then random high ports

const COMMON_PORTS = [21, 22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3306, 3389, 5432, 5900, 8080, 8443, 9090];

export class PortScanPattern {
  private ip: string;
  private ports: number[];
  private currentIndex: number;

  constructor() {
    this.ip = randomSuspiciousIp();
    this.ports = [...COMMON_PORTS];
    for (let i = 0; i < 10; i++) {
      this.ports.push(1024 + Math.floor(Math.random() * 64000));
    }
    this.currentIndex = 0;
  }

  public hasMore(): boolean {
    return this.currentIndex < this.ports.length;
  }

  public nextEvent(): object {
    const port = this.ports[this.currentIndex];
    this.currentIndex++;

    return {
      type: 'port_scan',
      sourceIp: this.ip,
      targetEndpoint: `port:${port}`,
      timestamp: timestamp(),
      metadata: {
        port,
        protocol: port === 443 || port === 8443 ? 'HTTPS' : 'TCP',
      },
    };
  }
}