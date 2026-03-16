/**
 * Hermes Hunter Dashboard - API Client
 * Communicates with Hunter and Overseer APIs for live data
 */

const HUNTER_API_URL = process.env.NEXT_PUBLIC_HUNTER_API_URL || 'https://hermes-alpha-hunter.fly.dev';
const OVERSEER_API_URL = process.env.NEXT_PUBLIC_OVERSEER_API_URL;

const HUNTER_API_TOKEN = process.env.NEXT_PUBLIC_HUNTER_API_TOKEN;

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Hunter API Client
// ============================================================================

export interface HunterStatus {
  status: string;
  active_missions: number;
  total_missions: number;
  uptime: string;
}

export interface HunterMetrics {
  status: string;
  uptime: string;
  missions: {
    active: number;
    completed: number;
    failed: number;
    total: number;
  };
  vulnerabilities: {
    total: number;
  };
  performance: {
    avg_mission_duration: string;
    success_rate: string;
  };
  system: {
    workspace_size_mb: number;
    log_entries: number;
  };
}

export interface Vulnerability {
  id: string;
  file: string;
  mission_id: string;
  discovered_at: string;
  preview: string;
}

export interface VulnerabilityReport {
  id: string;
  file: string;
  content: string;
  discovered_at: string;
}

export interface LogEntry {
  timestamp: string;
  type: string;
  message: string;
}

export async function fetchHunterStatus(): Promise<HunterStatus> {
  const response = await fetch(`${HUNTER_API_URL}/api/status`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Hunter API error: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchHunterMetrics(): Promise<HunterMetrics> {
  const response = await fetch(`${HUNTER_API_URL}/api/metrics`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Hunter API error: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchVulnerabilities(): Promise<Vulnerability[]> {
  const response = await fetch(`${HUNTER_API_URL}/api/vulnerabilities`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Hunter API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.vulnerabilities || [];
}

export async function fetchVulnerability(id: string): Promise<VulnerabilityReport> {
  const response = await fetch(`${HUNTER_API_URL}/api/vulnerabilities/${id}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`Hunter API error: ${response.status}`);
  }
  
  return response.json();
}

export function subscribeToHunterLogs(
  onMessage: (entry: LogEntry) => void,
  onOpen?: () => void,
  onError?: (error: Event) => void
): () => void {
  const eventSource = new EventSource(`${HUNTER_API_URL}/api/logs/stream`);
  let errorLogged = false;

  eventSource.onopen = () => {
    errorLogged = false;
    onOpen?.();
  };

  eventSource.onmessage = (event) => {
    try {
      const entry: LogEntry = JSON.parse(event.data);
      onMessage(entry);
    } catch (e) {
      console.warn('Error parsing log entry:', e);
    }
  };

  eventSource.onerror = (error) => {
    if (!errorLogged) {
      console.warn('Hunter log stream disconnected, will retry automatically');
      errorLogged = true;
    }
    onError?.(error);
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

// ============================================================================
// Overseer API Client
// ============================================================================

export interface OverseerStatus {
  status: string;
  uptime: string;
  sessions_count: number;
  active_conversation: boolean;
}

export interface Session {
  id: string;
  created_at: string;
  message_count: number;
  last_activity: string;
  status: string;
}

export interface SessionDetail extends Session {
  messages: Array<{
    timestamp: string;
    role: string;
    content: string;
  }>;
  metadata: Record<string, unknown>;
}

export interface Intervention {
  timestamp: string;
  type: string;
  description: string;
  details: Record<string, unknown>;
}

export async function fetchOverseerStatus(): Promise<OverseerStatus> {
  if (!OVERSEER_API_URL) {
    throw new Error('Overseer API URL not configured');
  }
  
  const response = await fetch(`${OVERSEER_API_URL}/overseer/status`);
  
  if (!response.ok) {
    throw new Error(`Overseer API error: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchSessions(limit = 50): Promise<Session[]> {
  if (!OVERSEER_API_URL) {
    throw new Error('Overseer API URL not configured');
  }
  
  const response = await fetch(`${OVERSEER_API_URL}/overseer/sessions?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error(`Overseer API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.sessions || [];
}

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail> {
  if (!OVERSEER_API_URL) {
    throw new Error('Overseer API URL not configured');
  }
  
  const response = await fetch(`${OVERSEER_API_URL}/overseer/sessions/${sessionId}`);
  
  if (!response.ok) {
    throw new Error(`Overseer API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.session;
}

export async function fetchInterventions(limit = 50): Promise<Intervention[]> {
  if (!OVERSEER_API_URL) {
    throw new Error('Overseer API URL not configured');
  }
  
  const response = await fetch(`${OVERSEER_API_URL}/overseer/interventions?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error(`Overseer API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.interventions || [];
}

export function subscribeToOverseerEvents(
  onMessage: (message: unknown) => void,
  onError?: (error: Event) => void
): () => void {
  if (!OVERSEER_API_URL) {
    console.warn('Overseer API URL not configured');
    return () => {};
  }
  
  const eventSource = new EventSource(`${OVERSEER_API_URL}/overseer/events/stream`);
  let errorLogged = false;

  eventSource.onopen = () => {
    errorLogged = false;
  };

  eventSource.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      onMessage(message);
    } catch (e) {
      console.warn('Error parsing Overseer event:', e);
    }
  };

  eventSource.onerror = (error) => {
    if (!errorLogged) {
      console.warn('Overseer event stream disconnected, will retry automatically');
      errorLogged = true;
    }
    onError?.(error);
  };
  
  return () => {
    eventSource.close();
  };
}

// ============================================================================
// Utilities
// ============================================================================

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {};
  
  if (HUNTER_API_TOKEN) {
    headers['Authorization'] = `Bearer ${HUNTER_API_TOKEN}`;
  }
  
  return headers;
}

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).replace(',', '');
}

export function formatDuration(duration: string): string {
  // Parse duration like "123.4s" and format nicely
  const match = duration.match(/^([\d.]+)s$/);
  if (!match) return duration;
  
  const seconds = parseFloat(match[1]);
  
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(1);
  return `${minutes}m ${remainingSeconds}s`;
}
