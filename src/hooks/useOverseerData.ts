/**
 * React hooks for Overseer API data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchOverseerStatus,
  fetchSessions,
  fetchSessionDetail,
  fetchInterventions,
  subscribeToOverseerEvents,
  OverseerStatus,
  Session,
  SessionDetail,
  Intervention,
} from '@/lib/api';

// ============================================================================
// useOverseerStatus
// ============================================================================

export function useOverseerStatus(refreshInterval = 5000) {
  const [status, setStatus] = useState<OverseerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await fetchOverseerStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      // Overseer API is optional, so don't treat as fatal error
      setStatus(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchStatus]);

  return { status, loading, error, refresh: fetchStatus };
}

// ============================================================================
// useSessions
// ============================================================================

export function useSessions(limit = 20) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionsData = useCallback(async () => {
    try {
      const data = await fetchSessions(limit);
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchSessionsData();
  }, [fetchSessionsData]);

  return { sessions, loading, error, refresh: fetchSessionsData };
}

// ============================================================================
// useSessionDetail
// ============================================================================

export function useSessionDetail(sessionId: string | null) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    if (!sessionId) {
      setSession(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchSessionDetail(sessionId);
      setSession(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { session, loading, error, refresh: fetchSession };
}

// ============================================================================
// useInterventions
// ============================================================================

export function useInterventions(limit = 50) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterventionsData = useCallback(async () => {
    try {
      const data = await fetchInterventions(limit);
      setInterventions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interventions');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchInterventionsData();
  }, [fetchInterventionsData]);

  return { interventions, loading, error, refresh: fetchInterventionsData };
}

// ============================================================================
// useOverseerEvents
// ============================================================================

export interface OverseerEvent {
  timestamp: string;
  role: string;
  type?: string;
  content: string;
}

export function useOverseerEvents() {
  const [events, setEvents] = useState<OverseerEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(true);

    const cleanup = subscribeToOverseerEvents((message) => {
      setEvents((prev) => {
        const newEvents = [...prev, message as OverseerEvent];
        return newEvents.slice(-500);
      });
    });

    return () => {
      cleanup();
      setConnected(false);
    };
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return { events, connected, clearEvents };
}

// ============================================================================
// useOverseerDashboard (combined hook)
// ============================================================================

export function useOverseerDashboard() {
  const { status: overseerStatus } = useOverseerStatus(5000);
  const { sessions } = useSessions(20);
  const { interventions } = useInterventions(50);
  const { events, connected: eventsConnected } = useOverseerEvents();

  return {
    overseerStatus,
    sessions,
    interventions,
    events,
    eventsConnected,
  };
}
