import { config } from './config';
import app from './app';

app.listen(config.port, () => {
  console.log(`[event-api] Running on port ${config.port}`);
  console.log(`[event-api] Health check: http://localhost:${config.port}/health`);
  console.log(`[event-api] POST events:  http://localhost:${config.port}/events`);
});
