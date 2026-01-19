import api from '../../../api/axios';
import type { ApiResponse, ProcessStatus } from '../../../types';

/**
 * Obtiene los estados de proceso de la organizacion
 * GET /api/process-status
 */
export async function getProcessStatuses(): Promise<ProcessStatus[]> {
  const response = await api.get<ApiResponse<ProcessStatus[]>>('/process-status');
  return response.data.data;
}

/**
 * Crea estados por defecto para la organizacion
 * POST /api/process-status/defaults
 */
export async function createDefaultStatuses(): Promise<ProcessStatus[]> {
  const response = await api.post<ApiResponse<ProcessStatus[]>>('/process-status/defaults');
  return response.data.data;
}

/**
 * Crea un nuevo estado
 * POST /api/process-status
 */
export interface CreateProcessStatusDto {
  name: string;
  order?: number;
  color?: string;
  isTerminal?: boolean;
}

export async function createProcessStatus(data: CreateProcessStatusDto): Promise<ProcessStatus> {
  const response = await api.post<ApiResponse<ProcessStatus>>('/process-status', data);
  return response.data.data;
}

/**
 * Actualiza un estado
 * PUT /api/process-status/:id
 */
export async function updateProcessStatus(id: string, data: Partial<CreateProcessStatusDto>): Promise<ProcessStatus> {
  const response = await api.put<ApiResponse<ProcessStatus>>(`/process-status/${id}`, data);
  return response.data.data;
}

/**
 * Reordena los estados
 * PATCH /api/process-status/reorder
 */
export async function reorderProcessStatuses(statusIds: string[]): Promise<ProcessStatus[]> {
  const response = await api.patch<ApiResponse<ProcessStatus[]>>('/process-status/reorder', { statusIds });
  return response.data.data;
}

/**
 * Elimina un estado
 * DELETE /api/process-status/:id
 */
export async function deleteProcessStatus(id: string): Promise<void> {
  await api.delete(`/process-status/${id}`);
}
