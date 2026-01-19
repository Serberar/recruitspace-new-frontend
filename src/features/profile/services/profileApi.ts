import api from '../../auth/services/api';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Obtener datos del usuario actual
export async function getCurrentUser(): Promise<UserProfile> {
  const response = await api.get<UserProfile>('/user/me');
  return response.data;
}

// Actualizar perfil de usuario
export async function updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
  const response = await api.put<UserProfile>('/user/profile', data);
  return response.data;
}

// Cambiar contraseña
export async function changePassword(data: ChangePasswordDto): Promise<void> {
  await api.put('/user/change-password', data);
}

// Actualizar nombre de la organizacion
export interface UpdateOrganizationDto {
  name: string;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
}

export async function updateOrganization(data: UpdateOrganizationDto): Promise<OrganizationResponse> {
  const response = await api.put<OrganizationResponse>('/organization/me', data);
  return response.data;
}
