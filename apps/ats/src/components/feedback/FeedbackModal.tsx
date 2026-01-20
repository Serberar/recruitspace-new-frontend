import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { feedbackApi, type FeedbackType, getBrowserInfo } from '../../services/feedbackApi';
import { useToast } from '../ui/Toast';
import styles from './FeedbackModal.module.css';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { t } = useTranslation('common');
  const toast = useToast();

  const [type, setType] = useState<FeedbackType>('BUG');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error(t('feedback.descriptionRequired'));
      return;
    }

    if (description.trim().length < 10) {
      toast.error(t('feedback.descriptionTooShort'));
      return;
    }

    setIsSubmitting(true);

    try {
      await feedbackApi.create({
        type,
        description: description.trim(),
        pageUrl: window.location.href,
        userEmail: email.trim() || undefined,
        browserInfo: getBrowserInfo(),
      });

      toast.success(t('feedback.success'));
      setDescription('');
      setEmail('');
      setType('BUG');
      onClose();
    } catch {
      toast.error(t('feedback.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('feedback.title')}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>{t('feedback.type')}</label>
            <div className={styles.typeButtons}>
              <button
                type="button"
                className={`${styles.typeButton} ${type === 'BUG' ? styles.typeButtonActive : ''} ${styles.typeBug}`}
                onClick={() => setType('BUG')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                {t('feedback.typeBug')}
              </button>
              <button
                type="button"
                className={`${styles.typeButton} ${type === 'SUGGESTION' ? styles.typeButtonActive : ''} ${styles.typeSuggestion}`}
                onClick={() => setType('SUGGESTION')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {t('feedback.typeSuggestion')}
              </button>
              <button
                type="button"
                className={`${styles.typeButton} ${type === 'QUESTION' ? styles.typeButtonActive : ''} ${styles.typeQuestion}`}
                onClick={() => setType('QUESTION')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
                </svg>
                {t('feedback.typeQuestion')}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="feedback-description" className={styles.label}>
              {t('feedback.description')} *
            </label>
            <textarea
              id="feedback-description"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('feedback.descriptionPlaceholder')}
              rows={5}
              required
            />
          </div>

          {type === 'BUG' && (
            <div className={styles.field}>
              <label className={styles.label}>{t('feedback.page')}</label>
              <div className={styles.pageUrl}>{window.location.href}</div>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="feedback-email" className={styles.label}>
              {t('feedback.email')}
            </label>
            <input
              type="email"
              id="feedback-email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('feedback.emailPlaceholder')}
            />
            <span className={styles.hint}>{t('feedback.emailHint')}</span>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('app.cancel')}
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || !description.trim()}
            >
              {isSubmitting ? t('feedback.sending') : t('feedback.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FeedbackModal;
