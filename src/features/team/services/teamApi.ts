import api from '../../../api/axios';
import type { ApiResponse } from '../../../types';

/**
 * Tipos para gestion de equipo
 */
export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'org_admin' | 'org_recruiter';
  isActive: boolean;
  createdAt: string;
  _count?: {
    assignedOffers?: number;
  };
}

export interface CreateRecruiterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UpdateRecruiterDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

/**
 * Obtiene los miembros de la organizacion
 * GET /api/organization/members
 */
export async function getOrganizationMembers(): Promise<TeamMember[]> {
  const response = await api.get<ApiResponse<TeamMember[]>>('/organization/members');
  return response.data.data;
}

/**
 * Crea un nuevo recruiter en la organizacion
 * POST /api/organization/recruiter
 */
export async function createOrgRecruiter(data: CreateRecruiterDto): Promise<TeamMember> {
  const response = await api.post<ApiResponse<TeamMember>>('/organization/recruiter', data);
  return response.data.data;
}

/**
 * Actualiza un recruiter
 * PUT /api/organization/recruiter/:userId
 */
export async function updateOrgRecruiter(userId: string, data: UpdateRecruiterDto): Promise<TeamMember> {
  const response = await api.put<ApiResponse<TeamMember>>(`/organization/recruiter/${userId}`, data);
  return response.data.data;
}

/**
 * Activa o desactiva un recruiter
 * PATCH /api/organization/recruiter/status
 */
export async function updateRecruiterStatus(userId: string, isActive: boolean): Promise<TeamMember> {
  const response = await api.patch<ApiResponse<TeamMember>>('/organization/recruiter/status', {
    userId,
    isActive,
  });
  return response.data.data;
}
