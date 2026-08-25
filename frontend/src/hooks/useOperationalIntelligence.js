import { useState, useEffect } from 'react';
import API from '../api/axios';

export const useOperationalIntelligence = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOperationalIntelligence = async () => {
      try {
        setLoading(true);
        const response = await API.get('/dashboard/operational-intelligence');
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch operational intelligence:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperationalIntelligence();
  }, []);

  const applyRecommendation = async (processId, suggestedAction) => {
    try {
      const response = await API.post('/dashboard/operational-intelligence/apply', {
        process_id: processId,
        suggested_action: suggestedAction
      });
      return response.data;
    } catch (err) {
      console.error('Failed to apply operational intelligence:', err);
      throw err;
    }
  };

  return { data, loading, error, applyRecommendation };
};
