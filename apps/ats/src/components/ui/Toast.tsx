/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

/** Available toast notification types */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** Toast notification data structure */
export interface Toast {
  /** Unique identifier for the toast */
  id: string;
  /** Message to display */
  message: string;
  /** Visual type/severity of the toast */
  type: ToastType;
  /** Duration in ms before auto-dismiss (0 = no auto-dismiss) @default 4000 */
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook to access toast notification functions.
 * Must be used within a ToastProvider.
 *
 * @example
 * ```tsx
 * const toast = useToast();
 *
 * // Show success notification
 * toast.success('Guardado correctamente');
 *
 * // Show error with custom duration
 * toast.error('Error al guardar', 6000);
 *
 * // Show info notification
 * toast.info('Procesando...');
 * ```
 *
 * @throws Error if used outside of ToastProvider
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Provider component for the toast notification system.
 * Wrap your app with this to enable toast notifications.
 *
 * @example
 * ```tsx
 * // In App.tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const toast: Toast = { id, message, type, duration };
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => addToast(message, 'success', duration),
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => addToast(message, 'error', duration),
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => addToast(message, 'warning', duration),
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => addToast(message, 'info', duration),
    [addToast]
  );

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className={styles.container} role="region" aria-label="Notificaciones" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, toast.duration - 300);

      return () => clearTimeout(exitTimer);
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const icons = {
    success: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16.667 5L7.5 14.167 3.333 10" />
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6v4M10 14h.01" />
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8.57 3.813l-6.24 10.825A1.667 1.667 0 003.76 17.5h12.48a1.667 1.667 0 001.43-2.862L11.43 3.813a1.667 1.667 0 00-2.86 0z" />
        <path d="M10 7.5v3.333M10 14.167h.008" />
      </svg>
    ),
    info: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 13.333V10M10 6.667h.008" />
      </svg>
    ),
  };

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}
      role="alert"
    >
      <span className={styles.icon} aria-hidden="true">
        {icons[toast.type]}
      </span>
      <span className={styles.message}>{toast.message}</span>
      <button
        type="button"
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Cerrar notificacion"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4L4 12M4 4l8 8" />
        </svg>
      </button>
    </div>
  );
}

export default ToastProvider;
