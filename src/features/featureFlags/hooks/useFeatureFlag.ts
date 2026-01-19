import { useFeatureFlagsContext } from "../context/FeatureFlagsContext";

/**
 * Hook para verificar si un feature flag está habilitado
 *
 * @param flagName - Nombre del feature flag a verificar
 * @returns Objeto con el estado del flag
 *
 * @example
 * ```tsx
 * const { isEnabled, isLoading } = useFeatureFlag('new-candidate-flow');
 *
 * if (isLoading) return <Skeleton />;
 * if (isEnabled) return <NewCandidateFlow />;
 * return <LegacyCandidateFlow />;
 * ```
 */
export function useFeatureFlag(flagName: string) {
  const { isEnabled, isLoading, error } = useFeatureFlagsContext();

  return {
    /** Si el flag está habilitado */
    isEnabled: isEnabled(flagName),
    /** Si los flags están cargando */
    isLoading,
    /** Error al cargar flags */
    error,
  };
}

/**
 * Hook para obtener múltiples feature flags
 *
 * @param flagNames - Array de nombres de flags a verificar
 * @returns Objeto con el estado de cada flag
 *
 * @example
 * ```tsx
 * const { flags, isLoading } = useFeatureFlags(['dark-mode', 'new-ui']);
 *
 * if (flags['dark-mode']) {
 *   // Aplicar dark mode
 * }
 * ```
 */
export function useFeatureFlags(flagNames: string[]) {
  const { isEnabled, isLoading, error } = useFeatureFlagsContext();

  const flags = flagNames.reduce(
    (acc, name) => {
      acc[name] = isEnabled(name);
      return acc;
    },
    {} as Record<string, boolean>
  );

  return {
    /** Mapa de flags y sus valores */
    flags,
    /** Si los flags están cargando */
    isLoading,
    /** Error al cargar flags */
    error,
  };
}

/**
 * Hook para obtener todos los feature flags disponibles
 *
 * @returns Objeto con todos los flags y funciones de utilidad
 *
 * @example
 * ```tsx
 * const { flags, refresh } = useAllFeatureFlags();
 *
 * // Refrescar flags manualmente
 * await refresh();
 * ```
 */
export function useAllFeatureFlags() {
  const { flags, isLoading, error, refresh } = useFeatureFlagsContext();

  return {
    /** Todos los flags disponibles */
    flags,
    /** Si los flags están cargando */
    isLoading,
    /** Error al cargar flags */
    error,
    /** Función para refrescar los flags */
    refresh,
  };
}
