import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui';
import { AppFooter } from '../../components/footer/AppFooter';
import { resetPasswordAPI } from '../../features/auth/services/authService';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import styles from './ResetPasswordPage.module.css';

type PageState = 'form' | 'success' | 'error';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pageState, setPageState] = useState<PageState>(token ? 'form' : 'error');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = 'La contrasena es requerida';
    } else if (password.length < 8) {
      errors.password = 'La contrasena debe tener al menos 8 caracteres';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirma tu contrasena';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contrasenas no coinciden';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    if (!token) {
      setPageState('error');
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordAPI(token, password);
      setPageState('success');
    } catch (err) {
      const message = getErrorMessage(err) || 'El enlace es invalido o ha expirado.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (pageState === 'error' && !token) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={`${styles.card} ${styles.errorCard}`}>
            <div className={styles.errorIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h1 className={styles.title}>Enlace invalido</h1>
            <p className={styles.subtitle}>
              El enlace de restablecimiento no es valido. Por favor, solicita uno nuevo.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/forgot-password')}
            >
              Solicitar nuevo enlace
            </Button>
          </div>
        </div>

        <AppFooter />
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={`${styles.card} ${styles.successCard}`}>
            <div className={styles.successIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className={styles.title}>Contrasena actualizada</h1>
            <p className={styles.subtitle}>
              Tu contrasena ha sido restablecida correctamente. Ya puedes iniciar sesion con tu nueva contrasena.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Iniciar sesion
            </Button>
          </div>
        </div>

        <AppFooter />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Nueva contrasena</h1>
            <p className={styles.subtitle}>
              Introduce tu nueva contrasena. Debe tener al menos 8 caracteres.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.errorGlobal}>{error}</div>}

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="password">
                Nueva contrasena
              </label>
              <input
                id="password"
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                disabled={isLoading}
              />
              {fieldErrors.password && (
                <span className={styles.error}>{fieldErrors.password}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="confirmPassword">
                Confirmar contrasena
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                disabled={isLoading}
              />
              {fieldErrors.confirmPassword && (
                <span className={styles.error}>{fieldErrors.confirmPassword}</span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar contrasena'}
            </Button>
          </form>

          <div className={styles.backLink}>
            <Link to="/login">Volver a iniciar sesion</Link>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
