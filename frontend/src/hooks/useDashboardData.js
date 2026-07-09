import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

let cachedData = null;
let cachedPromise = null;
let lastFetchTime = null;
const CACHE_TTL_MS = 60000; // 1 minute cache

export const useDashboardData = (forceRefresh = false) => {
    const [data, setData] = useState(cachedData);
    const [loading, setLoading] = useState(!cachedData);
    const [error, setError] = useState(null);

    const fetchData = async (overrideRefresh = false) => {
        const isForce = forceRefresh || overrideRefresh;
        try {
            setLoading(true);
            const now = Date.now();
            
            if (!isForce && cachedData && lastFetchTime && (now - lastFetchTime < CACHE_TTL_MS)) {
                setData(cachedData);
                setLoading(false);
                return;
            }

            if (!cachedPromise || isForce) {
                cachedPromise = API.get('/dashboard/stats');
            }

            const res = await cachedPromise;
            cachedData = res.data;
            lastFetchTime = Date.now();
            setData(cachedData);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError(err);
            toast.error('Failed to load dashboard data');
            cachedPromise = null; // reset promise so it can retry
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [forceRefresh]);

    return { data, loading, error, refetch: () => fetchData(true) };
};
