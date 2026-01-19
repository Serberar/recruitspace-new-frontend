/**
 * Feature Flags Module
 *
 * Proporciona hooks y contexto para manejar feature flags
 * obtenidos dinámicamente del backend.
 *
 * @example
 * ```tsx
 * // En App.tsx o layout principal
 * import { FeatureFlagsProvider } from '@/features/featureFlags';
 *
 * function App() {
 *   return (
 *     <FeatureFlagsProvider defaultFlags={{ 'dark-mode': false }}>
 *       <Router />
 *     </FeatureFlagsProvider>
 *   );
 * }
 *
 * // En cualquier componente
 * import { useFeatureFlag } from '@/features/featureFlags';
 *
 * function MyComponent() {
 *   const { isEnabled, isLoading } = useFeatureFlag('new-feature');
 *
 *   if (isLoading) return <Skeleton />;
 *   if (isEnabled) return <NewFeature />;
 *   return <OldFeature />;
 * }
 * ```
 */

// Context
export { FeatureFlagsProvider, useFeatureFlagsContext } from "./context/FeatureFlagsContext";

// Hooks
export { useFeatureFlag, useFeatureFlags, useAllFeatureFlags } from "./hooks/useFeatureFlag";

// Components
export { FeatureGate, MultiFeatureGate } from "./components/FeatureGate";

// API
export { featureFlagsApi } from "./services/featureFlagsApi";
export type { FeatureFlag, FeatureFlagsResponse } from "./services/featureFlagsApi";
