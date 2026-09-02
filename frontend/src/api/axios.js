import axios from 'axios';
import { clearDashboardCache } from '../hooks/useDashboardData';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const API = axios.create({    
    baseURL: apiBaseUrl, 
    timeout: 30000  // 30 seconds — up from 120s which caused silent UI hangs
});

API.interceptors.request.use((req) => {    
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');    
    if (userInfo) {        
        req.headers.Authorization = `Bearer ${JSON.parse(userInfo).token}`;    
    }    
    return req;
});

API.interceptors.response.use(
    (response) => response,    
    (error) => {        
        if (error.response && error.response.status === 401) {            
            localStorage.removeItem('userInfo');            
            sessionStorage.removeItem('userInfo');            
            clearDashboardCache();
            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';        
            }
        }        
        return Promise.reject(error);    
    }
);

export default API;