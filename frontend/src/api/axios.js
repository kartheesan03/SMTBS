import axios from 'axios';

let apiBaseUrl = import.meta.env.VITE_API_URL;
if (apiBaseUrl && !apiBaseUrl.endsWith('/api')) {
    apiBaseUrl = `${apiBaseUrl}/api`;
}

const API = axios.create({    
    baseURL: apiBaseUrl, 
    timeout: 30000 
});API.interceptors.request.use((req) => {    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');    if (userInfo) {        req.headers.Authorization = `Bearer ${JSON.parse(userInfo).token}`;    }    return req;});API.interceptors.response.use(    (response) => response,    (error) => {        if (error.response && error.response.status === 401) {            localStorage.removeItem('userInfo');            sessionStorage.removeItem('userInfo');            window.location.href = '/login';        }        return Promise.reject(error);    });export default API;