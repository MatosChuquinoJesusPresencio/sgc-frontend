import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== '/auth/login' &&
            originalRequest.url !== '/auth/refresh'
        ) {
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post('/auth/refresh');

                isRefreshing = false;
                processQueue(null);

                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);

                localStorage.removeItem("authUser");
                sessionStorage.removeItem("authUser");
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const fetchApi = async (endpoint, options = {}) => {
    try {
        const response = await api({
            url: endpoint,
            method: options.method || 'GET',
            data: options.body ? JSON.parse(options.body) : undefined,
            ...options
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw {
                status: error.response.status,
                message: error.response.data?.message || 'Error en la petición',
                data: error.response.data
            };
        } else if (error.request) {
            console.error('Network Error:', error.request);
            throw { message: 'No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.' };
        } else {
            throw { message: error.message };
        }
    }
};

export default api;
