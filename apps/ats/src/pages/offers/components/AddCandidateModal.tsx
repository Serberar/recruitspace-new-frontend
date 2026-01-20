/**
 * AddCandidateModal - Modal para añadir candidatos manualmente o via CV
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/hooks/useErrorHandler';
import { parseCandidateCV, type ParsedCVData } from '@/services/candidatesApi';
import styles from './AddCandidateModal.module.css';

// Schema de validación alineado con el backend
const addCandidateSchema = z.object({
  // Datos básicos
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio')
    .email('El email no es válido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  fullName: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  phone: z
    .string()
    .trim()
    .max(30, 'El teléfono no puede exceder 30 caracteres')
    .refine(
      (val) => !val || /^[0-9+\-\s]+$/.test(val),
      'El teléfono no es válido'
    )
    .optional()
    .or(z.literal('')),
  linkedinUrl: z
    .string()
    .trim()
    .max(200, 'La URL no puede exceder 200 caracteres')
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      'La URL de LinkedIn no es válida'
    )
    .optional()
    .or(z.literal('')),
  // Perfil profesional
  summary: z
    .string()
    .trim()
    .max(2000, 'El resumen no puede exceder 2000 caracteres')
    .optional()
    .or(z.literal('')),
  skills: z
    .string()
    .trim()
    .max(1000, 'Las habilidades no pueden exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  experience: z
    .string()
    .trim()
    .max(3000, 'La experiencia no puede exceder 3000 caracteres')
    .optional()
    .or(z.literal('')),
  education: z
    .string()
    .trim()
    .max(2000, 'La formación no puede exceder 2000 caracteres')
    .optional()
    .or(z.literal('')),
  // Notas internas
  notes: z
    .string()
    .trim()
    .max(5000, 'Las notas no pueden exceder 5000 caracteres')
    .optional()
    .or(z.literal('')),
});

type AddCandidateFormData = z.infer<typeof addCandidateSchema>;

export interface AddCandidateData {
  email: string;
  fullName: string;
  phone?: string;
  linkedinUrl?: string;
  summary?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  notes?: string;
  cvFile?: File;
}

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddCandidateData) => Promise<void>;
  isLoading?: boolean;
  offerTitle?: string;
}

type InputMode = 'select' | 'manual' | 'cv';

export function AddCandidateModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  offerTitle,
}: AddCandidateModalProps) {
  const { t } = useTranslation('common');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [_parsedData, setParsedData] = useState<ParsedCVData | null>(null);
  const [_isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors: formErrors },
  } = useForm<AddCandidateFormData>({
    resolver: zodResolver(addCandidateSchema),
    defaultValues: {
      email: '',
      fullName: '',
      phone: '',
      linkedinUrl: '',
      summary: '',
      skills: '',
      experience: '',
      education: '',
      notes: '',
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset();
      setSubmitError(null);
      setInputMode('select');
      setSelectedFile(null);
    }
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: AddCandidateFormData) => {
    try {
      setSubmitError(null);
      // Convertir skills de string a array (separado por comas)
      const skillsArray = data.skills?.trim()
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;

      await onSubmit({
        email: data.email.trim().toLowerCase(),
        fullName: data.fullName.trim(),
        phone: data.phone?.trim() || undefined,
        linkedinUrl: data.linkedinUrl?.trim() || undefined,
        summary: data.summary?.trim() || undefined,
        skills: skillsArray,
        experience: data.experience?.trim() || undefined,
        education: data.education?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        cvFile: selectedFile || undefined,
      });
      reset();
      setSelectedFile(null);
    } catch (err) {
      setSubmitError(getErrorMessage(err) || t('toast.error'));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setSubmitError(null);
      setInputMode('select');
      setSelectedFile(null);
      onClose();
    }
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!allowedTypes.includes(file.type)) {
      setSubmitError(t('addCandidate.invalidFileType'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setSubmitError(t('addCandidate.fileTooLarge'));
      return;
    }

    setSelectedFile(file);
    setSubmitError(null);
    setIsParsing(true);

    try {
      // Parsear CV automáticamente
      const data = await parseCandidateCV(file);
      setParsedData(data);

      // Pre-llenar formulario con datos parseados
      setValue('fullName', data.fullName || '');
      setValue('email', data.email || '');
      setValue('phone', data.phone || '');
      setValue('linkedinUrl', data.linkedinUrl || '');
      setValue('summary', data.summary || '');
      setValue('skills', data.skills?.join(', ') || '');

      // Convertir experience array a string
      const experienceText = data.experience?.map(exp => {
        const parts = [];
        if (exp.position) parts.push(exp.position);
        if (exp.company) parts.push(`at ${exp.company}`);
        if (exp.description) parts.push(`- ${exp.description}`);
        return parts.join(' ');
      }).join('\n\n') || '';
      setValue('experience', experienceText);

      // Convertir education array a string
      const educationText = data.education?.map(edu => {
        const parts = [];
        if (edu.degree) parts.push(edu.degree);
        if (edu.field) parts.push(`in ${edu.field}`);
        if (edu.institution) parts.push(`- ${edu.institution}`);
        return parts.join(' ');
      }).join('\n\n') || '';
      setValue('education', educationText);

      // Cambiar al modo manual para que el usuario pueda revisar/editar
      setInputMode('manual');
    } catch (error) {
      console.error('Error parsing CV:', error);
      setSubmitError(t('addCandidate.parseError') || 'Error al parsear el CV. Por favor, complete los datos manualmente.');
      // Aún así cambiar a modo manual para que puedan llenar manualmente
      setInputMode('manual');
    } finally {
      setIsParsing(false);
    }
  }, [t, setValue]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Pantalla de selección de modo
  if (inputMode === 'select') {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={t('addCandidate.title')}
        size="md"
        closeOnOverlayClick={!isLoading}
        closeOnEscape={!isLoading}
      >
        <div className={styles.modeSelection}>
          {offerTitle && (
            <p className={styles.offerInfo}>
              {t('addCandidate.forOffer')}: <strong>{offerTitle}</strong>
            </p>
          )}

          <p className={styles.modeQuestion}>{t('addCandidate.selectMode')}</p>

          <div className={styles.modeOptions}>
            <button
              type="button"
              className={styles.modeOption}
              onClick={() => setInputMode('cv')}
            >
              <div className={styles.modeIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className={styles.modeText}>
                <strong>{t('addCandidate.modeCV')}</strong>
                <span>{t('addCandidate.modeCVDesc')}</span>
              </div>
            </button>

            <button
              type="button"
              className={styles.modeOption}
              onClick={() => setInputMode('manual')}
            >
              <div className={styles.modeIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <div className={styles.modeText}>
                <strong>{t('addCandidate.modeManual')}</strong>
                <span>{t('addCandidate.modeManualDesc')}</span>
              </div>
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // Pantalla de subida de CV
  if (inputMode === 'cv' && !selectedFile) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={t('addCandidate.uploadCV')}
        size="md"
        closeOnOverlayClick={!isLoading}
        closeOnEscape={!isLoading}
      >
        <div className={styles.cvUpload}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => setInputMode('select')}
          >
            ← {t('app.back')}
          </button>

          <div
            className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className={styles.dropZoneText}>{t('addCandidate.dropZoneText')}</p>
            <p className={styles.dropZoneHint}>{t('addCandidate.dropZoneHint')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileInputChange}
              className={styles.fileInput}
            />
          </div>

          <p className={styles.cvWarning}>{t('addCandidate.cvParsingWarning')}</p>

          {submitError && <div className={styles.error}>{submitError}</div>}
        </div>
      </Modal>
    );
  }

  // Formulario (manual o después de seleccionar CV)
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={inputMode === 'cv' ? t('addCandidate.completeData') : t('addCandidate.title')}
      size="md"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => {
            if (inputMode === 'cv') {
              setSelectedFile(null);
            } else {
              setInputMode('select');
            }
          }}
          disabled={isLoading}
        >
          ← {t('app.back')}
        </button>

        {offerTitle && (
          <p className={styles.offerInfo}>
            {t('addCandidate.forOffer')}: <strong>{offerTitle}</strong>
          </p>
        )}

        {selectedFile && (
          <div className={styles.selectedFile}>
            <div className={styles.fileInfo}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>{selectedFile.name}</span>
            </div>
            <button
              type="button"
              className={styles.removeFileButton}
              onClick={handleRemoveFile}
              disabled={isLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        <p className={styles.formHint}>
          {selectedFile
            ? t('addCandidate.cvHint')
            : t('addCandidate.manualHint')
          }
        </p>

        <div className={styles.field}>
          <label htmlFor="candidateEmail" className={styles.label}>
            {t('addCandidate.email')} <span className={styles.required}>*</span>
          </label>
          <input
            id="candidateEmail"
            type="email"
            {...register('email')}
            className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
            placeholder="candidato@email.com"
            disabled={isLoading}
            autoFocus
          />
          {formErrors.email && (
            <span className={styles.errorText}>{formErrors.email.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="candidateFullName" className={styles.label}>
            {t('addCandidate.fullName')} <span className={styles.required}>*</span>
          </label>
          <input
            id="candidateFullName"
            type="text"
            {...register('fullName')}
            className={`${styles.input} ${formErrors.fullName ? styles.inputError : ''}`}
            placeholder={t('addCandidate.fullNamePlaceholder')}
            disabled={isLoading}
          />
          {formErrors.fullName && (
            <span className={styles.errorText}>{formErrors.fullName.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="candidatePhone" className={styles.label}>
            {t('addCandidate.phone')}
          </label>
          <input
            id="candidatePhone"
            type="tel"
            {...register('phone')}
            className={`${styles.input} ${formErrors.phone ? styles.inputError : ''}`}
            placeholder="+34 600 000 000"
            disabled={isLoading}
          />
          {formErrors.phone && (
            <span className={styles.errorText}>{formErrors.phone.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="candidateLinkedin" className={styles.label}>
            {t('addCandidate.linkedin')}
          </label>
          <input
            id="candidateLinkedin"
            type="url"
            {...register('linkedinUrl')}
            className={`${styles.input} ${formErrors.linkedinUrl ? styles.inputError : ''}`}
            placeholder="https://linkedin.com/in/..."
            disabled={isLoading}
          />
          {formErrors.linkedinUrl && (
            <span className={styles.errorText}>{formErrors.linkedinUrl.message}</span>
          )}
        </div>

        {/* Sección de perfil profesional */}
        <div className={styles.sectionDivider}>
          <span>{t('addCandidate.professionalProfile')}</span>
        </div>

        <div className={styles.field}>
          <label htmlFor="candidateSummary" className={styles.label}>
            {t('addCandidate.summary')}
          </label>
          <textarea
            id="candidateSummary"
            {...register('summary')}
            className={`${styles.textarea} ${formErrors.summary ? styles.inputError : ''}`}
            placeholder={t('addCandidate.summaryPlaceholder')}
            disabled={isLoading}
            rows={2}
          />
          {formErrors.summary && (
            <span className={styles.errorText}>{formErrors.summary.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="candidateSkills" className={styles.label}>
            {t('addCandidate.skills')}
          </label>
          <input
            id="candidateSkills"
            type="text"
            {...register('skills')}
            className={`${styles.input} ${formErrors.skills ? styles.inputError : ''}`}
            placeholder={t('addCandidate.skillsPlaceholder')}
            disabled={isLoading}
          />
          {formErrors.skills && (
            <span className={styles.errorText}>{formErrors.skills.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="candidateExperience" className={styles.label}>
            {t('addCandidate.experience')}
          </label>
          <textarea
            id="candidateExperience"
            {...register('experience')}
            className={`${styles.textarea} ${formErrors.experience ? styles.inputError : ''}`}
            placeholder={t('addCandidate.experiencePlaceholder')}
            disabled={isLoading}
            rows={3}
          />
          {formErrors.experience && (
            <span className={styles.errorText}>{formErrors.experience.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="candidateEducation" className={styles.label}>
            {t('addCandidate.education')}
          </label>
          <textarea
            id="candidateEducation"
            {...register('education')}
            className={`${styles.textarea} ${formErrors.education ? styles.inputError : ''}`}
            placeholder={t('addCandidate.educationPlaceholder')}
            disabled={isLoading}
            rows={2}
          />
          {formErrors.education && (
            <span className={styles.errorText}>{formErrors.education.message}</span>
          )}
        </div>

        {/* Notas internas */}
        <div className={styles.sectionDivider}>
          <span>{t('addCandidate.internalNotes')}</span>
        </div>

        <div className={styles.field}>
          <label htmlFor="candidateNotes" className={styles.label}>
            {t('addCandidate.notes')}
          </label>
          <textarea
            id="candidateNotes"
            {...register('notes')}
            className={`${styles.textarea} ${formErrors.notes ? styles.inputError : ''}`}
            placeholder={t('addCandidate.notesPlaceholder')}
            disabled={isLoading}
            rows={3}
          />
          {formErrors.notes && (
            <span className={styles.errorText}>{formErrors.notes.message}</span>
          )}
        </div>

        {submitError && <div className={styles.error}>{submitError}</div>}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('app.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            {t('addCandidate.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddCandidateModal;
