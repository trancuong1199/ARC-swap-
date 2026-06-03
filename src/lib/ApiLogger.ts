export interface ApiLogEntry {
  id: string;
  status: number;
  method: string;
  path: string;
  date: string;
  time: string;
}

// In-memory log store
let logs: ApiLogEntry[] = [];
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export const addApiLog = (log: Omit<ApiLogEntry, 'id' | 'date' | 'time'>) => {
  const now = new Date();
  const newLog: ApiLogEntry = {
    ...log,
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString('en-US', { hour12: false })
  };
  
  logs = [newLog, ...logs];
  listeners.forEach(l => l());
};

export const getApiLogs = () => logs;

export const subscribeToApiLogs = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
