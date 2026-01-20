import { useEffect, useRef, type ReactNode, type MouseEvent, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

/**
 * Props for the Modal component
 */
export interface ModalProps {
  /** Controls the visibility of the modal */
  isOpen: boolean;
  /** Callback fired when the modal should close */
  onClose: () => void;
  /** Title displayed in the modal header */
  title?: string;
  /** Content to render inside the modal body */
  children: ReactNode;
  /** Content to render in the modal footer (typically action buttons) */
  footer?: ReactNode;
  /** Width of the modal @default 'md' */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether clicking the overlay closes the modal @default true */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape closes the modal @default true */
  closeOnEscape?: boolean;
  /** Whether to show the close button in the header @default true */
  showCloseButton?: boolean;
}

/**
 * An accessible modal dialog component with focus trap and keyboard navigation.
 *
 * Features:
 * - Focus trap to keep keyboard navigation within the modal
 * - Closes on Escape key press (configurable)
 * - Closes on overlay click (configurable)
 * - Restores focus to previously focused element on close
 * - Prevents body scroll when open
 * - Renders via React Portal to document.body
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmar accion"
 *   footer={
 *     <>
 *       <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
 *       <Button onClick={handleConfirm}>Confirmar</Button>
 *     </>
 *   }
 * >
 *   <p>Estas seguro de que deseas continuar?</p>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const handleOverlayClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={`${styles.modal} ${styles[size]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
      >
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && (
              <h2 id="modal-title" className={styles.title}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M15 5L5 15M5 5l10 10" />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default Modal;
