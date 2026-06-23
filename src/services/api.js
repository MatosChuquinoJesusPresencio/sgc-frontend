import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // This is the equivalent of credentials: 'include'
});

// Variables para manejar múltiples peticiones concurrentes mientras se refresca el token
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

        // Verificar si el error es 401 (No autorizado) y la petición no ha sido reintentada
        // Evitamos interceptar si la petición original era para login o para el mismo refresh
        if (
            error.response?.status === 401 && 
            !originalRequest._retry && 
            originalRequest.url !== '/auth/login' && 
            originalRequest.url !== '/auth/refresh'
        ) {
            if (isRefreshing) {
                // Si ya estamos refrescando, ponemos la petición en cola
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
                // Llamamos al endpoint de refresh para obtener un nuevo Access Token (vía cookies)
                await api.post('/auth/refresh');
                
                isRefreshing = false;
                processQueue(null);
                
                // Reintentamos la petición original que había fallado
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);
                
                // Si el refresh falla (el Refresh Token expiró o es inválido), 
                // forzamos el cierre de sesión en el frontend.
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
        const { body, ...restOptions } = options;
        const response = await api({
            url: endpoint,
            method: restOptions.method || 'GET',
            ...restOptions,
            data: body,
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
