/**
 * React hooks for Hunter API data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchHunterStatus,
  fetchHunterMetrics,
  fetchVulnerabilities,
  subscribeToHunterLogs,
  HunterStatus,
  HunterMetrics,
  Vulnerability,
  LogEntry,
} from '@/lib/api';

// ============================================================================
// useHunterStatus
// ============================================================================

export function useHunterStatus(refreshInterval = 5000) {
  const [status, setStatus] = useState<HunterStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await fetchHunterStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Hunter status');
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
// useHunterMetrics
// ============================================================================

export function useHunterMetrics(refreshInterval = 10000) {
  const [metrics, setMetrics] = useState<HunterMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await fetchHunterMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Hunter metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchMetrics]);

  return { metrics, loading, error, refresh: fetchMetrics };
}

// ============================================================================
// useVulnerabilities
// ============================================================================

export function useVulnerabilities(refreshInterval = 30000) {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVulns = useCallback(async () => {
    try {
      const data = await fetchVulnerabilities();
      setVulnerabilities(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vulnerabilities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVulns();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchVulns, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchVulns]);

  return { vulnerabilities, loading, error, refresh: fetchVulns };
}

// ============================================================================
// useHunterLogs
// ============================================================================

export function useHunterLogs(initialLimit = 50) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);

    const cleanup = subscribeToHunterLogs(
      (entry) => {
        setLogs((prev) => {
          const newLogs = [...prev, entry];
          // Keep last 500 entries
          return newLogs.slice(-500);
        });
      },
      () => {
        setConnected(true);
        setError(null);
      },
      () => {
        setConnected(false);
      }
    );

    return () => {
      cleanup();
      setConnected(false);
    };
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { logs, connected, error, clearLogs };
}

// ============================================================================
// useHunterDashboard (combined hook)
// ============================================================================

export function useHunterDashboard() {
  const { status: hunterStatus, loading: statusLoading } = useHunterStatus(5000);
  const { metrics, loading: metricsLoading } = useHunterMetrics(10000);
  const { vulnerabilities, loading: vulnsLoading } = useVulnerabilities(30000);
  const { logs, connected: logsConnected } = useHunterLogs();

  const loading = statusLoading || metricsLoading || vulnsLoading;

  return {
    hunterStatus,
    metrics,
    vulnerabilities,
    logs,
    logsConnected,
    loading,
  };
}
