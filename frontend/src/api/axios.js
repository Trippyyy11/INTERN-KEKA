import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor (keeping it simple for now, cookies handled by browser)
api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration/401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login (or let the component handle it)
            // window.location.href = '/'; 
        }
        return Promise.reject(error);
    }
);

export default api;
