import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { createJobOffer } from '../../services/jobOffersApi';
import { getOrganizationClients, getCreatedClients, createClient } from '../../services/clientsApi';
import { getCurrentUser } from '../../services/profileApi';
import { getSystemFeatures } from '../../services/portalApi';
import { jobOfferSchema, type JobOfferFormData } from '../../lib/validations/jobOffer.schema';
import PipelineEditor, { type PipelineStatus } from '../../components/pipeline/PipelineEditor';
import ClientFormModal, { type ClientFormData } from '../../components/modals/ClientFormModal';
import type { Client } from '../../types';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import { usePermissions } from '../../hooks/useRole';
import styles from './OfferForm.module.css';

// Pipeline por defecto
const DEFAULT_PIPELINE: PipelineStatus[] = [
  { id: 'temp-1', name: 'Aplicado', color: '#3B82F6', order: 1, isTerminal: false, action: 'NONE', sendNotification: true },
  { id: 'temp-2', name: 'Revision', color: '#8B5CF6', order: 2, isTerminal: false, action: 'NONE', sendNotification: true },
  { id: 'temp-3', name: 'Entrevista', color: '#06B6D4', order: 3, isTerminal: false, action: 'VIDEO_CALL', sendNotification: true },
  { id: 'temp-4', name: 'Contratado', color: '#22C55E', order: 4, isTerminal: true, action: 'NONE', sendNotification: true },
  { id: 'temp-5', name: 'Descartado', color: '#EF4444', order: 5, isTerminal: true, action: 'NONE', sendNotification: true },
];

