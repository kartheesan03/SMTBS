import { useState, useEffect } from "react";
import API from "../api/axios";

export const useAiInsights = () => {
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    API.get("/dashboard/insights")
      .then((res) => {
        if (isMounted) {
          setAiInsights(res.data || []);
          setError(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to fetch AI insights:", err);
          setError(true);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []); 

  return { aiInsights, loading, error };
};
