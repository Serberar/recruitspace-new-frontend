/**
 * Componente de mensajes con el candidato
 */
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../lib/i18n';
import type { ProcessMessageData } from '../../services/selectionProcessApi';
import { formatDate } from '../../utils/formatDate';
import styles from '../../pages/candidates/CandidateDetailPage.module.css';

interface ProcessMessagesProps {
  messages: ProcessMessageData[];
  loading: boolean;
  newMessage: string;
  sending: boolean;
  canEdit: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onNewMessageChange: (value: string) => void;
  onSendMessage: () => void;
}

function ProcessMessagesComponent({
  messages,
  loading,
  newMessage,
  sending,
  canEdit,
  messagesEndRef,
  onNewMessageChange,
  onSendMessage,
}: ProcessMessagesProps) {
  const { t } = useTranslation('common');
  const locale = i18n.language || 'es';

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{t('candidateDetail.candidateMessages')}</h2>

      <div className={styles.messagesContainer}>
        {loading ? (
          <p className={styles.emptyMessages}>{t('app.loading')}</p>
        ) : messages.length === 0 ? (
          <p className={styles.emptyMessages}>{t('candidateDetail.noMessages')}</p>
        ) : (
          <div className={styles.messagesList}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageItem} ${
                  msg.senderType === 'recruiter' ? styles.messageRecruiter : styles.messageCandidate
                }`}
              >
                <div className={styles.messageHeader}>
                  <span className={styles.messageAuthor}>{msg.senderName}</span>
                  <span className={styles.messageTime}>{formatDate(msg.createdAt, locale)}</span>
                </div>
                <p className={styles.messageContent}>{msg.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {canEdit && (
        <div className={styles.addMessageForm}>
          <input
            type="text"
            className={styles.messageInput}
            placeholder={t('candidateDetail.writeMessagePlaceholder')}
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            disabled={sending}
          />
          <button
            className={styles.sendMessageButton}
            onClick={onSendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? '...' : t('app.send')}
          </button>
        </div>
      )}
    </div>
  );
}

export const ProcessMessages = memo(ProcessMessagesComponent);
