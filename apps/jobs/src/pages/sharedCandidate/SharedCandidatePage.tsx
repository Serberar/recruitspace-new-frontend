import { logger } from '@/lib/logger';
import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  validateSharedLinkAccess,
  getSharedCandidateData,
  type SharedCandidateViewData,
} from '../../features/sharedCandidateLink/services/sharedCandidateLinkApi';
import styles from './SharedCandidatePage.module.css';

export default function SharedCandidatePage() {
  const { t } = useTranslation('common');
  const { token } = useParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SharedCandidateViewData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAccess = useCallback(async () => {
    if (!token || !password.trim()) {
      setError(t('sharedCandidate.invalidPassword'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate access
      const validation = await validateSharedLinkAccess({ token, password });

      if (!validation.valid) {
        switch (validation.reason) {
          case 'expired':
            setError(t('sharedCandidate.linkExpired'));
            break;
          case 'revoked':
            setError(t('sharedCandidate.linkRevoked'));
            break;
          case 'invalid_password':
            setError(t('sharedCandidate.invalidPassword'));
            break;
          default:
            setError(t('sharedCandidate.linkNotFound'));
        }
        return;
      }

      // Get candidate data
      const candidateData = await getSharedCandidateData(token, password);
      setData(candidateData);
      setIsAuthenticated(true);
    } catch (err: unknown) {
      logger.error('Error accessing shared link:', err);
      if (err instanceof Error && err.message.includes('403')) {
        setError(t('sharedCandidate.invalidPassword'));
      } else if (err instanceof Error && err.message.includes('404')) {
        setError(t('sharedCandidate.linkNotFound'));
      } else {
        setError(t('sharedCandidate.accessDenied'));
      }
    } finally {
      setLoading(false);
    }
  }, [token, password, t]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAccess();
    }
  };

  // Access form
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.accessCard}>
          <div className={styles.lockIcon}>🔒</div>
          <h1 className={styles.title}>{t('sharedCandidate.accessTitle')}</h1>
          <p className={styles.description}>{t('sharedCandidate.enterPassword')}</p>

          <div className={styles.form}>
            <input
              type="password"
              className={styles.input}
              placeholder={t('sharedCandidate.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />

            {error && <p className={styles.error}>{error}</p>}

            <button
              className={styles.accessButton}
              onClick={handleAccess}
              disabled={loading || !password.trim()}
            >
              {loading ? t('app.loading') : t('sharedCandidate.accessButton')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Candidate view
  if (!data) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.candidateView}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.candidateName}>{data.candidate.fullName}</h1>
            <div className={styles.offerInfo}>
              <span className={styles.offerLabel}>{t('sharedCandidate.offer')}:</span>
              <span className={styles.offerTitle}>{data.offer.title}</span>
              <span className={styles.clientName}>({data.offer.clientName})</span>
            </div>
            <div
              className={styles.statusBadge}
              style={{ backgroundColor: data.status.color }}
            >
              {data.status.name}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Profile info */}
          {data.candidate.email && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('sharedCandidate.profile')}</h2>
              <div className={styles.profileGrid}>
                {data.candidate.email && (
                  <div className={styles.profileItem}>
                    <span className={styles.profileLabel}>Email:</span>
                    <a href={`mailto:${data.candidate.email}`} className={styles.profileValue}>
                      {data.candidate.email}
                    </a>
                  </div>
                )}
                {data.candidate.phone && (
                  <div className={styles.profileItem}>
                    <span className={styles.profileLabel}>Tel:</span>
                    <a href={`tel:${data.candidate.phone}`} className={styles.profileValue}>
                      {data.candidate.phone}
                    </a>
                  </div>
                )}
                {data.candidate.linkedinUrl && (
                  <div className={styles.profileItem}>
                    <span className={styles.profileLabel}>LinkedIn:</span>
                    <a
                      href={data.candidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.profileValue}
                    >
                      Ver perfil
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CV info */}
          {data.cv && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('sharedCandidate.cv')}</h2>

              {data.cv.summary && (
                <div className={styles.subsection}>
                  <h3 className={styles.subsectionTitle}>{t('sharedCandidate.summary')}</h3>
                  <p className={styles.summary}>{data.cv.summary}</p>
                </div>
              )}

              {data.cv.skills && data.cv.skills.length > 0 && (
                <div className={styles.subsection}>
                  <h3 className={styles.subsectionTitle}>{t('sharedCandidate.skills')}</h3>
                  <div className={styles.skillsList}>
                    {data.cv.skills.map((skill, idx) => (
                      <span key={idx} className={styles.skillBadge}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.cv.experience && data.cv.experience.length > 0 && (
                <div className={styles.subsection}>
                  <h3 className={styles.subsectionTitle}>{t('sharedCandidate.experience')}</h3>
                  <div className={styles.experienceList}>
                    {data.cv.experience.map((exp, idx) => (
                      <div key={idx} className={styles.experienceItem}>
                        <div className={styles.experienceHeader}>
                          <span className={styles.experienceRole}>{exp.role}</span>
                          <span className={styles.experienceCompany}>{exp.company}</span>
                        </div>
                        {(exp.startDate || exp.endDate) && (
                          <span className={styles.experienceDates}>
                            {exp.startDate || '?'} - {exp.endDate || t('sharedCandidate.present')}
                          </span>
                        )}
                        {exp.description && (
                          <p className={styles.experienceDescription}>{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.cv.education && data.cv.education.length > 0 && (
                <div className={styles.subsection}>
                  <h3 className={styles.subsectionTitle}>{t('sharedCandidate.education')}</h3>
                  <div className={styles.educationList}>
                    {data.cv.education.map((edu, idx) => (
                      <div key={idx} className={styles.educationItem}>
                        <div className={styles.educationHeader}>
                          <span className={styles.educationDegree}>{edu.degree}</span>
                          {edu.field && <span className={styles.educationField}> - {edu.field}</span>}
                        </div>
                        <span className={styles.educationInstitution}>{edu.institution}</span>
                        {(edu.startDate || edu.endDate) && (
                          <span className={styles.educationDates}>
                            {edu.startDate || '?'} - {edu.endDate || t('sharedCandidate.present')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Video call */}
          {data.videoCall && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('sharedCandidate.videoCall')}</h2>
              <div className={styles.videoCallCard}>
                {data.videoCall.scheduledAt && (
                  <p className={styles.videoCallDate}>
                    {new Date(data.videoCall.scheduledAt).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                <a
                  href={data.videoCall.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.videoCallButton}
                >
                  {t('sharedCandidate.joinVideoCall')}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
