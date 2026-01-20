import { useAppSelector } from "./reduxHooks";

export type UserRole = 'org_admin' | 'recruiter' | 'org_recruiter' | 'candidate' | null;

export function useRole(): UserRole {
  const user = useAppSelector((state) => state.auth.user);
  return (user?.role?.toLowerCase() as UserRole) || null;
}

/**
 * Hook de permisos basado en el rol del usuario
 * Implementa la tabla de permisos de 03-roles-permissions.md
 */
export function usePermissions() {
  const role = useRole();

  const isAdmin = role === 'org_admin';
  const isRecruiter = role === 'recruiter';
  const isOrgRecruiter = role === 'org_recruiter';
  const isCandidate = role === 'candidate';

  // Cualquier tipo de recruiter (independiente u org)
  const isAnyRecruiter = isRecruiter || isOrgRecruiter;

  return {
    role,
    isAdmin,
    isRecruiter,
    isOrgRecruiter,
    isCandidate,
    isAnyRecruiter,

    // Ofertas / ATS
    canCreateOffer: isAdmin || isAnyRecruiter,
    canEditOffer: isAdmin || isAnyRecruiter,
    canViewPipeline: isAdmin || isAnyRecruiter,
    canChangeStatus: isAdmin || isAnyRecruiter,
    canAssignRecruiter: isAdmin,

    // Candidatos
    canViewCandidates: isAdmin || isAnyRecruiter,
    canCommentCandidate: isAdmin || isAnyRecruiter,
    canMessageCandidate: isAdmin || isAnyRecruiter,
    canViewGlobalHistory: isAdmin || isRecruiter, // org_recruiter: parcial

    // Pipeline
    canUsePipeline: isAdmin || isAnyRecruiter,
    canCreatePipeline: isAdmin || isAnyRecruiter,
    canEditOwnPipeline: isAdmin || isAnyRecruiter,
    canEditGlobalPipeline: isAdmin,

    // Clientes (CRM)
    canCreateClient: isAdmin || isRecruiter, // org_recruiter NO puede
    canEditClient: isAdmin || isRecruiter,
    canToggleClientActive: isAdmin || isRecruiter, // recruiter independiente gestiona sus propios clientes

    // Equipo
    canViewTeam: isAdmin || isOrgRecruiter, // org_recruiter: solo lectura
    canCreateRecruiter: isAdmin,
    canToggleRecruiterActive: isAdmin,
    canManageTeam: isAdmin, // crear, activar, desactivar

    // Comunicacion
    canSendMessages: isAdmin || isAnyRecruiter,
    canConfigureSMTP: isAdmin || isAnyRecruiter,
    canViewTemplates: isAdmin || isAnyRecruiter,
    canEditGlobalTemplates: isAdmin,

    // Organizacion / Seguridad
    canViewOrgData: isAdmin || isAnyRecruiter,
    canEditOrgData: isAdmin || isRecruiter, // recruiter independiente gestiona su propia org
    canManageRoles: isAdmin,
  };
}
