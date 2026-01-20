/**
 * CandidateDetailPage - Refactorizado
 *
 * Página de detalle de un candidato en un proceso de selección.
 * Refactorizada para cumplir estándares enterprise:
 * - Hooks personalizados para cada dominio de estado
 * - Componentes memoizados y reutilizables
 * - Cleanup adecuado de efectos secundarios
 * - Separación clara de responsabilidades
 */
import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks/reduxHooks';
import { usePermissions } from '../../hooks/useRole';
import type { Candidate } from '../../types';
import ShareCandidateModal from '../../components/sharedCandidateLink/ShareCandidateModal';
import { getSystemFeatures } from '../../services/portalApi';

// Hooks personalizados
import {
  useProcessData,
  useProcessComments,
  useProcessMessages,
  useStatusChange,
  useVideoCallSchedule,
  useCandidateInstructions,
  useFileUpload,
} from '../../hooks';

// Componentes extraídos
import {
  CandidateProfile,
  CandidateCV,
  ProcessMessages,
  ProcessHistory,
  StatusChangeModal,
  RecruiterActionsPanel,
  StatusList,
  InstructionsPanel,
  CommentsPanel,
  OtherActionsPanel,
} from '../../components/candidateDetail';

import styles from './CandidateDetailPage.module.css';

