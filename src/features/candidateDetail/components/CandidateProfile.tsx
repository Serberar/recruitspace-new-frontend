/**
 * Componente de perfil del candidato con edición inline completa
 * Permite editar: datos básicos, resumen, skills, experiencia, formación e idiomas
 */
import { memo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { logger } from '@/lib/logger';
import type { Candidate, CandidateExperience, CandidateEducation } from '../../../types';
import { updateCandidateProfile, generateCandidateCVHtml } from '../../candidates/services/candidatesApi';
import { getErrorMessage } from '../../../hooks/useErrorHandler';
import styles from '../../../pages/candidates/CandidateDetailPage.module.css';

/**
 * Genera y descarga el CV como PDF usando la API de impresion del navegador
 */
async function downloadCVAsPDF(candidateId: string): Promise<void> {
  // Obtener el HTML del CV desde el backend
  const htmlContent = await generateCandidateCVHtml(candidateId);

  // Crear un iframe oculto para imprimir
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error('No se pudo crear el documento para imprimir');
  }

  // Escribir el HTML en el iframe
  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Esperar a que se carguen los estilos
  await new Promise(resolve => setTimeout(resolve, 500));

  // Imprimir (el usuario puede guardar como PDF)
  iframe.contentWindow?.print();

  // Limpiar despues de un tiempo
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
}

interface CandidateProfileProps {
  candidate: Candidate | undefined;
  canEdit?: boolean;
  onCandidateUpdate?: (candidate: Candidate) => void;
  processId?: string;
}

interface EditableExperience extends CandidateExperience {
  id: string;
}

interface EditableEducation extends CandidateEducation {
  id: string;
}

interface EditFormData {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  summary: string;
  skills: string;
  languages: string;
  experience: EditableExperience[];
  education: EditableEducation[];
}

