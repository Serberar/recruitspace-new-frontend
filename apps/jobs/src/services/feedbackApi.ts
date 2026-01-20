import api from '../features/auth/services/api';

export type FeedbackType = 'BUG' | 'SUGGESTION' | 'QUESTION' | 'CONTACT';
export type FeedbackStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';

export interface BrowserInfo {
  browser?: string;
  os?: string;
  screenSize?: string;
}

export interface CreateFeedbackRequest {
  type: FeedbackType;
  description: string;
  pageUrl: string;
  userEmail?: string;
  browserInfo?: BrowserInfo;
  screenshotKey?: string;
  /** Para mensajes de contacto: nombre del remitente */
  senderName?: string;
  /** Para mensajes de contacto: asunto del mensaje */
  subject?: string;
}

export interface FeedbackReportResponse {
  id: string;
  type: FeedbackType;
  status: FeedbackStatus;
  description: string;
  pageUrl: string;
  userEmail: string | null;
  userRole: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolution: string | null;
}

export interface FeedbackMetrics {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  dismissed: number;
  byType: {
    bug: number;
    suggestion: number;
    question: number;
    contact: number;
  };
  last7Days: number;
  last30Days: number;
}

export interface RecentFeedbackResponse {
  reports: FeedbackReportResponse[];
  metrics: FeedbackMetrics;
}

/**
 * Obtiene información del navegador para enviar con el feedback
 */
export function getBrowserInfo(): BrowserInfo {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';

  // Detectar navegador
  if (ua.includes('Firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('Chrome')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari')) {
    browser = 'Safari';
  } else if (ua.includes('Edge')) {
    browser = 'Edge';
  }

  // Detectar OS
  if (ua.includes('Windows')) {
    os = 'Windows';
  } else if (ua.includes('Mac')) {
    os = 'macOS';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('Android')) {
    os = 'Android';
  } else if (ua.includes('iOS')) {
    os = 'iOS';
  }

  return {
    browser,
    os,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
  };
}

export const feedbackApi = {
  /**
   * Envía un nuevo reporte de feedback
   */
  create: async (data: CreateFeedbackRequest) => {
    const response = await api.post<{ success: boolean; data: FeedbackReportResponse }>('/feedback', {
      ...data,
      browserInfo: data.browserInfo || getBrowserInfo(),
    });
    return response.data;
  },
};

export default feedbackApi;
