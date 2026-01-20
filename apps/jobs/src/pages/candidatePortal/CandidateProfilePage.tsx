import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  getCandidateProfile,
  updateCandidateProfile,
  changePassword,
  type CandidateProfile,
} from '../../features/candidatePortal/services/candidatePortalApi';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import styles from './CandidateProfilePage.module.css';

type ToastType = 'success' | 'error' | null;

// Schema for profile form (without experience)
const profileSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Schema for password change
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma la nueva contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function CandidateProfilePage() {
  const { t } = useTranslation('common');
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType }>({ message: '', type: null });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCandidateProfile();
        setProfile(data);
        resetProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || '',
        });
      } catch (err) {
        setError(getErrorMessage(err) || t('candidatePortal.profile.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [resetProfile, t]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      const updated = await updateCandidateProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone?.trim() || undefined,
      });
      setProfile(updated);
      showToast(t('candidatePortal.profile.profileUpdated'), 'success');
    } catch (err) {
      showToast(getErrorMessage(err) || t('app.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setSavingPassword(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      resetPassword();
      showToast(t('candidatePortal.profile.passwordChanged'), 'success');
    } catch (err) {
      showToast(getErrorMessage(err) || t('app.error'), 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <p>{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <p>{error || t('candidatePortal.profile.loadError')}</p>
          <Link to="/portal" className={styles.backLink}>
            ← {t('candidatePortal.profile.back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>{t('candidatePortal.profile.title')}</h1>
      </header>

      {/* Content */}
      <main className={styles.content}>
        {/* Personal data form */}
        <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('candidatePortal.profile.personalData')}</h2>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>{t('candidatePortal.profile.firstNameLabel')}</label>
                <input
                  type="text"
                  {...registerProfile('firstName')}
                  className={`${styles.input} ${profileErrors.firstName ? styles.inputError : ''}`}
                />
                {profileErrors.firstName && <span className={styles.errorText}>{profileErrors.firstName.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('candidatePortal.profile.lastNameLabel')}</label>
                <input
                  type="text"
                  {...registerProfile('lastName')}
                  className={`${styles.input} ${profileErrors.lastName ? styles.inputError : ''}`}
                />
                {profileErrors.lastName && <span className={styles.errorText}>{profileErrors.lastName.message}</span>}
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>{t('candidatePortal.profile.emailLabel')}</label>
                <input
                  type="email"
                  className={styles.input}
                  value={profile.email}
                  disabled
                />
                <span className={styles.fieldHint}>{t('candidatePortal.profile.emailCannotChange')}</span>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('candidatePortal.profile.phoneLabel')}</label>
                <input
                  type="tel"
                  {...registerProfile('phone')}
                  className={`${styles.input} ${profileErrors.phone ? styles.inputError : ''}`}
                  placeholder={t('candidatePortal.profile.phonePlaceholder')}
                />
                {profileErrors.phone && <span className={styles.errorText}>{profileErrors.phone.message}</span>}
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={saving}
              >
                {saving ? t('app.saving') : t('candidatePortal.profile.saveChanges')}
              </button>
            </div>
          </section>
        </form>

        {/* Password change form */}
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('candidatePortal.profile.changePassword')}</h2>

            <div className={styles.field}>
              <label className={styles.label}>{t('candidatePortal.profile.currentPassword')}</label>
              <input
                type="password"
                {...registerPassword('currentPassword')}
                className={`${styles.input} ${passwordErrors.currentPassword ? styles.inputError : ''}`}
              />
              {passwordErrors.currentPassword && <span className={styles.errorText}>{passwordErrors.currentPassword.message}</span>}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>{t('candidatePortal.profile.newPassword')}</label>
                <input
                  type="password"
                  {...registerPassword('newPassword')}
                  className={`${styles.input} ${passwordErrors.newPassword ? styles.inputError : ''}`}
                />
                {passwordErrors.newPassword && <span className={styles.errorText}>{passwordErrors.newPassword.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('candidatePortal.profile.confirmPassword')}</label>
                <input
                  type="password"
                  {...registerPassword('confirmPassword')}
                  className={`${styles.input} ${passwordErrors.confirmPassword ? styles.inputError : ''}`}
                />
                {passwordErrors.confirmPassword && <span className={styles.errorText}>{passwordErrors.confirmPassword.message}</span>}
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={savingPassword}
              >
                {savingPassword ? t('app.saving') : t('candidatePortal.profile.changePassword')}
              </button>
            </div>
          </section>
        </form>
      </main>

      {/* Toast */}
      {toast.type && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
