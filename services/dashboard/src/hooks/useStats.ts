import { useState, useEffect, useCallback } from 'react';
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

  const fetchAllData = useCallback(async () => {
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
      console.error('[stats] Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Live updates via WebSocket
  // On every stats_update, refresh all data from REST
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== 'stats_update' || !lastMessage.payload) return;

    const { today: newToday, topAttackers: newAttackers } = lastMessage.payload;

    // Update today and topAttackers immediately from WebSocket
    if (newToday) setToday(newToday);
    if (newAttackers) setTopAttackers(newAttackers);

    // Refresh charts and recent events from REST
    const timer = setTimeout(async () => {
      try {
        const [typesRes, timelineRes, eventsRes] = await Promise.all([
          fetch(`${API_URL}/stats/attack-types`),
          fetch(`${API_URL}/stats/timeline`),
          fetch(`${API_URL}/stats/recent-events`),
        ]);

        setAttackTypes(await typesRes.json());
        setTimeline(await timelineRes.json());
        setRecentEvents(await eventsRes.json());
      } catch (error) {
        console.error('[stats] Failed to refresh chart data:', error);
      }
    }, 500);

    return () => clearTimeout(timer);
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