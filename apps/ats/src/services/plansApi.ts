/**
 * Plans API Service
 *
 * Servicio para gestionar planes y estado de beta.
 */

import api from '@/api/axios';

// ==================
// TYPES
// ==================

export interface BetaStatusResponse {
  hasBetaEndDate: boolean;
  betaEndDate: string | null;
  daysRemaining: number | null;
  isBetaExpired: boolean;
  message: string | null;
}

// ==================
// API FUNCTIONS
// ==================

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Obtiene el estado de la beta del usuario actual
 */
export async function getBetaStatus(): Promise<BetaStatusResponse> {
  const response = await api.get<ApiResponse<BetaStatusResponse>>('/plans/beta-status');
  return response.data.data;
}
