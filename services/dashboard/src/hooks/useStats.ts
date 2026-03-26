import { useState, useEffect } from 'react';
import { DailyStats, TopAttacker, AttackType, TimelineEntry, RecentEvent } from '../types';
import { useWebSocket } from './useWebSocket';

const API_URL = 'http://localhost:3003';

interface StatsData {
  today: DailyStats | null;
  topAttackers: TopAttacker[];
  attackTypes: AttackType[];
  timeline: TimelineEntry[];
  recentEvents: RecentEvent[];
  isConnected: boolean;
  isLoading: boolean;
}

export function useStats(): StatsData {
  const [today, setToday] = useState<DailyStats | null>(null);
  const [topAttackers, setTopAttackers] = useState<TopAttacker[]>([]);
  const [attackTypes, setAttackTypes] = useState<AttackType[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { lastMessage, isConnected } = useWebSocket();

  // Initial data load via REST
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [todayRes, attackersRes, typesRes, timelineRes, eventsRes] = await Promise.all([
          fetch(`${API_URL}/stats/today`),
          fetch(`${API_URL}/stats/top-attackers`),
          fetch(`${API_URL}/stats/attack-types`),
          fetch(`${API_URL}/stats/timeline`),
          fetch(`${API_URL}/stats/recent-events`),
        ]);

        setToday(await todayRes.json());
        setTopAttackers(await attackersRes.json());
        setAttackTypes(await typesRes.json());
        setTimeline(await timelineRes.json());
        setRecentEvents(await eventsRes.json());
      } catch (error) {
        console.error('[stats] Failed to fetch initial data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  // Live updates via WebSocket
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== 'stats_update' || !lastMessage.payload) return;

    const { today: newToday, topAttackers: newAttackers } = lastMessage.payload;

    if (newToday) setToday(newToday);
    if (newAttackers) setTopAttackers(newAttackers);
  }, [lastMessage]);

  return {
    today,
    topAttackers,
    attackTypes,
    timeline,
    recentEvents,
    isConnected,
    isLoading,
  };
}