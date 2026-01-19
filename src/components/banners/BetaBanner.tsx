/**
 * BetaBanner Component
 *
 * Muestra un aviso sobre el estado de la beta cuando el usuario ya está logueado.
 * Se muestra en el DashboardLayout donde ya conocemos el plan del usuario.
 * - Si la beta termina pronto: aviso amarillo
 * - Si la beta ha expirado: aviso rojo
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBetaStatus, type BetaStatusResponse } from '@/features/plans';
import styles from './BetaBanner.module.css';

export function BetaBanner() {
  const [betaStatus, setBetaStatus] = useState<BetaStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchBetaStatus = async () => {
      try {
        const status = await getBetaStatus();
        setBetaStatus(status);
      } catch (err) {
        console.error('Error fetching beta status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBetaStatus();
  }, []);

  // No mostrar si está cargando, sin fecha de beta, o ya fue descartado
  if (loading || !betaStatus?.hasBetaEndDate || !betaStatus.message || dismissed) {
    return null;
  }

  const variant = betaStatus.isBetaExpired ? 'error' : 'warning';

  return (
    <div className={`${styles.banner} ${styles[variant]}`}>
      <div className={styles.content}>
        <span className={styles.icon}>
          {variant === 'error' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )}
        </span>
        <span className={styles.message}>{betaStatus.message}</span>
        <Link to="/plans" className={styles.actionButton}>
          Ver planes
        </Link>
      </div>
      {!betaStatus.isBetaExpired && (
        <button
          className={styles.dismissButton}
          onClick={() => setDismissed(true)}
          aria-label="Cerrar aviso"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default BetaBanner;
