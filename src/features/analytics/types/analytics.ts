export interface RecruiterAnalyticsSummary {
  activeProcesses: number;
  hiredThisPeriod: number;
  rejectedThisPeriod: number;
  conversionRate: number;
  avgTimeToHire: number | null;
  totalApplicationsThisPeriod: number;
}

export interface AnalyticsByStatus {
  statusId: string;
  statusName: string;
  statusColor: string;
  count: number;
  percentage: number;
}

export interface AnalyticsByClient {
  clientId: string;
  clientName: string;
  activeOffers: number;
  activeProcesses: number;
  hired: number;
  rejected: number;
}

export interface AnalyticsByOffer {
  offerId: string;
  offerTitle: string;
  clientName: string;
  totalCandidates: number;
  hired: number;
  conversionRate: number;
  isActive: boolean;
}

export interface RecruiterAnalytics {
  summary: RecruiterAnalyticsSummary;
  byStatus: AnalyticsByStatus[];
  byClient: AnalyticsByClient[];
  byOffer: AnalyticsByOffer[];
}

export type AnalyticsPeriod = "month" | "quarter" | "year" | "all";

export interface AnalyticsFilters {
  period: AnalyticsPeriod;
  clientId?: string;
  offerId?: string;
}
