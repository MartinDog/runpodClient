import { useState, useCallback, useEffect } from "react";

export function useLogs(lines = 200) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://d8f5euw4493kgn-8080.proxy.runpod.net/api/logs?lines=${lines}`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setLogs(text.split("\n").filter((line) => line.length > 0));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [lines]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const clearLogs = useCallback(() => setLogs([]), []);

  return { logs, loading, error, refetch: fetchLogs, clearLogs };
}
