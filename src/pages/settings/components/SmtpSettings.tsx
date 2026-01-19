import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getUserSmtpConfig,
  setUserSmtpConfig,
  testSmtpConnection,
  type UserSmtpConfig,
} from '../../../features/email/services/emailApi';
import styles from './SmtpSettings.module.css';

interface SmtpFormData {
  host: string;
  port: string;
  username: string;
  password: string;
  secure: boolean;
}

export default function SmtpSettings() {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [existingConfig, setExistingConfig] = useState<UserSmtpConfig | null>(null);
  const [formData, setFormData] = useState<SmtpFormData>({
    host: '',
    port: '587',
    username: '',
    password: '',
    secure: false,
  });

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const config = await getUserSmtpConfig();
      setExistingConfig(config);
      if (config) {
        setFormData({
          host: config.host,
          port: String(config.port),
          username: config.username,
          password: '', // No se devuelve por seguridad
          secure: config.secure,
        });
      }
    } catch {
      // Sin config previa
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setTestResult(null);
  };

  const validateForm = (): boolean => {
    if (!formData.host || !formData.port || !formData.username) {
      showToast(t('settings.smtp.completeRequired'), 'error');
      return false;
    }
    // Si no hay config previa, password es obligatoria
    if (!existingConfig && !formData.password) {
      showToast(t('settings.smtp.completeRequired'), 'error');
      return false;
    }
    return true;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) return;

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testSmtpConnection({
        host: formData.host,
        port: parseInt(formData.port, 10),
        username: formData.username,
        password: formData.password,
        secure: formData.secure,
      });
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: t('settings.smtp.testError') });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await setUserSmtpConfig({
        host: formData.host,
        port: parseInt(formData.port, 10),
        username: formData.username,
        password: formData.password,
        secure: formData.secure,
      });
      showToast(t('settings.smtp.configSaved'), 'success');
      loadConfig(); // Recargar para actualizar estado
    } catch {
      showToast(t('settings.smtp.saveError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <p className={styles.intro}>{t('settings.smtp.intro')}</p>

      {/* Status indicator */}
      {existingConfig && (
        <div className={styles.statusCard}>
          <span className={styles.statusDot} />
          <span>{t('settings.smtp.configured')}</span>
        </div>
      )}

      {/* Form */}
      <div className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t('settings.smtp.host')}</label>
            <input
              type="text"
              name="host"
              className={styles.input}
              placeholder="smtp.gmail.com"
              value={formData.host}
              onChange={handleChange}
            />
          </div>
          <div className={styles.fieldSmall}>
            <label className={styles.label}>{t('settings.smtp.port')}</label>
            <input
              type="text"
              name="port"
              className={styles.input}
              placeholder="587"
              value={formData.port}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t('settings.smtp.user')}</label>
            <input
              type="text"
              name="username"
              className={styles.input}
              placeholder="tu@email.com"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('settings.smtp.password')}
              {existingConfig && <span className={styles.optional}> ({t('settings.smtp.leaveEmpty')})</span>}
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={styles.input}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="secure"
            checked={formData.secure}
            onChange={handleChange}
          />
          <span>{t('settings.smtp.useSsl')}</span>
        </label>
      </div>

      {/* Test result */}
      {testResult && (
        <div className={`${styles.testResult} ${testResult.success ? styles.success : styles.error}`}>
          {testResult.success ? '✓' : '✗'} {testResult.message}
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.testButton}
          onClick={handleTestConnection}
          disabled={testing || saving}
        >
          {testing ? t('settings.smtp.testing') : t('settings.smtp.testButton')}
        </button>
        <button
          className={styles.saveButton}
          onClick={handleSave}
          disabled={saving || testing}
        >
          {saving ? t('app.saving') : t('app.save')}
        </button>
      </div>

      {/* Help */}
      <div className={styles.help}>
        <p className={styles.helpTitle}>{t('settings.smtp.helpTitle')}</p>
        <ul className={styles.helpList}>
          <li>{t('settings.smtp.help1')}</li>
          <li>{t('settings.smtp.help2')}</li>
          <li>{t('settings.smtp.help3')}</li>
        </ul>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
