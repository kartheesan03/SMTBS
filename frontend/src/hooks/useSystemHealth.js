import { useState, useEffect } from 'react';
import API from '../api/axios';

export const useSystemHealth = (pollingIntervalMs = 60000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchHealth = async () => {
      try {
        const response = await API.get('/dashboard/system-health');
        if (isMounted) {
          setData(response.data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch system health:', err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          timeoutId = setTimeout(fetchHealth, pollingIntervalMs);
        }
      }
    };

    fetchHealth();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [pollingIntervalMs]);

  return { data, loading, error };
};
