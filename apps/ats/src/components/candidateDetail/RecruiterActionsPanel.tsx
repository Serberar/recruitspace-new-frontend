/**
 * Panel de acciones del reclutador (videollamadas, archivos)
 */
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../lib/i18n';
import type { RecruiterActions } from '../../services/selectionProcessApi';
import { formatDate } from '../../utils/formatDate';
import styles from '../../pages/candidates/CandidateDetailPage.module.css';

// Helper para construir URLs del backend
const getBackendUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  if (path.startsWith('/api/')) {
    return baseUrl.replace('/api', '') + path;
  }
  return baseUrl + path;
};

interface RecruiterActionsPanelProps {
  recruiterActions: RecruiterActions;
  processId: string;
  // Video call schedule
  editingSchedule: boolean;
  editScheduleDate: string;
  editScheduleTime: string;
  savingSchedule: boolean;
  onEditScheduleDateChange: (value: string) => void;
  onEditScheduleTimeChange: (value: string) => void;
  onStartEditSchedule: () => void;
  onCancelEditSchedule: () => void;
  onSaveSchedule: () => void;
  onDeleteSchedule: () => void;
  // File upload
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  uploadingFile: boolean;
  uploadError: string | null;
  onFileSelect: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Storage feature flag
  storageEnabled?: boolean;
}

function RecruiterActionsPanelComponent({
  recruiterActions,
  processId: _processId,
  editingSchedule,
  editScheduleDate,
  editScheduleTime,
  savingSchedule,
  onEditScheduleDateChange,
  onEditScheduleTimeChange,
  onStartEditSchedule,
  onCancelEditSchedule,
  onSaveSchedule,
  onDeleteSchedule,
  fileInputRef,
  uploadingFile,
  uploadError,
  onFileSelect,
  onFileChange,
  storageEnabled = true,
}: RecruiterActionsPanelProps) {
  const { t } = useTranslation('common');
  const locale = i18n.language || 'es';
  const minDate = new Date().toISOString().split('T')[0];

  // When storage is disabled, don't show FILE_UPLOAD related actions
  const showFileUpload = storageEnabled && recruiterActions.currentStatus.action === 'FILE_UPLOAD';

  const hasActions =
    recruiterActions.currentStatus.action === 'VIDEO_CALL' ||
    showFileUpload ||
    (storageEnabled && recruiterActions.techTest.candidateFileUrl) ||
    (storageEnabled && recruiterActions.techTest.recruiterFileUrl);

  if (!hasActions) return null;

  return (
    <div className={styles.recruiterActionsCard}>
      <h3 className={styles.recruiterActionsTitle}>{t('candidateDetail.recruiterActions')}</h3>

      {/* Video Call Section */}
      {recruiterActions.currentStatus.action === 'VIDEO_CALL' &&
        recruiterActions.videoCall.roomUrl && (
          <div className={styles.recruiterActionSection}>
            <p className={styles.recruiterActionLabel}>{t('candidateDetail.videoCall')}</p>

            {editingSchedule ? (
              <div className={styles.editScheduleForm}>
                <div className={styles.scheduleInputs}>
                  <input
                    type="date"
                    className={styles.scheduleInput}
                    value={editScheduleDate}
                    onChange={(e) => onEditScheduleDateChange(e.target.value)}
                    min={minDate}
                  />
                  <input
                    type="time"
                    className={styles.scheduleInput}
                    value={editScheduleTime}
                    onChange={(e) => onEditScheduleTimeChange(e.target.value)}
                  />
                </div>
                <div className={styles.editScheduleActions}>
                  <button
                    className={styles.saveScheduleButton}
                    onClick={onSaveSchedule}
                    disabled={savingSchedule || !editScheduleDate || !editScheduleTime}
                  >
                    {savingSchedule ? '...' : t('app.save')}
                  </button>
                  <button
                    className={styles.cancelScheduleButton}
                    onClick={onCancelEditSchedule}
                    disabled={savingSchedule}
                  >
                    {t('app.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {recruiterActions.videoCall.scheduledAt ? (
                  <div className={styles.scheduledInfo}>
                    <div className={styles.scheduledContent}>
                      <span className={styles.scheduledLabel}>
                        {t('candidateDetail.scheduledFor')}
                      </span>
                      <span className={styles.scheduledDate}>
                        {formatDate(recruiterActions.videoCall.scheduledAt, locale)}
                      </span>
                    </div>
                    <div className={styles.scheduleActions}>
                      <button
                        className={styles.editScheduleButton}
                        onClick={onStartEditSchedule}
                        title={t('app.edit')}
                      >
                        ✏️
                      </button>
                      <button
                        className={styles.deleteScheduleButton}
                        onClick={onDeleteSchedule}
                        disabled={savingSchedule}
                        title={t('app.delete')}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noScheduleInfo}>
                    <span className={styles.noScheduleText}>{t('candidateDetail.noSchedule')}</span>
                    <button className={styles.addScheduleButton} onClick={onStartEditSchedule}>
                      {t('candidateDetail.addSchedule')}
                    </button>
                  </div>
                )}
              </>
            )}

            <a
              href={recruiterActions.videoCall.roomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.videoCallButton}
            >
              {t('candidateDetail.joinVideoCall')}
            </a>
          </div>
        )}

      {/* File Upload Section */}
      {showFileUpload && (
        <div className={styles.recruiterActionSection}>
          <p className={styles.recruiterActionLabel}>{t('candidateDetail.techTestFiles')}</p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            style={{ display: 'none' }}
          />

          <button
            className={styles.uploadButton}
            onClick={onFileSelect}
            disabled={uploadingFile}
          >
            {uploadingFile ? t('candidateDetail.uploading') : t('candidateDetail.uploadTechTest')}
          </button>

          {uploadError && <p className={styles.uploadError}>{uploadError}</p>}

          {recruiterActions.techTest.recruiterFileUrl && (
            <a
              href={getBackendUrl(recruiterActions.techTest.recruiterFileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.downloadButton}
            >
              {t('candidateDetail.downloadRecruiterFile')}
            </a>
          )}
        </div>
      )}

      {/* Candidate File Section */}
      {showFileUpload && (
        <div className={styles.recruiterActionSection}>
          <p className={styles.recruiterActionLabel}>{t('candidateDetail.candidateFile')}</p>
          {recruiterActions.techTest.candidateFileUrl ? (
            <>
              {recruiterActions.techTest.candidateSubmittedAt && (
                <p className={styles.submissionDate}>
                  {t('candidateDetail.submittedAt', {
                    date: formatDate(recruiterActions.techTest.candidateSubmittedAt, locale),
                  })}
                </p>
              )}
              <a
                href={getBackendUrl(recruiterActions.techTest.candidateFileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.downloadButton}
              >
                {t('candidateDetail.downloadCandidateFile')}
              </a>
            </>
          ) : (
            <p className={styles.noFileText}>{t('candidateDetail.noCandidateFileYet')}</p>
          )}
        </div>
      )}
    </div>
  );
}

export const RecruiterActionsPanel = memo(RecruiterActionsPanelComponent);
