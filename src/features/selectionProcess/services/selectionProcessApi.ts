import api from '../../../api/axios';
import type { ApiResponse, SelectionProcess } from '../../../types';

/**
 * Obtiene procesos de selección por oferta
 * GET /api/selection-process/offer/:offerId
 */
export async function getProcessesByOffer(offerId: string): Promise<SelectionProcess[]> {
  const response = await api.get<ApiResponse<SelectionProcess[]>>(`/selection-process/offer/${offerId}`);
  return response.data.data;
}

/**
 * Obtiene procesos de selección por candidato
 * GET /api/selection-process/candidate/:candidateId
 */
export async function getProcessesByCandidate(candidateId: string): Promise<SelectionProcess[]> {
  const response = await api.get<ApiResponse<SelectionProcess[]>>(`/selection-process/candidate/${candidateId}`);
  return response.data.data;
}

/**
 * Obtiene un proceso por ID
 * GET /api/selection-process/:id
 */
export async function getProcessById(id: string): Promise<SelectionProcess> {
  const response = await api.get<ApiResponse<SelectionProcess>>(`/selection-process/${id}`);
  return response.data.data;
}

/**
 * Crea un nuevo proceso de selección
 * POST /api/selection-process
 */
export interface CreateSelectionProcessDto {
  candidateId: string;
  offerId: string;
  statusId?: string;
  notes?: string;
}

export async function createSelectionProcess(data: CreateSelectionProcessDto): Promise<SelectionProcess> {
  const response = await api.post<ApiResponse<SelectionProcess>>('/selection-process', data);
  return response.data.data;
}

/**
 * Actualiza el estado de un proceso
 * PATCH /api/selection-process/:id/status
 */
export async function updateProcessStatus(
  id: string,
  statusId: string,
  candidateInstructions?: string | null
): Promise<SelectionProcess> {
  const response = await api.patch<ApiResponse<SelectionProcess>>(`/selection-process/${id}/status`, {
    statusId,
    candidateInstructions,
  });
  return response.data.data;
}

/**
 * Añade una nota a un proceso
 * POST /api/selection-process/:id/notes
 */
export async function addProcessNote(id: string, note: string): Promise<SelectionProcess> {
  const response = await api.post<ApiResponse<SelectionProcess>>(`/selection-process/${id}/notes`, { note });
  return response.data.data;
}

/**
 * Obtiene el historial de cambios de estado de un proceso
 * GET /api/selection-process/:id/status-history
 */
export interface StatusHistoryEntry {
  id: string;
  statusId: string;
  statusName: string;
  statusColor: string;
  changedById: string | null;
  changedByName: string | null;
  changedAt: string;
}

export async function getProcessStatusHistory(id: string): Promise<StatusHistoryEntry[]> {
  const response = await api.get<ApiResponse<StatusHistoryEntry[]>>(`/selection-process/${id}/status-history`);
  return response.data.data;
}

/**
 * Comentarios internos de un proceso
 */
export interface ProcessComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

/**
 * Obtiene los comentarios de un proceso
 * GET /api/selection-process/:id/comments
 */
export async function getProcessComments(id: string): Promise<ProcessComment[]> {
  const response = await api.get<ApiResponse<ProcessComment[]>>(`/selection-process/${id}/comments`);
  return response.data.data;
}

/**
 * Añade un comentario a un proceso
 * POST /api/selection-process/:id/comments
 */
export async function addProcessComment(id: string, content: string): Promise<ProcessComment> {
  const response = await api.post<ApiResponse<ProcessComment>>(`/selection-process/${id}/comments`, { content });
  return response.data.data;
}

/**
 * Edita un comentario
 * PATCH /api/selection-process/comments/:commentId
 */
export async function updateProcessComment(commentId: string, content: string): Promise<ProcessComment> {
  const response = await api.patch<ApiResponse<ProcessComment>>(`/selection-process/comments/${commentId}`, { content });
  return response.data.data;
}

/**
 * Elimina un comentario
 * DELETE /api/selection-process/comments/:commentId
 */
export async function deleteProcessComment(commentId: string): Promise<void> {
  await api.delete(`/selection-process/comments/${commentId}`);
}

/**
 * Marca un proceso como revisado
 * PATCH /api/selection-process/:id/review
 */
export async function markProcessAsReviewed(id: string): Promise<void> {
  await api.patch(`/selection-process/${id}/review`);
}

/**
 * Genera o recupera el token de acceso público para un proceso
 * POST /api/selection-process/:id/public-token
 */
export async function generatePublicToken(id: string): Promise<string> {
  const response = await api.post<ApiResponse<{ publicAccessToken: string }>>(`/selection-process/${id}/public-token`);
  return response.data.data.publicAccessToken;
}

/**
 * Acciones del reclutador para un proceso
 */
