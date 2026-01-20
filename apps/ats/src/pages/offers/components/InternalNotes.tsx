/**
 * InternalNotes - Componente para gestionar notas internas de una oferta
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { updateOfferNotes } from '@/services/jobOffersApi';
import { getErrorMessage } from '@/hooks/useErrorHandler';
import styles from '../OfferDetailPage.module.css';

interface InternalNotesProps {
  offerId: string;
  initialNotes: string | null | undefined;
  onUpdate?: (notes: string | null) => void;
}

export function InternalNotes({ offerId, initialNotes, onUpdate }: InternalNotesProps) {
  const { t } = useTranslation('common');
  const [notes, setNotes] = useState(initialNotes || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotes, setSavedNotes] = useState(initialNotes || '');

  useEffect(() => {
    setNotes(initialNotes || '');
    setSavedNotes(initialNotes || '');
  }, [initialNotes]);

  const handleSave = useCallback(async () => {
    if (notes === savedNotes) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await updateOfferNotes(offerId, notes.trim() || null);
      setSavedNotes(result.internalNotes || '');
      setNotes(result.internalNotes || '');
      setIsEditing(false);
      onUpdate?.(result.internalNotes);
    } catch (err) {
      setError(getErrorMessage(err) || t('offerDetail.notesError'));
    } finally {
      setIsSaving(false);
    }
  }, [offerId, notes, savedNotes, onUpdate, t]);

  const handleCancel = useCallback(() => {
    setNotes(savedNotes);
    setIsEditing(false);
    setError(null);
  }, [savedNotes]);

  const handleDelete = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      await updateOfferNotes(offerId, null);
      setSavedNotes('');
      setNotes('');
      setIsEditing(false);
      onUpdate?.(null);
    } catch (err) {
      setError(getErrorMessage(err) || t('offerDetail.notesError'));
    } finally {
      setIsSaving(false);
    }
  }, [offerId, onUpdate, t]);

  const hasNotes = savedNotes.trim().length > 0;

  return (
    <section className={styles.notesSection}>
      <div className={styles.notesSectionHeader}>
        <h2 className={styles.sectionTitle}>{t('offerDetail.internalNotes')}</h2>
        {!isEditing && (
          <button
            type="button"
            className={styles.notesEditButton}
            onClick={() => setIsEditing(true)}
          >
            {hasNotes ? t('app.edit') : t('offerDetail.addNote')}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className={styles.notesEditor}>
          <textarea
            className={styles.notesTextarea}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('offerDetail.notesPlaceholder')}
            rows={4}
            disabled={isSaving}
            autoFocus
          />
          {error && <p className={styles.notesError}>{error}</p>}
          <div className={styles.notesActions}>
            {hasNotes && (
              <button
                type="button"
                className={styles.notesDeleteButton}
                onClick={handleDelete}
                disabled={isSaving}
              >
                {t('app.delete')}
              </button>
            )}
            <div className={styles.notesActionsRight}>
              <button
                type="button"
                className={styles.notesCancelButton}
                onClick={handleCancel}
                disabled={isSaving}
              >
                {t('app.cancel')}
              </button>
              <button
                type="button"
                className={styles.notesSaveButton}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? t('app.saving') : t('app.save')}
              </button>
            </div>
          </div>
        </div>
      ) : hasNotes ? (
        <div className={styles.notesContent}>
          <p className={styles.notesText}>{savedNotes}</p>
        </div>
      ) : (
        <div className={styles.notesEmpty}>
          <p>{t('offerDetail.noNotes')}</p>
        </div>
      )}
    </section>
  );
}
