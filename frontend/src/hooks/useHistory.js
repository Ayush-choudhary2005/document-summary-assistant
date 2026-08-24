import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'dsa-history';
const MAX_ENTRIES = 20;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useHistory() {
  const [history, setHistory] = useState(loadHistory);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const addEntry = useCallback((result) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fileName: result.fileName,
      summary: result.summary,
      summaryPoints: result.summaryPoints || [],
      summaryLength: result.summaryLength,
      summaryMode: result.summaryMode,
      keywords: result.keywords?.slice(0, 5) || [],
      stats: result.stats,
      createdAt: new Date().toISOString(),
    };
    setHistory((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
    return entry;
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const removeEntry = useCallback((id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { history, addEntry, clearHistory, removeEntry };
}
