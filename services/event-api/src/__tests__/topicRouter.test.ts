import { getTopicForEvent } from '../kafka/topicRouter';

describe('Topic Router', () => {
  it('should route auth_failure to auth-events', () => {
    expect(getTopicForEvent('auth_failure')).toBe('auth-events');
  });

  it('should route auth_success to auth-events', () => {
    expect(getTopicForEvent('auth_success')).toBe('auth-events');
  });

  it('should route port_scan to network-events', () => {
    expect(getTopicForEvent('port_scan')).toBe('network-events');
  });

  it('should route suspicious_request to network-events', () => {
    expect(getTopicForEvent('suspicious_request')).toBe('network-events');
  });

  it('should route rate_limit_exceeded to network-events', () => {
    expect(getTopicForEvent('rate_limit_exceeded')).toBe('network-events');
  });

  it('should route brute_force_detected to threat-alerts', () => {
    expect(getTopicForEvent('brute_force_detected')).toBe('threat-alerts');
  });

  it('should throw for unknown event type', () => {
    expect(() => getTopicForEvent('unknown_type')).toThrow('No topic mapped');
  });
});