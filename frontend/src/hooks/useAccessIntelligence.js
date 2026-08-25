import { useState, useEffect } from 'react';
import API from '../api/axios';

export const useAccessIntelligence = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await API.get('/dashboard/access-intelligence');
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch access intelligence:', err);
      setError(err.response?.data?.error || 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const applyRecommendation = async (employeeId, suggestedAddition) => {
    try {
      const response = await API.post('/dashboard/access-intelligence/apply', {
        employee_id: employeeId,
        suggested_addition: suggestedAddition
      });
      return response.data;
    } catch (err) {
      console.error('Failed to apply recommendation:', err);
      throw err;
    }
  };

  return { data, loading, error, applyRecommendation, refetch: fetchInsights };
};
