import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/useIsMobile';
import styles from './PipelineEditor.module.css';

export type PipelineAction = 'NONE' | 'VIDEO_CALL' | 'FILE_UPLOAD';

export interface PipelineStatus {
  id: string;
  name: string;
  color: string;
  order: number;
  isTerminal: boolean;
  action: PipelineAction;
  sendNotification: boolean;
}

const ACTIONS: { value: PipelineAction; icon: string }[] = [
  { value: 'NONE', icon: '—' },
  { value: 'VIDEO_CALL', icon: '📹' },
  { value: 'FILE_UPLOAD', icon: '📎' },
];

interface PipelineEditorProps {
  statuses: PipelineStatus[];
  onChange: (statuses: PipelineStatus[]) => void;
  disabled?: boolean;
  storageEnabled?: boolean;
}

const COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#F59E0B', // amber
  '#10B981', // emerald
  '#EF4444', // red
  '#EC4899', // pink
  '#6366F1', // indigo
];

export default function PipelineEditor({ statuses, onChange, disabled, storageEnabled = true }: PipelineEditorProps) {
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();

  // Filter actions based on storage availability
  const availableActions = storageEnabled
    ? ACTIONS
    : ACTIONS.filter(a => a.value !== 'FILE_UPLOAD');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [colorPickerId, setColorPickerId] = useState<string | null>(null);
  const [actionPickerId, setActionPickerId] = useState<string | null>(null);
  const [newStatusName, setNewStatusName] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const moveStatus = (id: string, direction: 'up' | 'down') => {
    const index = statuses.findIndex(s => s.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= statuses.length) return;

    const newStatuses = [...statuses];
    const [item] = newStatuses.splice(index, 1);
    newStatuses.splice(newIndex, 0, item);

    const reordered = newStatuses.map((s, i) => ({ ...s, order: i + 1 }));
    onChange(reordered);
  };

  const handleColorSelect = (statusId: string, color: string) => {
    updateStatus(statusId, { color });
    setColorPickerId(null);
  };

  const handleActionSelect = (statusId: string, action: PipelineAction) => {
    updateStatus(statusId, { action });
    setActionPickerId(null);
  };

  const addStatus = () => {
    if (!newStatusName.trim()) return;

    const newStatus: PipelineStatus = {
      id: `temp-${Date.now()}`,
      name: newStatusName.trim(),
      color: COLORS[statuses.length % COLORS.length],
      order: statuses.length + 1,
      isTerminal: false,
      action: 'NONE',
      sendNotification: true,
    };

    onChange([...statuses, newStatus]);
    setNewStatusName('');
  };

  const removeStatus = (id: string) => {
    const filtered = statuses.filter(s => s.id !== id);
    const reordered = filtered.map((s, i) => ({ ...s, order: i + 1 }));
    onChange(reordered);
  };

  const updateStatus = (id: string, updates: Partial<PipelineStatus>) => {
    onChange(statuses.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (disabled) return;
    setDraggedId(id);
    dragNodeRef.current = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);

    setTimeout(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.classList.add(styles.dragging);
      }
    }, 0);
  };

  const handleDragEnd = () => {
    if (dragNodeRef.current) {
      dragNodeRef.current.classList.remove(styles.dragging);
    }
    setDraggedId(null);
    setDragOverId(null);
    dragNodeRef.current = null;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    if (disabled || !draggedId || draggedId === id) return;
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (disabled || !draggedId || draggedId === targetId) return;

    const draggedIndex = statuses.findIndex(s => s.id === draggedId);
    const targetIndex = statuses.findIndex(s => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newStatuses = [...statuses];
    const [draggedItem] = newStatuses.splice(draggedIndex, 1);
    newStatuses.splice(targetIndex, 0, draggedItem);

    const reordered = newStatuses.map((s, i) => ({ ...s, order: i + 1 }));
    onChange(reordered);

    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.statusList}>
        {statuses.map((status, index) => (
          <div
            key={status.id}
            className={`${styles.statusItem} ${dragOverId === status.id ? styles.dragOver : ''}`}
            draggable={!disabled && !isMobile && editingId !== status.id}
            onDragStart={(e) => handleDragStart(e, status.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, status.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status.id)}
          >
            {!isMobile && (
              <div className={styles.dragHandle} title={t('pipeline.dragToReorder')}>
                <span className={styles.dragIcon}>⠿</span>
              </div>
            )}

            {isMobile && !disabled && (
              <div className={styles.mobileReorder} role="group" aria-label={t('pipeline.reorderControls')}>
                <button
                  type="button"
                  onClick={() => moveStatus(status.id, 'up')}
                  disabled={index === 0}
                  className={styles.moveBtn}
                  aria-label={`${t('pipeline.moveUp')} ${status.name}`}
                >
                  <span aria-hidden="true">↑</span>
                </button>
                <button
                  type="button"
                  onClick={() => moveStatus(status.id, 'down')}
                  disabled={index === statuses.length - 1}
                  className={styles.moveBtn}
                  aria-label={`${t('pipeline.moveDown')} ${status.name}`}
                >
                  <span aria-hidden="true">↓</span>
                </button>
              </div>
            )}

            <div className={styles.statusOrder}>{index + 1}</div>

            <div className={styles.colorPickerWrapper}>
              <button
                type="button"
                className={styles.statusColor}
                style={{ backgroundColor: status.color }}
                onClick={() => !disabled && setColorPickerId(colorPickerId === status.id ? null : status.id)}
                aria-label={`${t('pipeline.changeColor')} ${status.name}`}
                aria-expanded={colorPickerId === status.id}
                aria-haspopup="listbox"
                disabled={disabled}
              />
              {colorPickerId === status.id && (
                <div className={styles.colorPicker} role="listbox" aria-label={t('pipeline.colorOptions')}>
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      role="option"
                      aria-selected={status.color === color}
                      className={`${styles.colorOption} ${status.color === color ? styles.colorOptionSelected : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(status.id, color)}
                      aria-label={color}
                    />
                  ))}
                </div>
              )}
            </div>

            {editingId === status.id ? (
              <input
                type="text"
                value={status.name}
                onChange={(e) => updateStatus(status.id, { name: e.target.value })}
                onBlur={() => setEditingId(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                className={styles.statusInput}
                aria-label={t('pipeline.statusName')}
                autoFocus
              />
            ) : (
              <button
                type="button"
                className={styles.statusName}
                onClick={() => !disabled && setEditingId(status.id)}
                disabled={disabled}
                aria-label={`${t('pipeline.editStatus')} ${status.name}`}
              >
                {status.name}
              </button>
            )}

            <div className={styles.actionPickerWrapper}>
              <span className={styles.actionLabel}>{t('pipeline.actionLabel')}</span>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => !disabled && setActionPickerId(actionPickerId === status.id ? null : status.id)}
                title={t('pipeline.selectAction')}
                disabled={disabled}
              >
                {availableActions.find(a => a.value === status.action)?.icon || '—'}
              </button>
              {actionPickerId === status.id && (
                <div className={styles.actionPicker}>
                  {availableActions.map((action) => (
                    <button
                      key={action.value}
                      type="button"
                      className={`${styles.actionOption} ${status.action === action.value ? styles.actionOptionSelected : ''}`}
                      onClick={() => handleActionSelect(status.id, action.value)}
                      title={t(`pipeline.actions.${action.value}`)}
                    >
                      {action.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <label className={styles.notifyLabel} title={t('pipeline.sendNotificationDesc')}>
              <input
                type="checkbox"
                checked={status.sendNotification}
                onChange={(e) => updateStatus(status.id, { sendNotification: e.target.checked })}
                disabled={disabled}
              />
              <span className={styles.notifyText}>{t('pipeline.notifyLabel')}</span>
            </label>

            <label className={styles.terminalLabel}>
              <input
                type="checkbox"
                checked={status.isTerminal}
                onChange={(e) => updateStatus(status.id, { isTerminal: e.target.checked })}
                disabled={disabled}
              />
              <span className={styles.terminalText}>{t('pipeline.final')}</span>
            </label>

            <button
              type="button"
              onClick={() => removeStatus(status.id)}
              disabled={disabled || statuses.length <= 2}
              className={styles.removeBtn}
              aria-label={`${t('app.delete')} ${status.name}`}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>

      {!disabled && (
        <div className={styles.addStatus}>
          <label htmlFor="new-status-input" className="sr-only">
            {t('pipeline.newStatusPlaceholder')}
          </label>
          <input
            id="new-status-input"
            type="text"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            placeholder={t('pipeline.newStatusPlaceholder')}
            className={styles.addInput}
            aria-describedby="pipeline-hint"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addStatus();
              }
            }}
          />
          <button
            type="button"
            onClick={addStatus}
            disabled={!newStatusName.trim()}
            className={styles.addBtn}
          >
            {t('pipeline.addStatus')}
          </button>
        </div>
      )}

      <p id="pipeline-hint" className={styles.hint}>
        {t('pipeline.hint')}
      </p>
    </div>
  );
}
