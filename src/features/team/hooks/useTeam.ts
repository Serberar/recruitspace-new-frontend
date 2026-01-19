/**
 * useTeam - Hook para gestionar miembros del equipo
 * Centraliza la carga, creación y gestión de estado de recruiters
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getOrganizationMembers,
  createOrgRecruiter,
  updateRecruiterStatus,
  type TeamMember,
  type CreateRecruiterDto,
} from '../services/teamApi';
import { getErrorMessage } from '@/hooks/useErrorHandler';

export interface UseTeamReturn {
  members: TeamMember[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createRecruiter: (data: CreateRecruiterDto) => Promise<TeamMember>;
  toggleRecruiterStatus: (userId: string, isActive: boolean) => Promise<TeamMember>;
}

export function useTeam(): UseTeamReturn {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref para evitar llamadas duplicadas
  const isFetching = useRef(false);

  const fetchMembers = useCallback(async () => {
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      const data = await getOrganizationMembers();
      setMembers(data);
    } catch (err) {
      setError(getErrorMessage(err) || 'Error al cargar equipo');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleCreateRecruiter = useCallback(async (data: CreateRecruiterDto): Promise<TeamMember> => {
    const newMember = await createOrgRecruiter(data);
    setMembers((prev) => [...prev, newMember]);
    return newMember;
  }, []);

  const handleToggleRecruiterStatus = useCallback(async (userId: string, isActive: boolean): Promise<TeamMember> => {
    const updated = await updateRecruiterStatus(userId, isActive);
    setMembers((prev) => prev.map((m) => (m.id === userId ? updated : m)));
    return updated;
  }, []);

  return {
    members,
    loading,
    error,
    refetch: fetchMembers,
    createRecruiter: handleCreateRecruiter,
    toggleRecruiterStatus: handleToggleRecruiterStatus,
  };
}
