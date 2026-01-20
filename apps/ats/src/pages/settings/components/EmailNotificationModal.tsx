import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getOrgEmailTemplate,
  updateOrgEmailConfig,
  resetOrgEmailTemplate,
  type OrgEmailTemplateDetail,
} from '../../../services/orgEmailApi';
import styles from './EmailNotificationModal.module.css';

interface Props {
  templateName: string;
  onClose: () => void;
}

export default function EmailNotificationModal({ templateName, onClose }: Props) {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<OrgEmailTemplateDetail | null>(null);

  // Form state
  const [enabled, setEnabled] = useState(true);
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'original' | 'preview'>('edit');

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOrgEmailTemplate(templateName);
        setTemplate(data);
        setEnabled(data.enabled);
        setCustomSubject(data.customSubject || '');
        setCustomBody(data.customBody || data.originalBody || '');
      } catch {
        setError(t('settings.notifications.modal.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateName]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateOrgEmailConfig(templateName, {
        enabled,
        customSubject: customSubject.trim() || null,
        customBody: customBody.trim() || null,
      });
      onClose();
    } catch {
      setError(t('settings.notifications.modal.errorSaving'));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(t('settings.notifications.modal.confirmReset'))) return;

    setSaving(true);
    try {
      await resetOrgEmailTemplate(templateName);
      onClose();
    } catch {
      setError(t('settings.notifications.modal.errorResetting'));
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    const varText = `{{${variable}}}`;
    setCustomBody((prev) => prev + varText);
  };

  // Generate preview by replacing variables with sample data
  const getPreview = () => {
    if (!template) return '';
    let preview = customBody || template.originalBody || '';

    const sampleData: Record<string, string> = {
      candidateName: 'Juan García',
      organizationName: 'Acme Corp',
      offerTitle: 'Desarrollador Senior',
      recruiterName: 'María López',
      interviewDate: '15 de enero de 2026',
      interviewTime: '10:00 AM',
      interviewLocation: 'Oficina central',
      interviewType: 'Presencial',
      accessUrl: 'https://example.com/portal',
      portalUrl: 'https://example.com/portal',
      applicationUrl: 'https://example.com/apply',
      shareUrl: 'https://example.com/share',
      messagePreview: 'Hola, me gustaría saber más sobre...',
      recipientName: 'Carlos Pérez',
      senderName: 'Ana Martínez',
      message: 'Te recomiendo este candidato para la posición.',
    };

    template.variables.forEach((variable) => {
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
      preview = preview.replace(regex, sampleData[variable] || `[${variable}]`);
    });

    return preview;
  };

  if (loading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.loading}>{t('app.loading')}</div>
        </div>
      </div>
    );
  }

  if (error && !template) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.error}>
            <p>{error}</p>
            <button className={styles.closeButton} onClick={onClose}>
              {t('app.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{template?.templateName}</h2>
            <p className={styles.description}>{template?.description}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Content */}
        <div className={styles.content}>
          {/* Enabled toggle */}
          <div className={styles.enabledRow}>
            <label className={styles.enabledLabel}>
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              <span>{t('settings.notifications.modal.enableEmail')}</span>
            </label>
            {!enabled && (
              <span className={styles.warningText}>
                {t('settings.notifications.modal.emailDisabledWarning')}
              </span>
            )}
          </div>

          {/* Variables */}
          <div className={styles.variablesSection}>
            <h4>{t('settings.notifications.modal.availableVariables')}</h4>
            <div className={styles.variablesList}>
              {template?.variables.map((variable) => (
                <button
                  key={variable}
                  className={styles.variableTag}
                  onClick={() => insertVariable(variable)}
                  type="button"
                >
                  {`{{${variable}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className={styles.formGroup}>
            <label>{t('settings.notifications.modal.customSubject')}</label>
            <input
              type="text"
              className={styles.input}
              placeholder={template?.defaultSubject}
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
            />
            <span className={styles.hint}>
              {t('settings.notifications.modal.subjectHint', { default: template?.defaultSubject })}
            </span>
          </div>

          {/* Body */}
          <div className={styles.formGroup}>
            <label>{t('settings.notifications.modal.emailBody')}</label>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'edit' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('edit')}
              >
                {t('settings.notifications.modal.edit')}
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'original' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('original')}
              >
                {t('settings.notifications.modal.original')}
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'preview' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('preview')}
              >
                {t('settings.notifications.modal.preview')}
              </button>
            </div>

            {activeTab === 'edit' && (
              <textarea
                className={styles.textarea}
                rows={12}
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                placeholder={t('settings.notifications.modal.bodyPlaceholder')}
              />
            )}

            {activeTab === 'original' && (
              <div className={styles.originalContainer}>
                <pre className={styles.originalCode}>{template?.originalBody || 'N/A'}</pre>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className={styles.previewContainer}>
                <div className={styles.preview} dangerouslySetInnerHTML={{ __html: getPreview() }} />
              </div>
            )}
          </div>

          {/* Stats */}
          {(template?.sentCount ?? 0) > 0 && (
            <div className={styles.statsRow}>
              <span>
                <strong>{t('settings.notifications.modal.totalSent')}:</strong> {template?.sentCount}
              </span>
              {template?.lastSentAt && (
                <span>
                  <strong>{t('settings.notifications.modal.lastSent')}:</strong>{' '}
                  {new Date(template.lastSentAt).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.resetButton} onClick={handleReset} disabled={saving}>
            {t('settings.notifications.modal.resetToDefault')}
          </button>
          <div className={styles.footerRight}>
            <button className={styles.cancelButton} onClick={onClose} disabled={saving}>
              {t('app.cancel')}
            </button>
            <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
              {saving ? t('app.saving') : t('app.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
