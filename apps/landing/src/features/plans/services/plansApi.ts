/**
 * Plans API Service
 *
 * Servicio para obtener planes desde el backend.
 */

import api from '@/api/axios';

export type AccountType = 'freelance' | 'company';

export interface PlanLimits {
  maxActiveOffers: number;
  maxRecruiters: number;
  maxCandidates: number;
}

export interface PlanFeatures {
  customBranding: boolean;
  customPipelines: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  teamCollaboration: boolean;
  candidatePool: boolean;
  bulkActions: boolean;
  integrations: boolean;
  whiteLabel: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  accountType: AccountType;

  // Precios
  price: number;
  priceDisplay: string;
  promoPrice: number | null;
  promoPriceDisplay: string | null;
  promoEndsAt: string | null;
  hasActivePromo: boolean;
  currency: string;
  billingInterval: string;

  // Trial
  trialDays: number;
  trialText: string | null;

  // Límites y features
  limits: PlanLimits;
  features: PlanFeatures | null;

  // UI
  description: string | null;
  badge: string | null;
  highlightText: string | null;
  isBeta: boolean;
  isFree: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Obtiene todos los planes públicos y activos
 */
export async function getPlans(accountType?: AccountType): Promise<Plan[]> {
  const params = accountType ? { accountType } : {};
  const response = await api.get<ApiResponse<Plan[]>>('/plans', { params });
  return response.data.data;
}

/**
 * Obtiene un plan por su ID
 */
export async function getPlanById(planId: string): Promise<Plan> {
  const response = await api.get<ApiResponse<Plan>>(`/plans/${planId}`);
  return response.data.data;
}

export interface SelectPlanResponse {
  subscriptionId?: string;
  planName: string;
  status?: string;
  requiresPayment?: boolean;
  checkoutUrl?: string;
}

/**
 * Selecciona un plan inicial para usuarios autenticados sin suscripción
 */
export async function selectPlan(planId: string): Promise<SelectPlanResponse> {
  const response = await api.post<ApiResponse<SelectPlanResponse>>('/billing/select-plan', { planId });
  return response.data.data;
}

export interface BetaStatusResponse {
  hasBetaEndDate: boolean;
  betaEndsAt: string | null;
  isBetaExpired: boolean;
  isBetaEndingSoon: boolean;
  betaDaysRemaining: number | null;
  message: string | null;
}

/**
 * Obtiene el estado de la beta activa (si hay fecha de fin definida)
 * Usado para mostrar avisos en login y dashboard
 */
export async function getBetaStatus(): Promise<BetaStatusResponse> {
  const response = await api.get<ApiResponse<BetaStatusResponse>>('/plans/beta-status');
  return response.data.data;
}
