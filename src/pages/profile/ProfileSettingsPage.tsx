import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  updateOrganization,
  type UserProfile,
} from '../../features/profile/services/profileApi';
import styles from './ProfileSettingsPage.module.css';

type ToastType = 'success' | 'error' | null;

export default function ProfileSettingsPage() {
  const { t } = useTranslation('common');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');

  // Password form states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: ToastType }>({ message: '', type: null });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCurrentUser();
      setUser(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setEmail(data.email);
      setOrganizationName(data.organizationName || '');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || t('settings.profile.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile({ firstName, lastName, email });
      setUser(updated);
      showToast(t('settings.profile.saved'), 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || t('settings.profile.saveError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateOrganization({ name: organizationName });
      showToast(t('settings.profile.organizationSaved'), 'success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      showToast(error.response?.data?.message || t('settings.profile.organizationSaveError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.profile.passwordMismatch'));
      return;
    }

    if (newPassword.length < 12) {
      setPasswordError(t('settings.profile.passwordTooShort'));
      return;
    }

    setSaving(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      showToast(t('settings.profile.passwordChanged'), 'success');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setPasswordError(error.response?.data?.message || t('settings.profile.passwordChangeError'));
    } finally {
      setSaving(false);
    }
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
        <h3>{t('app.error')}</h3>
        <p>{error}</p>
        <button className={styles.retryButton} onClick={fetchUser}>
          {t('app.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('settings.profile.title')}</h1>
        <p className={styles.subtitle}>{t('settings.profile.subtitle')}</p>
      </header>

      {/* Datos personales */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.profile.personalData')}</h2>
        <form onSubmit={handleSaveProfile} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.label}>{t('settings.profile.firstName')}</label>
              <input
                type="text"
                className={styles.input}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.label}>{t('settings.profile.lastName')}</label>
              <input
                type="text"
                className={styles.input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.label}>{t('settings.profile.email')}</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton} disabled={saving}>
              {saving ? t('app.saving') : t('settings.profile.save')}
            </button>
          </div>
        </form>
      </section>

      {/* Organizacion - Solo visible para admin y recruiter independiente */}
      {(user?.role === 'org_admin' || user?.role === 'recruiter') && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('settings.profile.organization')}</h2>
          <form onSubmit={handleSaveOrganization} className={styles.form}>
            <div className={styles.formField}>
              <label className={styles.label}>{t('settings.profile.organizationName')}</label>
              <input
                type="text"
                className={styles.input}
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
              />
              <p className={styles.fieldHint}>{t('settings.profile.organizationHint')}</p>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveButton} disabled={saving}>
                {saving ? t('app.saving') : t('settings.profile.save')}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Cambiar contraseña */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('settings.profile.password')}</h2>
          {!showPasswordForm && (
            <button
              type="button"
              className={styles.changePasswordButton}
              onClick={() => setShowPasswordForm(true)}
            >
              {t('settings.profile.changePassword')}
            </button>
          )}
        </div>

        {showPasswordForm ? (
          <form onSubmit={handleChangePassword} className={styles.form}>
            {passwordError && (
              <div className={styles.errorMessage}>{passwordError}</div>
            )}

            <div className={styles.formField}>
              <label className={styles.label}>{t('settings.profile.currentPassword')}</label>
              <input
                type="password"
                className={styles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>{t('settings.profile.newPassword')}</label>
              <input
                type="password"
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className={styles.fieldHint}>{t('settings.profile.passwordRequirements')}</p>
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>{t('settings.profile.confirmPassword')}</label>
              <input
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordError(null);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                {t('app.cancel')}
              </button>
              <button type="submit" className={styles.saveButton} disabled={saving}>
                {saving ? t('app.saving') : t('settings.profile.savePassword')}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.infoCard}>
            <p>{t('settings.profile.passwordInfo')}</p>
          </div>
        )}
      </section>

      {/* Toast */}
      {toast.type && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