function CandidateProfileComponent({ candidate, canEdit = true, onCandidateUpdate, processId }: CandidateProfileProps) {
  const { t } = useTranslation('common');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    fullName: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    summary: '',
    skills: '',
    languages: '',
    experience: [],
    education: [],
  });

  const handleDownloadCV = useCallback(async () => {
    if (!candidate) return;
    setDownloading(true);
    setError(null);
    try {
      await downloadCVAsPDF(candidate.id);
    } catch (err) {
      logger.error('Error downloading CV:', err);
      setError(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  }, [candidate, t]);

  const handleStartEdit = useCallback(() => {
    if (!candidate) return;
    setFormData({
      fullName: candidate.fullName || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      linkedinUrl: candidate.linkedinUrl || '',
      summary: candidate.summary || '',
      skills: candidate.skills?.join(', ') || '',
      languages: candidate.languages?.join(', ') || '',
      experience: (candidate.experience || []).map((exp, idx) => ({
        ...exp,
        id: `exp-${idx}`,
      })),
      education: (candidate.education || []).map((edu, idx) => ({
        ...edu,
        id: `edu-${idx}`,
      })),
    });
    setError(null);
    setIsEditing(true);
  }, [candidate]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setError(null);
  }, []);

  const handleInputChange = useCallback((field: keyof EditFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Experience handlers
  const handleAddExperience = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: `exp-${Date.now()}`, company: '', role: '', startDate: '', endDate: '', description: '' },
      ],
    }));
  }, []);

  const handleUpdateExperience = useCallback((id: string, field: keyof CandidateExperience, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  }, []);

  const handleRemoveExperience = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  }, []);

  // Education handlers
  const handleAddEducation = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { id: `edu-${Date.now()}`, institution: '', degree: '', field: '', startDate: '', endDate: '' },
      ],
    }));
  }, []);

  const handleUpdateEducation = useCallback((id: string, field: keyof CandidateEducation, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  }, []);

  const handleRemoveEducation = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!candidate) return;

    setSaving(true);
    setError(null);

    try {
      const skillsArray = formData.skills.trim()
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : undefined;

      const languagesArray = formData.languages.trim()
        ? formData.languages.split(',').map(s => s.trim()).filter(Boolean)
        : undefined;

      // Limpiar experience y education de ids temporales
      const experienceData = formData.experience
        .filter(exp => exp.company.trim() || exp.role.trim())
        .map(({ id, ...rest }) => rest);

      const educationData = formData.education
        .filter(edu => edu.institution.trim() || edu.degree.trim())
        .map(({ id, ...rest }) => rest);

      await updateCandidateProfile(candidate.id, {
        fullName: formData.fullName.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        summary: formData.summary.trim() || undefined,
        skills: skillsArray,
        languages: languagesArray,
        experience: experienceData.length > 0 ? experienceData : undefined,
        education: educationData.length > 0 ? educationData : undefined,
      }, processId);

      // Update local state
      if (onCandidateUpdate) {
        onCandidateUpdate({
          ...candidate,
          fullName: formData.fullName.trim() || candidate.fullName,
          phone: formData.phone.trim() || undefined,
          linkedinUrl: formData.linkedinUrl.trim() || undefined,
          summary: formData.summary.trim() || undefined,
          skills: skillsArray,
          languages: languagesArray,
          experience: experienceData.length > 0 ? experienceData : undefined,
          education: educationData.length > 0 ? educationData : undefined,
        });
      }

      setIsEditing(false);
    } catch (err) {
      logger.error('Error updating candidate profile:', err);
      setError(getErrorMessage(err) || t('toast.error'));
    } finally {
      setSaving(false);
    }
  }, [candidate, formData, onCandidateUpdate, t]);

  if (isEditing) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{t('candidateDetail.editProfile')}</h2>
        </div>

        <div className={styles.editForm}>
          {/* Aviso sobre snapshots */}
          {processId && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#e3f2fd',
              border: '1px solid #90caf9',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#1565c0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                {t('candidateDetail.snapshotEditInfo', 'Los cambios solo afectarán a este proceso de selección. Los demás procesos del candidato mantendrán su información independiente.')}
              </span>
            </div>
          )}

          {/* Datos básicos */}
          <div className={styles.editSectionTitle}>{t('candidateDetail.basicData')}</div>

          <div className={styles.editField}>
            <label className={styles.editLabel}>
              {t('candidateDetail.name')} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.editInput}
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              disabled={saving}
            />
          </div>

          <div className={styles.editField}>
            <label className={styles.editLabel}>{t('candidateDetail.email')}</label>
            <input
              type="email"
              className={`${styles.editInput} ${styles.editInputDisabled}`}
              value={formData.email}
              disabled
              title={t('candidateDetail.emailCannotBeChanged')}
            />
            <span className={styles.editHint}>{t('candidateDetail.emailCannotBeChanged')}</span>
          </div>

          <div className={styles.editFieldRow}>
            <div className={styles.editField}>
              <label className={styles.editLabel}>{t('candidateDetail.phone')}</label>
              <input
                type="tel"
                className={styles.editInput}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+34 600 000 000"
                disabled={saving}
              />
            </div>

            <div className={styles.editField}>
              <label className={styles.editLabel}>{t('candidateDetail.linkedin')}</label>
              <input
                type="url"
                className={styles.editInput}
                value={formData.linkedinUrl}
                onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/..."
                disabled={saving}
              />
            </div>
          </div>

          {/* Perfil profesional */}
          <div className={styles.editSectionTitle}>{t('candidateDetail.professionalProfile')}</div>

          <div className={styles.editField}>
            <label className={styles.editLabel}>{t('candidateDetail.summary')}</label>
            <textarea
              className={styles.editTextarea}
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder={t('candidateDetail.summaryPlaceholder')}
              rows={3}
              disabled={saving}
            />
          </div>

          <div className={styles.editField}>
            <label className={styles.editLabel}>{t('candidateDetail.skills')}</label>
            <input
              type="text"
              className={styles.editInput}
              value={formData.skills}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              placeholder={t('candidateDetail.skillsPlaceholder')}
              disabled={saving}
            />
            <span className={styles.editHint}>{t('candidateDetail.skillsHint')}</span>
          </div>

          <div className={styles.editField}>
            <label className={styles.editLabel}>{t('candidateDetail.languages')}</label>
            <input
              type="text"
              className={styles.editInput}
              value={formData.languages}
              onChange={(e) => handleInputChange('languages', e.target.value)}
              placeholder={t('candidateDetail.languagesPlaceholder')}
              disabled={saving}
            />
            <span className={styles.editHint}>{t('candidateDetail.languagesHint')}</span>
          </div>

          {/* Experiencia */}
          <div className={styles.editSectionTitle}>
            {t('candidateDetail.experience')}
            <button
              type="button"
              className={styles.addItemButton}
              onClick={handleAddExperience}
              disabled={saving}
            >
              + {t('candidateDetail.addExperience')}
            </button>
          </div>

          {formData.experience.map((exp) => (
            <div key={exp.id} className={styles.editableItem}>
              <button
                type="button"
                className={styles.removeItemButton}
                onClick={() => handleRemoveExperience(exp.id)}
                disabled={saving}
              >
                &times;
              </button>
              <div className={styles.editableItemFields}>
                <div className={styles.editFieldRow}>
                  <input
                    type="text"
                    className={styles.editInput}
                    value={exp.role}
                    onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                    placeholder={t('candidateDetail.rolePlaceholder')}
                    disabled={saving}
                  />
                  <input
                    type="text"
                    className={styles.editInput}
                    value={exp.company}
                    onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                    placeholder={t('candidateDetail.companyPlaceholder')}
                    disabled={saving}
                  />
                </div>
                <div className={styles.editFieldRow}>
                  <input
                    type="text"
                    className={styles.editInput}
                    value={exp.startDate || ''}
                    onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                    placeholder={t('candidateDetail.startDatePlaceholder')}
                    disabled={saving}
                  />
                  <input
                    type="text"
                    className={styles.editInput}
                    value={exp.endDate || ''}
                    onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                    placeholder={t('candidateDetail.endDatePlaceholder')}
                    disabled={saving}
                  />
                </div>
                <textarea
                  className={styles.editTextarea}
                  value={exp.description || ''}
                  onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                  placeholder={t('candidateDetail.descriptionPlaceholder')}
                  rows={2}
                  disabled={saving}
                />
              </div>
            </div>
          ))}

          {formData.experience.length === 0 && (
            <p className={styles.emptyListHint}>{t('candidateDetail.noExperience')}</p>
          )}

          {/* Formación */}
          <div className={styles.editSectionTitle}>
            {t('candidateDetail.education')}
            <button
              type="button"
              className={styles.addItemButton}
              onClick={handleAddEducation}
              disabled={saving}
            >
              + {t('candidateDetail.addEducation')}
            </button>
          </div>

          {formData.education.map((edu) => (
            <div key={edu.id} className={styles.editableItem}>
              <button
                type="button"
                className={styles.removeItemButton}
                onClick={() => handleRemoveEducation(edu.id)}
                disabled={saving}
              >
                &times;
              </button>
              <div className={styles.editableItemFields}>
                <div className={styles.editFieldRow}>
                  <input
                    type="text"
                    className={styles.editInput}
                    value={edu.degree}
                    onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                    placeholder={t('candidateDetail.degreePlaceholder')}
                    disabled={saving}
                  />
                  <input
                    type="text"
                    className={styles.editInput}
                    value={edu.institution}
                    onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                    placeholder={t('candidateDetail.institutionPlaceholder')}
                    disabled={saving}
                  />
                </div>
                <div className={styles.editFieldRow}>
                  <input
                    type="text"
                    className={styles.editInput}
                    value={edu.field || ''}
                    onChange={(e) => handleUpdateEducation(edu.id, 'field', e.target.value)}
                    placeholder={t('candidateDetail.fieldPlaceholder')}
                    disabled={saving}
                  />
                </div>
                <div className={styles.editFieldRow}>
                  <input
                    type="text"
                    className={styles.editInput}
                    value={edu.startDate || ''}
                    onChange={(e) => handleUpdateEducation(edu.id, 'startDate', e.target.value)}
                    placeholder={t('candidateDetail.startDatePlaceholder')}
                    disabled={saving}
                  />
                  <input
                    type="text"
                    className={styles.editInput}
                    value={edu.endDate || ''}
                    onChange={(e) => handleUpdateEducation(edu.id, 'endDate', e.target.value)}
                    placeholder={t('candidateDetail.endDatePlaceholder')}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          ))}

          {formData.education.length === 0 && (
            <p className={styles.emptyListHint}>{t('candidateDetail.noEducation')}</p>
          )}

          {error && <div className={styles.editError}>{error}</div>}

          <div className={styles.editActions}>
            <button
              type="button"
              className={styles.editCancelButton}
              onClick={handleCancelEdit}
              disabled={saving}
            >
              {t('app.cancel')}
            </button>
            <button
              type="button"
              className={styles.editSaveButton}
              onClick={handleSave}
              disabled={saving || !formData.fullName.trim()}
            >
              {saving ? t('app.saving') : t('app.save')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{t('candidateDetail.profile')}</h2>
        <div className={styles.cardHeaderActions}>
          {candidate && (
            <button
              type="button"
              className={styles.downloadCvButton}
              onClick={handleDownloadCV}
              disabled={downloading}
              title={t('candidateDetail.downloadCv')}
            >
              {downloading ? (
                <span className={styles.spinner} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
              <span>{t('candidateDetail.downloadCv')}</span>
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              className={styles.editButton}
              onClick={handleStartEdit}
              title={t('candidateDetail.editProfile')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className={styles.profileGrid}>
        <div className={styles.profileItem}>
          <span className={styles.profileLabel}>{t('candidateDetail.name')}</span>
          <span className={styles.profileValue}>{candidate?.fullName || '-'}</span>
        </div>
        <div className={styles.profileItem}>
          <span className={styles.profileLabel}>{t('candidateDetail.email')}</span>
          <span className={styles.profileValue}>{candidate?.email || '-'}</span>
        </div>
        <div className={styles.profileItem}>
          <span className={styles.profileLabel}>{t('candidateDetail.phone')}</span>
          <span className={styles.profileValue}>{candidate?.phone || '-'}</span>
        </div>
        {candidate?.linkedinUrl && (
          <div className={styles.profileItem}>
            <span className={styles.profileLabel}>{t('candidateDetail.linkedin')}</span>
            <a
              href={candidate.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.profileValueLink}
            >
              {t('candidateDetail.viewProfile')}
            </a>
          </div>
        )}
      </div>

      {/* Summary */}
      {candidate?.summary && (
        <div className={styles.profileSection}>
          <h3 className={styles.profileSectionTitle}>{t('candidateDetail.summary')}</h3>
          <p className={styles.profileSectionText}>{candidate.summary}</p>
        </div>
      )}

      {/* Skills */}
      {candidate?.skills && candidate.skills.length > 0 && (
        <div className={styles.profileSection}>
          <h3 className={styles.profileSectionTitle}>{t('candidateDetail.skills')}</h3>
          <div className={styles.skillsList}>
            {candidate.skills.map((skill, idx) => (
              <span key={idx} className={styles.skillTag}>{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {candidate?.languages && candidate.languages.length > 0 && (
        <div className={styles.profileSection}>
          <h3 className={styles.profileSectionTitle}>{t('candidateDetail.languages')}</h3>
          <div className={styles.skillsList}>
            {candidate.languages.map((lang, idx) => (
              <span key={idx} className={styles.skillTag}>{lang}</span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {candidate?.experience && candidate.experience.length > 0 && (
        <div className={styles.profileSection}>
          <h3 className={styles.profileSectionTitle}>{t('candidateDetail.experience')}</h3>
          <div className={styles.experienceList}>
            {candidate.experience.map((exp, idx) => (
              <div key={idx} className={styles.experienceItem}>
                <div className={styles.experienceHeader}>
                  <strong>{exp.role}</strong>
                  {exp.company && <span> - {exp.company}</span>}
                </div>
                {(exp.startDate || exp.endDate) && (
                  <div className={styles.experienceDates}>
                    {exp.startDate || '?'} - {exp.endDate || t('candidateDetail.present')}
                  </div>
                )}
                {exp.description && (
                  <p className={styles.experienceDescription}>{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {candidate?.education && candidate.education.length > 0 && (
        <div className={styles.profileSection}>
          <h3 className={styles.profileSectionTitle}>{t('candidateDetail.education')}</h3>
          <div className={styles.experienceList}>
            {candidate.education.map((edu, idx) => (
              <div key={idx} className={styles.experienceItem}>
                <div className={styles.experienceHeader}>
                  <strong>{edu.degree}</strong>
                  {edu.field && <span> - {edu.field}</span>}
                </div>
                {edu.institution && (
                  <div className={styles.experienceInstitution}>{edu.institution}</div>
                )}
                {(edu.startDate || edu.endDate) && (
                  <div className={styles.experienceDates}>
                    {edu.startDate || '?'} - {edu.endDate || t('candidateDetail.present')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const CandidateProfile = memo(CandidateProfileComponent);
