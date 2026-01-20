import api from '../../../api/axios';
import type { ApiResponse } from '../../../types';

/**
 * Tipos para el portal del candidato
 */
export interface ExperienceItem {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
}

export interface CandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cvUrl?: string;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  skills?: string[];
  languages?: string[];
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProcess {
  id: string;
  jobOfferId: string;
  jobOfferTitle: string;
  organizationName: string;
  statusId: string;
  statusName: string;
  statusOrder: number;
  appliedAt: string;
  updatedAt: string;
  publicToken: string | null;
}

export interface ProcessDetail {
  id: string;
  jobOffer: {
    id: string;
    title: string;
    organizationName: string;
    description?: string;
  };
  status: {
    id: string;
    name: string;
    order: number;
    isFinal: boolean;
  };
  currentStep?: {
    id: string;
    type: 'INTERVIEW' | 'TECH_TEST' | 'VIDEO_CALL' | 'REVIEW';
    status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
    scheduledAt?: string;
    instructions?: string;
    meetingUrl?: string;
  };
  messages: {
    id: string;
    content: string;
    isFromCandidate: boolean;
    createdAt: string;
  }[];
  appliedAt: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  skills?: string[];
  languages?: string[];
  experience?: ExperienceItem[];
  education?: EducationItem[];
  summary?: string;
}

/**
 * Obtiene el perfil del candidato autenticado
 * GET /api/candidate-portal/profile
 */
export async function getCandidateProfile(): Promise<CandidateProfile> {
  const response = await api.get<ApiResponse<CandidateProfile>>('/candidate-portal/profile');
  return response.data.data;
}

/**
 * Actualiza el perfil del candidato
 * PUT /api/candidate-portal/profile
 */
export async function updateCandidateProfile(data: UpdateProfileDto): Promise<CandidateProfile> {
  const response = await api.put<ApiResponse<CandidateProfile>>('/candidate-portal/profile', data);
  return response.data.data;
}

/**
 * Obtiene la lista de procesos del candidato
 * GET /api/candidate-portal/processes
 */
export async function getCandidateProcesses(): Promise<CandidateProcess[]> {
  const response = await api.get<ApiResponse<CandidateProcess[]>>('/candidate-portal/processes');
  return response.data.data;
}

/**
 * Obtiene el detalle de un proceso especifico
 * GET /api/candidate-portal/processes/:processId
 */
export async function getProcessDetail(processId: string): Promise<ProcessDetail> {
  const response = await api.get<ApiResponse<ProcessDetail>>(`/candidate-portal/processes/${processId}`);
  return response.data.data;
}

/**
 * Confirma asistencia a una entrevista
 * POST /api/candidate-portal/processes/:processId/confirm-interview
 */
export async function confirmInterview(processId: string, stepId: string): Promise<void> {
  await api.post(`/candidate-portal/processes/${processId}/confirm-interview`, { stepId });
}

/**
 * Sube una prueba tecnica
 * POST /api/candidate-portal/processes/:processId/upload-test
 */
export async function uploadTechTest(processId: string, stepId: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('stepId', stepId);
  formData.append('file', file);

  // Don't set Content-Type header manually - axios will set it with the correct boundary
  await api.post(`/candidate-portal/processes/${processId}/upload-test`, formData);
}

/**
 * Sube un nuevo CV
 * POST /api/candidate-portal/cv
 */
export async function uploadCV(file: File): Promise<CandidateProfile> {
  const formData = new FormData();
  formData.append('file', file);

  // Don't set Content-Type header manually - axios will set it with the correct boundary
  const response = await api.post<ApiResponse<CandidateProfile>>('/candidate-portal/cv', formData);
  return response.data.data;
}

/**
 * Cambia la contraseña del candidato
 * POST /api/candidate-portal/change-password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await api.post('/candidate-portal/change-password', { currentPassword, newPassword });
}
