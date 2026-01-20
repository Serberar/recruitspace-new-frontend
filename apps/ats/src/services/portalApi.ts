/**
 * Portal API Service
 *
 * Servicio para gestionar datos del portal de la organización.
 */

import api from '@/api/axios';

// ==================
// TYPES
// ==================

export interface OrganizationPortal {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  customDomain: string | null;
  portalEnabled: boolean;
  createdAt: string;
}

export interface PortalFeatures {
  customBranding: boolean;
  customDomain: boolean;
  publicJobBoard: boolean;
  candidatePortal: boolean;
}

export interface SystemFeatures {
  videoInterview: boolean;
  aiAssistant: boolean;
  advancedAnalytics: boolean;
  customFields: boolean;
  integrations: boolean;
  storageEnabled: boolean;
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
 * Obtiene los datos de la organización actual
 */
export async function getOrganization(): Promise<OrganizationPortal> {
  const response = await api.get<ApiResponse<OrganizationPortal>>('/organization');
  return response.data.data;
}

/**
 * Obtiene las features del portal
 */
export async function getPortalFeatures(): Promise<PortalFeatures> {
  const response = await api.get<ApiResponse<PortalFeatures>>('/organization/portal/features');
  return response.data.data;
}

/**
 * Actualiza los datos del portal
 */
export async function updatePortal(data: Partial<OrganizationPortal>): Promise<OrganizationPortal> {
  const response = await api.patch<ApiResponse<OrganizationPortal>>('/organization/portal', data);
  return response.data.data;
}

/**
 * Obtiene las features del sistema habilitadas
 */
export async function getSystemFeatures(): Promise<SystemFeatures> {
  const response = await api.get<ApiResponse<SystemFeatures>>('/system/features');
  return response.data.data;
}
