import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks/reduxHooks';
import {
  getPublicJobOfferById,
  getModalityLabel,
  type PublicJobOffer,
} from '../../features/publicJobs/services/publicJobsApi';
import { JobOfferSEO } from '../../components/seo';
import { PublicHeader, PublicFooter } from '../../components/public';
import { markJobAsViewed } from '../../utils/viewedJobs';
import { getErrorMessage, isApiError } from '../../hooks/useErrorHandler';
import styles from './JobDetailPage.module.css';

function getRelativeTime(date: Date, t: (key: string, options?: Record<string, unknown>) => string): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('public.jobsList.postedToday');
  if (diffDays === 1) return t('public.jobsList.postedYesterday');
  if (diffDays < 7) return t('public.jobsList.postedDaysAgo', { days: diffDays });
  if (diffDays < 30) return t('public.jobsList.postedWeeksAgo', { weeks: Math.floor(diffDays / 7) });
  return t('public.jobsList.postedMonthsAgo', { months: Math.floor(diffDays / 30) });
}

export default function JobDetailPage() {
  const { t } = useTranslation('common');
  const { jobId, orgSlug } = useParams<{ jobId: string; orgSlug?: string }>();
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);

  // Determinar si estamos en modo organización basándose en la URL, no en los datos del job
  const isOrgMode = !!orgSlug;

  const [job, setJob] = useState<PublicJobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Solo candidatos y usuarios no autenticados pueden aplicar
  const canApply = !isLoggedIn || user?.role === 'candidate';

  useEffect(() => {
    const fetchData = async () => {
      if (!jobId) return;

      setLoading(true);
      setError(null);
      try {
        const jobData = await getPublicJobOfferById(jobId);
        setJob(jobData);
        markJobAsViewed(jobId);
      } catch (err) {
        if (isApiError(err) && err.response?.status === 404) {
          setError(t('public.jobDetail.notAvailable'));
        } else {
          setError(getErrorMessage(err) || t('public.jobDetail.loadError'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, t]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <p>{t('public.jobDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <h2>{t('public.jobDetail.notFound')}</h2>
            <p>{error || t('public.jobDetail.loadError')}</p>
            <Link to="/jobs" className={styles.errorBackLink}>
              {t('public.jobDetail.backToOffers')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Nombre público personalizado o nombre de la organización
  const publicName = job.displayName || '';
  const isNew = new Date(job.createdAt) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  return (
    <div className={styles.page}>
      <JobOfferSEO
        title={job.title}
        description={job.description}
        location={job.location}
        salary={job.salary}
        company={publicName}
        url={window.location.href}
      />

      {/* Header - solo muestra branding de org si estamos en modo org */}
      <PublicHeader
        logoUrl={isOrgMode ? job.organizationLogoUrl : undefined}
        organizationName={isOrgMode ? job.organizationName : undefined}
        showBranding={!isOrgMode || !job.organizationLogoUrl}
      />

      {/* Content */}
      <main className={styles.content}>
        {/* Back Link - usa el contexto de la URL, no los datos del job */}
        <Link
          to={isOrgMode ? `/org/${orgSlug}/jobs` : '/jobs'}
          className={styles.backLink}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t('public.jobDetail.backToOffers')}
        </Link>

        <div className={styles.layout}>
          {/* Main Column */}
          <div className={styles.mainColumn}>
            <div className={styles.jobCard}>
              {/* Job Header */}
              <div className={styles.jobHeader}>
                <div className={styles.titleRow}>
                  <h1 className={styles.jobTitle}>{job.title}</h1>
                  {isNew && <span className={styles.newBadge}>{t('public.jobsList.new')}</span>}
                </div>
                {publicName && (
                  <p className={styles.jobCompany}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21h18M3 7v14M21 7v14M9 21V3h6v18M9 7h6M9 11h6M9 15h6" />
                    </svg>
                    {publicName}
                  </p>
                )}
              </div>

              {/* Meta Tags */}
              <div className={styles.jobMeta}>
                {job.location && (
                  <span className={styles.metaTag}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {job.location}
                  </span>
                )}
                {job.modality && (
                  <span className={styles.metaTag}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                    {getModalityLabel(job.modality)}
                  </span>
                )}
                {job.contractType && (
                  <span className={styles.metaTag}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    {job.contractType}
                  </span>
                )}
                {job.salary && (
                  <span className={styles.metaTag}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v12M8 10h8M8 14h8" />
                    </svg>
                    {job.salary}
                  </span>
                )}
                <span className={styles.metaTag}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {getRelativeTime(new Date(job.createdAt), t)}
                </span>
              </div>

              {/* Description */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  {t('public.jobDetail.description')}
                </h2>
                <div className={styles.sectionContent}>
                  {job.description.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>

              {/* Requirements */}
              {job.requirements && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    {t('public.jobDetail.requirements')}
                  </h2>
                  <div className={styles.sectionContent}>
                    {job.requirements.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </section>
              )}

              {/* Benefits */}
              {job.benefits && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {t('public.jobDetail.benefits')}
                  </h2>
                  <div className={styles.sectionContent}>
                    {job.benefits.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </section>
              )}

              {/* Apply Button - Mobile */}
              <div className={styles.applyMobile}>
                {canApply ? (
                  <Link to={isOrgMode ? `/org/${orgSlug}/jobs/${job.id}/apply` : `/jobs/${job.id}/apply`} className={styles.applyButton}>
                    {t('public.jobDetail.applyNow')}
                  </Link>
                ) : (
                  <button className={styles.applyButtonDisabled} disabled>
                    {t('public.jobDetail.applyNow')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>{t('public.jobDetail.applyNow')}</h3>
              <p className={styles.sidebarText}>
                {publicName && `${publicName} - `}{job.title}
              </p>
              {canApply ? (
                <Link to={isOrgMode ? `/org/${orgSlug}/jobs/${job.id}/apply` : `/jobs/${job.id}/apply`} className={styles.applyButton}>
                  {t('public.jobDetail.applyNow')}
                </Link>
              ) : (
                <button className={styles.applyButtonDisabled} disabled>
                  {t('public.jobDetail.applyNow')}
                </button>
              )}
            </div>

            {/* Quick Info */}
            <div className={styles.quickInfo}>
              {job.location && (
                <div className={styles.quickItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <span className={styles.quickLabel}>Ubicacion</span>
                    <span className={styles.quickValue}>{job.location}</span>
                  </div>
                </div>
              )}
              {job.modality && (
                <div className={styles.quickItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                  <div>
                    <span className={styles.quickLabel}>Modalidad</span>
                    <span className={styles.quickValue}>{getModalityLabel(job.modality)}</span>
                  </div>
                </div>
              )}
              {job.contractType && (
                <div className={styles.quickItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <div>
                    <span className={styles.quickLabel}>Contrato</span>
                    <span className={styles.quickValue}>{job.contractType}</span>
                  </div>
                </div>
              )}
              {job.salary && (
                <div className={styles.quickItem}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v12M8 10h8M8 14h8" />
                  </svg>
                  <div>
                    <span className={styles.quickLabel}>Salario</span>
                    <span className={styles.quickValue}>{job.salary}</span>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