export default function CandidateDetailPage() {
  const { t } = useTranslation('common');
  const { processId } = useParams<{ processId: string }>();
  const navigate = useNavigate();
  const currentUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const { isAdmin } = usePermissions();

  // Admin solo puede ver, no editar
  const canEdit = !isAdmin;

  // Estado del proceso y datos
  const {
    process,
    statuses,
    statusHistory,
    recruiterActions,
    currentStatus,
    loading,
    error,
    refetch,
    refreshStatusHistory,
    refreshRecruiterActions,
    updateProcess,
  } = useProcessData(processId);

  // Comentarios
  const commentsHook = useProcessComments(processId, t);

  // Mensajes
  const messagesHook = useProcessMessages(processId);

  // Cambio de estado
  const statusChangeHook = useStatusChange();

  // Programación de videollamada
  const videoCallHook = useVideoCallSchedule();

  // Instrucciones al candidato
  const instructionsHook = useCandidateInstructions();

  // Subida de archivos
  const fileUploadHook = useFileUpload();

  // Modal de compartir
  const [showShareModal, setShowShareModal] = useState(false);

  // System features (storage enabled)
  const [storageEnabled, setStorageEnabled] = useState(true);

  useEffect(() => {
    getSystemFeatures()
      .then((features) => setStorageEnabled(features.storageEnabled))
      .catch(() => setStorageEnabled(true));
  }, []);

  // Navegación
  const handleBack = useCallback(() => {
    if (process?.offerId) {
      navigate(`/app/offers/${process.offerId}`);
    } else {
      navigate('/app/offers');
    }
  }, [process?.offerId, navigate]);

  // Refresh combinado para status y actions
  const handleRefreshAfterStatusChange = useCallback(async () => {
    await Promise.all([refreshStatusHistory(), refreshRecruiterActions()]);
  }, [refreshStatusHistory, refreshRecruiterActions]);

  // Handler para confirmar cambio de estado
  const handleConfirmStatusChange = useCallback(() => {
    if (!process) return;
    statusChangeHook.confirmChange(process, updateProcess, handleRefreshAfterStatusChange);
  }, [process, statusChangeHook, updateProcess, handleRefreshAfterStatusChange]);

  // Handler para actualizar los datos del candidato
  const handleCandidateUpdate = useCallback((updatedCandidate: Candidate) => {
    if (!process) return;
    updateProcess({
      ...process,
      candidate: updatedCandidate,
    });
  }, [process, updateProcess]);

  // Loading state
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>{t('candidateDetail.loading')}</p>
      </div>
    );
  }

  // Error state
  if (error || !process) {
    return (
      <div className={styles.error}>
        <h3>{t('candidateDetail.error')}</h3>
        <p>{error || t('candidateDetail.notFound')}</p>
        <button className={styles.retryButton} onClick={refetch}>
          {t('app.retry')}
        </button>
      </div>
    );
  }

  const candidate = process.candidate;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          ← {t('candidateDetail.backToPipeline')}
        </button>

        <div className={styles.headerMain}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>{candidate?.fullName || t('dashboard.candidate')}</h1>
            <p className={styles.subtitle}>
              {t('candidateDetail.offerLabel')}: {process.jobOffer?.title || t('candidateDetail.noOffer')}
            </p>
            <div className={styles.currentStatus}>
              <span className={styles.statusLabel}>{t('candidateDetail.currentStatus')}:</span>
              <span
                className={styles.statusBadge}
                style={{ backgroundColor: currentStatus?.color || 'var(--color-info-light)' }}
              >
                {currentStatus?.name || t('candidateDetail.unknown')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Main content */}
        <div className={styles.main}>
          <CandidateProfile
            candidate={candidate}
            canEdit={canEdit}
            onCandidateUpdate={handleCandidateUpdate}
            processId={processId}
          />

          <CandidateCV candidate={candidate} />

          <ProcessMessages
            messages={messagesHook.messages}
            loading={messagesHook.loading}
            newMessage={messagesHook.newMessage}
            sending={messagesHook.sending}
            canEdit={canEdit}
            messagesEndRef={messagesHook.messagesEndRef}
            onNewMessageChange={messagesHook.setNewMessage}
            onSendMessage={messagesHook.handleSendMessage}
          />

          <ProcessHistory history={statusHistory} />
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Recruiter Actions */}
          {canEdit && recruiterActions && (
            <RecruiterActionsPanel
              recruiterActions={recruiterActions}
              processId={processId!}
              editingSchedule={videoCallHook.editing}
              editScheduleDate={videoCallHook.editDate}
              editScheduleTime={videoCallHook.editTime}
              savingSchedule={videoCallHook.saving}
              onEditScheduleDateChange={videoCallHook.setEditDate}
              onEditScheduleTimeChange={videoCallHook.setEditTime}
              onStartEditSchedule={() =>
                videoCallHook.startEdit(recruiterActions.videoCall.scheduledAt)
              }
              onCancelEditSchedule={videoCallHook.cancelEdit}
              onSaveSchedule={() =>
                videoCallHook.saveSchedule(processId!, refreshRecruiterActions)
              }
              onDeleteSchedule={() =>
                videoCallHook.deleteSchedule(processId!, t, refreshRecruiterActions)
              }
              fileInputRef={fileUploadHook.fileInputRef}
              uploadingFile={fileUploadHook.uploading}
              uploadError={fileUploadHook.error}
              onFileSelect={fileUploadHook.handleFileSelect}
              onFileChange={(e) =>
                fileUploadHook.handleFileChange(e, processId!, refreshRecruiterActions, t)
              }
              storageEnabled={storageEnabled}
            />
          )}

          {/* Status List */}
          {canEdit && (
            <StatusList
              statuses={statuses}
              currentStatusId={currentStatus?.id}
              changingStatus={statusChangeHook.changingStatus}
              onStatusSelect={statusChangeHook.openModal}
            />
          )}

          {/* Instructions */}
          <InstructionsPanel
            instructions={process.candidateInstructions}
            canEdit={canEdit}
            editing={instructionsHook.editing}
            editText={instructionsHook.editText}
            saving={instructionsHook.saving}
            onEditTextChange={instructionsHook.setEditText}
            onStartEdit={() => instructionsHook.startEdit(process.candidateInstructions)}
            onCancelEdit={instructionsHook.cancelEdit}
            onSave={() => instructionsHook.saveInstructions(processId!, updateProcess, process)}
            onDelete={() =>
              instructionsHook.deleteInstructions(processId!, t, updateProcess, process)
            }
          />

          {/* Comments */}
          <CommentsPanel
            comments={commentsHook.comments}
            currentUserId={currentUserId}
            canEdit={canEdit}
            newComment={commentsHook.newComment}
            addingComment={commentsHook.addingComment}
            editingCommentId={commentsHook.editingCommentId}
            editingContent={commentsHook.editingContent}
            onNewCommentChange={commentsHook.setNewComment}
            onEditingContentChange={commentsHook.setEditingContent}
            onAddComment={commentsHook.handleAddComment}
            onStartEdit={commentsHook.handleStartEdit}
            onCancelEdit={commentsHook.handleCancelEdit}
            onSaveEdit={commentsHook.handleSaveEdit}
            onDeleteComment={commentsHook.handleDeleteComment}
          />

          {/* Other Actions */}
          {canEdit && (
            <OtherActionsPanel
              processId={processId!}
              process={process}
              onProcessUpdate={updateProcess}
              onOpenShareModal={() => setShowShareModal(true)}
            />
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      {statusChangeHook.showModal && statusChangeHook.selectedStatus && (
        <StatusChangeModal
          selectedStatus={statusChangeHook.selectedStatus}
          changingStatus={statusChangeHook.changingStatus}
          candidateInstructions={statusChangeHook.candidateInstructions}
          scheduledDate={statusChangeHook.scheduledDate}
          scheduledTime={statusChangeHook.scheduledTime}
          onCandidateInstructionsChange={statusChangeHook.setCandidateInstructions}
          onScheduledDateChange={statusChangeHook.setScheduledDate}
          onScheduledTimeChange={statusChangeHook.setScheduledTime}
          onClose={statusChangeHook.closeModal}
          onConfirm={handleConfirmStatusChange}
        />
      )}

      {/* Share Modal */}
      {showShareModal && processId && candidate && (
        <ShareCandidateModal
          processId={processId}
          candidateName={candidate.fullName || t('dashboard.candidate')}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
