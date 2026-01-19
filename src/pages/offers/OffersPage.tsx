import { useEffect, useState, useCallback, useMemo, memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getOrganization } from '../../features/portal/services/portalApi';
import { getOrganizationMembers, type TeamMember } from '../../features/team/services/teamApi';
import { useOffers } from '../../features/jobOffers/hooks/useOffers';
import { useDebounce } from '../../hooks/useDebounce';
import { usePermissions } from '../../hooks/useRole';
import type { JobOffer } from '../../types';
import styles from './OffersPage.module.css';

type StatusFilter = 'all' | 'active' | 'inactive';

interface OfferCardProps {
  offer: JobOffer;
  onView: (id: string) => void;
  onAssign?: (offerId: string) => void;
  onToggleActive?: (offerId: string, active: boolean) => void;
  canToggleActive: boolean;
  isAdmin: boolean;
  t: (key: string) => string;
}

const OfferCard = memo(function OfferCard({
  offer,
  onView,
  onAssign,
  onToggleActive,
  canToggleActive,
  isAdmin,
  t,
}: OfferCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    onView(offer.id);
  }, [onView, offer.id]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onView(offer.id);
    }
  }, [onView, offer.id]);

  const handleAssignClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAssign?.(offer.id);
  }, [onAssign, offer.id]);

  const handleMenuClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  }, []);

  const handleToggleActiveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleActive?.(offer.id, !offer.active);
    setMenuOpen(false);
  }, [onToggleActive, offer.id, offer.active]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Múltiples asignados
  const assignedUsers = offer.assignedUsers || [];
  const hasAssignedUsers = assignedUsers.length > 0;

  return (
    <div
      className={`${styles.offerCard} ${!offer.active ? styles.inactive : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.offerInfo}>
        <h3 className={styles.offerTitle}>{offer.title}</h3>
        <div className={styles.offerMeta}>
          {offer.client && (
            <span className={styles.offerClient}>
              {t('dashboard.client')}: {offer.client.name}
            </span>
          )}
          {offer.active ? (
            <span className={`badge ${styles.statusActive}`}>{t('status.active')}</span>
          ) : (
            <span className={`badge ${styles.statusInactive}`}>{t('status.inactive')}</span>
          )}
        </div>
        {isAdmin && (
          <div className={styles.assignedInfo}>
            {hasAssignedUsers ? (
              <button
                className={styles.assignedBadge}
                onClick={handleAssignClick}
                title={t('offers.changeAssignment')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {`${t('offers.assignedRecruiters')}: ${assignedUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ')}`}
              </button>
            ) : (
              <button
                className={styles.unassignedBadge}
                onClick={handleAssignClick}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                {t('offers.assignRecruiter')}
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.offerStats}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>
            {offer._count?.selectionProcesses || 0}
          </div>
          <div className={styles.statLabel}>{t('nav.candidates')}</div>
        </div>
      </div>

      {canToggleActive && (
        <div className={styles.menuWrapper} ref={menuRef}>
          <button
            className={styles.menuButton}
            onClick={handleMenuClick}
            title={t('app.actions')}
          >
            ⋮
          </button>
          {menuOpen && (
            <div className={styles.menu}>
              <button className={styles.menuItem} onClick={handleToggleActiveClick}>
                {offer.active ? t('app.deactivate') : t('app.activate')}
              </button>
            </div>
          )}
        </div>
      )}

      <span className={styles.cardArrow}>→</span>
    </div>
  );
});

interface AssignModalProps {
  offer: JobOffer | null;
  members: TeamMember[];
  onAssign: (offerId: string, userId: string) => Promise<void>;
  onUnassign: (offerId: string, userId: string) => Promise<void>;
  onClose: () => void;
  t: (key: string) => string;
}

