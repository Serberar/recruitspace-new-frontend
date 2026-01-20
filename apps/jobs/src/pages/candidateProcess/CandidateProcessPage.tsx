import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getPublicProcess,
  uploadTechTest,
  sendMessage,
  getMessages,
  getStatusHistory,
  getAccessInfo,
  verifyPassword,
  resendPassword,
  type PublicProcessDetail,
  type ProcessMessage,
  type StatusHistoryEntry,
} from '../../features/candidateProcess/services/candidateProcessApi';
import { getErrorMessage, isApiError } from '../../hooks/useErrorHandler';
import { PublicFooter, PublicHeader } from '../../components/public';
import styles from './CandidateProcessPage.module.css';

type ToastType = 'success' | 'error' | null;

// Helper para construir URLs del backend (las URLs de descarga son relativas al API)
const getBackendUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  // Si la URL ya empieza con /api, quitamos /api del baseUrl para evitar duplicar
  if (path.startsWith('/api/')) {
    return baseUrl.replace('/api', '') + path;
  }
  return baseUrl + path;
};

export default function CandidateProcessPage() {
  const { t, i18n } = useTranslation('common');
  const { publicToken } = useParams<{ publicToken: string }>();
  const [searchParams] = useSearchParams();

  // Modo preview: recruiters pueden ver sin contraseña pero no actuar
  const isPreviewMode = searchParams.get('preview') === 'true';

  // Estados de autenticación
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessPassword, setAccessPassword] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [resendingPassword, setResendingPassword] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const [processDetail, setProcessDetail] = useState<PublicProcessDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [messages, setMessages] = useState<ProcessMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);

  const [toast, setToast] = useState<{ message: string; type: ToastType }>({ message: '', type: null });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 3000);
  };

  // Verificar acceso al cargar la página
  useEffect(() => {
    const checkAccess = async () => {
      if (!publicToken) return;

      // En modo preview (recruiter), no se requiere contraseña
      if (isPreviewMode) {
        setRequiresPassword(false);
        setIsAuthenticated(true);
        setCheckingAccess(false);
        return;
      }

      setCheckingAccess(true);
      try {
        const accessInfo = await getAccessInfo(publicToken);
        if (accessInfo.requiresPassword) {
          setRequiresPassword(true);
          setIsAuthenticated(false);
        } else {
          // No requiere contraseña (candidato tiene cuenta o proceso sin password)
          setRequiresPassword(false);
          setIsAuthenticated(true);
        }
      } catch (err) {
        if (isApiError(err) && (err.response?.status === 404 || err.response?.status === 410)) {
          setError('expired');
        } else {
          setError(getErrorMessage(err) || t('candidateProcess.loadError'));
        }
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [publicToken, t, isPreviewMode]);

  // Handler para verificar contraseña
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicToken || !passwordInput.trim()) return;

    setVerifyingPassword(true);
    setPasswordError(null);

    try {
      const isValid = await verifyPassword(publicToken, passwordInput.trim());
      if (isValid) {
        setAccessPassword(passwordInput.trim());
        setIsAuthenticated(true);
      } else {
        setPasswordError(t('candidateProcess.invalidPassword'));
      }
    } catch (err) {
      setPasswordError(getErrorMessage(err) || t('candidateProcess.invalidPassword'));
    } finally {
      setVerifyingPassword(false);
    }
  };

  // Handler para reenviar contraseña
  const handleResendPassword = async () => {
    if (!publicToken || resendingPassword) return;

    setResendingPassword(true);
    setPasswordError(null);
    setResendSuccess(false);

    try {
      await resendPassword(publicToken);
      setResendSuccess(true);
    } catch (err) {
      setPasswordError(getErrorMessage(err) || t('candidateProcess.resendError'));
    } finally {
      setResendingPassword(false);
    }
  };

  const fetchProcess = async () => {
    if (!publicToken) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getPublicProcess(publicToken, accessPassword || undefined, isPreviewMode);
      setProcessDetail(data);
    } catch (err) {
      if (isApiError(err) && (err.response?.status === 404 || err.response?.status === 410)) {
        setError('expired');
      } else if (isApiError(err) && err.response?.status === 401) {
        // Password required but not provided - show password form
        setRequiresPassword(true);
        setIsAuthenticated(false);
      } else {
        setError(getErrorMessage(err) || t('candidateProcess.loadError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!publicToken) return;

    setLoadingMessages(true);
    try {
      const data = await getMessages(publicToken, accessPassword || undefined, isPreviewMode);
      setMessages(data);
    } catch {
      // Silently fail - messages are optional
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchStatusHistory = async () => {
    if (!publicToken) return;

    try {
      const data = await getStatusHistory(publicToken, accessPassword || undefined, isPreviewMode);
      setStatusHistory(data);
    } catch {
      // Silently fail - history is optional
    }
  };

  // Solo cargar datos cuando esté autenticado
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchProcess();
    fetchMessages();
    fetchStatusHistory();
  }, [publicToken, isAuthenticated]);

  // Track previous message count to detect new messages
  const prevMessageCountRef = useRef(0);

  // Polling for new messages every 10 seconds
  useEffect(() => {
    if (!publicToken || !isAuthenticated) return;

    const pollMessages = async () => {
      try {
        const data = await getMessages(publicToken, accessPassword || undefined, isPreviewMode);
        // Only update if there are new messages
        if (data.length !== prevMessageCountRef.current) {
          setMessages(data);
        }
      } catch {
        // Silently fail - polling errors are not critical
      }
    };

    const intervalId = setInterval(pollMessages, 10000);

    return () => clearInterval(intervalId);
  }, [publicToken, isAuthenticated, accessPassword, isPreviewMode]);

  // Scroll to bottom only when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  // Get current step from steps array based on currentStepId (usado como fallback para upload de archivos)
  const currentStep = processDetail?.steps.find(s => s.id === processDetail.currentStepId) || null;

  // Buscar step de TECH_TEST para subida de archivos (cuando action es FILE_UPLOAD)
  const techTestStep = processDetail?.steps.find(s => s.type === 'TECH_TEST') || null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadTest = async () => {
    if (!publicToken || !selectedFile) return;

    // Usar techTestStep si existe, o currentStep como fallback
    const stepForUpload = techTestStep || currentStep;
    if (!stepForUpload) return;

    setUploading(true);
    try {
      // Incluir contraseña si fue requerida
      await uploadTechTest(publicToken, stepForUpload.id, selectedFile, accessPassword || undefined);
      showToast(t('candidateProcess.fileUploaded'), 'success');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchProcess();
    } catch (err) {
      showToast(getErrorMessage(err) || t('app.error'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!publicToken || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      // Incluir contraseña si fue requerida
      const sentMessage = await sendMessage(publicToken, newMessage.trim(), accessPassword || undefined);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (err) {
      showToast(getErrorMessage(err) || t('candidateProcess.messageError'), 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-ES', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Mostrar loading mientras verificamos acceso
  if (checkingAccess) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>{t('candidateProcess.loading')}</p>
      </div>
    );
  }

  // Mostrar formulario de contraseña si es requerido y no está autenticado
  if (requiresPassword && !isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.passwordSection}>
              <h2 className={styles.passwordTitle}>{t('candidateProcess.accessRequired')}</h2>
              <p className={styles.passwordDescription}>
                {t('candidateProcess.enterPassword')}
              </p>
              <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
                <input
                  type="text"
                  className={styles.passwordInput}
                  placeholder={t('candidateProcess.passwordPlaceholder')}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value.toUpperCase())}
                  maxLength={8}
                  autoComplete="off"
                  autoFocus
                />
                {passwordError && (
                  <p className={styles.passwordError}>{passwordError}</p>
                )}
                {resendSuccess && (
                  <p className={styles.resendSuccess}>{t('candidateProcess.resendSuccess')}</p>
                )}
                <button
                  type="submit"
                  className={styles.passwordButton}
                  disabled={verifyingPassword || !passwordInput.trim()}
                >
                  {verifyingPassword ? t('app.loading') : t('candidateProcess.accessButton')}
                </button>
              </form>
              <div className={styles.resendSection}>
                <p className={styles.resendText}>{t('candidateProcess.forgotPassword')}</p>
                <button
                  type="button"
                  className={styles.resendButton}
                  onClick={handleResendPassword}
                  disabled={resendingPassword}
                >
                  {resendingPassword ? t('app.loading') : t('candidateProcess.resendPassword')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>{t('candidateProcess.loading')}</p>
      </div>
    );
  }

  if (error === 'expired') {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.expiredState}>
              <h2 className={styles.expiredTitle}>{t('candidateProcess.notAvailable')}</h2>
              <p className={styles.expiredText}>{t('candidateProcess.checkEmail')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !processDetail) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.error}>
              <h2 className={styles.errorTitle}>{t('candidateProcess.error')}</h2>
              <p className={styles.errorText}>{error || t('candidateProcess.loadError')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { candidateDisplayName, offerPublicData, currentStatus, candidateInstructions, organizationBranding, storageEnabled } = processDetail;

  // Determinar si hay una acción activa para el candidato
  // PRIORIDAD: currentStatus.action siempre tiene prioridad sobre los steps
  // Si storage está deshabilitado, no mostramos FILE_UPLOAD como acción activa
  const effectiveAction = (currentStatus.action === 'FILE_UPLOAD' && !storageEnabled) ? null : currentStatus.action;
  const hasActiveAction = effectiveAction !== null;

  // El proceso está finalizado SOLO si el estado es terminal (contratado, rechazado, etc.)
  // Estados sin acción pero no terminales (aplicado, revisión) muestran "estamos revisando"
  const isFinished = currentStatus.isTerminal;

  // Get first name from display name
  const firstName = candidateDisplayName.split(' ')[0];

  // Render file upload form (used by both step-based and status-based actions)
  // En modo preview, solo mostramos info de que hay formulario de subida
  const renderFileUploadForm = (instructions?: string | null) => {
    if (isPreviewMode) {
      return (
        <div className={styles.previewDisabled}>
          <p className={styles.previewDisabledText}>{t('candidateProcess.previewUploadDisabled')}</p>
        </div>
      );
    }

    return (
      <div className={styles.fileUpload}>
        {instructions && (
          <p className={styles.instructions}>{instructions}</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          id="techTest"
          className={styles.fileInput}
          accept=".pdf,.zip,.rar"
          onChange={handleFileSelect}
        />
        <label htmlFor="techTest" className={styles.fileLabel}>
          <p className={styles.fileLabelText}>
            {t('candidateProcess.clickToSelectFile')}<br />
            {t('candidateProcess.fileFormats')}
          </p>
        </label>
        {selectedFile && (
          <>
            <p className={styles.selectedFile}>
              {t('candidateProcess.fileSelected', { name: selectedFile.name })}
            </p>
            <button
              className={styles.actionButton}
              onClick={handleUploadTest}
              disabled={uploading}
            >
              {uploading ? t('app.uploading') : t('candidateProcess.uploadFile')}
            </button>
          </>
        )}
      </div>
    );
  };

  // Render video call section with date/time and button
  const renderVideoCall = (roomUrl: string, scheduledAt?: string | null) => (
    <div className={styles.videoCallSection}>
      <p className={styles.videoCallTitle}>{t('candidateProcess.nextStepVideoCall')}</p>
      {scheduledAt && (
        <div className={styles.videoCallSchedule}>
          <div className={styles.videoCallScheduleText}>
            <span className={styles.videoCallScheduleLabel}>{t('candidateProcess.scheduledFor')}</span>
            <span className={styles.videoCallScheduleDate}>{formatDate(scheduledAt)}</span>
          </div>
        </div>
      )}
      <a
        href={roomUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.videoCallButton}
      >
        {t('candidateProcess.joinVideoCall')}
      </a>
    </div>
  );

  // Render submitted files section
  const renderSubmittedFiles = () => {
    if (!currentStatus.candidateSubmission) {
      return (
        <div className={styles.submittedFilesSection}>
          <h3 className={styles.submittedFilesTitle}>{t('candidateProcess.yourSubmissions')}</h3>
          <p className={styles.noSubmissions}>{t('candidateProcess.noSubmissionsYet')}</p>
        </div>
      );
    }

    return (
      <div className={styles.submittedFilesSection}>
        <h3 className={styles.submittedFilesTitle}>{t('candidateProcess.yourSubmissions')}</h3>
        <div className={styles.submittedFile}>
          <div className={styles.submittedFileInfo}>
            <span className={styles.submittedFileDate}>
              {t('candidateProcess.submittedOn', { date: formatDate(currentStatus.candidateSubmission.submittedAt) })}
            </span>
          </div>
          <a
            href={getBackendUrl(currentStatus.candidateSubmission.downloadUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.downloadButton}
          >
            {t('candidateProcess.downloadYourFile')}
          </a>
        </div>
      </div>
    );
  };

  // Render action based on status action (when no steps exist)
  // Uses effectiveAction which respects storageEnabled flag
  const renderStatusAction = () => {
    switch (effectiveAction) {
      case 'FILE_UPLOAD':
        return (
          <div className={styles.fileUploadSection}>
            {/* Custom instructions from recruiter */}
            {candidateInstructions && (
              <div className={styles.customInstructions}>
                <p className={styles.customInstructionsText}>{candidateInstructions}</p>
              </div>
            )}

            {/* Download recruiter's file */}
            {currentStatus.recruiterFileUrl && (
              <div className={styles.recruiterFileSection}>
                <p className={styles.instructions}>{t('candidateProcess.downloadRecruiterFileDesc')}</p>
                <a
                  href={getBackendUrl(currentStatus.recruiterFileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.downloadRecruiterButton}
                >
                  {t('candidateProcess.downloadRecruiterFile')}
                </a>
              </div>
            )}

            {/* Upload form */}
            <p className={styles.instructions}>{t('candidateProcess.uploadYourFile')}</p>
            {renderFileUploadForm()}

            {/* Submitted files */}
            {renderSubmittedFiles()}
          </div>
        );

      case 'VIDEO_CALL':
        return (
          <div className={styles.videoCallSection}>
            {/* Custom instructions from recruiter */}
            {candidateInstructions && (
              <div className={styles.customInstructions}>
                <p className={styles.customInstructionsText}>{candidateInstructions}</p>
              </div>
            )}
            {currentStatus.videoRoomUrl ? (
              renderVideoCall(currentStatus.videoRoomUrl, currentStatus.videoScheduledAt)
            ) : (
              <p className={styles.waitingText}>
                {t('candidateProcess.linkByEmail')}
              </p>
            )}
          </div>
        );

      default:
        // Si hay instrucciones personalizadas, mostrarlas en lugar del mensaje por defecto
        return (
          <div className={styles.waitingState}>
            {candidateInstructions ? (
              <div className={styles.customInstructions}>
                <p className={styles.customInstructionsText}>{candidateInstructions}</p>
              </div>
            ) : (
              <p className={styles.waitingText}>
                {t('candidateProcess.reviewingProfile')}<br />
                {t('candidateProcess.willNotify')}
              </p>
            )}
          </div>
        );
    }
  };

  // Render action based ONLY on currentStatus.action
  // Los steps ya no se usan para determinar qué mostrar - solo el estado del pipeline
  const renderStepAction = () => {
    return renderStatusAction();
  };

  return (
    <div className={styles.page}>
      {/* Navigation Header - consistente con el portal de empleo */}
      <PublicHeader
        logoUrl={organizationBranding?.logoUrl || undefined}
        organizationName={organizationBranding?.portalTitle || organizationBranding?.name}
        showBranding={!organizationBranding?.logoUrl}
      />

      {/* Hero Header con branding de la organización */}
      <div className={`${styles.heroHeader} ${organizationBranding?.headerImageUrl ? styles.hasCustomImage : ''}`}>
        {organizationBranding?.headerImageUrl ? (
          <>
            <img
              src={organizationBranding.headerImageUrl}
              alt=""
              className={styles.heroHeaderImage}
            />
            <div className={styles.heroHeaderOverlay} />
          </>
        ) : (
          <div className={styles.heroHeaderBackground} />
        )}
        <div className={styles.heroHeaderContent}>
          {organizationBranding?.logoUrl && (
            <div className={styles.heroLogoWrapper}>
              <img
                src={organizationBranding.logoUrl}
                alt={organizationBranding.name}
                className={styles.heroLogo}
              />
            </div>
          )}
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              {organizationBranding?.portalTitle || organizationBranding?.name || t('candidateProcess.yourProcess')}
            </h1>
            {organizationBranding?.portalSubtitle && (
              <p className={styles.heroSubtitle}>{organizationBranding.portalSubtitle}</p>
            )}
          </div>
        </div>
        {/* Gradient line at bottom - igual que el portal */}
        <div className={styles.heroGradientLine} />
      </div>

      <div className={styles.container}>
        {/* Preview mode banner */}
        {isPreviewMode && (
          <div className={styles.previewBanner}>
            <p className={styles.previewBannerText}>{t('candidateProcess.previewMode')}</p>
          </div>
        )}

        {/* Greeting Card */}
        <div className={styles.greetingCard}>
          <h2 className={styles.greeting}>{t('candidateProcess.hello', { name: firstName })}</h2>
          <p className={styles.greetingSubtitle}>
            {t('candidateProcess.participatingIn')} <strong>{offerPublicData.title}</strong>
          </p>
        </div>

        {/* Current status - sin card */}
        <div className={styles.statusSection}>
          <span className={styles.statusLabel}>{t('candidateProcess.yourCurrentStatus')}</span>
          <p
            className={styles.currentStatus}
            style={currentStatus.color ? { color: currentStatus.color } : undefined}
          >
            {currentStatus.name}
          </p>
        </div>

        {/* Instructions / Action */}
        {isFinished ? (
          <div className={styles.card}>
            <div className={styles.finishedState}>
              <h2 className={styles.finishedTitle}>{t('candidateProcess.processEnded')}</h2>
              <p className={styles.finishedText}>
                {t('candidateProcess.thanksForInterest')}<br />
                {t('candidateProcess.feedbackAvailable')}
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              {hasActiveAction ? t('candidateProcess.nextStep') : t('candidateProcess.instructions')}
            </h2>
            {renderStepAction()}
          </div>
        )}

        {/* Messages section */}
        {!isFinished && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t('candidateProcess.messages')}</h2>
            <div className={styles.messagesContainer}>
              {loadingMessages ? (
                <p className={styles.loadingMessages}>{t('app.loading')}</p>
              ) : messages.length === 0 ? (
                <p className={styles.noMessages}>{t('candidateProcess.noMessages')}</p>
              ) : (
                <div className={styles.messagesList}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${styles.message} ${msg.senderType === 'candidate' ? styles.messageCandidate : styles.messageRecruiter}`}
                    >
                      <p className={styles.messageAuthor}>{msg.senderName}</p>
                      <p className={styles.messageContent}>{msg.content}</p>
                      <span className={styles.messageTime}>{formatDate(msg.createdAt)}</span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
              {/* En modo preview no se puede enviar mensajes */}
              {isPreviewMode ? (
                <div className={styles.previewDisabled}>
                  <p className={styles.previewDisabledText}>{t('candidateProcess.previewMessagesDisabled')}</p>
                </div>
              ) : (
                <div className={styles.messageForm}>
                  <input
                    type="text"
                    className={styles.messageInput}
                    placeholder={t('candidateProcess.writeMessage')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    className={styles.sendButton}
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                  >
                    {sendingMessage ? '...' : t('app.send')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status History - at the bottom as informational */}
        {statusHistory.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t('candidateProcess.statusHistory')}</h2>
            <div className={styles.historyList}>
              {statusHistory.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`${styles.historyItem} ${index === 0 ? styles.historyItemCurrent : ''}`}
                >
                  <div className={styles.historyContent}>
                    <span
                      className={styles.historyStatus}
                      style={entry.statusColor ? { color: entry.statusColor } : undefined}
                    >
                      {entry.statusName}
                      {index === 0 && ` (${t('candidateProcess.current')})`}
                    </span>
                    <span className={styles.historyDate}>
                      {formatDate(entry.changedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <PublicFooter />

      {/* Toast */}
      {toast.type && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
