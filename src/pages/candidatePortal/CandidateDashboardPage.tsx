import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getCandidateProcesses,
  type CandidateProcess,
} from '../../features/candidatePortal/services/candidatePortalApi';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import styles from './CandidateDashboardPage.module.css';

export default function CandidateDashboardPage() {
  const { t } = useTranslation('common');
  const [processes, setProcesses] = useState<CandidateProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const data = await getCandidateProcesses();
        setProcesses(data);
      } catch (err) {
        setError(getErrorMessage(err) || t('candidatePortal.dashboard.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <p>{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>{t('candidatePortal.dashboard.title')}</h1>
      </header>

      {/* Content */}
      <main className={styles.content}>
        {error ? (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        ) : processes.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>
              {t('candidatePortal.dashboard.noProcesses')}
            </p>
            <Link to="/jobs" className={styles.exploreLink}>
              {t('candidatePortal.dashboard.exploreOffers')}
            </Link>
          </div>
        ) : (
          <div className={styles.processesList}>
            {processes.map((process) => (
              <article key={process.id} className={styles.processCard}>
                <h2 className={styles.processTitle}>{process.jobOfferTitle}</h2>
                <p className={styles.processCompany}>{process.organizationName}</p>
                <p className={styles.processApplied}>
                  {t('candidatePortal.dashboard.appliedDate', { date: formatDate(process.appliedAt) })}
                </p>
                <div className={styles.processFooter}>
                  <div className={styles.statusRow}>
                    <span className={styles.processStatus}>{process.statusName}</span>
                    <span className={styles.processUpdated}>
                      {t('candidatePortal.dashboard.updatedDate', { date: formatDate(process.updatedAt) })}
                    </span>
                  </div>
                  {process.publicToken ? (
                    <a
                      href={`/candidate/process/${process.publicToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewButton}
                    >
                      {t('candidatePortal.dashboard.viewProcess')}
                    </a>
                  ) : (
                    <span className={styles.viewButtonDisabled}>
                      {t('candidatePortal.dashboard.processNotReady')}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <Link to="/jobs" className={styles.footerLink}>
          {t('candidatePortal.dashboard.viewJobOffers')}
        </Link>
      </footer>
    </div>
  );
}
