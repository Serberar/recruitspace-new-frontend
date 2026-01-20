/**
 * Componente de CV del candidato con datos parseados
 */
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Candidate, CandidateExperience, CandidateEducation } from '../../types';
import styles from '../../pages/candidates/CandidateDetailPage.module.css';

interface CandidateCVProps {
  candidate: Candidate | undefined;
}

function CandidateCVComponent({ candidate }: CandidateCVProps) {
  const { t } = useTranslation('common');

  const hasData =
    candidate?.summary ||
    (candidate?.skills && candidate.skills.length > 0) ||
    (candidate?.experience && candidate.experience.length > 0) ||
    (candidate?.education && candidate.education.length > 0);

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{t('candidateDetail.cv')}</h2>

      {/* Resumen profesional */}
      {candidate?.summary && (
        <div className={styles.cvSection}>
          <h3 className={styles.cvSectionTitle}>{t('candidateDetail.summary')}</h3>
          <p className={styles.cvSummary}>{candidate.summary}</p>
        </div>
      )}

      {/* Habilidades */}
      {candidate?.skills && candidate.skills.length > 0 && (
        <div className={styles.cvSection}>
          <h3 className={styles.cvSectionTitle}>{t('candidateDetail.skills')}</h3>
          <div className={styles.skillsList}>
            {candidate.skills.map((skill, index) => (
              <span key={index} className={styles.skillBadge}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experiencia laboral */}
      {candidate?.experience && candidate.experience.length > 0 && (
        <div className={styles.cvSection}>
          <h3 className={styles.cvSectionTitle}>{t('candidateDetail.experience')}</h3>
          <div className={styles.experienceList}>
            {(candidate.experience as CandidateExperience[]).map((exp, index) => (
              <div key={index} className={styles.experienceItem}>
                <div className={styles.experienceHeader}>
                  <span className={styles.experienceRole}>{exp.role}</span>
                  <span className={styles.experienceCompany}>{exp.company}</span>
                </div>
                {(exp.startDate || exp.endDate) && (
                  <span className={styles.experienceDates}>
                    {exp.startDate || '?'} - {exp.endDate || t('candidateDetail.present')}
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

      {/* Educación */}
      {candidate?.education && candidate.education.length > 0 && (
        <div className={styles.cvSection}>
          <h3 className={styles.cvSectionTitle}>{t('candidateDetail.education')}</h3>
          <div className={styles.educationList}>
            {(candidate.education as CandidateEducation[]).map((edu, index) => (
              <div key={index} className={styles.educationItem}>
                <div className={styles.educationHeader}>
                  <span className={styles.educationDegree}>{edu.degree}</span>
                  {edu.field && <span className={styles.educationField}> - {edu.field}</span>}
                </div>
                <span className={styles.educationInstitution}>{edu.institution}</span>
                {(edu.startDate || edu.endDate) && (
                  <span className={styles.educationDates}>
                    {edu.startDate || '?'} - {edu.endDate || t('candidateDetail.present')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay datos */}
      {!hasData && <p className={styles.emptyComments}>{t('candidateDetail.noCvData')}</p>}
    </div>
  );
}

export const CandidateCV = memo(CandidateCVComponent);
