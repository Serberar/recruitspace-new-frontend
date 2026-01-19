/**
 * PlansPage
 *
 * Página de selección de planes.
 * - Para usuarios no autenticados: elige plan y va a registro
 * - Para usuarios autenticados sin plan: selecciona plan directamente
 *
 * Diseño premium con elementos de confianza y mejor UX.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getPlans, type Plan, type AccountType } from '@/features/plans';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import { checkSession } from '@/features/auth/authSlice';
import { AppFooter } from '@/components/footer/AppFooter';
import Menu from '@/components/menu/Menu';
import Logo from '@/components/logo/Logo';
import { AccountTypeSelector } from './components/AccountTypeSelector';
import { PlanCard } from './components/PlanCard';
import styles from './PlansPage.module.css';

// Iconos para trust badges
const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default function PlansPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, isAuthLoading } = useAppSelector((state) => state.auth);

  // Para usuarios autenticados, usar su accountType; para no autenticados, permitir elegir
  const userAccountType = isLoggedIn && user?.accountType ? user.accountType : null;

  const [accountType, setAccountType] = useState<AccountType>('freelance');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usuario autenticado sin plan activo
  const needsPlanSelection = isLoggedIn && user && !user.hasActivePlan;

  // org_recruiter no puede gestionar planes, solo el admin de la org
  const isOrgRecruiter = isLoggedIn && user?.role === 'org_recruiter';

  // Tipo de cuenta efectivo: si el usuario está autenticado, usar el suyo; si no, usar el selector
  const effectiveAccountType = userAccountType ?? accountType;

  useEffect(() => {
    // Si el usuario está autenticado y tiene accountType, usarlo
    if (userAccountType) {
      setAccountType(userAccountType);
    }
  }, [userAccountType]);

  useEffect(() => {
    // No cargar planes mientras se verifica la autenticación
    if (isAuthLoading) {
      return;
    }

    const fetchPlans = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getPlans(effectiveAccountType);
        setPlans(data);
      } catch (err) {
        console.error('Error fetching plans:', err);
        setError('No se pudieron cargar los planes. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [effectiveAccountType, isAuthLoading]);

  // Callback cuando se selecciona un plan exitosamente
  const handlePlanSelected = async () => {
    // Refrescar la sesión para actualizar hasActivePlan
    try {
      const result = await dispatch(checkSession()).unwrap();
      if (result.hasActivePlan) {
        // Navegar a donde el usuario intentaba ir, o al dashboard
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
        navigate(from || '/app/dashboard', { replace: true });
      }
    } catch {
      // Si falla checkSession, redirigir a login
      navigate('/login', { replace: true });
    }
  };

  // Filtrar para no mostrar planes anuales junto a los mensuales
  // Mostrar solo mensuales por defecto, con opción de ver anuales
  const monthlyPlans = plans.filter(p => p.billingInterval === 'monthly');

  // Si el usuario está logueado, mostrar con el menú de la app
  if (isLoggedIn) {
    return (
      <div className={styles.pageWithMenu}>
        <Menu />
        <div className={styles.contentWithMenu}>
          <div className={styles.container}>
            {/* Title */}
            <div className={styles.titleSection}>
              <h1 className={styles.title}>
                {needsPlanSelection ? 'Selecciona tu plan' : 'Gestiona tu plan'}
              </h1>
              <p className={styles.subtitle}>
                {needsPlanSelection
                  ? 'Necesitas un plan activo para continuar usando la plataforma'
                  : 'Administra tu suscripcion actual'}
              </p>
            </div>

            {/* Mensaje para org_recruiter */}
            {isOrgRecruiter && needsPlanSelection && (
              <div className={styles.orgRecruiterMessage}>
                <p>
                  Tu organizacion no tiene un plan activo. Contacta con el administrador
                  de tu organizacion para activar un plan.
                </p>
              </div>
            )}

            {/* Plans Grid - ocultar para org_recruiter sin plan */}
            {!(isOrgRecruiter && needsPlanSelection) && (
              <>
                {(loading || isAuthLoading) ? (
                  <div className={styles.loading}>
                    <div className={styles.loadingSpinner} />
                    <p>Cargando planes...</p>
                  </div>
                ) : error ? (
                  <div className={styles.error}>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <div className={styles.plansGrid}>
                    {monthlyPlans.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        isAuthenticated={!!needsPlanSelection}
                        onPlanSelected={handlePlanSelected}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Footer note */}
            {!(isOrgRecruiter && needsPlanSelection) && (
              <p className={styles.footerNote}>
                Mantienes tu precio mientras tu suscripcion este activa.
              </p>
            )}
          </div>
          <AppFooter />
        </div>
      </div>
    );
  }

  // Usuario no logueado - diseño landing
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header para no logueados */}
        <div className={styles.header}>
          <Link to="/">
            <Logo size="md" />
          </Link>
        </div>

        {/* Title */}
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Elige tu plan</h1>
          <p className={styles.subtitle}>
            Comienza gratis y escala cuando lo necesites
          </p>
        </div>

        {/* Account Type Selector */}
        <AccountTypeSelector
          selected={accountType}
          onChange={setAccountType}
        />

        {/* Plans Grid */}
        {(loading || isAuthLoading) ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner} />
            <p>Cargando planes...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </div>
        ) : (
          <div className={styles.plansGrid}>
            {monthlyPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isAuthenticated={false}
                onPlanSelected={handlePlanSelected}
              />
            ))}
          </div>
        )}

        {/* Trust badges */}
        <div className={styles.trustSection}>
          <div className={styles.trustBadge}>
            <ShieldIcon />
            <span>Datos seguros</span>
          </div>
          <div className={styles.trustBadge}>
            <CreditCardIcon />
            <span>Cancela cuando quieras</span>
          </div>
          <div className={styles.trustBadge}>
            <ZapIcon />
            <span>Activo al instante</span>
          </div>
        </div>

        <p className={styles.footerNote}>
          Mantienes tu precio mientras tu suscripcion este activa.
        </p>

        <p className={styles.loginLink}>
          Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesion</Link>
        </p>
      </div>

      <AppFooter />
    </div>
  );
}
