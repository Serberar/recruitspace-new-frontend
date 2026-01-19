import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { AppFooter } from '../../components/footer/AppFooter';
import { forgotPasswordAPI } from '../../features/auth/services/authService';
import styles from './ForgotPasswordPage.module.css';

type PageState = 'form' | 'success';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [pageState, setPageState] = useState<PageState>('form');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Por favor, introduce tu correo electronico.');
      return;
    }

    setIsLoading(true);

    try {
      await forgotPasswordAPI(email.trim());
      setPageState('success');
    } catch {
      // Por seguridad, el backend siempre devuelve exito
      // pero mostramos un error generico si hay problema de red
      setError('Ha ocurrido un error. Por favor, intentalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (pageState === 'success') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.cardWrapper}>
            <div className={`${styles.card} ${styles.successCard}`}>
              <div className={styles.successIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h1 className={styles.title}>Correo enviado</h1>
              <p className={styles.subtitle}>
                Si existe una cuenta con el correo <strong>{email}</strong>, recibiras un enlace para restablecer tu contrasena.
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => setPageState('form')}
              >
                Enviar otro correo
              </Button>
              <div className={styles.backLink}>
                <Link to="/login">Volver a iniciar sesion</Link>
              </div>
            </div>
          </div>
        </div>

        <AppFooter />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.cardWrapper}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h1 className={styles.title}>Recuperar contrasena</h1>
              <p className={styles.subtitle}>
                Introduce tu correo electronico y te enviaremos un enlace para restablecer tu contrasena.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="email">
                  Correo electronico
                </label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  disabled={isLoading}
                />
                {error && <span className={styles.error}>{error}</span>}
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperacion'}
              </Button>
            </form>

            <div className={styles.backLink}>
              <Link to="/login">Volver a iniciar sesion</Link>
            </div>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
