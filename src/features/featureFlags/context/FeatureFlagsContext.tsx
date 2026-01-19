import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { featureFlagsApi } from "../services/featureFlagsApi";
import { useAppSelector } from "@/hooks/reduxHooks";

/**
 * Estado del contexto de Feature Flags
 */
interface FeatureFlagsState {
  /** Mapa de flags y sus valores */
  flags: Record<string, boolean>;
  /** Indica si los flags están cargando */
  isLoading: boolean;
  /** Error al cargar flags */
  error: string | null;
  /** Verifica si un flag está habilitado */
  isEnabled: (flagName: string) => boolean;
  /** Recarga los flags desde el backend */
  refresh: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsState | undefined>(
  undefined
);

interface FeatureFlagsProviderProps {
  children: ReactNode;
  /** Flags por defecto mientras carga */
  defaultFlags?: Record<string, boolean>;
}

/**
 * Provider de Feature Flags
 *
 * Carga los feature flags del backend y los hace disponibles
 * en toda la aplicación via contexto.
 */
export function FeatureFlagsProvider({
  children,
  defaultFlags = {},
}: FeatureFlagsProviderProps) {
  const [flags, setFlags] = useState<Record<string, boolean>>(defaultFlags);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  const loadFlags = useCallback(async () => {
    // Solo cargar si el usuario está autenticado
    if (!isLoggedIn) {
      setFlags(defaultFlags);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await featureFlagsApi.getFlags();
      setFlags({ ...defaultFlags, ...response.flags });
    } catch (err) {
      setError("Error al cargar feature flags");
      // En caso de error, usar los flags por defecto
      setFlags(defaultFlags);
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, defaultFlags]);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  const isEnabled = useCallback(
    (flagName: string): boolean => {
      return flags[flagName] ?? false;
    },
    [flags]
  );

  const value: FeatureFlagsState = {
    flags,
    isLoading,
    error,
    isEnabled,
    refresh: loadFlags,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de Feature Flags
 */
export function useFeatureFlagsContext(): FeatureFlagsState {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error(
      "useFeatureFlagsContext must be used within a FeatureFlagsProvider"
    );
  }
  return context;
}