export interface RecruiterActions {
  processId: string;
  currentStatus: {
    id: string;
    name: string;
    color: string | null;
    action: 'VIDEO_CALL' | 'FILE_UPLOAD' | null;
  };
  videoCall: {
    available: boolean;
    roomUrl: string | null;
    scheduledAt: string | null;
  };
  techTest: {
    recruiterCanUpload: boolean;
    candidateFileUrl: string | null;
    candidateSubmittedAt: string | null;
    recruiterFileUrl: string | null;
  };
}

/**
 * Obtiene las acciones disponibles del reclutador para un proceso
 * GET /api/selection-process/:id/recruiter-actions
 */
export async function getRecruiterActions(id: string): Promise<RecruiterActions> {
  const response = await api.get<ApiResponse<RecruiterActions>>(`/selection-process/${id}/recruiter-actions`);
  return response.data.data;
}

/**
 * Sube un archivo de prueba técnica del reclutador
 * POST /api/selection-process/:id/upload-tech-test
 */
export interface UploadTechTestResponse {
  fileKey: string;
  stepId: string;
}

export async function uploadTechTestFile(processId: string, file: File): Promise<UploadTechTestResponse> {
  const formData = new FormData();
  formData.append('file', file);

  // Don't set Content-Type header manually - axios will set it with the correct boundary
  const response = await api.post<ApiResponse<UploadTechTestResponse>>(
    `/selection-process/${processId}/upload-tech-test`,
    formData
  );
  return response.data.data;
}

/**
 * Elimina el archivo de prueba técnica subido por el reclutador
 * DELETE /api/selection-process/:id/recruiter-file
 */
export async function deleteRecruiterFile(processId: string): Promise<void> {
  await api.delete(`/selection-process/${processId}/recruiter-file`);
}

/**
 * Programa una entrevista/videoconferencia
 * POST /api/selection-process/:processId/schedule-interview
 */
export interface ScheduleInterviewInput {
  title?: string;
  startsAt: string; // ISO date string
  endsAt?: string;
  hasVideoCall: boolean;
  visibleToCandidate: boolean;
  requiresConfirmation: boolean;
}

export interface ScheduleInterviewResponse {
  stepId: string;
  videoRoomUrl: string | null;
}

export async function scheduleInterview(
  processId: string,
  data: ScheduleInterviewInput
): Promise<ScheduleInterviewResponse> {
  const response = await api.post<ApiResponse<ScheduleInterviewResponse>>(
    `/selection-process/${processId}/schedule-interview`,
    data
  );
  return response.data.data;
}

/**
 * Actualiza la programación de una videollamada
 * PATCH /api/selection-process/:processId/video-call-schedule
 */
export async function updateVideoCallSchedule(
  processId: string,
  startsAt: string
): Promise<{ stepId: string; startsAt: string | null }> {
  const response = await api.patch<ApiResponse<{ stepId: string; startsAt: string | null }>>(
    `/selection-process/${processId}/video-call-schedule`,
    { startsAt }
  );
  return response.data.data;
}

/**
 * Elimina la programación de una videollamada (sin borrar el step)
 * DELETE /api/selection-process/:processId/video-call-schedule
 */
export async function deleteVideoCallSchedule(processId: string): Promise<void> {
  await api.delete(`/selection-process/${processId}/video-call-schedule`);
}

/**
 * Actualiza las instrucciones para el candidato
 * PATCH /api/selection-process/:processId/instructions
 */
export async function updateCandidateInstructions(
  processId: string,
  candidateInstructions: string | null
): Promise<{ candidateInstructions: string | null }> {
  const response = await api.patch<ApiResponse<{ candidateInstructions: string | null }>>(
    `/selection-process/${processId}/instructions`,
    { candidateInstructions }
  );
  return response.data.data;
}

/**
 * Tipo para mensajes del proceso
 */
export interface ProcessMessageData {
  id: string;
  senderType: 'recruiter' | 'candidate';
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * Obtiene los mensajes de un proceso
 * GET /api/selection-process/:processId/messages
 */
export async function getProcessMessages(processId: string): Promise<ProcessMessageData[]> {
  const response = await api.get<ApiResponse<ProcessMessageData[]>>(`/selection-process/${processId}/messages`);
  return response.data.data;
}

/**
 * Envía un mensaje al candidato
 * POST /api/selection-process/:processId/messages
 */
export async function sendProcessMessage(processId: string, content: string): Promise<ProcessMessageData> {
  const response = await api.post<ApiResponse<ProcessMessageData>>(`/selection-process/${processId}/messages`, { content });
  return response.data.data;
}

/**
 * Cuenta mensajes no leídos del candidato
 * GET /api/selection-process/:processId/unread-messages
 */
export async function getUnreadMessagesCount(processId: string): Promise<number> {
  const response = await api.get<ApiResponse<{ unreadCount: number }>>(`/selection-process/${processId}/unread-messages`);
  return response.data.data.unreadCount;
}
