import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getProcessDetail,
  type ProcessDetail,
} from '../../features/candidatePortal/services/candidatePortalApi';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import styles from './CandidatePortalProcessPage.module.css';

export default function CandidatePortalProcessPage() {
  const { t } = useTranslation('common');
  const { processId } = useParams<{ processId: string }>();
  const [process, setProcess] = useState<ProcessDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProcess = async () => {
      if (!processId) return;

      try {
        const data = await getProcessDetail(processId);
        setProcess(data);
      } catch (err) {
        setError(getErrorMessage(err) || t('candidatePortal.process.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchProcess();
  }, [processId, t]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
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

  if (error || !process) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <p>{error || t('candidatePortal.process.notFound')}</p>
          <Link to="/portal" className={styles.backLink}>
            {t('candidatePortal.process.backToProcesses')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link to="/portal" className={styles.breadcrumbLink}>
          {t('candidatePortal.menu.dashboard')}
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{process.jobOffer.title}</span>
      </nav>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{process.jobOffer.title}</h1>
          <p className={styles.company}>{process.jobOffer.organizationName}</p>
        </div>
        <div className={styles.statusBadge}>
          {process.status.name}
        </div>
      </header>

      {/* Main content */}
      <div className={styles.content}>
        {/* Process info card */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{t('candidatePortal.process.processInfo')}</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('candidatePortal.process.appliedDate')}</span>
              <span className={styles.infoValue}>{formatDate(process.appliedAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>{t('candidatePortal.process.currentStatus')}</span>
              <span className={styles.infoValue}>{process.status.name}</span>
            </div>
          </div>
        </section>

        {/* Job description */}
        {process.jobOffer.description && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>{t('candidatePortal.process.jobDescription')}</h2>
            <p className={styles.description}>{process.jobOffer.description}</p>
          </section>
        )}

        {/* Current step (if any) */}
        {process.currentStep && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>{t('candidatePortal.process.currentStep')}</h2>
            <div className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <span className={styles.stepType}>
                  {t(`candidatePortal.process.stepTypes.${process.currentStep.type}`)}
                </span>
                <span className={`${styles.stepStatus} ${styles[`stepStatus${process.currentStep.status}`]}`}>
                  {t(`candidatePortal.process.stepStatus.${process.currentStep.status}`)}
                </span>
              </div>
              {process.currentStep.scheduledAt && (
                <p className={styles.stepSchedule}>
                  {t('candidatePortal.process.scheduledFor', { date: formatDate(process.currentStep.scheduledAt) })}
                </p>
              )}
              {process.currentStep.instructions && (
                <p className={styles.stepInstructions}>{process.currentStep.instructions}</p>
              )}
              {process.currentStep.meetingUrl && (
                <a
                  href={process.currentStep.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.meetingLink}
                >
                  {t('candidatePortal.process.joinMeeting')}
                </a>
              )}
            </div>
          </section>
        )}

        {/* Messages timeline */}
        {process.messages && process.messages.length > 0 && (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>{t('candidatePortal.process.messages')}</h2>
            <div className={styles.timeline}>
              {process.messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.timelineItem} ${message.isFromCandidate ? styles.fromCandidate : styles.fromCompany}`}
                >
                  <div className={styles.messageContent}>{message.content}</div>
                  <div className={styles.messageDate}>{formatDate(message.createdAt)}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <Link to="/portal" className={styles.backButton}>
          {t('candidatePortal.process.backToProcesses')}
        </Link>
      </footer>
    </div>
  );
}
