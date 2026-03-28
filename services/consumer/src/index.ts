import { config } from './config';
import { connectDatabase } from './database';
import { startConsumer, stopConsumer } from './kafka/consumer';
import { startCleanupTimer } from './processors/threatDetector';

async function start(): Promise<void> {
  await connectDatabase();
  await startConsumer();

  startCleanupTimer();

  console.log('[consumer] Service running — waiting for events');
  console.log('[consumer] Threat detection: brute force (10 failures/2min), port scan (8 ports/1min)');
}

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