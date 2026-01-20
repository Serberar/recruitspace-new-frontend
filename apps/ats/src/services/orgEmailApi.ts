import api from '../api/axios';

/**
 * Información de un email de organización
 */
export interface OrgEmailInfo {
  templateName: string;
  displayName: string;
  description: string;
  defaultSubject: string;
  variables: string[];
  enabled: boolean;
  customSubject: string | null;
  customBody: string | null;
  lastSentAt: string | null;
  sentCount: number;
  hasCustomTemplate: boolean;
  originalTemplateExists: boolean;
}

/**
 * Detalle completo de una plantilla
 */
export interface OrgEmailTemplateDetail extends OrgEmailInfo {
  originalBody: string | null;
}

/**
 * Estadísticas de emails de la organización
 */
export interface OrgEmailStats {
  totalSent: number;
  totalTemplates: number;
  enabledTemplates: number;
  disabledTemplates: number;
  customizedTemplates: number;
  recentlySentCount: number;
  mostUsed: Array<{
    templateName: string;
    sentCount: number;
    lastSentAt: string | null;
  }>;
}

/**
 * Respuesta de lista de emails
 */
export interface OrgEmailsResponse {
  emails: OrgEmailInfo[];
  total: number;
  enabledCount: number;
  disabledCount: number;
  customizedCount: number;
}

/**
 * Obtiene la lista de todos los emails configurables de la organización
 */
export async function getOrgEmails(): Promise<OrgEmailsResponse> {
  const response = await api.get('/settings/emails');
  return response.data.data;
}

/**
 * Obtiene estadísticas de emails de la organización
 */
export async function getOrgEmailStats(): Promise<OrgEmailStats> {
  const response = await api.get('/settings/emails/stats');
  return response.data.data;
}

/**
 * Obtiene el detalle de una plantilla específica
 */
export async function getOrgEmailTemplate(templateName: string): Promise<OrgEmailTemplateDetail> {
  const response = await api.get(`/settings/emails/${templateName}`);
  return response.data.data;
}

/**
 * Actualiza la configuración de una plantilla
 */
export async function updateOrgEmailConfig(
  templateName: string,
  data: {
    enabled?: boolean;
    customSubject?: string | null;
    customBody?: string | null;
  }
): Promise<OrgEmailInfo> {
  const response = await api.put(`/settings/emails/${templateName}`, data);
  return response.data.data;
}

/**
 * Habilita o deshabilita un email
 */
export async function toggleOrgEmail(
  templateName: string,
  enabled: boolean
): Promise<{ templateName: string; enabled: boolean }> {
  const response = await api.patch(`/settings/emails/${templateName}/toggle`, { enabled });
  return response.data.data;
}

/**
 * Resetea una plantilla a los valores por defecto
 */
export async function resetOrgEmailTemplate(templateName: string): Promise<OrgEmailInfo> {
  const response = await api.post(`/settings/emails/${templateName}/reset`);
  return response.data.data;
}
