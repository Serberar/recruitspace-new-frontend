import api from '../api/axios';
import type { ApiResponse, RecruiterDashboard } from '../types';

/**
 * Obtiene el dashboard completo del recruiter
 * GET /api/dashboard/recruiter
 */
export async function getRecruiterDashboard(): Promise<RecruiterDashboard> {
  const response = await api.get<ApiResponse<RecruiterDashboard>>('/dashboard/recruiter');
  return response.data.data;
}

/**
 * Obtiene solo las métricas del pipeline
 * GET /api/dashboard/recruiter/metrics
 */
export async function getPipelineMetrics() {
  const response = await api.get('/dashboard/recruiter/metrics');
  return response.data.data;
}

/**
 * Obtiene los KPIs del recruiter
 * GET /api/dashboard/recruiter/kpis
 */
export async function getRecruiterKPIs() {
  const response = await api.get('/dashboard/recruiter/kpis');
  return response.data.data;
}

/**
 * Obtiene la actividad reciente
 * GET /api/dashboard/recruiter/activity
 */
export async function getRecentActivity(limit: number = 20) {
  const response = await api.get('/dashboard/recruiter/activity', {
    params: { limit }
  });
  return response.data.data;
}
