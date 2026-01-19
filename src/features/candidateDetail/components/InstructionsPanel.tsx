/**
 * Panel de instrucciones para el candidato
 */
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../../../pages/candidates/CandidateDetailPage.module.css';

interface InstructionsPanelProps {
  instructions: string | null | undefined;
  canEdit: boolean;
  editing: boolean;
  editText: string;
  saving: boolean;
  onEditTextChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
}

function InstructionsPanelComponent({
  instructions,
  canEdit,
  editing,
  editText,
  saving,
  onEditTextChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: InstructionsPanelProps) {
  const { t } = useTranslation('common');

  return (
    <div className={styles.actionCard}>
      <h3 className={styles.actionTitle}>{t('candidateDetail.candidateInstructionsTitle')}</h3>

      {canEdit && editing ? (
        <div className={styles.editInstructionsForm}>
          <textarea
            className={styles.instructionsTextarea}
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            placeholder={t('candidateDetail.candidateInstructionsPlaceholder')}
            rows={3}
            maxLength={2000}
            autoFocus
          />
          <div className={styles.editInstructionsActions}>
            <button
              className={styles.saveScheduleButton}
              onClick={onSave}
              disabled={saving}
            >
              {saving ? '...' : t('app.save')}
            </button>
            <button
              className={styles.cancelScheduleButton}
              onClick={onCancelEdit}
              disabled={saving}
            >
              {t('app.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <>
          {instructions ? (
            <div className={styles.sidebarCommentItem}>
              {canEdit && (
                <div className={styles.instructionsHeader}>
                  <div className={styles.sidebarCommentActions}>
                    <button
                      className={styles.sidebarCommentActionBtn}
                      onClick={onStartEdit}
                      disabled={saving}
                      title={t('app.edit')}
                    >
                      ✎
                    </button>
                    <button
                      className={styles.sidebarCommentActionBtn}
                      onClick={onDelete}
                      disabled={saving}
                      title={t('app.delete')}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              <p className={styles.sidebarCommentContent}>{instructions}</p>
            </div>
          ) : (
            <div className={styles.noInstructions}>
              <p className={styles.noInstructionsText}>{t('candidateDetail.noInstructions')}</p>
              {canEdit && (
                <button
                  className={styles.sidebarCommentActionBtn}
                  onClick={onStartEdit}
                  title={t('candidateDetail.addInstructions')}
                >
                  +
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const InstructionsPanel = memo(InstructionsPanelComponent);
