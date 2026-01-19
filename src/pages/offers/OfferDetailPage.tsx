/**
 * OfferDetailPage - Página de detalle de oferta refactorizada
 *
 * Estructura modular:
 * - hooks/useOfferFilters: Gestión de filtros
 * - components/OfferHeader: Cabecera
 * - components/SummaryStats: Estadísticas
 * - components/FilterPanel: Panel de filtros
 * - components/PipelineTimeline: Timeline del pipeline
 */

import { logger } from '@/lib/logger';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getJobOfferByIdSimple,
  getOfferPipeline,
  getOfferFilters,
} from '@/features/jobOffers/services/jobOffersApi';
import { getProcessesByOffer, createSelectionProcess } from '@/features/selectionProcess/services/selectionProcessApi';
import { createCandidate, findCandidateByEmail, updateCandidateProfile } from '@/features/candidates/services/candidatesApi';
import type { JobOffer, SelectionProcess, ProcessStatus } from '@/types';
import { getErrorMessage } from '@/hooks/useErrorHandler';
import { usePermissions } from '@/hooks/useRole';
import { useOfferFilters } from './hooks';
import { OfferHeader, SummaryStats, FilterPanel, PipelineTimeline, InternalNotes, AddCandidateModal } from './components';
import type { AddCandidateData } from './components/AddCandidateModal';
import { exportCandidatesToExcel } from '@/utils/exportCandidatesToExcel';
import styles from './OfferDetailPage.module.css';

interface ProcessesByStatus {
  [statusId: string]: SelectionProcess[];
}

