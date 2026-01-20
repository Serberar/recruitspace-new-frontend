/**
 * BillingPage
 *
 * Página de gestión de suscripción y facturación.
 * Muestra: plan actual, límites, uso, add-ons disponibles y comprados.
 * Incluye gestión de suscripción Stripe (cancelar, reactivar, portal).
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/useRole';
import {
  getBillingOverview,
  getAvailableAddons,
  purchaseAddon,
  getStripeStatus,
  getSubscriptionInfo,
  cancelSubscription,
  reactivateSubscription,
  openBillingPortal,
  type BillingOverview,
  type PlanAddon,
  type StripeStatus,
  type SubscriptionInfo,
} from '@/services/billingApi';
import { getErrorMessage } from '@/hooks/useErrorHandler';
import styles from './BillingPage.module.css';

// Iconos SVG inline
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

type ToastType = 'success' | 'error' | null;

export default function BillingPage() {
  const { t } = useTranslation('common');
  const { isAdmin } = usePermissions();

  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [availableAddons, setAvailableAddons] = useState<PlanAddon[]>([]);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [cancelingSubscription, setCancelingSubscription] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType }>({
    message: '',
    type: null,
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, addonsData, stripeStatusData, subInfo] = await Promise.all([
        getBillingOverview(),
        getAvailableAddons().catch(() => []), // Si falla, devolver array vacío
        getStripeStatus(),
        getSubscriptionInfo(),
      ]);
      setOverview(overviewData);
      setAvailableAddons(addonsData || []);
      setStripeStatus(stripeStatusData);
      setSubscriptionInfo(subInfo);
    } catch (err) {
      setError(getErrorMessage(err) || t('billing.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelSubscription = async () => {
    setCancelingSubscription(true);
    try {
      await cancelSubscription();
      showToast(t('billing.cancelSuccess'), 'success');
      setShowCancelConfirm(false);
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err) || t('billing.cancelError'), 'error');
    } finally {
      setCancelingSubscription(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setReactivating(true);
    try {
      await reactivateSubscription();
      showToast(t('billing.reactivateSuccess'), 'success');
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err) || t('billing.reactivateError'), 'error');
    } finally {
      setReactivating(false);
    }
  };

  const handleOpenPortal = async () => {
    try {
      const url = await openBillingPortal();
      window.open(url, '_blank');
    } catch (err) {
      showToast(getErrorMessage(err) || t('billing.portalError'), 'error');
    }
  };

  const handlePurchaseAddon = async (addon: PlanAddon) => {
    setPurchasing(addon.id);
    try {
      await purchaseAddon(addon.id, 1);
      showToast(t('billing.addonPurchased', { name: addon.name }), 'success');
      fetchData(); // Refrescar datos
    } catch (err) {
      showToast(getErrorMessage(err) || t('billing.purchaseError'), 'error');
    } finally {
      setPurchasing(null);
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 999999) return 0; // Ilimitado
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'var(--color-error)';
    if (percentage >= 70) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const formatLimit = (value: number) => {
    return value === 999999 ? t('billing.unlimited') : value.toString();
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchData}>{t('app.retry')}</button>
      </div>
    );
  }

  if (!overview) return null;

  const { subscription, limits, usage, addons: purchasedAddons } = overview;

  // Calcular uso
  const offersPercentage = getUsagePercentage(usage.activeOffers, limits.maxActiveOffers);
  const recruitersPercentage = getUsagePercentage(usage.recruiters, limits.maxRecruiters);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('billing.title')}</h1>
          <p className={styles.subtitle}>{t('billing.subtitle')}</p>
        </div>
      </div>

      {/* Plan actual */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('billing.currentPlan')}</h2>
        <div className={styles.planCard}>
          {subscription ? (
            <>
              <div className={styles.planInfo}>
                <h3 className={styles.planName}>{subscription.planName}</h3>
                <span className={`${styles.planStatus} ${styles[subscription.status]}`}>
                  {t(`billing.status.${subscription.status}`)}
                </span>
              </div>
              <div className={styles.planPrice}>
                <span className={styles.priceValue}>{subscription.priceDisplay}</span>
                <span className={styles.priceInterval}>/{t('billing.perMonth')}</span>
              </div>
              {subscription.trialEndsAt && (
                <p className={styles.trialInfo}>
                  {t('billing.trialEnds', {
                    date: new Date(subscription.trialEndsAt).toLocaleDateString(),
                  })}
                </p>
              )}
            </>
          ) : (
            <div className={styles.noPlan}>
              <p>{t('billing.noPlan')}</p>
            </div>
          )}
        </div>

        {/* Información de renovación/cancelación (solo si Stripe está habilitado) */}
        {stripeStatus?.enabled && subscriptionInfo && subscriptionInfo.status !== 'none' && isAdmin && (
          <div className={styles.subscriptionManagement}>
            {/* Fecha de renovación */}
            {subscriptionInfo.currentPeriodEnd && (
              <div className={styles.renewalInfo}>
                <div className={styles.renewalIcon}>
                  <CalendarIcon />
                </div>
                <div className={styles.renewalText}>
                  {subscriptionInfo.cancelAtPeriodEnd ? (
                    <>
                      <span className={styles.renewalLabel}>{t('billing.accessUntil')}:</span>
                      <span className={styles.renewalDate}>
                        {new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                      <span className={styles.canceledNote}>{t('billing.subscriptionWillEnd')}</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.renewalLabel}>{t('billing.renewsOn')}:</span>
                      <span className={styles.renewalDate}>
                        {new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className={styles.subscriptionActions}>
              {/* Botón para abrir portal de Stripe */}
              <button
                className={styles.portalButton}
                onClick={handleOpenPortal}
              >
                <CreditCardIcon />
                {t('billing.manageBilling')}
              </button>

              {/* Botón cancelar o reactivar */}
              {subscriptionInfo.cancelAtPeriodEnd ? (
                <button
                  className={styles.reactivateButton}
                  onClick={handleReactivateSubscription}
                  disabled={reactivating}
                >
                  {reactivating ? t('app.processing') : t('billing.reactivateSubscription')}
                </button>
              ) : (
                <button
                  className={styles.cancelButton}
                  onClick={() => setShowCancelConfirm(true)}
                >
                  {t('billing.cancelSubscription')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Aviso de Stripe deshabilitado (modo beta) */}
        {stripeStatus && !stripeStatus.enabled && isAdmin && (
          <div className={styles.betaNotice}>
            <div className={styles.betaIcon}>
              <InfoIcon />
            </div>
            <div className={styles.betaText}>
              <strong>{t('billing.betaMode')}</strong>
              <p>{t('billing.betaModeDescription')}</p>
            </div>
          </div>
        )}
      </section>

      {/* Modal de confirmación de cancelación */}
      {showCancelConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>{t('billing.confirmCancelTitle')}</h3>
            <p className={styles.modalText}>
              {t('billing.confirmCancelText', {
                date: subscriptionInfo?.currentPeriodEnd
                  ? new Date(subscriptionInfo.currentPeriodEnd).toLocaleDateString('es-ES')
                  : '',
              })}
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                onClick={() => setShowCancelConfirm(false)}
              >
                {t('app.back')}
              </button>
              <button
                className={styles.modalConfirmButton}
                onClick={handleCancelSubscription}
                disabled={cancelingSubscription}
              >
                {cancelingSubscription ? t('app.processing') : t('billing.confirmCancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uso y límites */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('billing.usageAndLimits')}</h2>
        <div className={styles.usageGrid}>
          {/* Ofertas activas */}
          <div className={styles.usageCard}>
            <div className={styles.usageHeader}>
              <span className={styles.usageLabel}>{t('billing.activeOffers')}</span>
              <span className={styles.usageValue}>
                {usage.activeOffers} / {formatLimit(limits.maxActiveOffers)}
              </span>
            </div>
            <div className={styles.usageBar}>
              <div
                className={styles.usageProgress}
                style={{
                  width: `${offersPercentage}%`,
                  backgroundColor: getUsageColor(offersPercentage),
                }}
              />
            </div>
            {limits.extraOffers > 0 && (
              <span className={styles.extraBadge}>
                +{limits.extraOffers} {t('billing.fromAddons')}
              </span>
            )}
          </div>

          {/* Miembros del equipo */}
          <div className={styles.usageCard}>
            <div className={styles.usageHeader}>
              <span className={styles.usageLabel}>{t('billing.teamMembers')}</span>
              <span className={styles.usageValue}>
                {usage.recruiters} / {formatLimit(limits.maxRecruiters)}
              </span>
            </div>
            <div className={styles.usageBar}>
              <div
                className={styles.usageProgress}
                style={{
                  width: `${recruitersPercentage}%`,
                  backgroundColor: getUsageColor(recruitersPercentage),
                }}
              />
            </div>
            {limits.extraRecruiters > 0 && (
              <span className={styles.extraBadge}>
                +{limits.extraRecruiters} {t('billing.fromAddons')}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Opciones de ampliación */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('billing.expandOptions')}</h2>
        {availableAddons && availableAddons.length > 0 ? (
          <>
            <p className={styles.sectionSubtitle}>
              {stripeStatus?.enabled
                ? t('billing.addonsDescription')
                : t('billing.addonsComingSoon')}
            </p>
            <div className={styles.addonsGrid}>
              {availableAddons.map((addon) => {
                const isBetaDisabled = !stripeStatus?.enabled;
                return (
                  <div
                    key={addon.id}
                    className={`${styles.addonCard} ${isBetaDisabled ? styles.addonCardDisabled : ''}`}
                  >
                    <div className={styles.addonInfo}>
                      <h4 className={styles.addonName}>{addon.name}</h4>
                      {addon.description && (
                        <p className={styles.addonDescription}>{addon.description}</p>
                      )}
                    </div>
                    <div className={styles.addonAction}>
                      <span className={styles.addonPrice}>{addon.priceDisplay}</span>
                      {isBetaDisabled ? (
                        <span className={styles.comingSoonBadge}>{t('billing.comingSoon')}</span>
                      ) : (
                        <button
                          className={styles.buyButton}
                          onClick={() => handlePurchaseAddon(addon)}
                          disabled={purchasing === addon.id}
                        >
                          {purchasing === addon.id ? t('app.processing') : t('billing.buy')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className={styles.noAddonsMessage}>
            <p>{t('billing.noAddonsAvailable')}</p>
            <p className={styles.noAddonsHint}>{t('billing.upgradePlanHint')}</p>
          </div>
        )}
      </section>

      {/* Add-ons comprados */}
      {purchasedAddons.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('billing.purchasedAddons')}</h2>
          <div className={styles.purchasedList}>
            {purchasedAddons.map((addon) => (
              <div key={addon.id} className={styles.purchasedItem}>
                <div className={styles.purchasedInfo}>
                  <span className={styles.purchasedName}>
                    {addon.addon.name}
                    {addon.quantity > 1 && ` x${addon.quantity}`}
                  </span>
                  <span className={styles.purchasedDate}>
                    {t('billing.purchasedOn', {
                      date: new Date(addon.purchasedAt).toLocaleDateString(),
                    })}
                  </span>
                </div>
                <span className={styles.purchasedPrice}>{addon.addon.priceDisplay}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Toast */}
      {toast.type && (
        <div
          className={`${styles.toast} ${
            toast.type === 'success' ? styles.toastSuccess : styles.toastError
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
