import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());


app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'event-api',
    timestamp: new Date().toISOString(),
  });
});

app.post('/events', (req, res) => {
  console.log('[event-api] Received event:', req.body);
  res.status(202).json({ accepted: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`[event-api] Running on port ${PORT}`);
  console.log(`[event-api] Health check: http://localhost:${PORT}/health`);
});
