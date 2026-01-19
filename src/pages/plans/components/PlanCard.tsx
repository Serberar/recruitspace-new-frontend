/**
 * PlanCard Component
 *
 * Tarjeta de plan individual para la página de selección de planes.
 * Diseño premium con mejor jerarquía visual.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Plan } from '@/features/plans';
import { selectPlan } from '@/features/plans';
import styles from '../PlansPage.module.css';

interface PlanCardProps {
  plan: Plan;
  /** Si el usuario está autenticado y necesita seleccionar plan */
  isAuthenticated?: boolean;
  /** Callback cuando se selecciona el plan exitosamente */
  onPlanSelected?: () => void;
}

// Icono de check mejorado
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Icono de reloj para trial
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Icono de flecha para el botón
const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export function PlanCard({ plan, isAuthenticated = false, onPlanSelected }: PlanCardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async () => {
    // Si no está autenticado, ir a registro con el plan
    if (!isAuthenticated) {
      navigate(`/register?plan=${plan.id}`);
      return;
    }

    // Si está autenticado, seleccionar el plan directamente
    setLoading(true);
    setError(null);

    try {
      const result = await selectPlan(plan.id);

      if (result.requiresPayment && result.checkoutUrl) {
        // Redirigir al checkout de Stripe
        window.location.href = result.checkoutUrl;
      } else {
        // Plan gratuito activado, notificar y redirigir
        onPlanSelected?.();
        navigate('/app/dashboard');
      }
    } catch (err) {
      console.error('Error selecting plan:', err);
      setError('Error al seleccionar el plan. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Determinar qué precio mostrar
  const displayPrice = plan.hasActivePromo && plan.promoPriceDisplay
    ? plan.promoPriceDisplay
    : plan.priceDisplay;

  const originalPrice = plan.hasActivePromo ? plan.priceDisplay : null;

  // Determinar el texto del botón
  const getButtonText = () => {
    if (loading) return 'Procesando...';
    if (plan.isFree) return 'Empezar gratis';
    if (plan.trialDays > 0) return 'Probar gratis';
    return 'Seleccionar plan';
  };

  return (
    <div
      className={`${styles.planCard} ${plan.highlightText ? styles.planCardHighlighted : ''}`}
    >
      {/* Badge de destacado */}
      {plan.badge && (
        <span className={styles.planBadge}>{plan.badge}</span>
      )}

      {/* Header */}
      <div className={styles.planHeader}>
        <div className={styles.planNameRow}>
          <h3 className={styles.planName}>{plan.name}</h3>
          {plan.isBeta && <span className={styles.betaTag}>Beta</span>}
        </div>

        {/* Precio */}
        <div className={styles.planPricing}>
          {originalPrice && (
            <span className={styles.planOriginalPrice}>{originalPrice}</span>
          )}
          <span className={styles.planPrice}>{displayPrice}</span>
        </div>

        {/* Trial */}
        {plan.trialText && (
          <span className={styles.planTrial}>
            <ClockIcon />
            {plan.trialText}
          </span>
        )}
      </div>

      {/* Descripción */}
      {plan.description && (
        <p className={styles.planDescription}>{plan.description}</p>
      )}

      {/* Límites */}
      <ul className={styles.planLimits}>
        <li>
          <span className={styles.limitIcon}><CheckIcon /></span>
          {plan.limits.maxActiveOffers === 999999
            ? 'Ofertas ilimitadas'
            : <><span className={styles.limitValue}>{plan.limits.maxActiveOffers}</span> ofertas activas</>}
        </li>
        <li>
          <span className={styles.limitIcon}><CheckIcon /></span>
          {plan.accountType === 'company' ? (
            plan.limits.maxRecruiters === 999999
              ? '1 administrador + recruiters ilimitados'
              : <>1 administrador + <span className={styles.limitValue}>{plan.limits.maxRecruiters}</span> {plan.limits.maxRecruiters === 1 ? 'recruiter' : 'recruiters'}</>
          ) : (
            '1 usuario'
          )}
        </li>
      </ul>

      {/* Features destacadas */}
      {plan.features && (
        <ul className={styles.planFeatures}>
          {plan.features.customBranding && (
            <li><span className={styles.featureIcon}><CheckIcon /></span>Branding personalizado</li>
          )}
          {plan.features.advancedAnalytics && (
            <li><span className={styles.featureIcon}><CheckIcon /></span>Analytics avanzados</li>
          )}
          {plan.features.teamCollaboration && (
            <li><span className={styles.featureIcon}><CheckIcon /></span>Colaboración en equipo</li>
          )}
          {plan.features.apiAccess && (
            <li><span className={styles.featureIcon}><CheckIcon /></span>Acceso API</li>
          )}
          {plan.features.prioritySupport && (
            <li><span className={styles.featureIcon}><CheckIcon /></span>Soporte prioritario</li>
          )}
        </ul>
      )}

      {/* Error */}
      {error && (
        <p className={styles.planError}>{error}</p>
      )}

      {/* Botón */}
      <button
        className={`${styles.planButton} ${plan.isFree ? styles.planButtonSecondary : styles.planButtonPrimary}`}
        onClick={handleSelect}
        disabled={loading}
      >
        {getButtonText()}
        {!loading && <ArrowIcon />}
      </button>
    </div>
  );
}