function AssignModal({ offer, members, onAssign, onUnassign, onClose, t }: AssignModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!offer) return null;

  const assignedUsers = offer.assignedUsers || [];
  const assignedUserIds = new Set(assignedUsers.map(u => u.id));
  // Solo mostrar recruiters (excluir admins) que no estén ya asignados
  const availableMembers = members.filter(m => !assignedUserIds.has(m.id) && m.role === 'org_recruiter');

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      await onAssign(offer.id, selectedUserId);
      setSelectedUserId('');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (userId: string) => {
    setLoading(true);
    try {
      await onUnassign(offer.id, userId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{t('offers.manageRecruiters')}</h3>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalOfferTitle}>{offer.title}</p>

          {/* Lista de asignados actuales */}
          {assignedUsers.length > 0 && (
            <div className={styles.assignedList}>
              <label className={styles.selectLabel}>{t('offers.currentlyAssigned')}</label>
              {assignedUsers.map((user) => (
                <div key={user.id} className={styles.assignedItem}>
                  <span>{user.firstName} {user.lastName}</span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleUnassign(user.id)}
                    disabled={loading || assignedUsers.length <= 1}
                    title={assignedUsers.length <= 1 ? t('offers.cannotRemoveLastRecruiter') : t('offers.unassign')}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Selector para añadir nuevo */}
          {availableMembers.length > 0 && (
            <div className={styles.addRecruiterSection}>
              <label className={styles.selectLabel}>{t('offers.addRecruiter')}</label>
              <div className={styles.addRecruiterRow}>
                <select
                  className={styles.selectInput}
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">{t('offers.selectRecruiterPlaceholder')}</option>
                  {availableMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
                <button
                  className="btn-primary"
                  onClick={handleAssign}
                  disabled={!selectedUserId || loading}
                >
                  {t('offers.add')}
                </button>
              </div>
            </div>
          )}

          {availableMembers.length === 0 && assignedUsers.length > 0 && (
            <p className={styles.allAssigned}>{t('offers.allRecruitersAssigned')}</p>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            {t('app.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OffersPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { isAdmin } = permissions;

  // REF-1: Usar hook centralizado para gestión de ofertas
  const {
    offers,
    loading,
    error,
    refetch,
    toggleOfferActive,
    assignRecruiter,
    unassignRecruiter,
  } = useOffers();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [orgSlug, setOrgSlug] = useState<string | null>(null);
  const [assignModalOffer, setAssignModalOffer] = useState<JobOffer | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Permisos: admin y cualquier recruiter pueden activar/desactivar ofertas
  const canToggleActive = permissions.isAdmin || permissions.isAnyRecruiter;
  // Solo admin y recruiter independiente pueden ver filtros de estado
  const canFilterByStatus = permissions.isAdmin || permissions.isRecruiter;

  // Cargar datos adicionales (team members y org slug) que no están en el hook
  useEffect(() => {
    const loadAdditionalData = async () => {
      if (isAdmin) {
        try {
          const members = await getOrganizationMembers();
          setTeamMembers(members.filter(m => m.isActive));
        } catch {
          // No bloquear si falla
        }
      }

      try {
        const orgData = await getOrganization();
        setOrgSlug(orgData.slug || null);
      } catch {
        // Silenciar error
      }
    };
    loadAdditionalData();
  }, [isAdmin]);

  const filteredOffers = useMemo(() => {
    let result = offers;

    // Filtro por estado
    // org_recruiter solo ve activas, otros pueden usar filtro
    if (permissions.isOrgRecruiter) {
      result = result.filter((o) => o.active);
    } else if (statusFilter === 'active') {
      result = result.filter((o) => o.active);
    } else if (statusFilter === 'inactive') {
      result = result.filter((o) => !o.active);
    }

    // Filtro por búsqueda
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (offer) =>
          offer.title.toLowerCase().includes(query) ||
          offer.client?.name.toLowerCase().includes(query) ||
          offer.assignedUsers?.some(u =>
            u.firstName.toLowerCase().includes(query) ||
            u.lastName.toLowerCase().includes(query)
          )
      );
    }

    return result;
  }, [debouncedSearch, offers, statusFilter, permissions.isOrgRecruiter]);

  const handleViewOffer = useCallback((offerId: string) => {
    navigate(`/app/offers/${offerId}`);
  }, [navigate]);

  const handleCreateOffer = useCallback(() => {
    navigate('/app/offers/new');
  }, [navigate]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleOpenAssignModal = useCallback((offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      setAssignModalOffer(offer);
    }
  }, [offers]);

  const handleCloseAssignModal = useCallback(() => {
    setAssignModalOffer(null);
  }, []);

  // REF-1: Usar funciones del hook en lugar de llamadas directas a API
  const handleAssignOffer = useCallback(async (offerId: string, userId: string) => {
    const updatedOffer = await assignRecruiter(offerId, userId);
    setAssignModalOffer(updatedOffer);
  }, [assignRecruiter]);

  const handleUnassignOffer = useCallback(async (offerId: string, userId: string) => {
    const updatedOffer = await unassignRecruiter(offerId, userId);
    setAssignModalOffer(updatedOffer);
  }, [unassignRecruiter]);

  const handleToggleActive = useCallback(async (offerId: string, active: boolean) => {
    await toggleOfferActive(offerId, active);
  }, [toggleOfferActive]);

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
        <button className={styles.retryButton} onClick={refetch}>
          {t('app.retry')}
        </button>
      </div>
    );
  }

  const publicPortalUrl = orgSlug ? `/org/${orgSlug}/jobs` : null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{t('offers.title')}</h1>
          {publicPortalUrl && (
            <a
              href={publicPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.portalLink}
            >
              Ver portal publico
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
        {permissions.canCreateOffer && (
          <button className={styles.createButton} onClick={handleCreateOffer}>
            {t('offers.createOffer')}
          </button>
        )}
      </div>

      {offers.length > 0 && (
        <div className={styles.filtersRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={isAdmin ? t('offers.searchPlaceholderAdmin') : t('offers.searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {canFilterByStatus && (
            <div className={styles.statusFilters}>
              <button
                className={`${styles.filterButton} ${statusFilter === 'active' ? styles.filterActive : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                {t('offers.filterActive')}
              </button>
              <button
                className={`${styles.filterButton} ${statusFilter === 'inactive' ? styles.filterActive : ''}`}
                onClick={() => setStatusFilter('inactive')}
              >
                {t('offers.filterInactive')}
              </button>
              <button
                className={`${styles.filterButton} ${statusFilter === 'all' ? styles.filterActive : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                {t('offers.filterAll')}
              </button>
            </div>
          )}
        </div>
      )}

      {filteredOffers.length === 0 && offers.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>{t('offers.noOffers')}</h3>
          {permissions.canCreateOffer && (
            <button className="btn-primary" onClick={handleCreateOffer}>
              {t('offers.createFirst')}
            </button>
          )}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>{t('offers.noResults')}</h3>
          <p>{t('offers.noResultsDesc')}</p>
        </div>
      ) : (
        <div className={styles.offersList}>
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onView={handleViewOffer}
              onAssign={isAdmin ? handleOpenAssignModal : undefined}
              onToggleActive={canToggleActive ? handleToggleActive : undefined}
              canToggleActive={canToggleActive}
              isAdmin={isAdmin}
              t={t}
            />
          ))}
        </div>
      )}

      {assignModalOffer && (
        <AssignModal
          offer={assignModalOffer}
          members={teamMembers}
          onAssign={handleAssignOffer}
          onUnassign={handleUnassignOffer}
          onClose={handleCloseAssignModal}
          t={t}
        />
      )}
    </div>
  );
}
