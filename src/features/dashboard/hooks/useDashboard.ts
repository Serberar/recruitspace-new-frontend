/**
 * useDashboard - Hook para gestionar datos del dashboard
 * Centraliza la carga del dashboard de recruiter y analytics de admin
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { RecruiterDashboard } from '@/types';
import type { RecruiterAnalytics, AnalyticsPeriod } from '@/features/analytics/types/analytics';
import { getRecruiterDashboard } from '../services/dashboardApi';
import { getRecruiterAnalytics } from '@/features/analytics/services/analyticsApi';
import { usePermissions } from '@/hooks/useRole';
import { getErrorMessage } from '@/hooks/useErrorHandler';

export interface UseDashboardReturn {
  // Recruiter dashboard data
  dashboard: RecruiterDashboard | null;
  // Admin analytics data
  analytics: RecruiterAnalytics | null;
  // State
  loading: boolean;
  error: string | null;
  period: AnalyticsPeriod;
  // Actions
  refetch: () => Promise<void>;
  setPeriod: (period: AnalyticsPeriod) => void;
}

export function useDashboard(): UseDashboardReturn {
  const [dashboard, setDashboard] = useState<RecruiterDashboard | null>(null);
  const [analytics, setAnalytics] = useState<RecruiterAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriodState] = useState<AnalyticsPeriod>('month');
  const { isAdmin } = usePermissions();

  // Ref para evitar llamadas duplicadas
  const isFetching = useRef(false);

  const fetchData = useCallback(async (selectedPeriod?: AnalyticsPeriod) => {
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      if (isAdmin) {
        const data = await getRecruiterAnalytics({ period: selectedPeriod || period });
        setAnalytics(data);
      } else {
        const data = await getRecruiterDashboard();
        setDashboard(data);
      }
    } catch (err) {
      setError(getErrorMessage(err) || 'Error al cargar dashboard');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [isAdmin, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPeriod = useCallback((newPeriod: AnalyticsPeriod) => {
    setPeriodState(newPeriod);
    fetchData(newPeriod);
  }, [fetchData]);

  return {
    dashboard,
    analytics,
    loading,
    error,
    period,
    refetch: fetchData,
    setPeriod,
  };
}
