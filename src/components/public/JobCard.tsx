import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getModalityLabel, type PublicJobOffer } from '../../features/publicJobs/services/publicJobsApi';
import { getRelativeTime, isRecentDate } from '../../utils/dateUtils';
import styles from './JobCard.module.css';

interface JobCardProps {
  job: PublicJobOffer;
  isViewed?: boolean;
  showCompany?: boolean;
  orgSlug?: string; // Contexto de organización para mantener navegación
}

export function JobCard({ job, isViewed = false, showCompany = true, orgSlug }: JobCardProps) {
  const { t } = useTranslation('common');
  const isNew = isRecentDate(new Date(job.createdAt), 3);

  // Si estamos en portal de org, mantener ese contexto
  const jobUrl = orgSlug ? `/org/${orgSlug}/jobs/${job.id}` : `/jobs/${job.id}`;

  return (
    <Link to={jobUrl} className={styles.card}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>{job.title}</h2>
            {isViewed && (
              <span className={styles.viewedBadge}>{t('public.jobsList.viewed')}</span>
            )}
            {isNew && !isViewed && (
              <span className={styles.newBadge}>{t('public.jobsList.new')}</span>
            )}
          </div>
          {showCompany && job.displayName && (
            <p className={styles.company}>
              <svg className={styles.companyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M3 7v14M21 7v14M9 21V3h6v18M9 7h6M9 11h6M9 15h6" />
              </svg>
              {job.displayName}
            </p>
          )}
        </div>
        <div className={styles.meta}>
          {job.location && (
            <span className={styles.tag}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {job.location}
            </span>
          )}
          {job.modality && (
            <span className={styles.tag}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              {getModalityLabel(job.modality)}
            </span>
          )}
          {job.contractType && (
            <span className={styles.tag}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {job.contractType}
            </span>
          )}
          {job.salary && (
            <span className={styles.tag}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v12M8 10h8M8 14h8" />
              </svg>
              {job.salary}
            </span>
          )}
          <span className={styles.tag}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {getRelativeTime(new Date(job.createdAt), t)}
          </span>
        </div>
      </div>
      <div className={styles.arrow}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
}
