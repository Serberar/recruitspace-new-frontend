import api from '../api/axios';
import type { ApiResponse } from '../types';

/**
 * Datos para crear un candidato
 */
export interface CreateCandidateDto {
  email: string;
  fullName: string;
  phone?: string;
  linkedinUrl?: string;
  notes?: string;
}

/**
 * Respuesta del candidato creado
 */
export interface CandidateResponse {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  linkedinUrl: string | null;
  organizationId: string;
  createdAt: string;
}

/**
 * Crea un nuevo candidato
 * POST /api/candidate
 */
export async function createCandidate(data: CreateCandidateDto): Promise<CandidateResponse> {
  const response = await api.post<ApiResponse<CandidateResponse>>('/candidate', data);
  return response.data.data;
}

/**
 * Busca un candidato por email
 * GET /api/candidate/by-email?email=xxx
 */
export async function findCandidateByEmail(email: string): Promise<CandidateResponse | null> {
  try {
    const response = await api.get<ApiResponse<CandidateResponse>>('/candidate/by-email', {
      params: { email },
    });
    return response.data.data;
  } catch (error) {
    // Si no existe, devuelve null
    if ((error as { response?: { status: number } }).response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Obtiene todos los candidatos de la organización
 * GET /api/candidate/organization
 */
export async function getCandidatesByOrganization(): Promise<CandidateResponse[]> {
  const response = await api.get<ApiResponse<CandidateResponse[]>>('/candidate/organization');
  return response.data.data;
}

/**
 * Datos para actualizar el perfil de un candidato
 */
export interface UpdateCandidateProfileDto {
  fullName?: string;
  phone?: string;
  linkedinUrl?: string;
  skills?: string[];
  languages?: string[];
  experience?: Array<{
    company?: string;
    position?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    current?: boolean;
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  summary?: string;
}

/**
 * Actualiza el perfil de un candidato
 * PUT /api/candidate/:candidateId/profile
 */
export async function updateCandidateProfile(
  candidateId: string,
  data: UpdateCandidateProfileDto,
  processId?: string
): Promise<CandidateResponse> {
  const response = await api.put<ApiResponse<CandidateResponse>>(
    `/candidate/${candidateId}/profile`,
    { ...data, processId }
  );
  return response.data.data;
}

/**
 * Genera el CV del candidato en formato HTML
 * GET /api/candidate/:candidateId/generate-cv
 */
export async function generateCandidateCVHtml(candidateId: string): Promise<string> {
  const response = await api.get<string>(
    `/candidate/${candidateId}/generate-cv`,
    {
      params: { format: 'html' },
      responseType: 'text',
    }
  );
  return response.data;
}

/**
 * Sube y parsea el CV de un candidato
 * POST /api/candidate/:candidateId/upload-cv
 */
export async function uploadCandidateCV(candidateId: string, cvFile: File): Promise<CandidateResponse> {
  const formData = new FormData();
  formData.append('cv', cvFile);

  const response = await api.post<ApiResponse<CandidateResponse>>(
    `/candidate/${candidateId}/upload-cv`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}

/**
 * Datos parseados de un CV
 */
export interface ParsedCVData {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  summary: string;
  skills: string[];
  experience: Array<{
    company?: string;
    position?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    current?: boolean;
  }>;
  education: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  languages?: string[];
}

/**
 * Parsea un CV y devuelve los datos extraídos (sin guardar)
 * POST /api/candidate/parse-cv
 *
 * El CV se procesa en memoria y NO se almacena
 */
export async function parseCandidateCV(cvFile: File): Promise<ParsedCVData> {
  const formData = new FormData();
  formData.append('cv', cvFile);

  const response = await api.post<ApiResponse<ParsedCVData>>(
    `/candidate/parse-cv`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
}
