import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getOrgEmails,
  toggleOrgEmail,
  type OrgEmailsResponse,
} from '../../../services/orgEmailApi';
import EmailNotificationModal from './EmailNotificationModal';
import styles from './EmailNotifications.module.css';

export default function EmailNotifications() {
  const { t } = useTranslation('common');
  const [data, setData] = useState<OrgEmailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOrgEmails();
      setData(result);
    } catch {
      setError(t('settings.notifications.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleToggle = async (templateName: string, currentEnabled: boolean) => {
    setTogglingId(templateName);
    try {
      await toggleOrgEmail(templateName, !currentEnabled);
      // Actualizar localmente sin refetch
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          emails: prev.emails.map((e) =>
            e.templateName === templateName ? { ...e, enabled: !currentEnabled } : e
          ),
          enabledCount: currentEnabled ? prev.enabledCount - 1 : prev.enabledCount + 1,
          disabledCount: currentEnabled ? prev.disabledCount + 1 : prev.disabledCount - 1,
        };
      });
    } catch {
      // Revertir en caso de error
      fetchEmails();
    } finally {
      setTogglingId(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedTemplate(null);
    fetchEmails();
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button className={styles.retryButton} onClick={fetchEmails}>
          {t('app.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <p className={styles.intro}>{t('settings.notifications.intro')}</p>

      <div className={styles.emailList}>
        {data?.emails.map((email) => (
          <div
            key={email.templateName}
            className={`${styles.emailRow} ${!email.enabled ? styles.disabled : ''}`}
          >
            <div className={styles.emailInfo}>
              <div className={styles.emailName}>{email.displayName}</div>
              <div className={styles.emailDesc}>{email.description}</div>
            </div>
            <div className={styles.emailActions}>
              <button
                className={styles.editBtn}
                onClick={() => setSelectedTemplate(email.templateName)}
                title={t('settings.notifications.customize')}
              >
                {t('settings.notifications.customize')}
              </button>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={email.enabled}
                  disabled={togglingId === email.templateName}
                  onChange={() => handleToggle(email.templateName, email.enabled)}
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <EmailNotificationModal templateName={selectedTemplate} onClose={handleCloseModal} />
      )}
    </div>
  );
}
