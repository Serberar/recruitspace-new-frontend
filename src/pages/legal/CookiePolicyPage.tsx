import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppFooter } from '../../components/footer/AppFooter';
import Logo from '../../components/logo/Logo';
import styles from './LegalPage.module.css';

export function CookiePolicyPage() {
  const { t } = useTranslation('common');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t('app.back')}
          </Link>
          <Link to="/" className={styles.logoLink}>
            <Logo size="sm" />
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>{t('legal.cookies.title')}</h1>
          <p className={styles.lastUpdated}>{t('legal.lastUpdated')}: {new Date().toLocaleDateString()}</p>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.cookies.what.title')}</h2>
            <p className={styles.text}>{t('legal.cookies.what.text')}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.cookies.types.title')}</h2>
            <p className={styles.text}>{t('legal.cookies.types.text')}</p>
            <ul className={styles.list}>
              <li><strong>{t('legal.cookies.types.essential.name')}:</strong> {t('legal.cookies.types.essential.desc')}</li>
              <li><strong>{t('legal.cookies.types.functional.name')}:</strong> {t('legal.cookies.types.functional.desc')}</li>
              <li><strong>{t('legal.cookies.types.analytics.name')}:</strong> {t('legal.cookies.types.analytics.desc')}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.cookies.manage.title')}</h2>
            <p className={styles.text}>{t('legal.cookies.manage.text')}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.cookies.thirdParty.title')}</h2>
            <p className={styles.text}>{t('legal.cookies.thirdParty.text')}</p>
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

export default CookiePolicyPage;
