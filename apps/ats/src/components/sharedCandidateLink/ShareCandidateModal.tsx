import { logger } from '@/lib/logger';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  createSharedCandidateLink,
  getSharedLinksByProcess,
  revokeSharedLink,
  type SharedCandidateLinkResponse,
  type CreateSharedCandidateLinkRequest,
} from '../../services/sharedCandidateLinkApi';
import styles from './ShareCandidateModal.module.css';

interface ShareCandidateModalProps {
  processId: string;
  candidateName: string;
  onClose: () => void;
}

type TabType = 'create' | 'history';

function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default function ShareCandidateModal({
  processId,
  candidateName,
  onClose,
}: ShareCandidateModalProps) {
  const { t } = useTranslation('common');

  const [activeTab, setActiveTab] = useState<TabType>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [password, setPassword] = useState(generateRandomPassword());
  const [expiresInDays, setExpiresInDays] = useState<number>(7);
  const [canViewProfile, setCanViewProfile] = useState(true);
  const [canViewCv, setCanViewCv] = useState(true);
  const [canJoinVideoCall, setCanJoinVideoCall] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [sendEmail, setSendEmail] = useState(false);

  // Result state
  const [createdLink, setCreatedLink] = useState<{
    shareUrl: string;
    password: string;
    emailSent: boolean;
  } | null>(null);

  // History state
  const [links, setLinks] = useState<SharedCandidateLinkResponse[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);

  const fetchLinks = useCallback(async () => {
    setLoadingLinks(true);
    try {
      const data = await getSharedLinksByProcess(processId);
      setLinks(data);
    } catch (err) {
      logger.error('Error fetching links:', err);
    } finally {
      setLoadingLinks(false);
    }
  }, [processId]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'history') {
      fetchLinks();
    }
  };

  const handleCreate = async () => {
    if (!password || password.length < 4) {
      setError(t('shareCandidate.passwordTooShort'));
      return;
    }

    if (sendEmail && !recipientEmail) {
      setError(t('shareCandidate.emailRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: CreateSharedCandidateLinkRequest = {
        selectionProcessId: processId,
        password,
        expiresInDays,
        canViewProfile,
        canViewCv,
        canJoinVideoCall,
        sendEmail,
        ...(recipientEmail && { recipientEmail }),
        ...(recipientName && { recipientName }),
      };

      const result = await createSharedCandidateLink(request);
      setCreatedLink({
        shareUrl: result.shareUrl,
        password: result.password,
        emailSent: result.emailSent,
      });
    } catch (err: unknown) {
      logger.error('Error creating link:', err);
      setError(
        err instanceof Error
          ? err.message
          : t('shareCandidate.createError')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (linkId: string) => {
    if (!confirm(t('shareCandidate.confirmRevoke'))) return;

    try {
      await revokeSharedLink(linkId);
      fetchLinks();
    } catch (err) {
      logger.error('Error revoking link:', err);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert(t('shareCandidate.linkCopied'));
    } catch (err) {
      logger.error('Error copying to clipboard:', err);
    }
  };

  const handleCopyPassword = async (pwd: string) => {
    try {
      await navigator.clipboard.writeText(pwd);
      alert(t('shareCandidate.passwordCopied'));
    } catch (err) {
      logger.error('Error copying to clipboard:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('shareCandidate.title')}</h2>
          <p className={styles.subtitle}>
            {t('shareCandidate.sharing', { name: candidateName })}
          </p>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'create' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('create')}
          >
            {t('shareCandidate.tabCreate')}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'history' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('history')}
          >
            {t('shareCandidate.tabHistory')}
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'create' && !createdLink && (
            <div className={styles.createForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t('shareCandidate.password')}</label>
                <div className={styles.passwordRow}>
                  <input
                    type="text"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={4}
                  />
                  <button
                    type="button"
                    className={styles.regenerateBtn}
                    onClick={() => setPassword(generateRandomPassword())}
                    title={t('shareCandidate.regenerate')}
                  >
                    🔄
                  </button>
                </div>
                <span className={styles.hint}>{t('shareCandidate.passwordHint')}</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('shareCandidate.expiration')}</label>
                <select
                  className={styles.select}
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                >
                  <option value={1}>{t('shareCandidate.days1')}</option>
                  <option value={3}>{t('shareCandidate.days3')}</option>
                  <option value={7}>{t('shareCandidate.days7')}</option>
                  <option value={30}>{t('shareCandidate.days30')}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('shareCandidate.permissions')}</label>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={canViewProfile}
                      onChange={(e) => setCanViewProfile(e.target.checked)}
                    />
                    <span>{t('shareCandidate.canViewProfile')}</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={canViewCv}
                      onChange={(e) => setCanViewCv(e.target.checked)}
                    />
                    <span>{t('shareCandidate.canViewCv')}</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={canJoinVideoCall}
                      onChange={(e) => setCanJoinVideoCall(e.target.checked)}
                    />
                    <span>{t('shareCandidate.canJoinVideoCall')}</span>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                  />
                  <span>{t('shareCandidate.sendEmail')}</span>
                </label>
              </div>

              {sendEmail && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('shareCandidate.recipientName')}</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder={t('shareCandidate.recipientNamePlaceholder')}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>{t('shareCandidate.recipientEmail')}</label>
                    <input
                      type="email"
                      className={styles.input}
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder={t('shareCandidate.recipientEmailPlaceholder')}
                      required
                    />
                  </div>
                </>
              )}

              {error && <p className={styles.error}>{error}</p>}

              <button
                className={styles.createButton}
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? t('app.loading') : t('shareCandidate.createLink')}
              </button>
            </div>
          )}

          {activeTab === 'create' && createdLink && (
            <div className={styles.successResult}>
              <div className={styles.successIcon}>✓</div>
              <h3 className={styles.successTitle}>{t('shareCandidate.linkCreated')}</h3>

              {createdLink.emailSent && (
                <p className={styles.emailSent}>{t('shareCandidate.emailSent')}</p>
              )}

              <div className={styles.resultCard}>
                <div className={styles.resultRow}>
                  <label className={styles.resultLabel}>{t('shareCandidate.linkLabel')}</label>
                  <div className={styles.resultValue}>
                    <input
                      type="text"
                      className={styles.resultInput}
                      value={createdLink.shareUrl}
                      readOnly
                    />
                    <button
                      className={styles.copyBtn}
                      onClick={() => handleCopyLink(createdLink.shareUrl)}
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div className={styles.resultRow}>
                  <label className={styles.resultLabel}>{t('shareCandidate.passwordLabel')}</label>
                  <div className={styles.resultValue}>
                    <input
                      type="text"
                      className={styles.resultInput}
                      value={createdLink.password}
                      readOnly
                    />
                    <button
                      className={styles.copyBtn}
                      onClick={() => handleCopyPassword(createdLink.password)}
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              <p className={styles.warning}>{t('shareCandidate.saveWarning')}</p>

              <button className={styles.doneButton} onClick={onClose}>
                {t('app.done')}
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className={styles.historyList}>
              {loadingLinks ? (
                <p className={styles.loadingText}>{t('app.loading')}</p>
              ) : links.length === 0 ? (
                <p className={styles.emptyText}>{t('shareCandidate.noLinks')}</p>
              ) : (
                links.map((link) => (
                  <div
                    key={link.id}
                    className={`${styles.linkCard} ${!link.isValid ? styles.linkCardInvalid : ''}`}
                  >
                    <div className={styles.linkHeader}>
                      <span className={styles.linkRecipient}>
                        {link.recipientName || link.recipientEmail || t('shareCandidate.anonymous')}
                      </span>
                      <span
                        className={`${styles.linkStatus} ${
                          link.isValid ? styles.linkStatusActive : styles.linkStatusInactive
                        }`}
                      >
                        {link.isRevoked
                          ? t('shareCandidate.revoked')
                          : link.isExpired
                          ? t('shareCandidate.expired')
                          : t('shareCandidate.active')}
                      </span>
                    </div>
                    <div className={styles.linkMeta}>
                      <span>{t('shareCandidate.created')}: {formatDate(link.createdAt)}</span>
                      <span>{t('shareCandidate.expires')}: {formatDate(link.expiresAt)}</span>
                      <span>{t('shareCandidate.accesses')}: {link.accessCount}</span>
                    </div>
                    <div className={styles.linkPermissions}>
                      {link.canViewProfile && <span className={styles.permBadge}>👤</span>}
                      {link.canViewCv && <span className={styles.permBadge}>📄</span>}
                      {link.canJoinVideoCall && <span className={styles.permBadge}>📹</span>}
                    </div>
                    {link.isValid && !link.isRevoked && (
                      <button
                        className={styles.revokeBtn}
                        onClick={() => handleRevoke(link.id)}
                      >
                        {t('shareCandidate.revoke')}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
