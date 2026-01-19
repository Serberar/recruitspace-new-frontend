/**
 * Billing API Service
 *
 * Servicio para gestionar suscripciones, add-ons y facturación.
 */

import api from '@/api/axios';

// ==================
// TYPES - Add-ons
// ==================

export type AddonType = 'extra_offer' | 'extra_recruiter';

export interface PlanAddon {
  id: string;
  type: AddonType;
  name: string;
  description: string | null;
  price: number;
  priceDisplay: string;
  currency: string;
  active: boolean;
}

export interface OrganizationAddon {
  id: string;
  addonId: string;
  quantity: number;
  lockedPrice: number;
  purchasedAt: string;
  addon: PlanAddon;
}

// ==================
// TYPES - Subscription
// ==================

export interface CurrentSubscription {
  id: string;
  planId: string;
  planName: string;
  planSlug: string;
  status: 'active' | 'trial' | 'canceled' | 'suspended';
  lockedPrice: number;
  priceDisplay: string;
  startedAt: string;
  trialEndsAt: string | null;
  canceledAt: string | null;
}

export interface EffectiveLimits {
  maxActiveOffers: number;
  maxRecruiters: number;
  maxCandidates: number;
  extraOffers: number;
  extraRecruiters: number;
}

export interface CurrentUsage {
  activeOffers: number;
  recruiters: number;
  candidates: number;
}

export interface BillingOverview {
  subscription: CurrentSubscription | null;
  limits: EffectiveLimits;
  usage: CurrentUsage;
  addons: OrganizationAddon[];
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
 * Obtiene todos los add-ons disponibles
 */
export async function getAvailableAddons(): Promise<PlanAddon[]> {
  const response = await api.get<ApiResponse<PlanAddon[]>>('/addons');
  return response.data.data;
}

/**
 * Obtiene los add-ons comprados por la organización
 */
export async function getOrganizationAddons(): Promise<OrganizationAddon[]> {
  const response = await api.get<ApiResponse<OrganizationAddon[]>>('/addons/organization');
  return response.data.data;
}

/**
 * Compra un add-on
 */
export async function purchaseAddon(
  addonId: string,
  quantity: number = 1
): Promise<OrganizationAddon> {
  const response = await api.post<ApiResponse<OrganizationAddon>>('/addons/purchase', {
    addonId,
    quantity,
  });
  return response.data.data;
}

/**
 * Obtiene los límites efectivos (plan base + add-ons)
 */
export async function getEffectiveLimits(): Promise<EffectiveLimits> {
  const response = await api.get<ApiResponse<EffectiveLimits>>('/addons/limits');
  return response.data.data;
}

/**
 * Obtiene el resumen completo de facturación
 */
export async function getBillingOverview(): Promise<BillingOverview> {
  const response = await api.get<ApiResponse<BillingOverview>>('/billing/overview');
  return response.data.data;
}

// ==================
// TYPES - Stripe
// ==================

export interface StripeStatus {
  enabled: boolean;
  publishableKey: string | null;
}

export interface SubscriptionInfo {
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'none';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  planName: string | null;
  priceId: string | null;
}

// ==================
// API FUNCTIONS - Stripe
// ==================

/**
 * Obtiene el estado de Stripe (habilitado/deshabilitado)
 */
export async function getStripeStatus(): Promise<StripeStatus> {
  const response = await api.get<ApiResponse<StripeStatus>>('/billing/stripe-status');
  return response.data.data;
}

/**
 * Obtiene información de la suscripción actual de Stripe
 */
export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
  const response = await api.get<ApiResponse<SubscriptionInfo>>('/billing/subscription');
  return response.data.data;
}

/**
 * Crea una sesión de checkout de Stripe
 */
export async function createCheckoutSession(
  priceId: string,
  planName: string,
  trialDays?: number
): Promise<string> {
  const response = await api.post<ApiResponse<{ url: string }>>('/billing/checkout', {
    priceId,
    planName,
    trialDays,
  });
  return response.data.data.url;
}

/**
 * Abre el portal de billing de Stripe
 */
export async function openBillingPortal(): Promise<string> {
  const response = await api.post<ApiResponse<{ url: string }>>('/billing/portal');
  return response.data.data.url;
}

/**
 * Cancela la suscripción (al final del período)
 */
export async function cancelSubscription(): Promise<void> {
  await api.post('/billing/cancel');
}

/**
 * Reactiva una suscripción cancelada
 */
export async function reactivateSubscription(): Promise<void> {
  await api.post('/billing/reactivate');
}
