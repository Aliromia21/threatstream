import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// WebSocket Server

let wss: WebSocketServer;
let clientCount = 0;

export function setupWebSocket(server: HttpServer): void {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    clientCount++;
    console.log(`[ws] Client connected (total: ${clientCount})`);

    // Send welcome message with current connection info
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to ThreatStream',
      timestamp: new Date().toISOString(),
    }));

    ws.on('close', () => {
      clientCount--;
      console.log(`[ws] Client disconnected (total: ${clientCount})`);
    });

    ws.on('error', (error) => {
      console.error('[ws] Client error:', error);
    });
  });

  console.log('[ws] WebSocket server ready');
}

// Broadcast to all connected clients

export function broadcast(data: object): void {
  if (!wss) return;

  const message = JSON.stringify(data);
  let sent = 0;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      sent++;
    }
  });
}

export function getClientCount(): number {
  return clientCount;
}