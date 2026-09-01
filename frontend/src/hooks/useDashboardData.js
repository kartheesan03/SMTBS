import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
let cachedData = null;
let cachedPromise = null;
let lastFetchTime = null;
const CACHE_TTL_MS = 60000;

export const clearDashboardCache = () => {
    cachedData = null;
    cachedPromise = null;
    lastFetchTime = null;
};

export const useDashboardData = (forceRefresh = false) => {
    const [data, setData] = useState(cachedData);
    const [loading, setLoading] = useState(!cachedData);
    const [error, setError] = useState(null);
    const fetchData = async (overrideRefresh = false) => {
        const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
        if (!userInfo) {
            setLoading(false);
            return;
        }
        const isForce = forceRefresh || overrideRefresh;
        try {
            setLoading(true);
            const now = Date.now();
            if (!isForce && cachedData && lastFetchTime && (now - lastFetchTime < CACHE_TTL_MS)) {
                setData(cachedData);
                setLoading(false);
                return;
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
            
            if (!cachedPromise || isForce) {
                cachedPromise = API.get('/dashboard/stats', { signal: controller.signal });
            }
            const res = await cachedPromise;
            clearTimeout(timeoutId);
            
            cachedData = res.data;
            lastFetchTime = Date.now();
            setData(cachedData);
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            if (err.name === 'CanceledError' || err.message === 'canceled') {
                 setError({ message: 'Request timed out' });
                 toast.error('Dashboard data took too long to load');
            } else {
                 setError(err);
                 toast.error('Failed to load dashboard data');
            }
        } finally {
            cachedPromise = null;
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [forceRefresh]);
    return { data, loading, error, refetch: () => fetchData(true) };
};
