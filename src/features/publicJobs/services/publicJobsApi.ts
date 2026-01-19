import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Cliente axios sin autenticacion para rutas publicas
const publicApi = axios.create({
  baseURL: API_BASE,
});

/**
 * Tipos para ofertas publicas
 */
export interface PublicJobOffer {
  id: string;
  title: string;
  description: string;
  category?: string;
  salary?: string;
  location?: string;
  modality?: string;
  contractType?: string;
  requirements?: string;
  benefits?: string;
  displayName?: string; // Nombre público (publicDisplayName o organizationName)
  organizationSlug?: string;
  organizationLogoUrl?: string; // Logo de la organización
  organizationName?: string; // Nombre de la organización
  companyName?: string; // Alias para nombre de empresa
  createdAt: string;
}

export interface PublicJobOffersResponse {
  data: PublicJobOffer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApplyToJobDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cv: File;
}

export interface ApplicationResult {
  candidateId: string;
  processId: string;
  message: string;
}

/**
 * Datos parseados del CV
 */
export interface ParsedCVData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate?: string;
    endDate?: string;
  }>;
  languages: string[];
}

/**
 * Opciones de filtro disponibles
 */
export interface FilterOptions {
  categories: string[];
  locations: string[];
  contractTypes: string[];
  modalities: string[];
}

/**
 * Obtiene las ofertas publicas con filtros y paginacion
 * GET /api/public/job-offers
 */
export async function getPublicJobOffers(params?: {
  search?: string;
  category?: string;
  location?: string;
  modality?: string;
  contractType?: string;
  page?: number;
  limit?: number;
}): Promise<PublicJobOffersResponse> {
  const response = await publicApi.get<{ data: { items: PublicJobOffer[]; total: number; page: number; limit: number; totalPages: number } }>('/public/job-offers', {
    params,
  });
  return {
    data: response.data.data.items,
    pagination: {
      page: response.data.data.page,
      limit: response.data.data.limit,
      total: response.data.data.total,
      totalPages: response.data.data.totalPages,
    },
  };
}

/**
 * Obtiene las categorias disponibles
 * GET /api/public/job-offers/categories
 */
export async function getPublicCategories(): Promise<string[]> {
  const response = await publicApi.get<{ data: { categories: string[] } }>('/public/job-offers/categories');
  return response.data.data.categories;
}

/**
 * Obtiene todas las opciones de filtro disponibles
 * GET /api/public/job-offers/filters
 */
export async function getPublicFilterOptions(): Promise<FilterOptions> {
  const response = await publicApi.get<{ data: FilterOptions }>('/public/job-offers/filters');
  return response.data.data;
}

/**
 * Obtiene las categorias de una organizacion
 * GET /api/public/job-offers/organization/:slug/categories
 */
export async function getPublicCategoriesByOrganization(slug: string): Promise<string[]> {
  const response = await publicApi.get<{ data: { categories: string[] } }>(`/public/job-offers/organization/${slug}/categories`);
  return response.data.data.categories;
}

/**
 * Obtiene todas las opciones de filtro de una organizacion
 * GET /api/public/job-offers/organization/:slug/filters
 */
export async function getPublicFilterOptionsByOrganization(slug: string): Promise<FilterOptions> {
  const response = await publicApi.get<{ data: FilterOptions }>(`/public/job-offers/organization/${slug}/filters`);
  return response.data.data;
}

/**
 * Obtiene las ofertas publicas de una organizacion por su slug
 * GET /api/public/job-offers/organization/:slug
 */
export async function getPublicJobOffersByOrganization(
  slug: string,
  params?: {
    search?: string;
    category?: string;
    location?: string;
    modality?: string;
    contractType?: string;
    page?: number;
    limit?: number;
  }
): Promise<PublicJobOffersResponse> {
  const response = await publicApi.get<{ data: { items: PublicJobOffer[]; total: number; page: number; limit: number; totalPages: number } }>(
    `/public/job-offers/organization/${slug}`,
    { params }
  );
  return {
    data: response.data.data.items,
    pagination: {
      page: response.data.data.page,
      limit: response.data.data.limit,
      total: response.data.data.total,
      totalPages: response.data.data.totalPages,
    },
  };
}

/**
 * Obtiene el detalle de una oferta publica
 * GET /api/public/job-offers/:id
 */
export async function getPublicJobOfferById(id: string): Promise<PublicJobOffer> {
  const response = await publicApi.get<{ data: PublicJobOffer }>(`/public/job-offers/${id}`);
  return response.data.data;
}

/**
 * Parsea un CV y devuelve los datos extraídos
 * POST /api/public/job-offers/:id/parse-cv
 */
export async function parseCV(offerId: string, cv: File): Promise<ParsedCVData> {
  const formData = new FormData();
  formData.append('cv', cv);

  const response = await publicApi.post<{ data: ParsedCVData }>(
    `/public/job-offers/${offerId}/parse-cv`,
    formData
  );
  return response.data.data;
}

/**
 * Aplica a una oferta publica
 * POST /api/public/job-offers/:id/apply
 */
export async function applyToJobOffer(offerId: string, data: ApplyToJobDto): Promise<ApplicationResult> {
  const formData = new FormData();
  // Backend expects fullName, so we concatenate firstName and lastName
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  formData.append('fullName', fullName);
  formData.append('email', data.email);
  if (data.phone) {
    formData.append('phone', data.phone);
  }
  formData.append('cv', data.cv);

  // Don't set Content-Type header manually - axios will set it with the correct boundary
  const response = await publicApi.post<{ data: ApplicationResult }>(
    `/public/job-offers/${offerId}/apply`,
    formData
  );
  return response.data.data;
}

/**
 * Informacion publica de una organizacion
 */
export interface PublicOrganization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  headerImageUrl?: string;
  portalTitle?: string;
  portalSubtitle?: string;
}

/**
 * Obtiene informacion publica de una organizacion por su slug
 * GET /api/public/organizations/:slug
 */
export async function getPublicOrganization(slug: string): Promise<PublicOrganization> {
  const response = await publicApi.get<{ data: PublicOrganization }>(`/public/organizations/${slug}`);
  return response.data.data;
}

/**
 * Obtiene la etiqueta de modalidad
 */
export function getModalityLabel(modality?: string): string {
  if (!modality) return '';

  const normalized = modality.toLowerCase();
  switch (normalized) {
    case 'remote':
      return 'Remoto';
    case 'onsite':
    case 'on-site':
      return 'Presencial';
    case 'hybrid':
      return 'Híbrido';
    default:
      // Si no coincide, devolver el valor original capitalizado
      return modality.charAt(0).toUpperCase() + modality.slice(1);
  }
}
