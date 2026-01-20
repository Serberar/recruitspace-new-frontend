import { logger } from '@/lib/logger';
import axios from "axios";
import i18n from "i18next";
import { store } from "../../../app/store";
import { logout, refreshSession } from "../authSlice";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Instancia de Axios para servicios de autenticación.
 * Configurada para cookies httpOnly.
 *
 * Los tokens se manejan automáticamente via cookies.
 * El navegador envía las cookies con cada request (withCredentials: true).
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor de request - añade Accept-Language header
api.interceptors.request.use((config) => {
  config.headers["Accept-Language"] = i18n.language || "es";
  return config;
});

// Interceptor de respuesta → extrae data del envelope y maneja refresh
api.interceptors.response.use(
  (response) => {
    // Si la respuesta tiene el formato { success, data }, extraemos data
    if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si fue 401 y no hemos reintentado ya
    if (error.response?.status === 401 && !originalRequest._retry) {
      // No intentar refresh en rutas de autenticación (no tiene sentido)
      const isAuthRoute = originalRequest.url?.includes('/auth/login') ||
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh');

      if (isAuthRoute) {
        // En login/register/refresh, devolver el error original del backend
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Intentar refrescar la sesión (el backend actualiza la cookie)
        await store.dispatch(refreshSession()).unwrap();
        // Reintentar la request original (el navegador enviará la cookie actualizada)
        return api(originalRequest);
      } catch (refreshError) {
        logger.error("Refresh token inválido, cerrando sesión");
        store.dispatch(logout());
        // Devolver el error original, no el de refresh
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
