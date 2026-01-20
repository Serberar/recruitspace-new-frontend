import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getProcessStatuses,
  createProcessStatus,
  updateProcessStatus,
  reorderProcessStatuses,
  deleteProcessStatus,
  type CreateProcessStatusDto,
} from '../../services/processStatusApi';
import type { ProcessStatus } from '../../types';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import styles from './PipelineSettingsPage.module.css';

type ToastType = 'success' | 'error' | null;

export default function PipelineSettingsPage() {
  const { t } = useTranslation('common');
  const [statuses, setStatuses] = useState<ProcessStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType }>({ message: '', type: null });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusIsTerminal, setNewStatusIsTerminal] = useState(false);
  const [addingStatus, setAddingStatus] = useState(false);

  const [editingStatus, setEditingStatus] = useState<ProcessStatus | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsTerminal, setEditIsTerminal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const data = await getProcessStatuses();
      setStatuses(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      showToast(getErrorMessage(err) || t('settings.pipeline.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newStatuses = [...statuses];
    const [draggedItem] = newStatuses.splice(draggedIndex, 1);
    newStatuses.splice(index, 0, draggedItem);

    setStatuses(newStatuses);
    setDraggedIndex(index);
    setHasChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const statusIds = statuses.map((s) => s.id);
      await reorderProcessStatuses(statusIds);
      showToast(t('settings.pipeline.orderSaved'), 'success');
      setHasChanges(false);
      fetchStatuses();
    } catch (err) {
      showToast(getErrorMessage(err) || t('settings.pipeline.orderError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddStatus = async () => {
    if (!newStatusName.trim()) return;

    setAddingStatus(true);
    try {
      const data: CreateProcessStatusDto = {
        name: newStatusName.trim(),
        isTerminal: newStatusIsTerminal,
        order: statuses.length,
      };
      await createProcessStatus(data);
      showToast(t('settings.pipeline.statusCreated'), 'success');
      setNewStatusName('');
      setNewStatusIsTerminal(false);
      setShowAddModal(false);
      fetchStatuses();
    } catch (err) {
      showToast(getErrorMessage(err) || t('settings.pipeline.statusCreateError'), 'error');
    } finally {
      setAddingStatus(false);
    }
  };

  const handleEditStatus = (status: ProcessStatus) => {
    setEditingStatus(status);
    setEditName(status.name);
    setEditIsTerminal(status.isTerminal || false);
  };

  const handleUpdateStatus = async () => {
    if (!editingStatus || !editName.trim()) return;

    setUpdatingStatus(true);
    try {
      await updateProcessStatus(editingStatus.id, {
        name: editName.trim(),
        isTerminal: editIsTerminal,
      });
      showToast(t('settings.pipeline.statusUpdated'), 'success');
      setEditingStatus(null);
      fetchStatuses();
    } catch (err) {
      showToast(getErrorMessage(err) || t('settings.pipeline.statusUpdateError'), 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteStatus = async (status: ProcessStatus) => {
    if (!confirm(t('settings.pipeline.confirmDelete', { name: status.name }))) {
      return;
    }

    try {
      await deleteProcessStatus(status.id);
      showToast(t('settings.pipeline.statusDeleted'), 'success');
      fetchStatuses();
    } catch (err) {
      showToast(getErrorMessage(err) || t('settings.pipeline.statusDeleteError'), 'error');
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
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{t('settings.pipeline.title')}</h1>
          <p className={styles.subtitle}>
            {t('settings.pipeline.subtitle')}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            {t('settings.pipeline.addStatus')}
          </button>
        </div>
      </div>

      {/* Warning if has changes */}
      {hasChanges && (
        <div className={styles.warning}>
          <p>{t('settings.pipeline.unsavedChanges')}</p>
          <button
            className={styles.saveOrderButton}
            onClick={handleSaveOrder}
            disabled={saving}
          >
            {saving ? t('app.saving') : t('settings.pipeline.saveOrder')}
          </button>
        </div>
      )}

      {/* Context info */}
      <div className={styles.contextInfo}>
        <p className={styles.contextText}>
          {t('settings.pipeline.globalInfo')}
        </p>
      </div>

      {/* Statuses list */}
      <div className={styles.statusesList}>
        <div className={styles.listHeader}>
          <span className={styles.listHeaderText}>{t('settings.pipeline.processStates')}</span>
          <span className={styles.listHeaderHint}>{t('settings.pipeline.dragToReorder')}</span>
        </div>

        {statuses.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{t('settings.pipeline.noStates')}</p>
            <button
              className={styles.addButton}
              onClick={() => setShowAddModal(true)}
            >
              {t('settings.pipeline.createFirstState')}
            </button>
          </div>
        ) : (
          <div className={styles.statusItems}>
            {statuses.map((status, index) => (
              <div
                key={status.id}
                className={`${styles.statusItem} ${draggedIndex === index ? styles.statusItemDragging : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className={styles.statusDragHandle}>
                  <span className={styles.dragIcon}>≡</span>
                </div>

                <div className={styles.statusInfo}>
                  <span className={styles.statusName}>{status.name}</span>
                  <div className={styles.statusBadges}>
                    {status.isTerminal && (
                      <span className={styles.badgeFinal}>{t('settings.pipeline.final')}</span>
                    )}
                    <span className={styles.badgeOrder}>{t('settings.pipeline.order', { order: status.order + 1 })}</span>
                  </div>
                </div>

                <div className={styles.statusActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditStatus(status)}
                    title={t('app.edit')}
                  >
                    {t('app.edit')}
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteStatus(status)}
                    title={t('app.delete')}
                  >
                    {t('app.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help text */}
      <div className={styles.helpSection}>
        <h3 className={styles.helpTitle}>{t('settings.pipeline.helpTitle')}</h3>
        <ul className={styles.helpList}>
          <li>{t('settings.pipeline.help1')}</li>
          <li>{t('settings.pipeline.help2')}</li>
          <li>{t('settings.pipeline.help3')}</li>
          <li>{t('settings.pipeline.help4')}</li>
        </ul>
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{t('settings.pipeline.addStatusTitle')}</h2>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>
                {t('settings.pipeline.statusNameLabel')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.modalInput}
                placeholder={t('settings.pipeline.statusNamePlaceholder')}
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.modalField}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={newStatusIsTerminal}
                  onChange={(e) => setNewStatusIsTerminal(e.target.checked)}
                />
                <span>{t('settings.pipeline.isFinal')}</span>
              </label>
              <p className={styles.fieldHint}>
                {t('settings.pipeline.isFinalHint')}
              </p>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowAddModal(false)}
              >
                {t('app.cancel')}
              </button>
              <button
                className={styles.submitButton}
                onClick={handleAddStatus}
                disabled={addingStatus || !newStatusName.trim()}
              >
                {addingStatus ? t('app.creating') : t('settings.pipeline.createStatus')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingStatus && (
        <div className={styles.modalOverlay} onClick={() => setEditingStatus(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{t('settings.pipeline.editStatusTitle')}</h2>

            <div className={styles.modalField}>
              <label className={styles.modalLabel}>
                {t('settings.pipeline.statusNameLabel')} <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.modalInput}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.modalField}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={editIsTerminal}
                  onChange={(e) => setEditIsTerminal(e.target.checked)}
                />
                <span>{t('settings.pipeline.isFinal')}</span>
              </label>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setEditingStatus(null)}
              >
                {t('app.cancel')}
              </button>
              <button
                className={styles.submitButton}
                onClick={handleUpdateStatus}
                disabled={updatingStatus || !editName.trim()}
              >
                {updatingStatus ? t('app.saving') : t('app.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.type && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
