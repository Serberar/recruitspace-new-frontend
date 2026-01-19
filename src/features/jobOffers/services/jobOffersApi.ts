import api from '../../../api/axios';
import type { ApiResponse, JobOffer, PaginatedResponse, ProcessStatus } from '../../../types';

/**
 * Obtiene las ofertas asignadas al usuario actual
 * GET /api/job-offer/assigned
 */
export async function getAssignedOffers(userId?: string): Promise<JobOffer[]> {
  const params = userId ? { userId } : {};
  const response = await api.get<ApiResponse<JobOffer[]>>('/job-offer/assigned', { params });
  return response.data.data;
}

/**
 * Obtiene ofertas por organización (admin)
 * GET /api/job-offer/organization
 */
export interface JobOfferFilters {
  active?: boolean;
  assignedUserId?: string;
  clientId?: string;
  page?: number;
  limit?: number;
}

export async function getOffersByOrganization(filters?: JobOfferFilters): Promise<PaginatedResponse<JobOffer>> {
  const response = await api.get<ApiResponse<PaginatedResponse<JobOffer>>>('/job-offer/organization', {
    params: filters
  });
  return response.data.data;
}

/**
 * Obtiene una oferta por ID
 * GET /api/job-offer/:jobOfferId/client/:clientId
 */
export async function getJobOfferById(jobOfferId: string, clientId: string): Promise<JobOffer> {
  const response = await api.get<ApiResponse<JobOffer>>(`/job-offer/${jobOfferId}/client/${clientId}`);
  return response.data.data;
}

/**
 * Obtiene una oferta por ID (simplificado, sin clientId)
 * GET /api/job-offer/:id
 */
export async function getJobOfferByIdSimple(id: string): Promise<JobOffer> {
  const response = await api.get<ApiResponse<JobOffer>>(`/job-offer/${id}`);
  return response.data.data;
}

/**
 * Crea una nueva oferta
 * POST /api/job-offer
 */
export interface CustomPipelineStatusDto {
  name: string;
  color: string;
  order: number;
  isTerminal: boolean;
  action?: string | null;
  sendNotification?: boolean;
}

export interface CreateJobOfferDto {
  title: string;
  description: string;
  clientId: string;
  salary?: string;
  location?: string;
  modality?: 'remote' | 'onsite' | 'hybrid';
  requirements?: string;
  benefits?: string;
  category?: string;
  contractType?: string;
  isPublic?: boolean;
  salaryPublic?: boolean;
  publicDisplayName?: string;
  active?: boolean;
  useStandardPipeline?: boolean;
  customPipeline?: CustomPipelineStatusDto[];
}

export async function createJobOffer(data: CreateJobOfferDto): Promise<JobOffer> {
  const response = await api.post<ApiResponse<JobOffer>>('/job-offer', data);
  return response.data.data;
}

/**
 * Actualiza una oferta
 * PUT /api/job-offer/:id
 */
export async function updateJobOffer(id: string, data: Partial<CreateJobOfferDto>): Promise<JobOffer> {
  const response = await api.put<ApiResponse<JobOffer>>(`/job-offer/${id}`, data);
  return response.data.data;
}

/**
 * Activa o desactiva una oferta
 * PATCH /api/job-offer/active/:id
 */
export async function setJobOfferActive(id: string, active: boolean): Promise<JobOffer> {
  const response = await api.patch<ApiResponse<JobOffer>>(`/job-offer/active/${id}`, { active });
  return response.data.data;
}

/**
 * Obtiene ofertas por cliente
 * GET /api/job-offer/client/:clientId
 */
export async function getOffersByClient(clientId: string, active?: boolean): Promise<JobOffer[]> {
  const params = active !== undefined ? { active } : {};
  const response = await api.get<ApiResponse<JobOffer[]>>(`/job-offer/client/${clientId}`, { params });
  return response.data.data;
}

/**
 * Obtiene el pipeline de una oferta
 * GET /api/job-offer/:offerId/pipeline
 * Retorna los estados del pipeline (estándar o personalizado según la oferta)
 */
export async function getOfferPipeline(offerId: string): Promise<ProcessStatus[]> {
  const response = await api.get<ApiResponse<ProcessStatus[]>>(`/job-offer/${offerId}/pipeline`);
  return response.data.data;
}

/**
 * Filtros personalizados de una oferta
 */
export interface OfferFilters {
  skillFilters: string[];
  educationFilters: string[];
}

/**
 * Obtiene los filtros personalizados de una oferta
 * GET /api/job-offer/:offerId/filters
 */
export async function getOfferFilters(offerId: string): Promise<OfferFilters> {
  const response = await api.get<ApiResponse<OfferFilters>>(`/job-offer/${offerId}/filters`);
  return response.data.data;
}

/**
 * Actualiza los filtros personalizados de una oferta
 * PUT /api/job-offer/:offerId/filters
 */
export async function updateOfferFilters(offerId: string, filters: Partial<OfferFilters>): Promise<OfferFilters> {
  const response = await api.put<ApiResponse<OfferFilters>>(`/job-offer/${offerId}/filters`, filters);
  return response.data.data;
}

/**
 * Asigna una oferta a un recruiter (añade a la lista de asignados)
 * POST /api/job-offer/assign
 */
export async function assignOfferToRecruiter(offerId: string, userId: string): Promise<JobOffer> {
  const response = await api.post<ApiResponse<JobOffer>>('/job-offer/assign', { offerId, userId });
  return response.data.data;
}

/**
 * Desasigna un recruiter de una oferta (quita de la lista de asignados)
 * POST /api/job-offer/unassign
 */
export async function unassignOfferFromRecruiter(offerId: string, userId: string): Promise<JobOffer> {
  const response = await api.post<ApiResponse<JobOffer>>('/job-offer/unassign', { offerId, userId });
  return response.data.data;
}

/**
 * Actualiza las notas internas de una oferta
 * PUT /api/job-offer/:offerId/notes
 */
export async function updateOfferNotes(offerId: string, internalNotes: string | null): Promise<{ internalNotes: string | null }> {
  const response = await api.put<ApiResponse<{ internalNotes: string | null }>>(`/job-offer/${offerId}/notes`, { internalNotes });
  return response.data.data;
}
