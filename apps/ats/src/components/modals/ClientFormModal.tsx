import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { clientSimpleSchema, type ClientSimpleFormData } from '../../lib/validations/client.schema';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import styles from './ClientFormModal.module.css';

export interface ClientFormData {
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
}

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  isLoading?: boolean;
  /** Datos iniciales para edición */
  initialData?: ClientFormData;
  /** Título del modal (opcional, usa traducción por defecto) */
  title?: string;
}

/**
 * Modal para crear o editar un cliente.
 * Incluye todos los campos: nombre (obligatorio), contacto, email, teléfono.
 */
export function ClientFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  title,
}: ClientFormModalProps) {
  const { t } = useTranslation('common');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
    setError,
  } = useForm<ClientSimpleFormData>({
    resolver: zodResolver(clientSimpleSchema),
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      phone: '',
    },
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || '',
        contact: initialData?.contact || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
      });
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: ClientSimpleFormData) => {
    try {
      await onSubmit({
        name: data.name.trim(),
        contact: data.contact?.trim() || undefined,
        email: data.email?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
      });
      reset();
    } catch (err) {
      setError('root', { message: getErrorMessage(err) || t('toast.error') });
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      onClose();
    }
  };

  const isEditing = !!initialData;
  const modalTitle = title || (isEditing ? t('clients.editClient') : t('clients.newClientTitle'));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={modalTitle}
      size="md"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="clientName" className={styles.label}>
            {t('clients.nameLabel')} <span className={styles.required}>*</span>
          </label>
          <input
            id="clientName"
            type="text"
            {...register('name')}
            className={`${styles.input} ${formErrors.name ? styles.inputError : ''}`}
            placeholder={t('clients.namePlaceholder')}
            disabled={isLoading}
            autoFocus
          />
          {formErrors.name && <span className={styles.errorText}>{formErrors.name.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="clientContact" className={styles.label}>
            {t('clients.contactLabel')}
          </label>
          <input
            id="clientContact"
            type="text"
            {...register('contact')}
            className={`${styles.input} ${formErrors.contact ? styles.inputError : ''}`}
            placeholder={t('clients.contactPlaceholder')}
            disabled={isLoading}
          />
          {formErrors.contact && <span className={styles.errorText}>{formErrors.contact.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="clientEmail" className={styles.label}>
            {t('clients.emailLabel')}
          </label>
          <input
            id="clientEmail"
            type="email"
            {...register('email')}
            className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
            placeholder="email@client.com"
            disabled={isLoading}
          />
          {formErrors.email && <span className={styles.errorText}>{formErrors.email.message}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="clientPhone" className={styles.label}>
            {t('clients.phoneLabel')}
          </label>
          <input
            id="clientPhone"
            type="tel"
            {...register('phone')}
            className={`${styles.input} ${formErrors.phone ? styles.inputError : ''}`}
            placeholder={t('clients.phonePlaceholder')}
            disabled={isLoading}
          />
          {formErrors.phone && <span className={styles.errorText}>{formErrors.phone.message}</span>}
        </div>

        {formErrors.root && <div className={styles.error}>{formErrors.root.message}</div>}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t('app.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            {isEditing ? t('app.save') : t('clients.createButton')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ClientFormModal;
