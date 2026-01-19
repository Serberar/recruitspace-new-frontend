import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../hooks/reduxHooks";
import { AppFooter } from "../../components/footer/AppFooter";
import Logo from "../../components/logo/Logo";
import styles from "./MixedLandingPage.module.css";

export default function MixedLandingPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);
  const role = user?.role;

  // Redirect authenticated users
  useEffect(() => {
    if (isLoggedIn) {
      if (role === 'candidate') {
        navigate('/portal', { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    }
  }, [isLoggedIn, role, navigate]);

  if (isLoggedIn) {
    return null;
  }

  return (
    <div className={styles.landing}>
      {/* Animated background */}
      <div className={styles.bgGradient} />
      <div className={styles.bgOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>
      <div className={styles.bgGrid} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <Logo size="md" variant="light" />
        </div>
        <div className={styles.headerRight}>
          <Link to="/login" className={styles.headerLink}>
            {t('landing.header.loginCompanies')}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            {t('landing.badge')}
          </div>

          <h1 className={styles.title}>
            {t('landing.title.line1')}
            <span className={styles.titleGradient}>{t('landing.title.line2')}</span>
          </h1>

          <p className={styles.subtitle}>{t('landing.subtitle')}</p>

          {/* Main Actions - Two prominent cards */}
          <div className={styles.cardsContainer}>
            {/* Card: Buscar empleo */}
            <Link to="/jobs" className={styles.card}>
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{t('landing.cta.searchJobs')}</h2>
                <p className={styles.cardDesc}>{t('landing.cta.searchJobsMicro')}</p>
              </div>
              <div className={styles.cardArrow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className={styles.cardShine} />
            </Link>

            {/* Card: Gestionar procesos */}
            <Link to="/recruiter" className={styles.card}>
              <div className={styles.cardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.cardTitle}>{t('landing.cta.manageProcesses')}</h2>
                <p className={styles.cardDesc}>{t('landing.cta.manageProcessesMicro')}</p>
              </div>
              <div className={styles.cardArrow}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className={styles.cardShine} />
            </Link>
          </div>

          {/* Features bar */}
          <div className={styles.features}>
            <div className={styles.feature}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{t('landing.features.verified')}</span>
            </div>
            <div className={styles.featureDivider} />
            <div className={styles.feature}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span>{t('landing.features.fast')}</span>
            </div>
            <div className={styles.featureDivider} />
            <div className={styles.feature}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>{t('landing.features.secure')}</span>
            </div>
          </div>

          {/* Secondary action */}
          <Link to="/login-candidate" className={styles.secondaryLink}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {t('landing.cta.myApplications')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <AppFooter theme="dark" />
    </div>
  );
}
