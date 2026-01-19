/**
 * useAnalytics - Hook para gestionar analytics
 * Centraliza la carga de métricas y estadísticas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  RecruiterAnalytics,
  AnalyticsPeriod,
  AnalyticsFilters,
} from '../types/analytics';
import { getRecruiterAnalytics } from '../services/analyticsApi';
import { getErrorMessage } from '@/hooks/useErrorHandler';

export interface UseAnalyticsReturn {
  analytics: RecruiterAnalytics | null;
  loading: boolean;
  error: string | null;
  period: AnalyticsPeriod;
  refetch: () => Promise<void>;
  setPeriod: (period: AnalyticsPeriod) => void;
  setFilters: (filters: Partial<AnalyticsFilters>) => void;
}

export function useAnalytics(initialPeriod: AnalyticsPeriod = 'month'): UseAnalyticsReturn {
  const [analytics, setAnalytics] = useState<RecruiterAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AnalyticsFilters>({ period: initialPeriod });

  // Ref para evitar llamadas duplicadas
  const isFetching = useRef(false);

  const fetchAnalytics = useCallback(async (selectedFilters?: AnalyticsFilters) => {
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await getRecruiterAnalytics(selectedFilters || filters);
      setAnalytics(data);
    } catch (err) {
      setError(getErrorMessage(err) || 'Error al cargar analytics');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const setPeriod = useCallback((newPeriod: AnalyticsPeriod) => {
    const newFilters = { ...filters, period: newPeriod };
    setFiltersState(newFilters);
    fetchAnalytics(newFilters);
  }, [filters, fetchAnalytics]);

  const setFilters = useCallback((partialFilters: Partial<AnalyticsFilters>) => {
    const newFilters = { ...filters, ...partialFilters };
    setFiltersState(newFilters);
    fetchAnalytics(newFilters);
  }, [filters, fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    period: filters.period,
    refetch: fetchAnalytics,
    setPeriod,
    setFilters,
  };
}
