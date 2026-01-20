import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './ErrorFallback.module.css';

export interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
  showDetails?: boolean;
  showHomeButton?: boolean;
  showRetryButton?: boolean;
}

export function ErrorFallback({
  error,
  resetError,
  title,
  message,
  showDetails = import.meta.env.DEV,
  showHomeButton = true,
  showRetryButton = true,
}: ErrorFallbackProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const displayTitle = title || t('error.somethingWentWrong');
  const displayMessage = message || t('error.unexpectedError');

  const handleGoHome = () => {
    navigate('/');
    resetError?.();
  };

  const handleRetry = () => {
    resetError?.();
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <svg
            className={styles.icon}
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>

        <h1 className={styles.title}>{displayTitle}</h1>
        <p className={styles.message}>{displayMessage}</p>

        {showDetails && error && (
          <details className={styles.details}>
            <summary>{t('error.errorDetails')}</summary>
            <pre className={styles.errorStack}>
              <strong>{error.name}:</strong> {error.message}
              {error.stack && (
                <>
                  {'\n\n'}
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}

        <div className={styles.actions}>
          {showRetryButton && resetError && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleRetry}
            >
              {t('error.tryAgain')}
            </button>
          )}
          {showHomeButton && (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleGoHome}
            >
              {t('error.goHome')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Variant for route-level errors (404, etc.)
export function NotFoundFallback() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <span className={styles.errorCode}>404</span>
        </div>

        <h1 className={styles.title}>{t('error.pageNotFound')}</h1>
        <p className={styles.message}>{t('error.pageNotFoundDesc')}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate(-1)}
          >
            {t('error.goBack')}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/')}
          >
            {t('error.goHome')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Variant for server errors
export function ServerErrorFallback({ resetError }: { resetError?: () => void }) {
  const { t } = useTranslation('common');
  return (
    <ErrorFallback
      title={t('error.serverError')}
      message={t('error.unexpectedError')}
      resetError={resetError}
      showDetails={false}
    />
  );
}

// Variant for network errors
export function NetworkErrorFallback({ resetError }: { resetError?: () => void }) {
  const { t } = useTranslation('common');
  return (
    <ErrorFallback
      title={t('error.noConnection')}
      message={t('error.unexpectedError')}
      resetError={resetError}
      showDetails={false}
    />
  );
}

export default ErrorFallback;
