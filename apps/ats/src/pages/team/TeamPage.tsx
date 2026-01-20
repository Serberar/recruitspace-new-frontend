import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getOrganizationMembers,
  createOrgRecruiter,
  updateOrgRecruiter,
  updateRecruiterStatus,
  type TeamMember,
} from '../../services/teamApi';
import { usePermissions } from '../../hooks/useRole';
import {
  createRecruiterSchema,
  editRecruiterSchema,
  type CreateRecruiterFormData,
  type EditRecruiterFormData
} from '../../lib/validations/portal.schema';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import styles from './TeamPage.module.css';

type ToastType = 'success' | 'error' | null;

export default function TeamPage() {
  const { t } = useTranslation('common');
  const permissions = usePermissions();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState<TeamMember | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType }>({ message: '', type: null });

  // Formulario para crear
  const createForm = useForm<CreateRecruiterFormData>({
    resolver: zodResolver(createRecruiterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  // Formulario para editar
  const editForm = useForm<EditRecruiterFormData>({
    resolver: zodResolver(editRecruiterSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  // Usar el formulario correspondiente según el modo
  const currentForm = editingMember ? editForm : createForm;
  const { register, handleSubmit, formState: { errors: formErrors } } = currentForm;

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrganizationMembers();
      setMembers(data);
    } catch (err) {
      setError(getErrorMessage(err) || t('team.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenCreate = () => {
    setEditingMember(null);
    createForm.reset({ firstName: '', lastName: '', email: '', password: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    editForm.reset({ firstName: member.firstName, lastName: member.lastName, email: member.email, password: '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setShowPassword(false);
    createForm.reset({ firstName: '', lastName: '', email: '', password: '' });
    editForm.reset({ firstName: '', lastName: '', email: '', password: '' });
  };

  const onSubmit = async (data: CreateRecruiterFormData | EditRecruiterFormData) => {
    setSaving(true);
    try {
      if (editingMember) {
        // Editar recruiter existente
        const updateData: any = {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
        };

        // Solo incluir password si se proporcionó
        if (data.password && data.password.length > 0) {
          updateData.password = data.password;
        }

        await updateOrgRecruiter(editingMember.id, updateData);
        showToast(t('team.recruiterUpdated'), 'success');
      } else {
        // Crear nuevo recruiter - el schema ya garantiza que password existe
        await createOrgRecruiter({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          password: (data as CreateRecruiterFormData).password,
        });
        showToast(t('team.recruiterCreated'), 'success');
      }
      handleCloseModal();
      fetchMembers();
    } catch (err) {
      showToast(getErrorMessage(err) || t('toast.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (member: TeamMember) => {
    if (member.role === 'org_admin') {
      showToast(t('team.cannotDeactivateAdmin'), 'error');
      return;
    }

    // Si está activo, pedir confirmación antes de desactivar
    if (member.isActive) {
      setConfirmDeactivate(member);
      return;
    }

    // Si está inactivo, activar directamente
    try {
      await updateRecruiterStatus(member.id, true);
      showToast(t('team.recruiterActivated'), 'success');
      fetchMembers();
    } catch (err) {
      showToast(getErrorMessage(err) || t('toast.error'), 'error');
    }
  };

  const confirmDeactivateRecruiter = async () => {
    if (!confirmDeactivate) return;

    try {
      await updateRecruiterStatus(confirmDeactivate.id, false);
      showToast(t('team.recruiterDeactivated'), 'success');
      setConfirmDeactivate(null);
      fetchMembers();
    } catch (err) {
      showToast(getErrorMessage(err) || t('toast.error'), 'error');
      setConfirmDeactivate(null);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'org_admin': return t('team.roles.admin');
      case 'org_recruiter': return t('team.roles.recruiter');
      default: return role;
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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('team.title')}</h1>
          <p className={styles.subtitle}>{t('team.subtitle')}</p>
        </div>
        {permissions.canCreateRecruiter && (
          <button className={styles.createButton} onClick={handleOpenCreate}>
            {t('team.newRecruiter')}
          </button>
        )}
      </div>

      {error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchMembers}>{t('app.retry')}</button>
        </div>
      ) : members.length === 0 ? (
        <div className={styles.empty}>
          <p>{t('team.noMembers')}</p>
        </div>
      ) : (
        <div className={styles.membersList}>
          {members.map((member) => (
            <div key={member.id} className={`${styles.memberCard} ${!member.isActive ? styles.inactive : ''}`}>
              <div className={styles.memberInfo}>
                <div className={styles.memberAvatar}>
                  {member.firstName[0]}{member.lastName[0]}
                </div>
                <div className={styles.memberDetails}>
                  <h3 className={styles.memberName}>
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className={styles.memberEmail}>{member.email}</p>
                  <div className={styles.memberMeta}>
                    <span className={`${styles.roleBadge} ${member.role === 'org_admin' ? styles.adminBadge : ''}`}>
                      {getRoleLabel(member.role)}
                    </span>
                    {!member.isActive && (
                      <span className={styles.inactiveBadge}>{t('status.inactive')}</span>
                    )}
                  </div>
                </div>
              </div>
              {member.role !== 'org_admin' && (
                <div className={styles.memberActions}>
                  {permissions.canToggleRecruiterActive && (
                    <>
                      <button
                        className={styles.editButton}
                        onClick={() => handleOpenEdit(member)}
                      >
                        {t('team.edit')}
                      </button>
                      <button
                        className={styles.toggleButton}
                        onClick={() => handleToggleStatus(member)}
                      >
                        {member.isActive ? t('app.deactivate') : t('app.activate')}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingMember ? t('team.editRecruiterTitle') : t('team.newRecruiterTitle')}
            </h2>
            <p className={styles.modalSubtitle}>
              {editingMember ? t('team.editRecruiterDesc') : t('team.newRecruiterDesc')}
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>{t('team.firstNameLabel')} <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    {...register('firstName')}
                    className={`${styles.input} ${formErrors.firstName ? styles.inputError : ''}`}
                  />
                  {formErrors.firstName && <span className={styles.errorText}>{formErrors.firstName.message}</span>}
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t('team.lastNameLabel')} <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    {...register('lastName')}
                    className={`${styles.input} ${formErrors.lastName ? styles.inputError : ''}`}
                  />
                  {formErrors.lastName && <span className={styles.errorText}>{formErrors.lastName.message}</span>}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('team.emailLabel')} <span className={styles.required}>*</span></label>
                <input
                  type="email"
                  {...register('email')}
                  className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
                  placeholder={t('team.emailPlaceholder')}
                />
                {formErrors.email && <span className={styles.errorText}>{formErrors.email.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  {t('team.passwordLabel')}
                  {!editingMember && <span className={styles.required}>*</span>}
                  {editingMember && <span className={styles.optional}> ({t('app.optional')})</span>}
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`${styles.input} ${formErrors.password ? styles.inputError : ''}`}
                    placeholder={editingMember ? t('team.passwordEditHint') : t('team.passwordHint')}
                  />
                  <button
                    type="button"
                    className={styles.togglePasswordButton}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {formErrors.password && <span className={styles.errorText}>{formErrors.password.message}</span>}
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelButton} onClick={handleCloseModal}>
                  {t('app.cancel')}
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving}
                >
                  {saving
                    ? (editingMember ? t('app.saving') : t('app.creating'))
                    : (editingMember ? t('app.save') : t('team.createRecruiter'))
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeactivate && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDeactivate(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{t('team.confirmDeactivateTitle')}</h2>
            <p className={styles.modalSubtitle}>
              {confirmDeactivate._count?.assignedOffers && confirmDeactivate._count.assignedOffers > 0
                ? t('team.confirmDeactivateWithOffersMessage', {
                    name: `${confirmDeactivate.firstName} ${confirmDeactivate.lastName}`,
                    count: confirmDeactivate._count.assignedOffers
                  })
                : t('team.confirmDeactivateMessage', {
                    name: `${confirmDeactivate.firstName} ${confirmDeactivate.lastName}`
                  })
              }
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setConfirmDeactivate(null)}
              >
                {t('app.cancel')}
              </button>
              <button
                type="button"
                className={styles.saveButton}
                onClick={confirmDeactivateRecruiter}
              >
                {t('app.deactivate')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.type && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
