import { config } from './config';
import app from './app';
import { connectProducer, disconnectProducer } from './kafka';

async function start(): Promise<void> {
  // Connect to Kafka before accepting traffic
  await connectProducer();

  app.listen(config.port, () => {
    console.log(`[event-api] Running on port ${config.port}`);
    console.log(`[event-api] Health check: http://localhost:${config.port}/health`);
    console.log(`[event-api] POST events:  http://localhost:${config.port}/events`);
  });
}

process.on('SIGTERM', async () => {
  console.log('[event-api] SIGTERM received — shutting down');
  await disconnectProducer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[event-api] SIGINT received — shutting down');
  await disconnectProducer();
  process.exit(0);
});

start().catch((error) => {
  console.error('[event-api] Failed to start:', error);
  process.exit(1);
});