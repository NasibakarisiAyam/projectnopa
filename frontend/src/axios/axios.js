import axios from 'axios';

// axios instance bismillah
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// req interseptor
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//interseptor 
instance.interceptors.response.use(
    (response) => {
        const data = response?.data;
        // If API returns an app-level code indicating error, reject it so client error handling runs
        if (data && typeof data === 'object' && 'code' in data && data.code !== 200) {
            const err = new Error(data.message || 'API error');
            err.response = { status: data.code || response.status, data };
            return Promise.reject(err);
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default instance;
