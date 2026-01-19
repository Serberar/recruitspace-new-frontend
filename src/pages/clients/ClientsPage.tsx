import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useClients } from '../../features/clients/hooks/useClients';
import { usePermissions } from '../../hooks/useRole';
import { useDebounce } from '../../hooks/useDebounce';
import { clientSimpleSchema, type ClientSimpleFormData } from '../../lib/validations/client.schema';
import type { Client } from '../../types';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import styles from './ClientsPage.module.css';

type ToastType = 'success' | 'error' | null;
type StatusFilter = 'all' | 'active' | 'inactive';

export default function ClientsPage() {
  const { t } = useTranslation('common');
  const permissions = usePermissions();

  // REF-2: Usar hook centralizado para gestión de clientes
  const {
    clients,
    loading,
    error,
    refetch,
    createClient: hookCreateClient,
    updateClient: hookUpdateClient,
    toggleClientActive,
  } = useClients();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType }>({ message: '', type: null });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // org_recruiter solo ve activos, no puede filtrar
  const canFilterByStatus = permissions.isAdmin || permissions.isRecruiter;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm<ClientSimpleFormData>({
    resolver: zodResolver(clientSimpleSchema),
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      phone: '',
    },
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  // Filtrar clientes según el filtro de estado y búsqueda
  // org_recruiter solo ve activos (el backend ya filtra, pero por si acaso)
  const filteredClients = useMemo(() => {
    let result = clients;

    // org_recruiter solo ve activos
    if (permissions.isOrgRecruiter) {
      result = result.filter(c => c.active);
    } else if (statusFilter === 'active') {
      result = result.filter(c => c.active);
    } else if (statusFilter === 'inactive') {
      result = result.filter(c => !c.active);
    }

    // Filtro por búsqueda
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.contact?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [clients, statusFilter, permissions.isOrgRecruiter, debouncedSearch]);

  const handleOpenCreate = () => {
    setEditingClient(null);
    reset({ name: '', contact: '', email: '', phone: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    reset({ name: client.name, contact: client.contact || '', email: client.email || '', phone: client.phone || '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClient(null);
    reset({ name: '', contact: '', email: '', phone: '' });
  };

  // REF-2: Usar funciones del hook en lugar de llamadas directas a API
  const onSubmit = async (data: ClientSimpleFormData) => {
    setSaving(true);
    try {
      const clientData = {
        name: data.name.trim(),
        contact: data.contact?.trim() || undefined,
        email: data.email?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
      };

      if (editingClient) {
        await hookUpdateClient(editingClient.id, clientData);
        showToast(t('toast.updated'), 'success');
      } else {
        await hookCreateClient(clientData);
        showToast(t('toast.created'), 'success');
      }
      handleCloseModal();
    } catch (err) {
      showToast(getErrorMessage(err) || t('toast.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (client: Client) => {
    try {
      await toggleClientActive(client.id, !client.active);
      showToast(t('toast.updated'), 'success');
    } catch (err) {
      showToast(getErrorMessage(err) || t('toast.error'), 'error');
    }
  };

  const handleCardClick = useCallback((client: Client) => {
    if (permissions.canEditClient) {
      handleOpenEdit(client);
    }
  }, [permissions.canEditClient]);

  const handleCardKeyDown = useCallback((e: React.KeyboardEvent, client: Client) => {
    if (e.key === 'Enter' && permissions.canEditClient) {
      handleOpenEdit(client);
    }
  }, [permissions.canEditClient]);

  const handleMenuToggle = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === clientId ? null : clientId);
  };

  const handleMenuAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setOpenMenuId(null);
    action();
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
          <h1 className={styles.title}>{t('clients.title')}</h1>
          <p className={styles.subtitle}>
            {permissions.isAdmin ? t('clients.subtitle') : t('clients.subtitleRecruiter')}
          </p>
        </div>
        {permissions.canCreateClient && (
          <button className={styles.createButton} onClick={handleOpenCreate}>
            {t('clients.newClient')}
          </button>
        )}
      </div>

      {/* Búsqueda y filtros */}
      {clients.length > 0 && (
        <div className={styles.filtersRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('clients.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {canFilterByStatus && (
            <div className={styles.filters}>
              <button
                className={`${styles.filterButton} ${statusFilter === 'active' ? styles.filterActive : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                {t('clients.filterActive')}
              </button>
              <button
                className={`${styles.filterButton} ${statusFilter === 'inactive' ? styles.filterActive : ''}`}
                onClick={() => setStatusFilter('inactive')}
              >
                {t('clients.filterInactive')}
              </button>
              <button
                className={`${styles.filterButton} ${statusFilter === 'all' ? styles.filterActive : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                {t('clients.filterAll')}
              </button>
            </div>
          )}
        </div>
      )}

      {error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={refetch}>{t('app.retry')}</button>
        </div>
      ) : clients.length === 0 ? (
        <div className={styles.empty}>
          <p>{t('clients.noClients')}</p>
          {permissions.canCreateClient && (
            <button className={styles.createButton} onClick={handleOpenCreate}>
              {t('clients.createFirst')}
            </button>
          )}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className={styles.empty}>
          <p>{t('clients.noClientsFilter')}</p>
        </div>
      ) : (
        <div className={styles.clientsList}>
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className={`${styles.clientCard} ${!client.active ? styles.inactive : ''} ${permissions.canEditClient ? styles.clickable : ''}`}
              onClick={() => handleCardClick(client)}
              onKeyDown={(e) => handleCardKeyDown(e, client)}
              role={permissions.canEditClient ? 'button' : undefined}
              tabIndex={permissions.canEditClient ? 0 : undefined}
            >
              <div className={styles.clientInfo}>
                <h3 className={styles.clientName}>{client.name}</h3>
                {client.contact && <span className={styles.clientContact}>{client.contact}</span>}
                <div className={styles.clientMeta}>
                  {client.email && <span>{client.email}</span>}
                  {client.phone && <span>{client.phone}</span>}
                </div>
                {!client.active && <span className={styles.inactiveBadge}>{t('status.inactive')}</span>}
              </div>

              {permissions.canToggleClientActive && (
                <div className={styles.menuWrapper} ref={openMenuId === client.id ? menuRef : null}>
                  <button
                    className={styles.menuButton}
                    onClick={(e) => handleMenuToggle(e, client.id)}
                    aria-label={t('app.moreOptions')}
                  >
                    ⋮
                  </button>
                  {openMenuId === client.id && (
                    <div className={styles.menu}>
                      <button
                        className={styles.menuItem}
                        onClick={(e) => handleMenuAction(e, () => handleToggleActive(client))}
                      >
                        {client.active ? t('app.deactivate') : t('app.activate')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {permissions.canEditClient && (
                <span className={styles.cardArrow}>→</span>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {editingClient ? t('clients.editClient') : t('clients.newClientTitle')}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.field}>
                <label className={styles.label}>{t('clients.nameLabel')} <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  {...register('name')}
                  className={`${styles.input} ${formErrors.name ? styles.inputError : ''}`}
                  placeholder={t('clients.namePlaceholder')}
                />
                {formErrors.name && <span className={styles.errorText}>{formErrors.name.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('clients.contactLabel')}</label>
                <input
                  type="text"
                  {...register('contact')}
                  className={`${styles.input} ${formErrors.contact ? styles.inputError : ''}`}
                  placeholder={t('clients.contactPlaceholder')}
                />
                {formErrors.contact && <span className={styles.errorText}>{formErrors.contact.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('clients.emailLabel')}</label>
                <input
                  type="email"
                  {...register('email')}
                  className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
                  placeholder="email@client.com"
                />
                {formErrors.email && <span className={styles.errorText}>{formErrors.email.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t('clients.phoneLabel')}</label>
                <input
                  type="tel"
                  {...register('phone')}
                  className={`${styles.input} ${formErrors.phone ? styles.inputError : ''}`}
                  placeholder={t('clients.phonePlaceholder')}
                />
                {formErrors.phone && <span className={styles.errorText}>{formErrors.phone.message}</span>}
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
                  {saving ? t('app.saving') : t('app.save')}
                </button>
              </div>
            </form>
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
