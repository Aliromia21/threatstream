// Topic Router

const TOPIC_MAP: Record<string, string> = {
  auth_failure: 'auth-events',
  auth_success: 'auth-events',
  port_scan: 'network-events',
  suspicious_request: 'network-events',
  rate_limit_exceeded: 'network-events',
  brute_force_detected: 'threat-alerts',
};

export function getTopicForEvent(eventType: string): string {
  const topic = TOPIC_MAP[eventType];
  if (!topic) {
    throw new Error(`[topicRouter] No topic mapped for event type: ${eventType}`);
  }
  return topic;
}