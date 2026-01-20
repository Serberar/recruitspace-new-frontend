import { logger } from '@/lib/logger';
import api from "./authApi";

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Login de recruiters/admins
export const loginAPI = async (data: LoginData): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
};

// Login de candidatos
export const loginCandidateAPI = async (data: LoginData): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login-candidate", data);
  return response.data;
};

// Obtener usuario actual (para verificar sesión)
export interface CurrentUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string | null;
  accountType?: string;
  isVerified: boolean;
  hasActivePlan?: boolean;
}

export const getCurrentUserAPI = async (): Promise<CurrentUserResponse> => {
  const response = await api.get<CurrentUserResponse>("/auth/me");
  return response.data;
};

// Refresh token (el backend devuelve el usuario actualizado)
export const refreshAPI = async (): Promise<{ user: CurrentUserResponse }> => {
  const response = await api.post<{ user: CurrentUserResponse }>("/auth/refresh");
  return response.data;
};

export const logoutUser = async () => {
  try {
    await api.post("/auth/logout", {}, { withCredentials: true }); // si usas cookies httpOnly
    return true;
  } catch (err) {
    logger.error("Error cerrando sesión:", err);
    return false;
  }
};

// Registro de usuario con organización
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  type: "recruiter" | "org_admin";
  organizationName: string;
  planId?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  organizationId: string;
}

export const registerAPI = async (
  data: RegisterData
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>(
    "/auth/register",
    data
  );
  return response.data;
};

// Reenviar correo de verificación
export const resendVerificationAPI = async (email: string): Promise<void> => {
  await api.post("/auth/resend-verification", { email });
};

// Verificar email con token
export const verifyEmailAPI = async (token: string): Promise<{ role: string }> => {
  const response = await api.post("/auth/verify-email", { token });
  return response.data;
};

// Solicitar restablecimiento de contraseña
export const forgotPasswordAPI = async (email: string): Promise<void> => {
  await api.post("/auth/forgot-password", { email });
};

// Restablecer contraseña con token
export const resetPasswordAPI = async (token: string, newPassword: string): Promise<void> => {
  await api.post("/auth/reset-password", { token, newPassword });
};

// Registro de candidato
export interface RegisterCandidateData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
}

export interface RegisterCandidateResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const registerCandidateAPI = async (
  data: RegisterCandidateData
): Promise<RegisterCandidateResponse> => {
  const response = await api.post<RegisterCandidateResponse>(
    "/auth/register-candidate",
    data
  );
  return response.data;
};

// Reclamar cuenta de candidato existente
export interface ClaimCandidateResponse {
  userId: string;
  candidateId: string;
}

export const claimCandidateAPI = async (token: string): Promise<ClaimCandidateResponse> => {
  const response = await api.post<ClaimCandidateResponse>("/auth/claim-candidate", { token });
  return response.data;
};