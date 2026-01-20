import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppFooter } from '../../components/footer/AppFooter';
import Logo from '../../components/logo/Logo';
import styles from './FooterPage.module.css';

export function TermsOfServicePage() {
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
          <h1 className={styles.title}>{t('legal.terms.title')}</h1>
          <p className={styles.lastUpdated}>{t('legal.lastUpdated')}: {new Date().toLocaleDateString()}</p>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.terms.acceptance.title')}</h2>
            <p className={styles.text}>{t('legal.terms.acceptance.text')}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.terms.service.title')}</h2>
            <p className={styles.text}>{t('legal.terms.service.text')}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.terms.obligations.title')}</h2>
            <p className={styles.text}>{t('legal.terms.obligations.text')}</p>
            <ul className={styles.list}>
              <li>{t('legal.terms.obligations.item1')}</li>
              <li>{t('legal.terms.obligations.item2')}</li>
              <li>{t('legal.terms.obligations.item3')}</li>
              <li>{t('legal.terms.obligations.item4')}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.terms.intellectual.title')}</h2>
            <p className={styles.text}>{t('legal.terms.intellectual.text')}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.terms.limitation.title')}</h2>
            <p className={styles.text}>{t('legal.terms.limitation.text')}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.terms.modifications.title')}</h2>
            <p className={styles.text}>{t('legal.terms.modifications.text')}</p>
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

export default TermsOfServicePage;
