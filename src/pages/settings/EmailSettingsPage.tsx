import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SmtpSettings from './components/SmtpSettings';
import EmailNotifications from './components/EmailNotifications';
import styles from './EmailSettingsPage.module.css';

type TabType = 'smtp' | 'notifications';

export default function EmailSettingsPage() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<TabType>('smtp');

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{t('settings.email.title')}</h1>
        <p className={styles.subtitle}>{t('settings.email.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'smtp' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('smtp')}
        >
          {t('settings.email.tabSmtp')}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'notifications' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          {t('settings.email.tabNotifications')}
        </button>
      </div>

      {/* Tab content */}
      <div className={styles.tabContent}>
        {activeTab === 'smtp' && <SmtpSettings />}
        {activeTab === 'notifications' && <EmailNotifications />}
      </div>
    </div>
  );
}
