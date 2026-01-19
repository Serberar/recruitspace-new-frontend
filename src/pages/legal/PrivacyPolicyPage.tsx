import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppFooter } from '../../components/footer/AppFooter';
import Logo from '../../components/logo/Logo';
import styles from './LegalPage.module.css';

export function PrivacyPolicyPage() {
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
          <h1 className={styles.title}>{t('legal.privacy.title')}</h1>
          <p className={styles.lastUpdated}>{t('legal.lastUpdated')}: {new Date().toLocaleDateString()}</p>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.privacy.intro.title')}</h2>
            <p className={styles.text}>{t('legal.privacy.intro.text')}</p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.privacy.dataCollected.title')}</h2>
            <p className={styles.text}>{t('legal.privacy.dataCollected.text')}</p>
            <ul className={styles.list}>
              <li>{t('legal.privacy.dataCollected.item1')}</li>
              <li>{t('legal.privacy.dataCollected.item2')}</li>
              <li>{t('legal.privacy.dataCollected.item3')}</li>
              <li>{t('legal.privacy.dataCollected.item4')}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.privacy.purpose.title')}</h2>
            <p className={styles.text}>{t('legal.privacy.purpose.text')}</p>
            <ul className={styles.list}>
              <li>{t('legal.privacy.purpose.item1')}</li>
              <li>{t('legal.privacy.purpose.item2')}</li>
              <li>{t('legal.privacy.purpose.item3')}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.privacy.rights.title')}</h2>
            <p className={styles.text}>{t('legal.privacy.rights.text')}</p>
            <ul className={styles.list}>
              <li>{t('legal.privacy.rights.item1')}</li>
              <li>{t('legal.privacy.rights.item2')}</li>
              <li>{t('legal.privacy.rights.item3')}</li>
              <li>{t('legal.privacy.rights.item4')}</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('legal.privacy.contact.title')}</h2>
            <p className={styles.text}>{t('legal.privacy.contact.text')}</p>
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

export default PrivacyPolicyPage;
