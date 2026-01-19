import { logger } from '@/lib/logger';
/**
 * Hook para gestionar la programación de videollamadas
 */
import { useState, useCallback } from 'react';
import {
  updateVideoCallSchedule,
  deleteVideoCallSchedule,
} from '../../selectionProcess/services/selectionProcessApi';

export interface UseVideoCallScheduleReturn {
  editing: boolean;
  editDate: string;
  editTime: string;
  saving: boolean;
  setEditDate: (value: string) => void;
  setEditTime: (value: string) => void;
  startEdit: (scheduledAt: string | null) => void;
  cancelEdit: () => void;
  saveSchedule: (processId: string, onRefresh: () => Promise<void>) => Promise<void>;
  deleteSchedule: (
    processId: string,
    t: (key: string) => string,
    onRefresh: () => Promise<void>
  ) => Promise<void>;
}

export function useVideoCallSchedule(): UseVideoCallScheduleReturn {
  const [editing, setEditing] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = useCallback((scheduledAt: string | null) => {
    if (scheduledAt) {
      const date = new Date(scheduledAt);
      setEditDate(date.toISOString().split('T')[0]);
      setEditTime(date.toTimeString().slice(0, 5));
    } else {
      setEditDate('');
      setEditTime('');
    }
    setEditing(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditing(false);
    setEditDate('');
    setEditTime('');
  }, []);

  const saveSchedule = useCallback(
    async (processId: string, onRefresh: () => Promise<void>) => {
      if (!editDate || !editTime) return;

      setSaving(true);
      try {
        const startsAt = new Date(`${editDate}T${editTime}`).toISOString();
        await updateVideoCallSchedule(processId, startsAt);
        setEditing(false);
        await onRefresh();
      } catch (err) {
        logger.error('Error updating schedule:', err);
      } finally {
        setSaving(false);
      }
    },
    [editDate, editTime]
  );

  const deleteSchedule = useCallback(
    async (
      processId: string,
      t: (key: string) => string,
      onRefresh: () => Promise<void>
    ) => {
      if (!window.confirm(t('candidateDetail.confirmDeleteSchedule'))) return;

      setSaving(true);
      try {
        await deleteVideoCallSchedule(processId);
        await onRefresh();
      } catch (err) {
        logger.error('Error deleting schedule:', err);
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return {
    editing,
    editDate,
    editTime,
    saving,
    setEditDate,
    setEditTime,
    startEdit,
    cancelEdit,
    saveSchedule,
    deleteSchedule,
  };
}
