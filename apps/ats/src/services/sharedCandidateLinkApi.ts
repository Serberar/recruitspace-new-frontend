import api from '../api/axios';
import type { ApiResponse } from '../types';

/**
 * DTOs para SharedCandidateLink
 */

export interface SharedCandidateLinkResponse {
  id: string;
  token: string;
  selectionProcessId: string;
  expiresAt: string;
  canViewProfile: boolean;
  canViewCv: boolean;
  canJoinVideoCall: boolean;
  recipientEmail: string | null;
  recipientName: string | null;
  isRevoked: boolean;
  accessCount: number;
  lastAccessAt: string | null;
  createdAt: string;
  isExpired: boolean;
  isValid: boolean;
  daysUntilExpiration: number;
}

export interface CreateSharedCandidateLinkRequest {
  selectionProcessId: string;
  password: string;
  expiresInDays: number; // 1, 3, 7, 30
  canViewProfile?: boolean;
  canViewCv?: boolean;
  canJoinVideoCall?: boolean;
  recipientEmail?: string;
  recipientName?: string;
  sendEmail?: boolean;
}

export interface CreateSharedCandidateLinkResponse {
  link: SharedCandidateLinkResponse;
  shareUrl: string;
  password: string;
  emailSent: boolean;
}

export interface ValidateAccessRequest {
  token: string;
  password: string;
}

export interface ValidateAccessResponse {
  valid: boolean;
  reason?: 'expired' | 'revoked' | 'invalid_password' | 'not_found';
  permissions?: {
    canViewProfile: boolean;
    canViewCv: boolean;
    canJoinVideoCall: boolean;
  };
}

export interface SharedCandidateViewData {
  candidate: {
    fullName: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
  };
  cv?: {
    summary?: string;
    skills: string[];
    experience: Array<{
      company: string;
      role: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    }>;
    education: Array<{
      institution: string;
      degree: string;
      field?: string;
      startDate?: string;
      endDate?: string;
    }>;
  } | null;
  offer: {
    title: string;
    clientName: string;
  };
  status: {
    name: string;
    color: string;
  };
  videoCall?: {
    scheduledAt: string;
    url: string;
  } | null;
}

/**
 * Crea un enlace compartido para un candidato
 * POST /api/shared-candidate-links
 */
export async function createSharedCandidateLink(
  data: CreateSharedCandidateLinkRequest
): Promise<CreateSharedCandidateLinkResponse> {
  const response = await api.post<ApiResponse<CreateSharedCandidateLinkResponse>>(
    '/shared-candidate-links',
    data
  );
  return response.data.data;
}

/**
 * Lista los enlaces compartidos de un proceso
 * GET /api/shared-candidate-links/process/:processId
 */
export async function getSharedLinksByProcess(
  processId: string
): Promise<SharedCandidateLinkResponse[]> {
  const response = await api.get<ApiResponse<SharedCandidateLinkResponse[]>>(
    `/shared-candidate-links/process/${processId}`
  );
  return response.data.data;
}

/**
 * Revoca un enlace compartido
 * POST /api/shared-candidate-links/:id/revoke
 */
export async function revokeSharedLink(linkId: string): Promise<void> {
  await api.post(`/shared-candidate-links/${linkId}/revoke`);
}

/**
 * Valida el acceso a un enlace compartido (público)
 * POST /api/shared-candidate-links/validate
 */
export async function validateSharedLinkAccess(
  data: ValidateAccessRequest
): Promise<ValidateAccessResponse> {
  const response = await api.post<ApiResponse<ValidateAccessResponse>>(
    '/shared-candidate-links/validate',
    data
  );
  return response.data.data;
}

/**
 * Obtiene los datos del candidato compartido (público)
 * POST /api/shared-candidate-links/data
 */
export async function getSharedCandidateData(
  token: string,
  password: string
): Promise<SharedCandidateViewData> {
  const response = await api.post<ApiResponse<SharedCandidateViewData>>(
    '/shared-candidate-links/data',
    { token, password }
  );
  return response.data.data;
}
