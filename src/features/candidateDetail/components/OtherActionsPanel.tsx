import { logger } from '@/lib/logger';
/**
 * Panel de otras acciones (ver página candidato, compartir)
 */
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SelectionProcess } from '../../../types';
import { generatePublicToken } from '../../selectionProcess/services/selectionProcessApi';
import { getErrorMessage } from '../../../hooks/useErrorHandler';
import styles from '../../../pages/candidates/CandidateDetailPage.module.css';

interface OtherActionsPanelProps {
  processId: string;
  process: SelectionProcess;
  onProcessUpdate: (updated: SelectionProcess) => void;
  onOpenShareModal: () => void;
}

function OtherActionsPanelComponent({
  processId,
  process,
  onProcessUpdate,
  onOpenShareModal,
}: OtherActionsPanelProps) {
  const { t } = useTranslation('common');
  const [generatingToken, setGeneratingToken] = useState(false);

  const handleViewCandidatePage = useCallback(async () => {
    try {
      // Si ya tiene token, usarlo directamente
      if (process.publicAccessToken) {
        window.open(`/candidate/process/${process.publicAccessToken}?preview=true`, '_blank');
        return;
      }

      // Si no tiene token, generarlo
      setGeneratingToken(true);
      const token = await generatePublicToken(processId);

      if (!token) {
        logger.error('generatePublicToken returned empty token');
        alert(t('candidateDetail.errorGeneratingToken'));
        return;
      }

      // Actualizar el proceso local con el nuevo token
      onProcessUpdate({
        ...process,
        publicAccessToken: token,
        publicAccessEnabled: true,
      });

      // Abrir la página en modo preview
      window.open(`/candidate/process/${token}?preview=true`, '_blank');
    } catch (err) {
      logger.error('Error generating public token:', err);
      alert(getErrorMessage(err) || t('candidateDetail.errorGeneratingToken'));
    } finally {
      setGeneratingToken(false);
    }
  }, [processId, process, onProcessUpdate, t]);

  return (
    <div className={styles.actionCard}>
      <h3 className={styles.actionTitle}>{t('candidateDetail.otherActions')}</h3>
      <div className={styles.secondaryActions}>
        <button
          className={styles.secondaryAction}
          onClick={handleViewCandidatePage}
          disabled={generatingToken}
        >
          {generatingToken ? '...' : t('candidateDetail.viewCandidatePage')}
        </button>
        <button className={styles.secondaryAction} onClick={onOpenShareModal}>
          {t('shareCandidate.title')}
        </button>
      </div>
    </div>
  );
}

export const OtherActionsPanel = memo(OtherActionsPanelComponent);
