/**
 * SummaryStats - Tarjetas de resumen de candidatos
 */

import { useTranslation } from 'react-i18next';
import styles from '../OfferDetailPage.module.css';

interface SummaryStatsProps {
  totalCandidates: number;
  totalUnreviewed: number;
  totalProcesses: number;
  hasActiveFilters: boolean;
}

export function SummaryStats({
  totalCandidates,
  totalUnreviewed,
  totalProcesses,
  hasActiveFilters,
}: SummaryStatsProps) {
  const { t } = useTranslation('common');

  return (
    <div className={styles.summaryStats}>
      <div className={styles.statCard}>
        <span className={styles.statNumber}>{totalCandidates}</span>
        <span className={styles.statLabel}>
          {t('offerDetail.totalCandidates')}
          {hasActiveFilters && ` (${totalProcesses})`}
        </span>
      </div>
      {totalUnreviewed > 0 && (
        <div className={`${styles.statCard} ${styles.statCardHighlight}`}>
          <span className={styles.statNumber}>{totalUnreviewed}</span>
          <span className={styles.statLabel}>{t('offerDetail.pendingReview')}</span>
        </div>
      )}
    </div>
  );
}
