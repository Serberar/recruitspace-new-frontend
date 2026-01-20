import { logger } from '@/lib/logger';
/**
 * Hook para gestionar los datos del proceso de selección
 * Centraliza la carga de datos del proceso, estados y recruiter actions
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { SelectionProcess, ProcessStatus } from '../types';
import {
  getProcessById,
  getProcessStatusHistory,
  getRecruiterActions,
  markProcessAsReviewed,
  type StatusHistoryEntry,
  type RecruiterActions,
} from '../services/selectionProcessApi';
import { getOfferPipeline } from '../services/jobOffersApi';
import { getErrorMessage } from './useErrorHandler';

export interface UseProcessDataReturn {
  process: SelectionProcess | null;
  statuses: ProcessStatus[];
  statusHistory: StatusHistoryEntry[];
  recruiterActions: RecruiterActions | null;
  currentStatus: ProcessStatus | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refreshStatusHistory: () => Promise<void>;
  refreshRecruiterActions: () => Promise<void>;
  updateProcess: (updatedProcess: SelectionProcess) => void;
}

export function useProcessData(processId: string | undefined): UseProcessDataReturn {
  const [process, setProcess] = useState<SelectionProcess | null>(null);
  const [statuses, setStatuses] = useState<ProcessStatus[]>([]);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [recruiterActions, setRecruiterActions] = useState<RecruiterActions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref para evitar llamadas duplicadas
  const isFetching = useRef(false);

  const fetchData = useCallback(async () => {
    if (!processId || isFetching.current) return;

    isFetching.current = true;
    setLoading(true);
    setError(null);

    try {
      // Cargar proceso primero para obtener offerId
      const [processData, historyData, actionsData] = await Promise.all([
        getProcessById(processId),
        getProcessStatusHistory(processId),
        getRecruiterActions(processId),
      ]);

      // Cargar pipeline específico de la oferta
      const statusesData = await getOfferPipeline(processData.offerId);

      setProcess(processData);
      setStatuses(statusesData.sort((a, b) => a.order - b.order));
      setStatusHistory(historyData);
      setRecruiterActions(actionsData);

      // Marcar como revisado si es necesario
      if (!processData.reviewed) {
        markProcessAsReviewed(processId).catch((err) => {
          logger.error('Error marking process as reviewed:', err);
        });
      }
    } catch (err) {
      setError(getErrorMessage(err) || 'Error al cargar el proceso');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [processId]);

  const refreshStatusHistory = useCallback(async () => {
    if (!processId) return;
    try {
      const historyData = await getProcessStatusHistory(processId);
      setStatusHistory(historyData);
    } catch (err) {
      logger.error('Error refreshing status history:', err);
    }
  }, [processId]);

  const refreshRecruiterActions = useCallback(async () => {
    if (!processId) return;
    try {
      const actionsData = await getRecruiterActions(processId);
      setRecruiterActions(actionsData);
    } catch (err) {
      logger.error('Error refreshing recruiter actions:', err);
    }
  }, [processId]);

  const updateProcess = useCallback((updatedProcess: SelectionProcess) => {
    setProcess(updatedProcess);
  }, []);

  // Cargar datos al montar o cambiar processId
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Encontrar estado actual
  const currentStatus = statuses.find((s) => s.id === process?.statusId);

  return {
    process,
    statuses,
    statusHistory,
    recruiterActions,
    currentStatus,
    loading,
    error,
    refetch: fetchData,
    refreshStatusHistory,
    refreshRecruiterActions,
    updateProcess,
  };
}
