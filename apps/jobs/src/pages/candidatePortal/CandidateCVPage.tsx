import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getCandidateProfile,
  updateCandidateProfile,
  uploadCV,
  type CandidateProfile,
  type ExperienceItem,
  type EducationItem,
} from '../../features/candidatePortal/services/candidatePortalApi';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import { Button } from '../../components/ui';
import styles from './CandidateCVPage.module.css';

type ToastType = 'success' | 'error' | null;

export default function CandidateCVPage() {
  const { t } = useTranslation('common');
  const [, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingCV, setUploadingCV] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{ message: string; type: ToastType }>({ message: '', type: null });

  // Form state
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState('');
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCandidateProfile();
        setProfile(data);
        setSummary(data.summary || '');
        setSkills(data.skills || []);
        setLanguages(data.languages || []);
        setExperience(data.experience || []);
        setEducation(data.education || []);
      } catch (err) {
        setError(getErrorMessage(err) || t('candidatePortal.cv.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [t]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      showToast(t('candidatePortal.cv.onlyPdfDocx'), 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast(t('candidatePortal.cv.maxFileSize'), 'error');
      return;
    }

    setUploadingCV(true);
    try {
      const updated = await uploadCV(file);
      setProfile(updated);
      setSummary(updated.summary || '');
      setSkills(updated.skills || []);
      setLanguages(updated.languages || []);
      setExperience(updated.experience || []);
      setEducation(updated.education || []);
      showToast(t('candidatePortal.cv.cvUploaded'), 'success');
    } catch (err) {
      showToast(getErrorMessage(err) || t('app.error'), 'error');
    } finally {
      setUploadingCV(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateCandidateProfile({
        summary,
        skills,
        languages,
        experience,
        education,
      });
      setProfile(updated);
      showToast(t('candidatePortal.cv.saved'), 'success');
    } catch (err) {
      showToast(getErrorMessage(err) || t('app.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Skills handlers
  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Languages handlers
  const handleAddLanguage = () => {
    const trimmed = newLanguage.trim();
    if (trimmed && !languages.includes(trimmed)) {
      setLanguages([...languages, trimmed]);
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const handleLanguageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLanguage();
    }
  };

  // Experience handlers
  const handleAddExperience = () => {
    setExperience([...experience, { company: '', role: '', startDate: '', endDate: '', description: '' }]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index: number, field: keyof ExperienceItem, value: string) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  // Education handlers
  const handleAddEducation = () => {
    setEducation([...education, { institution: '', degree: '', field: '', startDate: '', endDate: '' }]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index: number, field: keyof EducationItem, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
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

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('candidatePortal.cv.title')}</h1>
      </header>

      <main className={styles.content}>
        {/* Upload CV Section */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>{t('candidatePortal.cv.uploadSection')}</h2>
          <p className={styles.sectionDesc}>{t('candidatePortal.cv.uploadDesc')}</p>

          {/* Aviso sobre snapshots */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#856404',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              {t('candidatePortal.cv.snapshotWarning', 'Si subes un nuevo CV o actualizas tu información, estos cambios NO afectarán a los procesos de selección que ya tengas en marcha. Cada proceso mantiene tu información del momento en que aplicaste.')}
            </span>
          </div>

          <div className={styles.uploadSection}>
            <input
              ref={fileInputRef}
              type="file"
              className={styles.fileInput}
              accept=".pdf,.docx"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              className={styles.uploadButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCV}
            >
              {uploadingCV ? t('app.uploading') : t('candidatePortal.cv.uploadNewCv')}
            </button>
            <span className={styles.uploadHint}>{t('candidatePortal.cv.cvFormats')}</span>
          </div>
        </div>

        {/* Summary Section */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>{t('candidatePortal.cv.summaryTitle')}</h2>
          <textarea
            className={styles.textarea}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder={t('candidatePortal.cv.summaryPlaceholder')}
            rows={4}
          />
        </div>

        {/* Skills Section */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>{t('candidatePortal.cv.skillsTitle')}</h2>
          <div className={styles.skillsContainer}>
            {skills.map((skill, index) => (
              <span key={index} className={styles.skillTag}>
                {skill}
                <button
                  type="button"
                  className={styles.removeSkill}
                  onClick={() => handleRemoveSkill(index)}
                  aria-label={t('app.delete')}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className={styles.addSkillRow}>
            <input
              type="text"
              className={styles.input}
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder={t('candidatePortal.cv.skillPlaceholder')}
            />
            <button
              type="button"
              className={styles.addButton}
              onClick={handleAddSkill}
              disabled={!newSkill.trim()}
            >
              {t('candidatePortal.cv.addSkill')}
            </button>
          </div>
        </div>

        {/* Languages Section */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>{t('candidatePortal.cv.languagesTitle')}</h2>
          <div className={styles.skillsContainer}>
            {languages.map((language, index) => (
              <span key={index} className={styles.skillTag}>
                {language}
                <button
                  type="button"
                  className={styles.removeSkill}
                  onClick={() => handleRemoveLanguage(index)}
                  aria-label={t('app.delete')}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className={styles.addSkillRow}>
            <input
              type="text"
              className={styles.input}
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyDown={handleLanguageKeyDown}
              placeholder={t('candidatePortal.cv.languagePlaceholder')}
            />
            <button
              type="button"
              className={styles.addButton}
              onClick={handleAddLanguage}
              disabled={!newLanguage.trim()}
            >
              {t('candidatePortal.cv.addLanguage')}
            </button>
          </div>
        </div>

        {/* Experience Section */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('candidatePortal.cv.experienceTitle')}</h2>
            <button
              type="button"
              className={styles.addButton}
              onClick={handleAddExperience}
            >
              + {t('candidatePortal.cv.addExperience')}
            </button>
          </div>

          {experience.length === 0 ? (
            <p className={styles.emptyText}>{t('candidatePortal.cv.noExperience')}</p>
          ) : (
            <div className={styles.itemsList}>
              {experience.map((exp, index) => (
                <div key={index} className={styles.itemCard}>
                  <button
                    type="button"
                    className={styles.removeItem}
                    onClick={() => handleRemoveExperience(index)}
                    aria-label={t('app.delete')}
                  >
                    &times;
                  </button>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>{t('candidatePortal.cv.company')}</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                        placeholder={t('candidatePortal.cv.companyPlaceholder')}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>{t('candidatePortal.cv.role')}</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={exp.role}
                        onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                        placeholder={t('candidatePortal.cv.rolePlaceholder')}
                      />
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>{t('candidatePortal.cv.startDate')}</label>
                      <input
                        type="month"
                        className={styles.input}
                        value={exp.startDate || ''}
                        onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>{t('candidatePortal.cv.endDate')}</label>
                      <input
                        type="month"
                        className={styles.input}
                        value={exp.endDate || ''}
                        onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                        placeholder={t('candidatePortal.cv.present')}
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{t('candidatePortal.cv.description')}</label>
                    <textarea
                      className={styles.textarea}
                      value={exp.description || ''}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      placeholder={t('candidatePortal.cv.descriptionPlaceholder')}
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education Section */}
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('candidatePortal.cv.educationTitle')}</h2>
            <button
              type="button"
              className={styles.addButton}
              onClick={handleAddEducation}
            >
              + {t('candidatePortal.cv.addEducation')}
            </button>
          </div>

          {education.length === 0 ? (
            <p className={styles.emptyText}>{t('candidatePortal.cv.noEducation')}</p>
          ) : (
            <div className={styles.itemsList}>
              {education.map((edu, index) => (
                <div key={index} className={styles.itemCard}>
                  <button
                    type="button"
                    className={styles.removeItem}
                    onClick={() => handleRemoveEducation(index)}
                    aria-label={t('app.delete')}
                  >
                    &times;
                  </button>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>{t('candidatePortal.cv.institution')}</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        placeholder={t('candidatePortal.cv.institutionPlaceholder')}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>{t('candidatePortal.cv.degree')}</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        placeholder={t('candidatePortal.cv.degreePlaceholder')}
                      />
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>{t('candidatePortal.cv.fieldOfStudy')}</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={edu.field || ''}
                        onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                        placeholder={t('candidatePortal.cv.fieldPlaceholder')}
                      />
                    </div>
                  </div>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>{t('candidatePortal.cv.startDate')}</label>
                      <input
                        type="month"
                        className={styles.input}
                        value={edu.startDate || ''}
                        onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>{t('candidatePortal.cv.endDate')}</label>
                      <input
                        type="month"
                        className={styles.input}
                        value={edu.endDate || ''}
                        onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className={styles.saveSection}>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            fullWidth
          >
            {t('app.save')}
          </Button>
        </div>
      </main>

      {toast.type && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
