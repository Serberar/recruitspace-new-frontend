/**
 * useClients - Hook para gestionar clientes
 * Centraliza la carga, creación, actualización y activación de clientes
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Client } from '@/types';
import {
  getOrganizationClients,
  getCreatedClients,
  createClient,
  updateClient,
  setClientActive,
  type CreateClientDto,
} from '../services/clientsApi';
import { usePermissions } from '@/hooks/useRole';
import { getErrorMessage } from '@/hooks/useErrorHandler';

export interface UseClientsReturn {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createClient: (data: CreateClientDto) => Promise<Client>;
  updateClient: (id: string, data: Partial<CreateClientDto>) => Promise<Client>;
  toggleClientActive: (id: string, active: boolean) => Promise<Client>;
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const permissions = usePermissions();

  // Ref para evitar llamadas duplicadas
  const isFetching = useRef(false);

  const fetchClients = useCallback(async () => {
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      let data: Client[];
      if (permissions.isAdmin || permissions.isOrgRecruiter) {
        // Admin y org_recruiter ven todos los clientes de la organización
        data = await getOrganizationClients();
      } else {
        // recruiter independiente ve clientes que ha creado
        data = await getCreatedClients();
      }
      setClients(data);
    } catch (err) {
      setError(getErrorMessage(err) || 'Error al cargar clientes');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [permissions.isAdmin, permissions.isOrgRecruiter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreateClient = useCallback(async (data: CreateClientDto): Promise<Client> => {
    const newClient = await createClient(data);
    setClients((prev) => [...prev, newClient]);
    return newClient;
  }, []);

  const handleUpdateClient = useCallback(async (id: string, data: Partial<CreateClientDto>): Promise<Client> => {
    const updated = await updateClient(id, data);
    setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const handleToggleClientActive = useCallback(async (id: string, active: boolean): Promise<Client> => {
    const updated = await setClientActive(id, active);
    setClients((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    createClient: handleCreateClient,
    updateClient: handleUpdateClient,
    toggleClientActive: handleToggleClientActive,
  };
}
