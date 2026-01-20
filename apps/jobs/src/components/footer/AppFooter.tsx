import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LanguageSelector from '../i18n/LanguageSelector';
import { FeedbackModal } from '../feedback/FeedbackModal';
import Logo from '../logo/Logo';
import styles from './AppFooter.module.css';

interface AppFooterProps {
  /** Variante del footer: 'full' muestra todo, 'minimal' solo lo esencial */
  variant?: 'full' | 'minimal';
  /** Tema del footer: 'light' (default) o 'dark' para sysadmin */
  theme?: 'light' | 'dark';
  /** Mostrar botón de reportar problema (default: true) */
  showFeedback?: boolean;
}

export function AppFooter({ variant = 'full', theme = 'light', showFeedback = true }: AppFooterProps) {
  const { t } = useTranslation('common');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const footerClasses = [
    styles.footer,
    variant === 'minimal' ? styles.minimal : '',
    theme === 'dark' ? styles.dark : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <footer className={footerClasses}>
        <div className={styles.container}>
          {variant === 'full' && (
            <div className={styles.links}>
              <Link to="/privacy" className={styles.link}>
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className={styles.link}>
                {t('footer.terms')}
              </Link>
              <Link to="/cookies" className={styles.link}>
                {t('footer.cookies')}
              </Link>
              <Link to="/contact" className={styles.link}>
                {t('footer.contact')}
              </Link>
            </div>
          )}

          <div className={styles.actions}>
            {showFeedback && (
              <button
                className={styles.feedbackButton}
                onClick={() => setIsFeedbackOpen(true)}
                aria-label={t('footer.reportProblem')}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                {t('footer.reportProblem')}
              </button>
            )}

            <LanguageSelector theme={theme} />
          </div>

          <div className={styles.copyright}>
            <Logo size="sm" variant={theme === 'dark' ? 'light' : 'dark'} />
            <span className={styles.year}>&copy; {currentYear}</span>
          </div>
        </div>
      </footer>

      {showFeedback && (
        <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      )}
    </>
  );
}

export default AppFooter;
