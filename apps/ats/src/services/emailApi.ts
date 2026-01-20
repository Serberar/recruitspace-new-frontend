import api from '../api/axios';
import type { ApiResponse } from '../types';

/**
 * Respuesta de configuracion SMTP del usuario
 */
export interface UserSmtpConfig {
  id: string;
  host: string;
  port: number;
  username: string;
  secure: boolean;
  createdAt: string;
}

/**
 * Obtiene la configuracion SMTP del usuario actual.
 * Retorna null si no tiene configurado.
 * GET /api/user/smtp-config
 */
export async function getUserSmtpConfig(): Promise<UserSmtpConfig | null> {
  const response = await api.get<ApiResponse<UserSmtpConfig | null>>('/user/smtp-config');
  return response.data.data;
}

/**
 * Verifica si el usuario tiene SMTP configurado.
 * Util para mostrar alertas.
 */
export async function hasSmtpConfigured(): Promise<boolean> {
  try {
    const config = await getUserSmtpConfig();
    return config !== null;
  } catch {
    return false;
  }
}

/**
 * Datos para configurar SMTP
 */
export interface SetSmtpConfigDto {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
}

/**
 * Guarda la configuracion SMTP del usuario.
 * PUT /api/user/smtp-config
 */
export async function setUserSmtpConfig(data: SetSmtpConfigDto): Promise<UserSmtpConfig> {
  const response = await api.put<ApiResponse<UserSmtpConfig>>('/user/smtp-config', data);
  return response.data.data;
}

/**
 * Elimina la configuracion SMTP del usuario.
 * DELETE /api/user/smtp-config
 */
export async function deleteUserSmtpConfig(): Promise<void> {
  await api.delete('/user/smtp-config');
}

/**
 * Prueba la conexion SMTP.
 * POST /api/user/smtp-config/test
 */
export async function testSmtpConnection(data: SetSmtpConfigDto): Promise<{ success: boolean; message: string }> {
  const response = await api.post<ApiResponse<{ success: boolean; message: string }>>('/user/smtp-config/test', data);
  return response.data.data;
}
