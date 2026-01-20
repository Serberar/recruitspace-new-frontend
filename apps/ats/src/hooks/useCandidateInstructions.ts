import { logger } from '@/lib/logger';
/**
 * Hook para gestionar las instrucciones al candidato
 */
import { useState, useCallback } from 'react';
import { updateCandidateInstructions } from '../services/selectionProcessApi';
import type { SelectionProcess } from '../types';

export interface UseCandidateInstructionsReturn {
  editing: boolean;
  editText: string;
  saving: boolean;
  setEditText: (value: string) => void;
  startEdit: (currentInstructions: string | null | undefined) => void;
  cancelEdit: () => void;
  saveInstructions: (
    processId: string,
    onSuccess: (updated: SelectionProcess) => void,
    currentProcess: SelectionProcess
  ) => Promise<void>;
  deleteInstructions: (
    processId: string,
    t: (key: string) => string,
    onSuccess: (updated: SelectionProcess) => void,
    currentProcess: SelectionProcess
  ) => Promise<void>;
}

export function useCandidateInstructions(): UseCandidateInstructionsReturn {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = useCallback((currentInstructions: string | null | undefined) => {
    setEditText(currentInstructions || '');
    setEditing(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setEditText('');
  }, []);

  const saveInstructions = useCallback(
    async (
      processId: string,
      onSuccess: (updated: SelectionProcess) => void,
      currentProcess: SelectionProcess
    ) => {
      setSaving(true);
      try {
        const instructionsToSave = editText.trim() || null;
        await updateCandidateInstructions(processId, instructionsToSave);
        onSuccess({ ...currentProcess, candidateInstructions: instructionsToSave });
        setEditing(false);
        setEditText('');
      } catch (err) {
        logger.error('Error saving instructions:', err);
      } finally {
        setSaving(false);
      }
    },
    [editText]
  );

  const deleteInstructions = useCallback(
    async (
      processId: string,
      t: (key: string) => string,
      onSuccess: (updated: SelectionProcess) => void,
      currentProcess: SelectionProcess
    ) => {
      if (!confirm(t('candidateDetail.confirmDeleteInstructions'))) return;

      setSaving(true);
      try {
        await updateCandidateInstructions(processId, null);
        onSuccess({ ...currentProcess, candidateInstructions: null });
      } catch (err) {
        logger.error('Error deleting instructions:', err);
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return {
    editing,
    editText,
    saving,
    setEditText,
    startEdit,
    cancelEdit,
    saveInstructions,
    deleteInstructions,
  };
}
