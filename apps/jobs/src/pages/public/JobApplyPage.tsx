import { useEffect, useState, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '../../hooks/reduxHooks';
import {
  getPublicJobOfferById,
  applyToJobOffer,
  parseCV,
  type PublicJobOffer,
  type ParsedCVData,
} from '../../features/publicJobs/services/publicJobsApi';
import { candidateApplicationSchema, type CandidateApplicationFormData } from '../../lib/validations/candidate.schema';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import { AppFooter } from '../../components/footer/AppFooter';
import styles from './JobApplyPage.module.css';

type Step = 'upload' | 'review';

// Tipos para datos editables
interface EditableExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
}

interface EditableEducation {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export default function JobApplyPage() {
  const { t } = useTranslation('common');
  const { jobId, orgSlug } = useParams<{ jobId: string; orgSlug?: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isLoggedIn, user, isAuthLoading } = useAppSelector((state) => state.auth);

  // Determinar si estamos en modo organización basándose en la URL
  const isOrgMode = !!orgSlug;

  const [job, setJob] = useState<PublicJobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Solo candidatos y usuarios no autenticados pueden aplicar
  // Recruiters, org_admin, org_recruiter no pueden aplicar
  const isRecruiterRole = user?.role && ['recruiter', 'org_admin', 'org_recruiter'].includes(user.role);

  // Redirigir a recruiters a la página de detalle de la oferta
  if (!isAuthLoading && isLoggedIn && isRecruiterRole) {
    const detailUrl = isOrgMode ? `/org/${orgSlug}/jobs/${jobId}` : `/jobs/${jobId}`;
    return <Navigate to={detailUrl} replace />;
  }

  // Two-step flow state
  const [step, setStep] = useState<Step>('upload');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCVData | null>(null);

  // Editable extracted data
  const [editableSummary, setEditableSummary] = useState('');
  const [editableSkills, setEditableSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [editableExperience, setEditableExperience] = useState<EditableExperience[]>([]);
  const [editableEducation, setEditableEducation] = useState<EditableEducation[]>([]);
  const [editableLanguages, setEditableLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors: formErrors },
    reset,
  } = useForm<CandidateApplicationFormData>({
    resolver: zodResolver(candidateApplicationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;

      setLoading(true);
      try {
        const data = await getPublicJobOfferById(jobId);
        setJob(data);
      } catch {
        setError(t('public.jobApply.notAvailable'));
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId, t]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !jobId) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      setParseError(t('public.jobApply.invalidFileType'));
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setParseError(t('public.jobApply.fileTooLarge'));
      return;
    }

    setCvFile(file);
    setParsing(true);
    setParseError(null);

    try {
      const data = await parseCV(jobId, file);
      setParsedData(data);

      // Pre-fill form with parsed data
      setValue('firstName', data.firstName || '', { shouldValidate: false });
      setValue('lastName', data.lastName || '', { shouldValidate: false });
      setValue('email', data.email || '', { shouldValidate: false });
      setValue('phone', data.phone || '', { shouldValidate: false });
      setValue('cv', file, { shouldValidate: true });

      // Initialize editable data from parsed CV
      setEditableSummary(data.summary || '');
      setEditableSkills(data.skills || []);
      setEditableExperience(
        (data.experience || []).map((exp, idx) => ({
          id: `exp-${idx}`,
          company: exp.company || '',
          role: exp.role || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
        }))
      );
      setEditableEducation(
        (data.education || []).map((edu, idx) => ({
          id: `edu-${idx}`,
          institution: edu.institution || '',
          degree: edu.degree || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
        }))
      );
      setEditableLanguages(data.languages || []);

      setStep('review');
    } catch (err) {
      setParseError(getErrorMessage(err) || t('public.jobApply.parseError'));
      setCvFile(null);
    } finally {
      setParsing(false);
    }
  };

