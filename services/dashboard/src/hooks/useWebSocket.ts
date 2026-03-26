import { useState, useEffect, useRef, useCallback } from 'react';
import { WsStatsUpdate } from '../types';

const WS_URL = 'ws://localhost:3003';
const RECONNECT_DELAY = 3000;

interface UseWebSocketReturn {
  lastMessage: WsStatsUpdate | null;
  isConnected: boolean;
}

export function useWebSocket(): UseWebSocketReturn {
  const [lastMessage, setLastMessage] = useState<WsStatsUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    // Don't create multiple connections
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[ws] Connected to Stats API');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: WsStatsUpdate = JSON.parse(event.data);
        setLastMessage(data);
      } catch (error) {
        console.error('[ws] Failed to parse message:', error);
      }
    };

    ws.onclose = () => {
      console.log('[ws] Disconnected — reconnecting...');
      setIsConnected(false);
      wsRef.current = null;

      // Auto-reconnect after delay
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
    };

    ws.onerror = (error) => {
      console.error('[ws] Error:', error);
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      // Cleanup on unmount
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return { lastMessage, isConnected };
}