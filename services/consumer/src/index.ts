import { config } from './config';
import { connectDatabase } from './database';
import { startConsumer, stopConsumer } from './kafka/consumer';
import { startCleanupTimer } from './processors/threatDetector';
import { flushRemaining } from './processors/batchProcessor';

async function start(): Promise<void> {
  await connectDatabase();
  await startConsumer();
  startCleanupTimer();

  console.log('[consumer] Service running — batch mode enabled');
  console.log('[consumer] Batch: 50 events or 1 second flush interval');
}

process.on('SIGTERM', async () => {
  console.log('[consumer] SIGTERM received — flushing buffer');
  await flushRemaining();  // Flush remaining events before exit
  await stopConsumer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[consumer] SIGINT received — flushing buffer');
  await flushRemaining();
  await stopConsumer();
  process.exit(0);
});

start().catch((error) => {
  console.error('[consumer] Failed to start:', error);
  process.exit(1);
});