  const handleGoBack = () => {
    setStep('upload');
    setCvFile(null);
    setParsedData(null);
    setParseError(null);
    setEditableSummary('');
    setEditableSkills([]);
    setNewSkill('');
    setEditableExperience([]);
    setEditableEducation([]);
    setEditableLanguages([]);
    setNewLanguage('');
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handlers for editable skills
  const handleAddSkill = () => {
    if (newSkill.trim() && !editableSkills.includes(newSkill.trim())) {
      setEditableSkills([...editableSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditableSkills(editableSkills.filter(s => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  // Handlers for editable languages
  const handleAddLanguage = () => {
    if (newLanguage.trim() && !editableLanguages.includes(newLanguage.trim())) {
      setEditableLanguages([...editableLanguages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    setEditableLanguages(editableLanguages.filter(l => l !== langToRemove));
  };

  const handleLanguageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLanguage();
    }
  };

  // Handlers for editable experience
  const handleUpdateExperience = (id: string, field: keyof EditableExperience, value: string) => {
    setEditableExperience(editableExperience.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handleRemoveExperience = (id: string) => {
    setEditableExperience(editableExperience.filter(exp => exp.id !== id));
  };

  const handleAddExperience = () => {
    setEditableExperience([
      ...editableExperience,
      { id: `exp-${Date.now()}`, company: '', role: '', startDate: '', endDate: '' }
    ]);
  };

  // Handlers for editable education
  const handleUpdateEducation = (id: string, field: keyof EditableEducation, value: string) => {
    setEditableEducation(editableEducation.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const handleRemoveEducation = (id: string) => {
    setEditableEducation(editableEducation.filter(edu => edu.id !== id));
  };

  const handleAddEducation = () => {
    setEditableEducation([
      ...editableEducation,
      { id: `edu-${Date.now()}`, institution: '', degree: '', startDate: '', endDate: '' }
    ]);
  };

  const onSubmit = async (data: CandidateApplicationFormData) => {
    if (!jobId) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await applyToJobOffer(jobId, {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || undefined,
        cv: data.cv,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(getErrorMessage(err) || t('public.jobApply.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmation screen
  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.confirmationContainer}>
          <div className={styles.confirmationCard}>
            <div className={styles.confirmationIcon}>✓</div>
            <h1 className={styles.confirmationTitle}>{t('public.jobApply.thanks')}</h1>
            <p className={styles.confirmationText}>
              {t('public.jobApply.confirmationSent')}
            </p>
            <p className={styles.confirmationText}>
              {t('public.jobApply.willNotify')}
            </p>
            <Link to={isOrgMode ? `/org/${orgSlug}/jobs` : '/jobs'} className={styles.backToJobsLink}>
              {t('public.jobApply.viewMoreOffers')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <p>{t('public.jobApply.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <h2>{t('public.jobApply.notFound')}</h2>
            <p>{error || t('public.jobApply.loadError')}</p>
            <Link to={isOrgMode ? `/org/${orgSlug}/jobs` : '/jobs'} className={styles.backLink}>
              ← {t('public.jobDetail.backToOffers')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to={isOrgMode ? `/org/${orgSlug}/jobs/${jobId}` : `/jobs/${jobId}`} className={styles.backLink}>
            ← {t('public.jobApply.backToOffer')}
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className={styles.content}>
        <div className={styles.container}>
          <div className={styles.formCard}>
            <h1 className={styles.formTitle}>{t('public.jobApply.applyTo', { title: job.title })}</h1>
            <p className={styles.formSubtitle}>{job.displayName}</p>

            {step === 'upload' ? (
              /* Step 1: Upload CV */
              <div className={styles.uploadStep}>
                <div className={styles.uploadPrompt}>
                  <p className={styles.uploadDescription}>
                    {t('public.jobApply.uploadDescription')}
                  </p>
                  <p className={styles.cvWarning}>
                    {t('public.jobApply.cvParsingWarning')}
                  </p>
                </div>

                <div
                  className={`${styles.fileUploadLarge} ${parseError ? styles.fileUploadError : ''} ${parsing ? styles.fileUploadParsing : ''}`}
                  onClick={() => !parsing && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className={styles.fileInput}
                    accept=".pdf,.docx"
                    onChange={handleFileSelect}
                    disabled={parsing}
                  />
                  {parsing ? (
                    <div className={styles.parsingState}>
                      <div className={styles.loadingSpinner} />
                      <p>{t('public.jobApply.parsing')}</p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.uploadIcon}>📄</div>
                      <p className={styles.uploadText}>{t('public.jobApply.uploadCTA')}</p>
                      <p className={styles.uploadHint}>{t('public.jobApply.cvFormats')}</p>
                    </>
                  )}
                </div>

                {parseError && (
                  <div className={styles.errorText}>{parseError}</div>
                )}

                <div className={styles.registerPrompt}>
                  <p className={styles.noAccountText}>
                    {t('public.jobApply.noAccountNeeded')}
                  </p>
                  <Link to="/register-candidate" className={styles.registerLink}>
                    {t('public.jobApply.registerNow')}
                  </Link>
                </div>
              </div>
            ) : (
              /* Step 2: Review and Submit */
              <div className={styles.reviewStep}>
                <div className={styles.reviewHeader}>
                  <button
                    type="button"
                    className={styles.changeFileButton}
                    onClick={handleGoBack}
                  >
                    ← {t('public.jobApply.changeFile')}
                  </button>
                  <div className={styles.selectedFileInfo}>
                    <span className={styles.fileIcon}>📄</span>
                    <span className={styles.fileName}>{cvFile?.name}</span>
                  </div>
                </div>

                <p className={styles.reviewDescription}>
                  {t('public.jobApply.reviewDescription')}
                </p>

                <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        {t('public.jobApply.firstName')} <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        {...register('firstName')}
                        className={`${styles.input} ${formErrors.firstName ? styles.inputError : ''}`}
                        placeholder={t('public.jobApply.firstNamePlaceholder')}
                      />
                      {formErrors.firstName && (
                        <span className={styles.errorText}>{formErrors.firstName.message}</span>
                      )}
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>
                        {t('public.jobApply.lastName')} <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        {...register('lastName')}
                        className={`${styles.input} ${formErrors.lastName ? styles.inputError : ''}`}
                        placeholder={t('public.jobApply.lastNamePlaceholder')}
                      />
                      {formErrors.lastName && (
                        <span className={styles.errorText}>{formErrors.lastName.message}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      {t('public.jobApply.email')} <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
                      placeholder={t('public.jobApply.emailPlaceholder')}
                    />
                    {formErrors.email && (
                      <span className={styles.errorText}>{formErrors.email.message}</span>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>{t('public.jobApply.phone')}</label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className={styles.input}
                      placeholder={t('public.jobApply.phonePlaceholder')}
                    />
                    {formErrors.phone && (
                      <span className={styles.errorText}>{formErrors.phone.message}</span>
                    )}
                  </div>

                  {/* Editable extracted data */}
                  {parsedData && (
                    <div className={styles.parsedDataPreview}>
                      <h3 className={styles.parsedDataTitle}>{t('public.jobApply.extractedData')}</h3>
                      <p className={styles.editableHint}>{t('public.jobApply.editableHint')}</p>

                      {/* Editable Summary */}
                      <div className={styles.parsedSection}>
                        <h4 className={styles.parsedSectionTitle}>{t('public.jobApply.summary')}</h4>
                        <textarea
                          className={styles.editableTextarea}
                          value={editableSummary}
                          onChange={(e) => setEditableSummary(e.target.value)}
                          placeholder={t('public.jobApply.summaryPlaceholder')}
                          rows={3}
                        />
                      </div>

                      {/* Editable Skills */}
                      <div className={styles.parsedSection}>
                        <h4 className={styles.parsedSectionTitle}>{t('public.jobApply.skills')}</h4>
                        <div className={styles.editableTagsContainer}>
                          {editableSkills.map((skill, idx) => (
                            <span key={idx} className={styles.editableTag}>
                              {skill}
                              <button
                                type="button"
                                className={styles.removeTagButton}
                                onClick={() => handleRemoveSkill(skill)}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <div className={styles.addTagInput}>
                            <input
                              type="text"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              onKeyDown={handleSkillKeyDown}
                              placeholder={t('public.jobApply.addSkillPlaceholder')}
                              className={styles.tagInput}
                            />
                            <button
                              type="button"
                              onClick={handleAddSkill}
                              className={styles.addTagButton}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Editable Experience */}
                      <div className={styles.parsedSection}>
                        <h4 className={styles.parsedSectionTitle}>{t('public.jobApply.experience')}</h4>
                        <div className={styles.editableList}>
                          {editableExperience.map((exp) => (
                            <div key={exp.id} className={styles.editableItem}>
                              <button
                                type="button"
                                className={styles.removeItemButton}
                                onClick={() => handleRemoveExperience(exp.id)}
                              >
                                ×
                              </button>
                              <div className={styles.editableItemFields}>
                                <input
                                  type="text"
                                  value={exp.role}
                                  onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                                  placeholder={t('public.jobApply.rolePlaceholder')}
                                  className={styles.editableInput}
                                />
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                                  placeholder={t('public.jobApply.companyPlaceholder')}
                                  className={styles.editableInput}
                                />
                                <div className={styles.dateRow}>
                                  <input
                                    type="text"
                                    value={exp.startDate}
                                    onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                                    placeholder={t('public.jobApply.startDatePlaceholder')}
                                    className={styles.editableDateInput}
                                  />
                                  <span className={styles.dateSeparator}>-</span>
                                  <input
                                    type="text"
                                    value={exp.endDate}
                                    onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                                    placeholder={t('public.jobApply.endDatePlaceholder')}
                                    className={styles.editableDateInput}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={handleAddExperience}
                            className={styles.addItemButton}
                          >
                            + {t('public.jobApply.addExperience')}
                          </button>
                        </div>
                      </div>

                      {/* Editable Education */}
                      <div className={styles.parsedSection}>
                        <h4 className={styles.parsedSectionTitle}>{t('public.jobApply.education')}</h4>
                        <div className={styles.editableList}>
                          {editableEducation.map((edu) => (
                            <div key={edu.id} className={styles.editableItem}>
                              <button
                                type="button"
                                className={styles.removeItemButton}
                                onClick={() => handleRemoveEducation(edu.id)}
                              >
                                ×
                              </button>
                              <div className={styles.editableItemFields}>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                                  placeholder={t('public.jobApply.degreePlaceholder')}
                                  className={styles.editableInput}
                                />
                                <input
                                  type="text"
                                  value={edu.institution}
                                  onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                                  placeholder={t('public.jobApply.institutionPlaceholder')}
                                  className={styles.editableInput}
                                />
                                <div className={styles.dateRow}>
                                  <input
                                    type="text"
                                    value={edu.startDate}
                                    onChange={(e) => handleUpdateEducation(edu.id, 'startDate', e.target.value)}
                                    placeholder={t('public.jobApply.startDatePlaceholder')}
                                    className={styles.editableDateInput}
                                  />
                                  <span className={styles.dateSeparator}>-</span>
                                  <input
                                    type="text"
                                    value={edu.endDate}
                                    onChange={(e) => handleUpdateEducation(edu.id, 'endDate', e.target.value)}
                                    placeholder={t('public.jobApply.endDatePlaceholder')}
                                    className={styles.editableDateInput}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={handleAddEducation}
                            className={styles.addItemButton}
                          >
                            + {t('public.jobApply.addEducation')}
                          </button>
                        </div>
                      </div>

                      {/* Editable Languages */}
                      <div className={styles.parsedSection}>
                        <h4 className={styles.parsedSectionTitle}>{t('public.jobApply.languages')}</h4>
                        <div className={styles.editableTagsContainer}>
                          {editableLanguages.map((lang, idx) => (
                            <span key={idx} className={styles.editableTag}>
                              {lang}
                              <button
                                type="button"
                                className={styles.removeTagButton}
                                onClick={() => handleRemoveLanguage(lang)}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <div className={styles.addTagInput}>
                            <input
                              type="text"
                              value={newLanguage}
                              onChange={(e) => setNewLanguage(e.target.value)}
                              onKeyDown={handleLanguageKeyDown}
                              placeholder={t('public.jobApply.addLanguagePlaceholder')}
                              className={styles.tagInput}
                            />
                            <button
                              type="button"
                              onClick={handleAddLanguage}
                              className={styles.addTagButton}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {submitError && (
                    <div className={styles.errorText} style={{ marginBottom: '1rem' }}>
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={submitting}
                  >
                    {submitting ? t('public.jobApply.submitting') : t('public.jobApply.submit')}
                  </button>

                  <div className={styles.registerPrompt}>
                    <p className={styles.noAccountText}>
                      {t('public.jobApply.noAccountNeeded')}
                    </p>
                    <Link to="/register-candidate" className={styles.registerLink}>
                      {t('public.jobApply.registerNow')}
                    </Link>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <AppFooter />
    </div>
  );
}
