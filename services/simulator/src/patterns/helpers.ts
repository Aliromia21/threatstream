// Random data generators for event simulation

const SUSPICIOUS_IPS = [
  '45.33.32.156', '185.220.101.42', '91.240.118.172',
  '23.129.64.210', '171.25.193.77', '198.96.155.3',
  '103.251.167.20', '194.88.105.5', '80.82.77.139',
  '159.203.176.62',
];

const NORMAL_IPS = [
  '192.168.1.10', '192.168.1.25', '192.168.1.50',
  '10.0.0.15', '10.0.0.30', '10.0.0.45',
  '172.16.0.100', '172.16.0.200',
];

const ENDPOINTS = [
  '/api/login', '/api/users', '/api/admin',
  '/api/dashboard', '/api/settings', '/api/payments',
  '/api/profile', '/api/reports', '/api/health',
];

const USERNAMES = [
  'admin', 'root', 'administrator', 'test', 'user',
  'guest', 'info', 'support', 'service', 'manager',
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  'python-requests/2.28.0',
  'curl/7.88.1',
  'Go-http-client/1.1',
  'sqlmap/1.7',
];

export function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomSuspiciousIp(): string {
  return randomFrom(SUSPICIOUS_IPS);
}

export function randomNormalIp(): string {
  return randomFrom(NORMAL_IPS);
}

export function randomEndpoint(): string {
  return randomFrom(ENDPOINTS);
}

export function randomUsername(): string {
  return randomFrom(USERNAMES);
}

export function randomUserAgent(): string {
  return randomFrom(USER_AGENTS);
}

export function timestamp(): string {
  return new Date().toISOString();
}