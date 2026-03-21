import axios from "axios";

const baseURL = import.meta.env.MODE === 'production'
    ? 'https://app.koonfinansen.com.mx'
    : 'http://127.0.0.1:8000';

// Configuración unificada para manejar credenciales y tokens automáticamente
const axiosConfig = {
    baseURL: baseURL,
    withCredentials: true,    // Indispensable para que las cookies viajen
    withXSRFToken: true,      // Envía el token CSRF automáticamente
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
};

// 1. Instancia para peticiones globales (úsala para /sanctum/csrf-cookie)
export const authApi = axios.create(axiosConfig);

// 2. Instancia para la API (con prefijo /api)
const api = axios.create({
    ...axiosConfig,
    baseURL: `${baseURL}/api`,
});

// Interceptor para inyectar el Token Bearer si existe en localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;