export default function OfferCreatePage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { canCreateClient } = usePermissions();

  const [clients, setClients] = useState<Client[]>([]);
  const [pipeline, setPipeline] = useState<PipelineStatus[]>(DEFAULT_PIPELINE);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [storageEnabled, setStorageEnabled] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: formErrors },
  } = useForm<JobOfferFormData>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: {
      title: '',
      description: '',
      clientId: '',
      salary: '',
      location: '',
      modality: undefined,
      requirements: '',
      benefits: '',
      category: '',
      contractType: '',
      isPublic: true,
      salaryPublic: false,
      publicDisplayName: '',
    },
  });

  const isPublic = watch('isPublic');
  const salaryPublic = watch('salaryPublic');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch system features in parallel
        const systemFeaturesPromise = getSystemFeatures().catch(() => ({ storageEnabled: true }));

        // First get user to know role
        const userData = await getCurrentUser();
        logger.info('[OfferCreate] User role:', userData.role);

        // Fetch clients based on role:
        // - org_admin / org_recruiter: all organization clients
        // - recruiter (independent): created clients
        let clientsData: Client[] = [];
        try {
          if (userData.role === 'org_admin' || userData.role === 'org_recruiter') {
            logger.info('[OfferCreate] Fetching organization clients');
            clientsData = await getOrganizationClients();
          } else if (userData.role === 'recruiter') {
            logger.info('[OfferCreate] Fetching created clients (recruiter)');
            clientsData = await getCreatedClients();
          } else {
            // Fallback: organization clients
            logger.info('[OfferCreate] Unknown role, fetching organization clients');
            clientsData = await getOrganizationClients();
          }
        } catch (clientErr) {
          logger.error('[OfferCreate] Error fetching clients:', clientErr);
        }

        logger.info('[OfferCreate] Clients loaded:', clientsData.length);
        setClients(clientsData);
        // Set organization name as default public display name
        if (userData.organizationName) {
          setValue('publicDisplayName', userData.organizationName);
        }

        // Await system features
        const systemFeatures = await systemFeaturesPromise;
        setStorageEnabled(systemFeatures.storageEnabled);
      } catch (err) {
        logger.error('Error loading data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [setValue]);

  const onSubmit = async (data: JobOfferFormData) => {
    setLoading(true);
    setSubmitError(null);

    // Validar pipeline
    if (pipeline.length < 2) {
      setSubmitError(t('offers.pipelineMinStates'));
      setLoading(false);
      return;
    }
    const hasTerminal = pipeline.some(s => s.isTerminal);
    if (!hasTerminal) {
      setSubmitError(t('offers.pipelineNeedsFinal'));
      setLoading(false);
      return;
    }

    try {
      const offer = await createJobOffer({
        title: data.title.trim(),
        description: data.description.trim(),
        clientId: data.clientId,
        salary: data.salary?.trim() || undefined,
        location: data.location?.trim() || undefined,
        modality: data.modality || undefined,
        requirements: data.requirements?.trim() || undefined,
        benefits: data.benefits?.trim() || undefined,
        category: data.category?.trim() || undefined,
        contractType: data.contractType || undefined,
        isPublic: data.isPublic ?? true,
        salaryPublic: data.salaryPublic ?? false,
        publicDisplayName: data.publicDisplayName?.trim() || undefined,
        active: true,
        useStandardPipeline: false,
        customPipeline: pipeline.map(s => ({
          name: s.name,
          color: s.color,
          order: s.order,
          isTerminal: s.isTerminal,
          action: s.action === 'NONE' ? null : s.action,
          sendNotification: s.sendNotification,
        })),
      });

      navigate(`/app/offers/${offer.id}`);
    } catch (err) {
      setSubmitError(getErrorMessage(err) || t('offerCreate.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/app/offers');
  };

  // Handler para crear cliente desde el modal
  const handleClientCreate = async (data: ClientFormData) => {
    setCreatingClient(true);
    try {
      const newClient = await createClient({
        name: data.name,
        contact: data.contact,
        email: data.email,
        phone: data.phone,
      });
      // Añadir al principio de la lista (después de los default)
      const defaultClients = clients.filter(c => c.isDefault);
      const regularClients = clients.filter(c => !c.isDefault);
      setClients([...defaultClients, newClient, ...regularClients]);
      // Seleccionar automáticamente el nuevo cliente
      setValue('clientId', newClient.id);
      setShowClientModal(false);
      logger.info('[OfferCreate] Client created:', newClient.id);
    } catch (err) {
      logger.error('[OfferCreate] Error creating client:', err);
      throw err; // Re-throw para que el modal muestre el error
    } finally {
      setCreatingClient(false);
    }
  };

  if (loadingData) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleCancel}>
          {t('offers.backToOffers')}
        </button>
        <h1 className={styles.title}>{t('offerCreate.title')}</h1>
      </div>

      {/* Form */}
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        {/* Basic data */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('offerCreate.basicData')}</h2>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>
                {t('offerCreate.titleField')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                {...register('title')}
                className={`${styles.input} ${formErrors.title ? styles.inputError : ''}`}
                placeholder={t('offerCreate.titlePlaceholder')}
              />
              {formErrors.title && <span className={styles.errorText}>{formErrors.title.message}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                {t('offerCreate.client')} <span className={styles.required}>*</span>
              </label>
              <div className={styles.clientSelectRow}>
                <select
                  {...register('clientId')}
                  className={`${styles.select} ${styles.clientSelect} ${formErrors.clientId ? styles.inputError : ''}`}
                >
                  <option value="">{t('offerCreate.selectClient')}</option>
                  {/* Clientes por defecto primero */}
                  {clients.filter(c => c.isDefault).map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                  {/* Separador si hay clientes default y regulares */}
                  {clients.some(c => c.isDefault) && clients.some(c => !c.isDefault) && (
                    <option disabled>──────────</option>
                  )}
                  {/* Clientes regulares */}
                  {clients.filter(c => !c.isDefault).map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {canCreateClient && (
                  <button
                    type="button"
                    className={styles.quickClientButton}
                    onClick={() => setShowClientModal(true)}
                    title={t('offerCreate.newClient')}
                  >
                    + {t('offerCreate.newClientShort')}
                  </button>
                )}
              </div>
              {formErrors.clientId && <span className={styles.errorText}>{formErrors.clientId.message}</span>}
              <p className={styles.fieldHint}>{t('offerCreate.clientNotPublicHint')}</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t('offerCreate.publicDisplayName')}</label>
              <input
                type="text"
                {...register('publicDisplayName')}
                className={`${styles.input} ${formErrors.publicDisplayName ? styles.inputError : ''}`}
                placeholder={t('offerCreate.publicDisplayNamePlaceholder')}
              />
              {formErrors.publicDisplayName && <span className={styles.errorText}>{formErrors.publicDisplayName.message}</span>}
              <p className={styles.fieldHint}>{t('offerCreate.publicDisplayNameHint')}</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                {t('offerCreate.description')} <span className={styles.required}>*</span>
              </label>
              <textarea
                {...register('description')}
                className={`${styles.textarea} ${formErrors.description ? styles.inputError : ''}`}
                placeholder={t('offerCreate.descriptionPlaceholder')}
              />
              {formErrors.description && (
                <span className={styles.errorText}>{formErrors.description.message}</span>
              )}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>{t('offerCreate.salary')}</label>
                <input
                  type="text"
                  {...register('salary')}
                  className={styles.input}
                  placeholder={t('offerCreate.salaryPlaceholder')}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('offerCreate.location')}</label>
                <input
                  type="text"
                  {...register('location')}
                  className={styles.input}
                  placeholder={t('offerCreate.locationPlaceholder')}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('offerCreate.modality')}</label>
                <select
                  {...register('modality')}
                  className={styles.select}
                >
                  <option value="">{t('offerCreate.selectModality')}</option>
                  <option value="remote">{t('modality.remote')}</option>
                  <option value="onsite">{t('modality.onsite')}</option>
                  <option value="hybrid">{t('modality.hybrid')}</option>
                </select>
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>{t('offerCreate.category')}</label>
                <input
                  type="text"
                  {...register('category')}
                  className={styles.input}
                  placeholder={t('offerCreate.categoryPlaceholder')}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('offerCreate.contractType')}</label>
                <select
                  {...register('contractType')}
                  className={styles.select}
                >
                  <option value="">{t('offerCreate.selectContractType')}</option>
                  <option value="full-time">{t('contractType.fullTime')}</option>
                  <option value="part-time">{t('contractType.partTime')}</option>
                  <option value="contract">{t('contractType.contract')}</option>
                  <option value="freelance">{t('contractType.freelance')}</option>
                  <option value="internship">{t('contractType.internship')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements and Benefits */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('offerCreate.detailsSection')}</h2>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label className={styles.label}>{t('offerCreate.requirements')}</label>
              <textarea
                {...register('requirements')}
                className={styles.textarea}
                placeholder={t('offerCreate.requirementsPlaceholder')}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>{t('offerCreate.benefits')}</label>
              <textarea
                {...register('benefits')}
                className={styles.textarea}
                placeholder={t('offerCreate.benefitsPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('offerCreate.visibilitySection')}</h2>

          <div className={styles.fieldGroup}>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isPublic ?? true}
                  onChange={(e) => setValue('isPublic', e.target.checked)}
                  className={styles.checkbox}
                />
                <span>{t('offerCreate.isPublic')}</span>
              </label>
              <p className={styles.checkboxHint}>{t('offerCreate.isPublicHint')}</p>
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={salaryPublic ?? false}
                  onChange={(e) => setValue('salaryPublic', e.target.checked)}
                  className={styles.checkbox}
                />
                <span>{t('offerCreate.salaryPublic')}</span>
              </label>
              <p className={styles.checkboxHint}>{t('offerCreate.salaryPublicHint')}</p>
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('offers.pipelineSection')}</h2>

          <PipelineEditor
            statuses={pipeline}
            onChange={setPipeline}
            storageEnabled={storageEnabled}
          />
        </div>

        {/* Error message */}
        {submitError && <div className={styles.formError}>{submitError}</div>}

        {/* Actions */}
        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={handleCancel}>
            {t('app.cancel')}
          </button>
          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? t('app.creating') : t('offerCreate.createButton')}
          </button>
        </div>
      </form>

      {/* Modal para crear cliente */}
      <ClientFormModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSubmit={handleClientCreate}
        isLoading={creatingClient}
      />
    </div>
  );
}
