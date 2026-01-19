/**
 * Lista de estados para cambiar el proceso
 */
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProcessStatus } from '../../../types';
import styles from '../../../pages/candidates/CandidateDetailPage.module.css';

interface StatusListProps {
  statuses: ProcessStatus[];
  currentStatusId: string | undefined;
  changingStatus: boolean;
  onStatusSelect: (status: ProcessStatus) => void;
}

function StatusListComponent({
  statuses,
  currentStatusId,
  changingStatus,
  onStatusSelect,
}: StatusListProps) {
  const { t } = useTranslation('common');

  return (
    <div className={styles.actionCard}>
      <h3 className={styles.actionTitle}>{t('candidateDetail.changeStatus')}</h3>

      <div className={styles.statusList}>
        {statuses.map((status) => {
          const isCurrent = status.id === currentStatusId;
          return (
            <button
              key={status.id}
              className={`${styles.statusOption} ${isCurrent ? styles.statusOptionCurrent : ''}`}
              onClick={() => onStatusSelect(status)}
              disabled={changingStatus || isCurrent}
            >
              <span className={styles.statusOptionName}>{status.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const StatusList = memo(StatusListComponent);
