jest.mock('../kafka', () => ({
  sendEvent: jest.fn().mockResolvedValue(undefined),
  getTopicForEvent: jest.fn().mockReturnValue('auth-events'),
  connectProducer: jest.fn().mockResolvedValue(undefined),
  disconnectProducer: jest.fn().mockResolvedValue(undefined),
  isProducerConnected: jest.fn().mockReturnValue(true),
}));