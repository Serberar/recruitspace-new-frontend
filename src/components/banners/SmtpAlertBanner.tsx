/**
 * SmtpAlertBanner Component
 *
 * Muestra un aviso cuando el usuario (recruiter) no tiene configurado su SMTP.
 * Sin SMTP configurado, no podra enviar emails a candidatos.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/hooks/reduxHooks';
import { usePermissions } from '@/hooks/useRole';
import { hasSmtpConfigured } from '@/features/email/services/emailApi';
import styles from './BetaBanner.module.css'; // Reutilizamos los estilos del BetaBanner

export function SmtpAlertBanner() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const { isRecruiter, isOrgRecruiter, isAdmin } = usePermissions();
  const [hasSmtp, setHasSmtp] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Solo mostrar a recruiters y admins
  const shouldCheck = isRecruiter || isOrgRecruiter || isAdmin;

  useEffect(() => {
    if (!user || !shouldCheck) {
      setLoading(false);
      return;
    }

    // Verificar si ya fue descartado en esta sesion
    const dismissedKey = `smtp-alert-dismissed-${user?.id}`;
    if (sessionStorage.getItem(dismissedKey)) {
      setDismissed(true);
      setLoading(false);
      return;
    }

    const checkSmtp = async () => {
      try {
        const configured = await hasSmtpConfigured();
        setHasSmtp(configured);
      } catch (err) {
        console.error('Error checking SMTP status:', err);
        // En caso de error, no mostrar el banner
        setHasSmtp(true);
      } finally {
        setLoading(false);
      }
    };

    checkSmtp();
  }, [user, shouldCheck]);

  const handleDismiss = () => {
    if (user?.id) {
      sessionStorage.setItem(`smtp-alert-dismissed-${user.id}`, 'true');
    }
    setDismissed(true);
  };

  // No mostrar si: cargando, no es recruiter, ya tiene SMTP, o fue descartado
  if (loading || !shouldCheck || hasSmtp !== false || dismissed) {
    return null;
  }

  return (
    <div className={`${styles.banner} ${styles.warning}`}>
      <div className={styles.content}>
        <span className={styles.icon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </span>
        <span className={styles.message}>
          {t('smtp.alert.noConfig', 'No tienes configurado tu servidor de correo (SMTP). Los candidatos no recibiran notificaciones por email hasta que lo configures.')}
        </span>
        <Link to="/app/settings/smtp" className={styles.actionButton}>
          {t('smtp.alert.configure', 'Configurar SMTP')}
        </Link>
      </div>
      <button
        className={styles.dismissButton}
        onClick={handleDismiss}
        aria-label={t('common.close', 'Cerrar')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default SmtpAlertBanner;
