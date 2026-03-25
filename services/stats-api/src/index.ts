import { config } from './config';
import { connectDatabase } from './database';
import app from './app';

async function start(): Promise<void> {
  await connectDatabase();

  app.listen(config.port, () => {
    console.log(`[stats-api] Running on port ${config.port}`);
    console.log(`[stats-api] Health: http://localhost:${config.port}/health`);
    console.log(`[stats-api] Stats:  http://localhost:${config.port}/stats/today`);
  });
}

start().catch((error) => {
  console.error('[stats-api] Failed to start:', error);
  process.exit(1);
});