export default function OfferDetailPage() {
  const { t } = useTranslation('common');
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const { canEditOffer } = usePermissions();

  const [offer, setOffer] = useState<JobOffer | null>(null);
  const [processes, setProcesses] = useState<SelectionProcess[]>([]);
  const [statuses, setStatuses] = useState<ProcessStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Add candidate modal
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [addCandidateLoading, setAddCandidateLoading] = useState(false);

  // Export confirmation modal
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  // Saved filters from API
  const [savedSkillFiltersFromApi, setSavedSkillFiltersFromApi] = useState<string[]>([]);
  const [savedEducationFiltersFromApi, setSavedEducationFiltersFromApi] = useState<string[]>([]);

  // Filter UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [showEducationInput, setShowEducationInput] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newEducationInput, setNewEducationInput] = useState('');

  // Use filter hook
  const filterHook = useOfferFilters({
    offerId,
    processes,
    initialSavedSkillFilters: savedSkillFiltersFromApi,
    initialSavedEducationFilters: savedEducationFiltersFromApi,
  });

  const fetchData = useCallback(async () => {
    if (!offerId) return;

    setLoading(true);
    setError(null);
    try {
      const [offerData, processesData, statusesData, filtersData] = await Promise.all([
        getJobOfferByIdSimple(offerId),
        getProcessesByOffer(offerId),
        getOfferPipeline(offerId),
        getOfferFilters(offerId),
      ]);

      setOffer(offerData);
      setProcesses(processesData);
      setStatuses(statusesData.sort((a, b) => a.order - b.order));
      setSavedSkillFiltersFromApi(filtersData.skillFilters || []);
      setSavedEducationFiltersFromApi(filtersData.educationFilters || []);
    } catch (err) {
      setError(getErrorMessage(err) || t('offerDetail.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [offerId, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group filtered processes by status
  const processesByStatus: ProcessesByStatus = {};
  statuses.forEach((status) => {
    processesByStatus[status.id] = filterHook.filteredProcesses.filter(
      (p) => p.statusId === status.id
    );
  });

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate('/app/offers');
  }, [navigate]);

  const handleViewCandidate = useCallback(
    (processId: string) => {
      navigate(`/app/process/${processId}`);
    },
    [navigate]
  );

  const handleCopyPublicLink = useCallback(async () => {
    if (!offer) return;

    const publicUrl = `${window.location.origin}/jobs/${offer.id}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setToast(t('offerDetail.linkCopied'));
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      logger.error('Error copying to clipboard:', err);
    }
  }, [offer, t]);

  const handleViewPublicOffer = useCallback(() => {
    if (!offer) return;
    window.open(`/jobs/${offer.id}`, '_blank');
  }, [offer]);

  const handleEditOffer = useCallback(() => {
    navigate(`/app/offers/${offerId}/edit`);
  }, [navigate, offerId]);

  // Export candidates to Excel - show confirmation first
  const handleExportClick = useCallback(() => {
    if (!offer || processes.length === 0) return;
    setShowExportConfirm(true);
  }, [offer, processes.length]);

  const handleConfirmExport = useCallback(() => {
    if (!offer || processes.length === 0) return;

    exportCandidatesToExcel({
      offerTitle: offer.title,
      processes,
      statuses,
    });
    setShowExportConfirm(false);
    setToast(t('exportConfirm.exported'));
    setTimeout(() => setToast(null), 3000);
  }, [offer, processes, statuses, t]);

  // Add candidate handler
  const handleAddCandidate = useCallback(async (data: AddCandidateData) => {
    if (!offerId) return;

    setAddCandidateLoading(true);
    try {
      // Check if candidate already exists
      let candidateId: string;
      const existingCandidate = await findCandidateByEmail(data.email);

      if (existingCandidate) {
        candidateId = existingCandidate.id;
      } else {
        // Create new candidate or reuse from global pool
        // El backend reutilizará candidatos existentes automáticamente
        const newCandidate = await createCandidate({
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          linkedinUrl: data.linkedinUrl,
          notes: data.notes,
        });
        candidateId = newCandidate.id;
      }

      // Create selection process for this offer
      const firstStatus = statuses.length > 0 ? statuses[0] : null;
      await createSelectionProcess({
        candidateId,
        offerId: offerId,
        statusId: firstStatus?.id,
        notes: data.notes,
      });

      // Update candidate profile with professional data if provided
      // El CV ya fue parseado en el modal, los datos ya vienen en el formulario
      const hasProfileData = data.summary || data.skills?.length || data.experience || data.education;
      if (hasProfileData) {
        await updateCandidateProfile(candidateId, {
          summary: data.summary,
          skills: data.skills,
          // Para experience y education, el backend espera arrays de objetos
          // Por ahora los guardamos como texto en el campo description
          experience: data.experience ? [{ description: data.experience }] : undefined,
          education: data.education ? [{ description: data.education }] : undefined,
        });
      }

      // Refresh the page data
      await fetchData();
      setShowAddCandidateModal(false);
      setToast(t('addCandidate.success'));
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      logger.error('Error adding candidate:', err);
      throw err;
    } finally {
      setAddCandidateLoading(false);
    }
  }, [offerId, statuses, fetchData, t]);

  // Custom input handlers
  const handleAddCustomSkill = useCallback(() => {
    const skill = newSkillInput.trim();
    if (skill && !filterHook.filters.selectedSkills.includes(skill)) {
      filterHook.toggleSkillFilter(skill);
      filterHook.addSavedSkillFilter(skill);
      setNewSkillInput('');
      setShowSkillInput(false);
    }
  }, [newSkillInput, filterHook]);

  const handleAddCustomEducation = useCallback(() => {
    const education = newEducationInput.trim();
    if (education && !filterHook.filters.selectedEducation.includes(education)) {
      filterHook.toggleEducationFilter(education);
      filterHook.addSavedEducationFilter(education);
      setNewEducationInput('');
      setShowEducationInput(false);
    }
  }, [newEducationInput, filterHook]);

  const handleSkillInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddCustomSkill();
      } else if (e.key === 'Escape') {
        setNewSkillInput('');
        setShowSkillInput(false);
      }
    },
    [handleAddCustomSkill]
  );

  const handleEducationInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddCustomEducation();
      } else if (e.key === 'Escape') {
        setNewEducationInput('');
        setShowEducationInput(false);
      }
    },
    [handleAddCustomEducation]
  );

  // Loading state
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  // Error state
  if (error || !offer) {
    return (
      <div className={styles.error}>
        <h3>{t('app.error')}</h3>
        <p>{error || t('offerDetail.notFound')}</p>
        <button className={styles.retryButton} onClick={fetchData}>
          {t('app.retry')}
        </button>
      </div>
    );
  }

  const totalCandidates = filterHook.filteredProcesses.length;
  const totalUnreviewed = filterHook.filteredProcesses.filter((p) => !p.reviewed).length;

  return (
    <div className={styles.page}>
      <OfferHeader
        offer={offer}
        onBack={handleBack}
        onViewPublic={handleViewPublicOffer}
        onCopyLink={handleCopyPublicLink}
        onEdit={handleEditOffer}
        canEdit={canEditOffer}
      />

      <InternalNotes
        offerId={offerId!}
        initialNotes={offer.internalNotes}
        onUpdate={(notes) => setOffer({ ...offer, internalNotes: notes })}
      />

      <SummaryStats
        totalCandidates={totalCandidates}
        totalUnreviewed={totalUnreviewed}
        totalProcesses={processes.length}
        hasActiveFilters={filterHook.hasActiveFilters}
      />

      {processes.length > 0 && (
        <FilterPanel
          filters={filterHook.filters}
          showFilters={showFilters}
          persistFilters={filterHook.persistFilters}
          hasActiveFilters={filterHook.hasActiveFilters}
          candidateSkills={filterHook.candidateSkills}
          candidateEducation={filterHook.candidateEducation}
          savedSkillFilters={filterHook.savedSkillFilters}
          savedEducationFilters={filterHook.savedEducationFilters}
          showSkillInput={showSkillInput}
          showEducationInput={showEducationInput}
          newSkillInput={newSkillInput}
          newEducationInput={newEducationInput}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onPersistFiltersChange={filterHook.setPersistFilters}
          onClearFilters={filterHook.clearFilters}
          onSearchChange={filterHook.setSearchQuery}
          onReviewStatusChange={filterHook.setReviewStatus}
          onToggleSkillFilter={filterHook.toggleSkillFilter}
          onRemoveSkillFilter={filterHook.removeSkillFilter}
          onToggleEducationFilter={filterHook.toggleEducationFilter}
          onRemoveEducationFilter={filterHook.removeEducationFilter}
          onDismissSkillSuggestion={filterHook.dismissSkillSuggestion}
          onDismissEducationSuggestion={filterHook.dismissEducationSuggestion}
          onShowSkillInput={() => setShowSkillInput(true)}
          onShowEducationInput={() => setShowEducationInput(true)}
          onSkillInputChange={setNewSkillInput}
          onEducationInputChange={setNewEducationInput}
          onAddCustomSkill={handleAddCustomSkill}
          onAddCustomEducation={handleAddCustomEducation}
          onCancelSkillInput={() => {
            setNewSkillInput('');
            setShowSkillInput(false);
          }}
          onCancelEducationInput={() => {
            setNewEducationInput('');
            setShowEducationInput(false);
          }}
          onSkillInputKeyDown={handleSkillInputKeyDown}
          onEducationInputKeyDown={handleEducationInputKeyDown}
        />
      )}

      <section className={styles.pipelineSection}>
        <div className={styles.pipelineHeader}>
          <h2 className={styles.sectionTitle}>{t('offerDetail.pipeline')}</h2>
          <button
            className={styles.addCandidateButton}
            onClick={() => setShowAddCandidateModal(true)}
          >
            + {t('offerDetail.addCandidate')}
          </button>
        </div>
        <PipelineTimeline
          statuses={statuses}
          processesByStatus={processesByStatus}
          totalCandidates={totalCandidates}
          onViewCandidate={handleViewCandidate}
          onCopyLink={handleCopyPublicLink}
        />
        {processes.length > 0 && (
          <div className={styles.pipelineFooter}>
            <button className={styles.exportButton} onClick={handleExportClick}>
              {t('offerDetail.exportCandidates')}
            </button>
          </div>
        )}
      </section>

      {toast && <div className={styles.toast}>{toast}</div>}

      <AddCandidateModal
        isOpen={showAddCandidateModal}
        onClose={() => setShowAddCandidateModal(false)}
        onSubmit={handleAddCandidate}
        isLoading={addCandidateLoading}
        offerTitle={offer.title}
      />

      {/* Export confirmation modal */}
      {showExportConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowExportConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>{t('exportConfirm.title')}</h3>
            <p>{t('exportConfirm.message', { count: processes.length })}</p>
            <ul className={styles.exportDataList}>
              <li>{t('exportConfirm.dataName')}</li>
              <li>{t('exportConfirm.dataEmail')}</li>
              <li>{t('exportConfirm.dataPhone')}</li>
              <li>{t('exportConfirm.dataStatus')}</li>
              <li>{t('exportConfirm.dataSkills')}</li>
              <li>{t('exportConfirm.dataExperience')}</li>
            </ul>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowExportConfirm(false)}
              >
                {t('app.cancel')}
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleConfirmExport}
              >
                {t('exportConfirm.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
