import { logger } from '@/lib/logger';
/**
 * Hook para gestionar el cambio de estado del proceso
 */
import { useState, useCallback } from 'react';
import type { SelectionProcess, ProcessStatus } from '../types';
import {
  updateProcessStatus,
  scheduleInterview,
} from '../services/selectionProcessApi';

export interface UseStatusChangeReturn {
  showModal: boolean;
  selectedStatus: ProcessStatus | null;
  changingStatus: boolean;
  candidateInstructions: string;
  scheduledDate: string;
  scheduledTime: string;
  setCandidateInstructions: (value: string) => void;
  setScheduledDate: (value: string) => void;
  setScheduledTime: (value: string) => void;
  openModal: (status: ProcessStatus) => void;
  closeModal: () => void;
  confirmChange: (
    process: SelectionProcess,
    onSuccess: (updatedProcess: SelectionProcess) => void,
    onRefresh: () => Promise<void>
  ) => Promise<void>;
}

export function useStatusChange(): UseStatusChangeReturn {
  const [showModal, setShowModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ProcessStatus | null>(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [candidateInstructions, setCandidateInstructions] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const openModal = useCallback((status: ProcessStatus) => {
    setSelectedStatus(status);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedStatus(null);
    setScheduledDate('');
    setScheduledTime('');
    setCandidateInstructions('');
  }, []);

  const confirmChange = useCallback(
    async (
      process: SelectionProcess,
      onSuccess: (updatedProcess: SelectionProcess) => void,
      onRefresh: () => Promise<void>
    ) => {
      if (!selectedStatus) return;

      setChangingStatus(true);
      try {
        // Preparar instrucciones
        const instructionsToSend = candidateInstructions.trim() || null;

        // Actualizar estado
        const updatedProcess = await updateProcessStatus(
          process.id,
          selectedStatus.id,
          instructionsToSend
        );

        onSuccess(updatedProcess);

        // Si es VIDEO_CALL y hay fecha/hora, programar entrevista
        if (selectedStatus.action === 'VIDEO_CALL' && scheduledDate && scheduledTime) {
          const startsAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
          await scheduleInterview(process.id, {
            startsAt,
            hasVideoCall: true,
            visibleToCandidate: true,
            requiresConfirmation: false,
          });
        }

        closeModal();
        await onRefresh();
      } catch (err) {
        logger.error('Error changing status:', err);
      } finally {
        setChangingStatus(false);
      }
    },
    [selectedStatus, candidateInstructions, scheduledDate, scheduledTime, closeModal]
  );

  return {
    showModal,
    selectedStatus,
    changingStatus,
    candidateInstructions,
    scheduledDate,
    scheduledTime,
    setCandidateInstructions,
    setScheduledDate,
    setScheduledTime,
    openModal,
    closeModal,
    confirmChange,
  };
}
