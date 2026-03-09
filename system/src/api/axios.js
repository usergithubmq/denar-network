import axios from "axios";

const baseURL = import.meta.env.MODE === 'production'
    ? 'https://app.koonfinansen.com.mx'
    : 'http://127.0.0.1:8000';

// Instancia para autenticación (Sanctum)
export const authApi = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

// Instancia para el resto de la API (con prefijo /api)
const api = axios.create({
    baseURL: `${baseURL}/api`,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    config.headers.Accept = "application/json";
    if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
    }
    if (token && token !== "undefined" && token !== "") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;