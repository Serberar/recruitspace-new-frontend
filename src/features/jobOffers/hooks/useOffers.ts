/**
 * useOffers - Hook para gestionar ofertas de trabajo
 * Centraliza la carga, creación, actualización y asignación de ofertas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { JobOffer } from '@/types';
import {
  getAssignedOffers,
  getOffersByOrganization,
  createJobOffer,
  updateJobOffer,
  setJobOfferActive,
  assignOfferToRecruiter,
  unassignOfferFromRecruiter,
  type CreateJobOfferDto,
} from '../services/jobOffersApi';
import { useRole } from '@/hooks/useRole';
import { getErrorMessage } from '@/hooks/useErrorHandler';

export interface UseOffersReturn {
  offers: JobOffer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createOffer: (data: CreateJobOfferDto) => Promise<JobOffer>;
  updateOffer: (id: string, data: Partial<CreateJobOfferDto>) => Promise<JobOffer>;
  toggleOfferActive: (id: string, active: boolean) => Promise<JobOffer>;
  assignRecruiter: (offerId: string, userId: string) => Promise<JobOffer>;
  unassignRecruiter: (offerId: string, userId: string) => Promise<JobOffer>;
}

export function useOffers(): UseOffersReturn {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = useRole();

  // org_admin y recruiter (freelance) ven TODAS las ofertas
  // org_recruiter (empleado) solo ve ofertas asignadas
  const seesAllOffers = role === 'org_admin' || role === 'recruiter';

  // Ref para evitar llamadas duplicadas
  const isFetching = useRef(false);

  const fetchOffers = useCallback(async () => {
    if (isFetching.current) return;

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      let offersData: JobOffer[];

      if (seesAllOffers) {
        // Admin y recruiter freelance ven todas las ofertas de la organización
        const response = await getOffersByOrganization();
        offersData = response?.data || [];
      } else {
        // org_recruiter (empleado) ve solo sus ofertas asignadas
        offersData = await getAssignedOffers() || [];
      }

      setOffers(offersData);
    } catch (err) {
      setError(getErrorMessage(err) || 'Error al cargar ofertas');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [seesAllOffers]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleCreateOffer = useCallback(async (data: CreateJobOfferDto): Promise<JobOffer> => {
    const newOffer = await createJobOffer(data);
    setOffers((prev) => [...prev, newOffer]);
    return newOffer;
  }, []);

  const handleUpdateOffer = useCallback(async (id: string, data: Partial<CreateJobOfferDto>): Promise<JobOffer> => {
    const updated = await updateJobOffer(id, data);
    setOffers((prev) => prev.map((o) => (o.id === id ? updated : o)));
    return updated;
  }, []);

  const handleToggleOfferActive = useCallback(async (id: string, active: boolean): Promise<JobOffer> => {
    const updated = await setJobOfferActive(id, active);
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, active } : o)));
    return updated;
  }, []);

  const handleAssignRecruiter = useCallback(async (offerId: string, userId: string): Promise<JobOffer> => {
    const updated = await assignOfferToRecruiter(offerId, userId);
    setOffers((prev) => prev.map((o) => (o.id === offerId ? updated : o)));
    return updated;
  }, []);

  const handleUnassignRecruiter = useCallback(async (offerId: string, userId: string): Promise<JobOffer> => {
    const updated = await unassignOfferFromRecruiter(offerId, userId);
    setOffers((prev) => prev.map((o) => (o.id === offerId ? updated : o)));
    return updated;
  }, []);

  return {
    offers,
    loading,
    error,
    refetch: fetchOffers,
    createOffer: handleCreateOffer,
    updateOffer: handleUpdateOffer,
    toggleOfferActive: handleToggleOfferActive,
    assignRecruiter: handleAssignRecruiter,
    unassignRecruiter: handleUnassignRecruiter,
  };
}
