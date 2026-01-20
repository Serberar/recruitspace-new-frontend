import axios from "axios";

/**
 * Instancia de Axios configurada para cookies httpOnly.
 *
 * Los tokens de autenticación se manejan automáticamente via cookies.
 * El navegador envía las cookies con cada request (withCredentials: true).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Endpoints que no deben triggear el refresh automático
const AUTH_ENDPOINTS = ['/auth/refresh', '/auth/me', '/auth/login', '/auth/logout'];

// Interceptor de respuesta para manejar refresh automático
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    // No intentar refresh en endpoints de auth (evita loops infinitos)
    const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint => requestUrl.includes(endpoint));

    // Si fue 401, no es un endpoint de auth, y no hemos reintentado ya
    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Lazy import para evitar dependencia circular
        const { store } = await import("@/store");
        const { refreshSession } = await import("@/store/slices/authSlice");

        // Intentar refrescar la sesión (el backend actualiza la cookie)
        await store.dispatch(refreshSession()).unwrap();
        // Reintentar la request original (el navegador enviará la cookie actualizada)
        return api(originalRequest);
      } catch {
        // Si el refresh falla, hacer logout
        const { store } = await import("@/store");
        const { logout } = await import("@/store/slices/authSlice");
        store.dispatch(logout());
      }
    }

    return Promise.reject(error);
  }
);

export default api;
