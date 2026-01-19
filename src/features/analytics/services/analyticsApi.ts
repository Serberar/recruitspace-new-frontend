import api from '../../../api/axios';
import type { ApiResponse } from '../../../types';
import type { RecruiterAnalytics, AnalyticsFilters } from '../types/analytics';

/**
 * Obtiene las estadísticas/analytics del recruiter
 * GET /api/dashboard/recruiter/analytics
 */
export async function getRecruiterAnalytics(
  filters: AnalyticsFilters = { period: 'month' }
): Promise<RecruiterAnalytics> {
  const params: Record<string, string> = {
    period: filters.period,
  };

  if (filters.clientId) {
    params.clientId = filters.clientId;
  }

  if (filters.offerId) {
    params.offerId = filters.offerId;
  }

  const response = await api.get<ApiResponse<RecruiterAnalytics>>(
    '/dashboard/recruiter/analytics',
    { params }
  );
  return response.data.data;
}
