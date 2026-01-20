/**
 * Modal para cambiar el estado del proceso
 */
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProcessStatus } from '../../types';
import styles from '../../pages/candidates/CandidateDetailPage.module.css';

interface StatusChangeModalProps {
  selectedStatus: ProcessStatus;
  changingStatus: boolean;
  candidateInstructions: string;
  scheduledDate: string;
  scheduledTime: string;
  onCandidateInstructionsChange: (value: string) => void;
  onScheduledDateChange: (value: string) => void;
  onScheduledTimeChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

function StatusChangeModalComponent({
  selectedStatus,
  changingStatus,
  candidateInstructions,
  scheduledDate,
  scheduledTime,
  onCandidateInstructionsChange,
  onScheduledDateChange,
  onScheduledTimeChange,
  onClose,
  onConfirm,
}: StatusChangeModalProps) {
  const { t } = useTranslation('common');

  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.modal} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={handleContentClick}>
        <h3 className={styles.modalTitle}>{t('candidateDetail.changeStatus')}</h3>
        <p className={styles.modalText}>
          {t('candidateDetail.changeStatusTo', { status: selectedStatus.name })}
        </p>

        {/* Video call scheduling fields */}
        {selectedStatus.action === 'VIDEO_CALL' && (
          <div className={styles.scheduleFields}>
            <p className={styles.scheduleHint}>{t('candidateDetail.scheduleVideoCall')}</p>
            <div className={styles.scheduleInputs}>
              <div className={styles.scheduleField}>
                <label className={styles.scheduleLabel}>{t('candidateDetail.date')}</label>
                <input
                  type="date"
                  className={styles.scheduleInput}
                  value={scheduledDate}
                  onChange={(e) => onScheduledDateChange(e.target.value)}
                  min={minDate}
                />
              </div>
              <div className={styles.scheduleField}>
                <label className={styles.scheduleLabel}>{t('candidateDetail.time')}</label>
                <input
                  type="time"
                  className={styles.scheduleInput}
                  value={scheduledTime}
                  onChange={(e) => onScheduledTimeChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Instrucciones personalizadas */}
        <div className={styles.instructionsField}>
          <label className={styles.instructionsLabel}>
            {t('candidateDetail.candidateInstructions')}
            <span className={styles.optionalLabel}> ({t('app.optional')})</span>
          </label>
          <textarea
            className={styles.instructionsTextarea}
            value={candidateInstructions}
            onChange={(e) => onCandidateInstructionsChange(e.target.value)}
            placeholder={t('candidateDetail.candidateInstructionsPlaceholder')}
            rows={3}
            maxLength={2000}
          />
          <p className={styles.instructionsHint}>{t('candidateDetail.candidateInstructionsHint')}</p>
        </div>

        <div className={styles.modalActions}>
          <button
            className={styles.modalCancel}
            onClick={onClose}
            disabled={changingStatus}
          >
            {t('app.cancel')}
          </button>
          <button
            className={styles.modalConfirm}
            onClick={onConfirm}
            disabled={changingStatus}
          >
            {changingStatus ? t('candidateDetail.changing') : t('candidateDetail.confirmChange')}
          </button>
        </div>
      </div>
    </div>
  );
}

export const StatusChangeModal = memo(StatusChangeModalComponent);
