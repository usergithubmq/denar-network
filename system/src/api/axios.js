import axios from "axios";

// Si existe VITE_API_URL en el .env, la usamos. 
// Si no, caemos en los valores por defecto.
const baseURL = import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === 'production'
        ? 'https://app.denar.network'
        : 'http://localhost:8000');

const axiosConfig = {
    baseURL: baseURL,
    withCredentials: true,
    withXSRFToken: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
};

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