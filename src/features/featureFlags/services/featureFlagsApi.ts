import api from "@/api/axios";

/**
 * Feature Flag del backend
 */
export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
}

/**
 * Respuesta del endpoint de feature flags
 */
export interface FeatureFlagsResponse {
  flags: Record<string, boolean>;
}

/**
 * API para obtener feature flags del backend
 */
export const featureFlagsApi = {
  /**
   * Obtiene todos los feature flags habilitados para el usuario actual
   */
  getFlags: async (): Promise<FeatureFlagsResponse> => {
    const response = await api.get<FeatureFlagsResponse>("/feature-flags");
    return response.data;
  },

  /**
   * Verifica si un feature flag específico está habilitado
   */
  isEnabled: async (flagName: string): Promise<boolean> => {
    try {
      const response = await api.get<{ enabled: boolean }>(
        `/feature-flags/${flagName}`
      );
      return response.data.enabled;
    } catch {
      return false;
    }
  },
};
