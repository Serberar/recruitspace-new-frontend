import api from '../../auth/services/api';

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  domain?: string;
  logoUrl?: string;
  headerImageUrl?: string;
  portalTitle?: string;
  portalSubtitle?: string;
  useBrandingOnCandidatePage?: boolean;
  candidatePageLogoUrl?: string;
  candidatePageHeaderImageUrl?: string;
  candidatePageTitle?: string;
  candidatePageSubtitle?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  domain?: string;
  logoUrl?: string;
  headerImageUrl?: string;
  portalTitle?: string;
  portalSubtitle?: string;
  useBrandingOnCandidatePage?: boolean;
  candidatePageLogoUrl?: string;
  candidatePageHeaderImageUrl?: string;
  candidatePageTitle?: string;
  candidatePageSubtitle?: string;
}

// Obtener mi organizacion (con slug para portal publico)
export async function getOrganization(): Promise<Organization> {
  const response = await api.get<Organization>('/organization/me');
  return response.data;
}

// Actualizar datos de la organizacion (admin only)
export async function updateOrganization(data: UpdateOrganizationDto): Promise<Organization> {
  const response = await api.put<Organization>('/organization/me', data);
  return response.data;
}

// Tipos de imagen permitidos para la organización
export type OrganizationImageType = 'logo' | 'header' | 'candidateLogo' | 'candidateHeader';

export interface UploadOrganizationImageResult {
  imageUrl: string;
  imageType: OrganizationImageType;
}

// Subir imagen de la organización (admin only)
export async function uploadOrganizationImage(
  file: File,
  imageType: OrganizationImageType
): Promise<UploadOrganizationImageResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('imageType', imageType);

  const response = await api.post<UploadOrganizationImageResult>('/organization/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

// Features del sistema habilitados
export interface SystemFeatures {
  storageEnabled: boolean;
}

// Obtener features del sistema habilitados
export async function getSystemFeatures(): Promise<SystemFeatures> {
  const response = await api.get<SystemFeatures>('/organization/features');
  return response.data;
}
