import { useState, useEffect } from 'react';
import API from '../api/axios';

export const useCashFlowForecaster = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCashFlowForecast = async () => {
      try {
        setLoading(true);
        const response = await API.get('/dashboard/cash-flow-forecast');
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch cash flow forecast:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlowForecast();
  }, []);

  const applyRecommendation = async (forecastId, suggestedAction) => {
    try {
      const response = await API.post('/dashboard/cash-flow-forecast/apply', {
        forecast_id: forecastId,
        suggested_action: suggestedAction
      });
      return response.data;
    } catch (err) {
      console.error('Failed to apply cash flow forecast:', err);
      throw err;
    }
  };

  return { data, loading, error, applyRecommendation };
};
