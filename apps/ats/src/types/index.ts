// Types compartidos del frontend

// =====================
// Auth Types
// =====================
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  organizationId?: string;
}

export type UserRole = 'org_admin' | 'org_recruiter' | 'recruiter' | 'candidate';

// =====================
// Job Offer Types
// =====================
export interface AssignedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  clientId: string;
  client?: { id: string; name: string };
  createdUserId: string;
  organizationId: string;
  organizationName?: string;
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
  active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    selectionProcesses: number;
  };
  // Múltiples recruiters asignados
  assignedUsers?: AssignedUser[];
  // Notas internas (solo visible para reclutadores)
  internalNotes?: string | null;
}

export type JobOfferStatus = 'active' | 'paused' | 'closed';

// =====================
// Client Types
// =====================
export interface Client {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  organizationId: string;
  active: boolean;
  isDefault?: boolean;  // Cliente por defecto (oferta propia)
  createdAt: string;
  updatedAt: string;
}

// =====================
// Candidate Types
// =====================
export interface CandidateExperience {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface CandidateEducation {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  cvUrl?: string;
  notes?: string;
  organizationId: string | null;
  // Datos parseados del CV
  skills?: string[];
  languages?: string[];
  experience?: CandidateExperience[];
  education?: CandidateEducation[];
  summary?: string;
  createdAt: string;
  updatedAt?: string;
}

// =====================
// Selection Process Types
// =====================
export interface SelectionProcess {
  id: string;
  candidateId: string;
  candidate?: Candidate;
  offerId: string;
  jobOffer?: JobOffer;
  statusId: string;
  status?: ProcessStatus;
  organizationId: string;
  notes?: string;
  reviewed?: boolean;
  reviewedAt?: string;
  candidateInstructions?: string | null;
  publicAccessToken?: string;
  publicAccessEnabled?: boolean;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessStatus {
  id: string;
  name: string;
  order: number;
  color?: string;
  isTerminal: boolean;
  organizationId?: string;
  action?: string | null;
  sendNotification?: boolean;
}

// =====================
// Dashboard Types
// =====================
export interface PipelineMetrics {
  statusId: string;
  statusName: string;
  count: number;
  order: number;
}

export interface RecruiterKPIs {
  totalActiveOffers: number;
  totalCandidatesInProcess: number;
  totalHiredThisMonth: number;
  avgTimeToHire: number;
}

export interface RecentActivityItem {
  id: string;
  type: string;
  description: string;
  entityType: string;
  entityId: string;
  userId: string;
  createdAt: string;
}

export interface PendingReviewByOffer {
  offerId: string;
  offerTitle: string;
  count: number;
}

export interface UnreadMessagesByProcess {
  processId: string;
  candidateName: string;
  offerTitle: string;
  offerId: string;
  count: number;
}

export interface RecruiterDashboard {
  metrics: PipelineMetrics[];
  kpis: RecruiterKPIs;
  recentActivity: RecentActivityItem[];
  assignedOffers: JobOffer[];
  pendingReviewByOffer: PendingReviewByOffer[];
  unreadMessages: UnreadMessagesByProcess[];
  totalUnreadMessages: number;
}

// Tipo para pendientes de acción (derivado del backend)
export interface PendingAction {
  id: string;
  candidateName: string;
  offerTitle: string;
  status: string;
  statusColor?: string;
  processId: string;
  lastUpdate: string;
}

// =====================
// API Response Types
// =====================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =====================
// Comment Types
// =====================
export interface Comment {
  id: string;
  content: string;
  entityType: 'candidate' | 'selectionProcess' | 'jobOffer' | 'client';
  entityId: string;
  isInternal: boolean;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}