import { config } from './config';
import { connectDatabase } from './database';
import { startConsumer, stopConsumer } from './kafka/consumer';

async function start(): Promise<void> {
  // Connecting to PostgreSQL
  await connectDatabase();

  // Consuming from Kafka
  await startConsumer();

  console.log('[consumer] Service running — waiting for events');
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[consumer] SIGTERM received — shutting down');
  await stopConsumer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[consumer] SIGINT received — shutting down');
  await stopConsumer();
  process.exit(0);
});

start().catch((error) => {
  console.error('[consumer] Failed to start:', error);
  process.exit(1);
});