import api from '../api/axios';
import type { ApiResponse, Client } from '../types';

/**
 * Obtiene los clientes de la organizacion
 * GET /api/client/organization
 */
export async function getOrganizationClients(): Promise<Client[]> {
  const response = await api.get<ApiResponse<Client[]>>('/client/organization');
  return response.data.data;
}

/**
 * Obtiene los clientes creados por el usuario
 * GET /api/client/created
 */
export async function getCreatedClients(): Promise<Client[]> {
  const response = await api.get<ApiResponse<Client[]>>('/client/created');
  return response.data.data;
}

/**
 * Crea un nuevo cliente
 * POST /api/client
 */
export interface CreateClientDto {
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
}

export async function createClient(data: CreateClientDto): Promise<Client> {
  const response = await api.post<ApiResponse<Client>>('/client', data);
  return response.data.data;
}

/**
 * Actualiza un cliente
 * PUT /api/client/update/:id
 */
export async function updateClient(id: string, data: Partial<CreateClientDto>): Promise<Client> {
  const response = await api.put<ApiResponse<Client>>(`/client/update/${id}`, data);
  return response.data.data;
}

/**
 * Activa o desactiva un cliente
 * PATCH /api/client/active/:id
 */
export async function setClientActive(id: string, active: boolean): Promise<Client> {
  const response = await api.patch<ApiResponse<Client>>(`/client/active/${id}`, { active });
  return response.data.data;
}

