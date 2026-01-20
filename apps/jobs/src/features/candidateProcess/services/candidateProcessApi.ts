import api from '../../../api/axios';
import type { ApiResponse } from '../../../types';

/**
 * Información de acceso al proceso público
 */
export interface AccessInfo {
  requiresPassword: boolean;
  candidateHasAccount: boolean;
}

/**
 * Obtiene información de acceso del proceso (si requiere contraseña)
 * GET /api/candidate-process/:publicToken/access-info
 */
export async function getAccessInfo(publicToken: string): Promise<AccessInfo> {
  const response = await api.get<ApiResponse<AccessInfo>>(`/candidate-process/${publicToken}/access-info`);
  return response.data.data;
}

/**
 * Verifica la contraseña de acceso
 * POST /api/candidate-process/:publicToken/verify-password
 */
export async function verifyPassword(publicToken: string, password: string): Promise<boolean> {
  const response = await api.post<ApiResponse<{ valid: boolean }>>(`/candidate-process/${publicToken}/verify-password`, { password });
  return response.data.data.valid;
}

/**
 * Tipos para el proceso publico del candidato
 * Alineado con PublicProcessDetailResponse del backend
 */
export interface CandidateSubmissionInfo {
  downloadUrl: string;
  submittedAt: string;
}

export interface OrganizationBranding {
  name: string;
  logoUrl: string | null;
  headerImageUrl: string | null;
  portalTitle: string | null;
  portalSubtitle: string | null;
}

export interface PublicProcessDetail {
  processId: string;
  candidateDisplayName: string;
  offerPublicData: {
    title: string;
    description: string;
    location: string | null;
    modality: string | null;
    salaryPublic: string | null;
  };
  currentStatus: {
    name: string;
    color: string | null;
    action: 'VIDEO_CALL' | 'FILE_UPLOAD' | null;
    isTerminal: boolean;
    videoRoomUrl: string | null;
    videoScheduledAt: string | null;
    recruiterFileUrl: string | null;
    candidateSubmission: CandidateSubmissionInfo | null;
  };
  // Instrucciones personalizadas del reclutador (null si no hay)
  candidateInstructions: string | null;
  currentStepId: string | null;
  steps: Array<{
    id: string;
    title: string;
    type: 'APPLICATION' | 'INTERVIEW' | 'TECH_TEST' | 'VIDEO_CALL' | 'CUSTOM';
    order: number;
    status: 'PENDING' | 'AVAILABLE' | 'COMPLETED' | 'CANCELED';
    scheduledAt: string | null;
    startsAt: string | null;
    endsAt: string | null;
    candidateActionType: 'CONFIRM_INTERVIEW' | 'UPLOAD_TEST' | 'JOIN_CALL' | null;
    videoRoomUrl: string | null;
    techTestInstructions: string | null;
  }>;
  comments: Array<{
    id: string;
    content: string;
    authorName: string;
    createdAt: string;
  }>;
  // Branding de la organización (null si no está habilitado)
  organizationBranding: OrganizationBranding | null;
  // Feature flag del sistema: si el almacenamiento está habilitado
  storageEnabled: boolean;
}

/**
 * Obtiene el detalle del proceso por token publico
 * GET /api/candidate-process/:publicToken
 */
export async function getPublicProcess(publicToken: string, password?: string, isPreview?: boolean): Promise<PublicProcessDetail> {
  const headers = password ? { 'X-Process-Password': password } : undefined;
  const params = isPreview ? { preview: 'true' } : undefined;
  const response = await api.get<ApiResponse<PublicProcessDetail>>(`/candidate-process/${publicToken}`, { headers, params });
  return response.data.data;
}

/**
 * Confirma una entrevista
 * POST /api/candidate-process/:publicToken/confirm-interview
 */
export async function confirmInterview(publicToken: string, stepId: string, password?: string): Promise<void> {
  const headers = password ? { 'X-Process-Password': password } : undefined;
  await api.post(`/candidate-process/${publicToken}/confirm-interview`, { stepId }, { headers });
}

/**
 * Sube un archivo de prueba tecnica
 * POST /api/candidate-process/:publicToken/upload-test
 */
export async function uploadTechTest(publicToken: string, stepId: string, file: File, password?: string): Promise<void> {
  const formData = new FormData();
  formData.append('stepId', stepId);
  formData.append('file', file);

  // Don't set Content-Type header manually - axios will set it with the correct boundary
  const headers = password ? { 'X-Process-Password': password } : undefined;
  await api.post(`/candidate-process/${publicToken}/upload-test`, formData, { headers });
}

/**
 * Tipo para mensajes del proceso
 */
export interface ProcessMessage {
  id: string;
  senderType: 'recruiter' | 'candidate';
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * Obtiene los mensajes del proceso
 * GET /api/candidate-process/:publicToken/messages
 */
export async function getMessages(publicToken: string, password?: string, isPreview?: boolean): Promise<ProcessMessage[]> {
  const headers = password ? { 'X-Process-Password': password } : undefined;
  const params = isPreview ? { preview: 'true' } : undefined;
  const response = await api.get<ApiResponse<ProcessMessage[]>>(`/candidate-process/${publicToken}/messages`, { headers, params });
  return response.data.data;
}

/**
 * Envia un mensaje al reclutador
 * POST /api/candidate-process/:publicToken/messages
 */
export async function sendMessage(publicToken: string, content: string, password?: string): Promise<ProcessMessage> {
  const headers = password ? { 'X-Process-Password': password } : undefined;
  const response = await api.post<ApiResponse<ProcessMessage>>(`/candidate-process/${publicToken}/messages`, { content }, { headers });
  return response.data.data;
}

/**
 * Tipo para historial de estados
 */
export interface StatusHistoryEntry {
  id: string;
  statusName: string;
  statusColor: string | null;
  changedAt: string;
}

/**
 * Obtiene el historial de estados del proceso
 * GET /api/candidate-process/:publicToken/status-history
 */
export async function getStatusHistory(publicToken: string, password?: string, isPreview?: boolean): Promise<StatusHistoryEntry[]> {
  const headers = password ? { 'X-Process-Password': password } : undefined;
  const params = isPreview ? { preview: 'true' } : undefined;
  const response = await api.get<ApiResponse<StatusHistoryEntry[]>>(`/candidate-process/${publicToken}/status-history`, { headers, params });
  return response.data.data;
}

/**
 * Solicita el reenvío de la contraseña de acceso al email del candidato
 * POST /api/candidate-process/:publicToken/resend-password
 */
export async function resendPassword(publicToken: string): Promise<void> {
  await api.post(`/candidate-process/${publicToken}/resend-password`);
}
