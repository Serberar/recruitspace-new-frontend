import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui';
import { AppFooter } from '../../components/footer/AppFooter';
import { claimCandidateAPI } from '../../features/auth/services/authService';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import styles from './ClaimAccountPage.module.css';

type ClaimStatus = 'loading' | 'success' | 'error';

export default function ClaimAccountPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<ClaimStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Token de confirmacion no proporcionado.');
      return;
    }

    const claimAccount = async () => {
      try {
        await claimCandidateAPI(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(
          getErrorMessage(err) ||
          'El enlace de confirmacion es invalido o ha expirado.'
        );
      }
    };

    claimAccount();
  }, [token]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          {status === 'loading' && (
            <>
              <div className={styles.loadingIcon}>
                <div className={styles.spinner} />
              </div>
              <h1 className={styles.title}>Confirmando tu cuenta...</h1>
              <p className={styles.text}>
                Por favor espera mientras vinculamos tu cuenta con tu perfil existente.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className={styles.successIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h1 className={styles.title}>Cuenta vinculada</h1>
              <p className={styles.text}>
                Tu cuenta ha sido vinculada correctamente con tu perfil de candidato.
                Ahora puedes acceder a todo tu historial de procesos de seleccion.
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/login-candidate')}
              >
                Iniciar sesion
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className={styles.errorIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h1 className={styles.title}>Error de confirmacion</h1>
              <p className={styles.text}>{errorMessage}</p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/login-candidate')}
              >
                Ir a iniciar sesion
              </Button>
            </>
          )}
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
