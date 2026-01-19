import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getOrganization,
  updateOrganization,
  uploadOrganizationImage,
  getSystemFeatures,
  type Organization,
  type OrganizationImageType,
} from '../../features/portal/services/portalApi';
import { usePermissions } from '../../hooks/useRole';
import { portalSettingsSchema, type PortalSettingsFormData } from '../../lib/validations/portal.schema';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import { ImageUpload } from '../../components/ImageUpload';
import styles from './PortalSettingsPage.module.css';

type ToastType = 'success' | 'error' | null;

export default function PortalSettingsPage() {
  const { t } = useTranslation('common');
  const permissions = usePermissions();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [storageEnabled, setStorageEnabled] = useState(true);

  const [toast, setToast] = useState<{ message: string; type: ToastType }>({ message: '', type: null });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors: formErrors },
  } = useForm<PortalSettingsFormData>({
    resolver: zodResolver(portalSettingsSchema),
    defaultValues: {
      domain: '',
      portalTitle: '',
      portalSubtitle: '',
      useBrandingOnCandidatePage: false,
      candidatePageTitle: '',
      candidatePageSubtitle: '',
    },
  });

  const domain = watch('domain');
  const useBrandingOnCandidatePage = watch('useBrandingOnCandidatePage');

  // Generar la URL del portal público
  const getPortalUrl = () => {
    const slug = domain || organization?.slug;
    if (!slug) return null;
    const baseUrl = window.location.origin;
    return `${baseUrl}/org/${slug}/jobs`;
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  // Handler para upload de imágenes
  const handleImageUpload = useCallback(
    async (file: File, imageType: OrganizationImageType): Promise<string> => {
      const result = await uploadOrganizationImage(file, imageType);
      // Actualizar el estado local y el formulario con la nueva URL
      setOrganization((prev) => {
        if (!prev) return prev;
        const fieldMap: Record<OrganizationImageType, keyof Organization> = {
          logo: 'logoUrl',
          header: 'headerImageUrl',
          candidateLogo: 'candidatePageLogoUrl',
          candidateHeader: 'candidatePageHeaderImageUrl',
        };
        return { ...prev, [fieldMap[imageType]]: result.imageUrl };
      });
      showToast(t('toast.updated'), 'success');
      return result.imageUrl;
    },
    [t]
  );

  // Handler para eliminar imagen (poner URL vacía)
  const handleImageRemove = useCallback(
    async (imageType: OrganizationImageType) => {
      const fieldMap: Record<OrganizationImageType, keyof Organization> = {
        logo: 'logoUrl',
        header: 'headerImageUrl',
        candidateLogo: 'candidatePageLogoUrl',
        candidateHeader: 'candidatePageHeaderImageUrl',
      };
      const field = fieldMap[imageType];

      try {
        await updateOrganization({ [field]: '' });
        setOrganization((prev) => {
          if (!prev) return prev;
          return { ...prev, [field]: '' };
        });
        showToast(t('toast.updated'), 'success');
      } catch (err) {
        showToast(getErrorMessage(err) || t('toast.error'), 'error');
      }
    },
    [t]
  );

  const fetchOrganization = async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtener datos en paralelo
      const [orgData, features] = await Promise.all([
        getOrganization(),
        getSystemFeatures().catch(() => ({ storageEnabled: true })), // Fallback si falla
      ]);

      setOrganization(orgData);
      setStorageEnabled(features.storageEnabled);
      reset({
        domain: orgData.domain || '',
        portalTitle: orgData.portalTitle || '',
        portalSubtitle: orgData.portalSubtitle || '',
        useBrandingOnCandidatePage: orgData.useBrandingOnCandidatePage || false,
        candidatePageTitle: orgData.candidatePageTitle || '',
        candidatePageSubtitle: orgData.candidatePageSubtitle || '',
      });
    } catch (err) {
      setError(getErrorMessage(err) || t('settings.portal.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, []);

  const onSubmit = async (data: PortalSettingsFormData) => {
    setSaving(true);
    try {
      const updated = await updateOrganization({
        domain: data.domain?.trim() || undefined,
        portalTitle: data.portalTitle?.trim() ?? '',
        portalSubtitle: data.portalSubtitle?.trim() ?? '',
        useBrandingOnCandidatePage: data.useBrandingOnCandidatePage,
        candidatePageTitle: data.candidatePageTitle?.trim() ?? '',
        candidatePageSubtitle: data.candidatePageSubtitle?.trim() ?? '',
      });
      setOrganization(updated);
      showToast(t('settings.portal.updated'), 'success');
    } catch (err) {
      showToast(getErrorMessage(err) || t('toast.error'), 'error');
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
        <button className={styles.retryButton} onClick={fetchOrganization}>
          {t('app.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('settings.portal.title')}</h1>
        <p className={styles.subtitle}>{t('settings.portal.subtitle')}</p>
      </header>

      <form className={styles.card} onSubmit={handleSubmit(onSubmit)}>
        {/* URL del portal */}
        <div className={styles.field}>
          <label className={styles.label}>{t('settings.portal.urlLabel')}</label>
          <p className={styles.fieldDescription}>{t('settings.portal.urlDescription')}</p>
          <div className={styles.portalUrlGroup}>
            <span className={styles.portalUrlPrefix}>{window.location.origin}/org/</span>
            <input
              type="text"
              {...register('domain')}
              className={`${styles.portalInput} ${formErrors.domain ? styles.inputError : ''}`}
              placeholder="mi-empresa"
              disabled={!permissions.canEditOrgData}
            />
            <span className={styles.portalUrlSuffix}>/jobs</span>
          </div>
          {formErrors.domain && <span className={styles.errorText}>{formErrors.domain.message}</span>}
          {getPortalUrl() && (
            <div className={styles.portalPreview}>
              <span className={styles.portalPreviewLabel}>{t('settings.portal.portalPreviewLabel')}</span>
              <a
                href={getPortalUrl()!}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.portalLink}
              >
                {getPortalUrl()}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.externalIcon}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>
          )}
        </div>

        {/* Título del portal */}
        <div className={styles.field}>
          <label className={styles.label}>{t('settings.portal.titleLabel')}</label>
          <input
            type="text"
            {...register('portalTitle')}
            className={`${styles.input} ${formErrors.portalTitle ? styles.inputError : ''}`}
            placeholder={organization?.name || t('settings.portal.titlePlaceholder')}
            disabled={!permissions.canEditOrgData}
          />
          {formErrors.portalTitle && <span className={styles.errorText}>{formErrors.portalTitle.message}</span>}
          <span className={styles.hint}>{t('settings.portal.titleHint')}</span>
        </div>

        {/* Subtítulo/frase del portal */}
        <div className={styles.field}>
          <label className={styles.label}>{t('settings.portal.subtitleLabel')}</label>
          <input
            type="text"
            {...register('portalSubtitle')}
            className={`${styles.input} ${formErrors.portalSubtitle ? styles.inputError : ''}`}
            placeholder={t('settings.portal.subtitlePlaceholder')}
            disabled={!permissions.canEditOrgData}
          />
          {formErrors.portalSubtitle && <span className={styles.errorText}>{formErrors.portalSubtitle.message}</span>}
          <span className={styles.hint}>{t('settings.portal.subtitleHint')}</span>
        </div>

        {/* Logo y cabecera - solo si storage está habilitado */}
        {storageEnabled && (
          <>
            {/* Logo */}
            <ImageUpload
              currentImageUrl={organization?.logoUrl}
              onUpload={(file) => handleImageUpload(file, 'logo')}
              onRemove={() => handleImageRemove('logo')}
              label={t('settings.portal.logoLabel')}
              hint={t('settings.portal.logoHint')}
              dimensions={t('settings.portal.logoDimensions')}
              previewType="logo"
              disabled={!permissions.canEditOrgData}
              maxSizeKB={500}
            />

            {/* Imagen de cabecera */}
            <ImageUpload
              currentImageUrl={organization?.headerImageUrl}
              onUpload={(file) => handleImageUpload(file, 'header')}
              onRemove={() => handleImageRemove('header')}
              label={t('settings.portal.headerImageLabel')}
              hint={t('settings.portal.headerImageHint')}
              dimensions={t('settings.portal.headerImageDimensions')}
              previewType="header"
              disabled={!permissions.canEditOrgData}
              maxSizeKB={2048}
            />
          </>
        )}

        {/* Sección de branding para página del candidato */}
        <div className={styles.candidateBrandingSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('settings.portal.candidateBrandingTitle')}</h2>
            <p className={styles.sectionDescription}>{t('settings.portal.candidateBrandingDescription')}</p>
          </div>

          {/* Checkbox para activar branding */}
          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                {...register('useBrandingOnCandidatePage')}
                className={styles.checkbox}
                disabled={!permissions.canEditOrgData}
              />
              <span className={styles.checkboxText}>{t('settings.portal.useBrandingOnCandidatePage')}</span>
            </label>
            <span className={styles.hint}>{t('settings.portal.useBrandingOnCandidatePageHint')}</span>
          </div>

          {/* Campos de personalización (solo si está activado el branding) */}
          {useBrandingOnCandidatePage && (
            <div className={styles.candidateBrandingFields}>
              <p className={styles.inheritHint}>{t('settings.portal.candidateFieldsHint')}</p>

              {/* Logo y cabecera para candidato - solo si storage está habilitado */}
              {storageEnabled && (
                <>
                  {/* Logo para candidato */}
                  <ImageUpload
                    currentImageUrl={organization?.candidatePageLogoUrl}
                    onUpload={(file) => handleImageUpload(file, 'candidateLogo')}
                    onRemove={() => handleImageRemove('candidateLogo')}
                    label={t('settings.portal.candidateLogoLabel')}
                    previewType="logo"
                    disabled={!permissions.canEditOrgData}
                    maxSizeKB={500}
                  />

                  {/* Imagen de cabecera para candidato */}
                  <ImageUpload
                    currentImageUrl={organization?.candidatePageHeaderImageUrl}
                    onUpload={(file) => handleImageUpload(file, 'candidateHeader')}
                    onRemove={() => handleImageRemove('candidateHeader')}
                    label={t('settings.portal.candidateHeaderImageLabel')}
                    previewType="header"
                    disabled={!permissions.canEditOrgData}
                    maxSizeKB={2048}
                  />
                </>
              )}

              {/* Título para candidato */}
              <div className={styles.field}>
                <label className={styles.label}>{t('settings.portal.candidateTitleLabel')}</label>
                <input
                  type="text"
                  {...register('candidatePageTitle')}
                  className={`${styles.input} ${formErrors.candidatePageTitle ? styles.inputError : ''}`}
                  placeholder={watch('portalTitle') || organization?.name || t('settings.portal.candidateTitlePlaceholder')}
                  disabled={!permissions.canEditOrgData}
                />
                {formErrors.candidatePageTitle && <span className={styles.errorText}>{formErrors.candidatePageTitle.message}</span>}
              </div>

              {/* Subtítulo para candidato */}
              <div className={styles.field}>
                <label className={styles.label}>{t('settings.portal.candidateSubtitleLabel')}</label>
                <input
                  type="text"
                  {...register('candidatePageSubtitle')}
                  className={`${styles.input} ${formErrors.candidatePageSubtitle ? styles.inputError : ''}`}
                  placeholder={watch('portalSubtitle') || t('settings.portal.candidateSubtitlePlaceholder')}
                  disabled={!permissions.canEditOrgData}
                />
                {formErrors.candidatePageSubtitle && <span className={styles.errorText}>{formErrors.candidatePageSubtitle.message}</span>}
              </div>
            </div>
          )}
        </div>

        {permissions.canEditOrgData && (
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving}
            >
              {saving ? t('app.saving') : t('settings.portal.saveChanges')}
            </button>
          </div>
        )}

        {!permissions.canEditOrgData && (
          <p className={styles.readOnlyNotice}>
            {t('settings.portal.adminOnly')}
          </p>
        )}
      </form>

      {/* Toast */}
      {toast.type && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
