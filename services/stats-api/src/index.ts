import http from 'http';
import { config } from './config';
import { connectDatabase } from './database';
import app from './app';
import { setupWebSocket } from './websocket';
import { startNotificationListener, stopNotificationListener } from './websocket/notifier';

async function start(): Promise<void> {
  await connectDatabase();

  const server = http.createServer(app);

  // Attach WebSocket server to the same HTTP server
  setupWebSocket(server);

  // Start listening for PostgreSQL notifications
  await startNotificationListener();

  server.listen(config.port, () => {
    console.log(`[stats-api] Running on port ${config.port}`);
    console.log(`[stats-api] REST:      http://localhost:${config.port}/stats/today`);
    console.log(`[stats-api] WebSocket: ws://localhost:${config.port}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[stats-api] SIGTERM received — shutting down');
  await stopNotificationListener();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[stats-api] SIGINT received — shutting down');
  await stopNotificationListener();
  process.exit(0);
});

start().catch((error) => {
  console.error('[stats-api] Failed to start:', error);
  process.exit(1);
});