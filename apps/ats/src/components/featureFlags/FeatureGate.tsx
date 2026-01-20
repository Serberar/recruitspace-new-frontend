import type { ReactNode } from "react";
import { useFeatureFlag } from "../../hooks/useFeatureFlag";

interface FeatureGateProps {
  /** Nombre del feature flag a verificar */
  flag: string;
  /** Contenido a mostrar si el flag está habilitado */
  children: ReactNode;
  /** Contenido a mostrar si el flag está deshabilitado (opcional) */
  fallback?: ReactNode;
  /** Contenido a mostrar mientras carga (opcional) */
  loading?: ReactNode;
}

/**
 * Componente para renderizado condicional basado en feature flags
 *
 * @example
 * ```tsx
 * <FeatureGate
 *   flag="new-dashboard"
 *   fallback={<OldDashboard />}
 *   loading={<Skeleton />}
 * >
 *   <NewDashboard />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  flag,
  children,
  fallback = null,
  loading = null,
}: FeatureGateProps) {
  const { isEnabled, isLoading } = useFeatureFlag(flag);

  if (isLoading && loading) {
    return <>{loading}</>;
  }

  if (isEnabled) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

interface MultiFeatureGateProps {
  /** Array de feature flags que deben estar habilitados */
  flags: string[];
  /** Si true, requiere que TODOS los flags estén habilitados. Si false, requiere AL MENOS UNO */
  requireAll?: boolean;
  /** Contenido a mostrar si las condiciones se cumplen */
  children: ReactNode;
  /** Contenido a mostrar si las condiciones no se cumplen */
  fallback?: ReactNode;
  /** Contenido a mostrar mientras carga */
  loading?: ReactNode;
}

/**
 * Componente para renderizado condicional basado en múltiples feature flags
 *
 * @example
 * ```tsx
 * // Requiere todos los flags
 * <MultiFeatureGate flags={['feature-a', 'feature-b']} requireAll>
 *   <AdvancedFeature />
 * </MultiFeatureGate>
 *
 * // Requiere al menos uno
 * <MultiFeatureGate flags={['beta-ui', 'new-ui']} requireAll={false}>
 *   <NewUI />
 * </MultiFeatureGate>
 * ```
 */
export function MultiFeatureGate({
  flags,
  requireAll = true,
  children,
  fallback = null,
  loading = null,
}: MultiFeatureGateProps) {
  // Usamos el primer flag para verificar el loading
  const { isLoading } = useFeatureFlag(flags[0] || "");

  if (isLoading && loading) {
    return <>{loading}</>;
  }

  // Verificamos todos los flags
  const FlagChecker = () => {
    const results = flags.map((flag) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { isEnabled } = useFeatureFlag(flag);
      return isEnabled;
    });

    const allEnabled = results.every(Boolean);
    const someEnabled = results.some(Boolean);

    const shouldRender = requireAll ? allEnabled : someEnabled;

    if (shouldRender) {
      return <>{children}</>;
    }

    return <>{fallback}</>;
  };

  return <FlagChecker />;
}
