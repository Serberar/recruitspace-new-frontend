/**
 * PipelineTimeline - Timeline visual del pipeline de selección
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProcessStatus, SelectionProcess } from '@/types';
import styles from '../OfferDetailPage.module.css';

interface ProcessesByStatus {
  [statusId: string]: SelectionProcess[];
}

interface PipelineTimelineProps {
  statuses: ProcessStatus[];
  processesByStatus: ProcessesByStatus;
  totalCandidates: number;
  onViewCandidate: (processId: string) => void;
  onCopyLink: () => void;
}

export function PipelineTimeline({
  statuses,
  processesByStatus,
  totalCandidates,
  onViewCandidate,
  onCopyLink,
}: PipelineTimelineProps) {
  const { t } = useTranslation('common');
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null);

  const toggleStatusExpand = (statusId: string) => {
    setExpandedStatus(expandedStatus === statusId ? null : statusId);
  };

  const getStatusCounts = (statusProcesses: SelectionProcess[]) => {
    const total = statusProcesses.length;
    const unreviewed = statusProcesses.filter((p) => !p.reviewed).length;
    const reviewed = statusProcesses.filter((p) => p.reviewed).length;
    return { total, unreviewed, reviewed };
  };

  const isEmpty = totalCandidates === 0;

  return (
    <div className={styles.pipelineContainer}>
      {/* Mensaje cuando no hay candidatos */}
      {isEmpty && (
        <div className={styles.emptyPipelineMessage}>
          <p>{t('offerDetail.noCandidatesYet')}</p>
          <button className={styles.copyLinkButtonInline} onClick={onCopyLink}>
            {t('offerDetail.copyPublicLink')}
          </button>
        </div>
      )}

      {/* Pipeline visual siempre visible */}
      <div className={styles.pipelineTimeline}>
        {statuses.map((status, index) => {
          const statusProcesses = processesByStatus[status.id] || [];
          const counts = getStatusCounts(statusProcesses);
          const isExpanded = expandedStatus === status.id;
          const isLast = index === statuses.length - 1;
          const hasCount = counts.total > 0;

          return (
            <div key={status.id} className={styles.timelineItem}>
              {/* Timeline connector */}
              <div className={styles.timelineConnector}>
                <div
                  className={`${styles.timelineDot} ${hasCount ? styles.timelineDotActive : ''}`}
                  style={{ backgroundColor: status.color }}
                />
                {!isLast && <div className={styles.timelineLine} />}
              </div>

              {/* Status content */}
              <div className={styles.timelineContent}>
                <button
                  className={`${styles.statusHeader} ${isExpanded ? styles.statusHeaderExpanded : ''} ${isEmpty ? styles.statusHeaderEmpty : ''}`}
                  onClick={() => hasCount && toggleStatusExpand(status.id)}
                  disabled={!hasCount}
                >
                  <div className={styles.statusInfo}>
                    <h3 className={styles.statusName}>
                      <span
                        className={styles.statusColorDot}
                        style={{ backgroundColor: status.color }}
                      />
                      {status.name}
                      {status.isTerminal && (
                        <span className={styles.terminalBadge}>Final</span>
                      )}
                    </h3>
                    {hasCount ? (
                      <div className={styles.statusCounts}>
                        {counts.unreviewed > 0 && (
                          <span className={styles.countBadgeNew}>
                            {counts.unreviewed} {t('offerDetail.new')}
                          </span>
                        )}
                        {counts.reviewed > 0 && (
                          <span className={styles.countBadgeReviewed}>
                            {counts.reviewed} {t('offerDetail.reviewed')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className={styles.emptyStatusText}>
                        {t('offerDetail.noOneCandidates')}
                      </span>
                    )}
                  </div>
                  {hasCount && (
                    <span
                      className={`${styles.expandIcon} ${isExpanded ? styles.expandIconOpen : ''}`}
                    >
                      ▼
                    </span>
                  )}
                </button>

                {/* Expanded candidate list */}
                {isExpanded && counts.total > 0 && (
                  <div className={styles.candidateList}>
                    {statusProcesses.map((process) => (
                      <div
                        key={process.id}
                        className={`${styles.candidateItem} ${!process.reviewed ? styles.candidateItemNew : ''}`}
                        onClick={() => onViewCandidate(process.id)}
                      >
                        <div className={styles.candidateInfo}>
                          {!process.reviewed && (
                            <span
                              className={styles.newIndicator}
                              title={t('offerDetail.notReviewed')}
                            />
                          )}
                          <div className={styles.candidateDetails}>
                            <p className={styles.candidateName}>
                              {process.candidate?.fullName || t('offerDetail.candidate')}
                            </p>
                            <p className={styles.candidateEmail}>
                              {process.candidate?.email || ''}
                            </p>
                          </div>
                        </div>
                        <span className={styles.viewArrow}>→</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
