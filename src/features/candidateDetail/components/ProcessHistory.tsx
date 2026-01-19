/**
 * Componente de historial de estados del proceso
 */
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../lib/i18n';
import type { StatusHistoryEntry } from '../../selectionProcess/services/selectionProcessApi';
import { formatDate } from '../utils/formatDate';
import styles from '../../../pages/candidates/CandidateDetailPage.module.css';

interface HistoryItemProps {
  entry: StatusHistoryEntry;
  isCurrent: boolean;
  currentLabel: string;
  locale: string;
}

const HistoryItem = memo(function HistoryItem({
  entry,
  isCurrent,
  currentLabel,
  locale,
}: HistoryItemProps) {
  return (
    <div className={`${styles.historyItem} ${isCurrent ? styles.historyItemCurrent : ''}`}>
      <div className={styles.historyContent}>
        <span className={styles.historyStatus}>
          {entry.statusName}
          {isCurrent && ` (${currentLabel})`}
        </span>
        <span className={styles.historyDate}>
          {formatDate(entry.changedAt, locale)}
          {entry.changedByName && ` - ${entry.changedByName}`}
        </span>
      </div>
    </div>
  );
});

interface ProcessHistoryProps {
  history: StatusHistoryEntry[];
}

function ProcessHistoryComponent({ history }: ProcessHistoryProps) {
  const { t } = useTranslation('common');
  const locale = i18n.language || 'es';

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{t('candidateDetail.statusHistory')}</h2>
      <div className={styles.historyList}>
        {history.length > 0 ? (
          history.map((entry, index) => (
            <HistoryItem
              key={entry.id}
              entry={entry}
              isCurrent={index === history.length - 1}
              currentLabel={t('candidateDetail.current')}
              locale={locale}
            />
          ))
        ) : (
          <p className={styles.emptyComments}>{t('candidateDetail.noStatusHistory')}</p>
        )}
      </div>
    </div>
  );
}

export const ProcessHistory = memo(ProcessHistoryComponent);
