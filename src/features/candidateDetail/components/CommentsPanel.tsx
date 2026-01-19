/**
 * Panel de comentarios internos
 */
import { memo, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../../lib/i18n';
import type { ProcessComment } from '../../selectionProcess/services/selectionProcessApi';
import { formatDate } from '../utils/formatDate';
import styles from '../../../pages/candidates/CandidateDetailPage.module.css';

interface CommentsPanelProps {
  comments: ProcessComment[];
  currentUserId: string | null;
  canEdit: boolean;
  newComment: string;
  addingComment: boolean;
  editingCommentId: string | null;
  editingContent: string;
  onNewCommentChange: (value: string) => void;
  onEditingContentChange: (value: string) => void;
  onAddComment: () => void;
  onStartEdit: (comment: ProcessComment) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDeleteComment: (commentId: string) => void;
}

function CommentsPanelComponent({
  comments,
  currentUserId,
  canEdit,
  newComment,
  addingComment,
  editingCommentId,
  editingContent,
  onNewCommentChange,
  onEditingContentChange,
  onAddComment,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteComment,
}: CommentsPanelProps) {
  const { t } = useTranslation('common');
  const locale = i18n.language || 'es';

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onAddComment();
    }
  };

  return (
    <div className={styles.actionCard}>
      <h3 className={styles.actionTitle}>{t('candidateDetail.internalComments')}</h3>

      <div className={styles.sidebarCommentsList}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className={styles.sidebarCommentItem}>
              <div className={styles.sidebarCommentHeader}>
                <span className={styles.sidebarCommentAuthor}>{comment.authorName}</span>
                {canEdit &&
                  comment.authorId === currentUserId &&
                  editingCommentId !== comment.id && (
                    <div className={styles.sidebarCommentActions}>
                      <button
                        className={styles.sidebarCommentActionBtn}
                        onClick={() => onStartEdit(comment)}
                        title={t('app.edit')}
                      >
                        ✎
                      </button>
                      <button
                        className={styles.sidebarCommentActionBtn}
                        onClick={() => onDeleteComment(comment.id)}
                        title={t('app.delete')}
                      >
                        ✕
                      </button>
                    </div>
                  )}
              </div>
              {canEdit && editingCommentId === comment.id ? (
                <div className={styles.editCommentForm}>
                  <input
                    type="text"
                    className={styles.sidebarCommentInput}
                    value={editingContent}
                    onChange={(e) => onEditingContentChange(e.target.value)}
                    autoFocus
                  />
                  <div className={styles.editCommentActions}>
                    <button className={styles.editCancelBtn} onClick={onCancelEdit}>
                      {t('app.cancel')}
                    </button>
                    <button
                      className={styles.editSaveBtn}
                      onClick={onSaveEdit}
                      disabled={!editingContent.trim()}
                    >
                      {t('app.save')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={styles.sidebarCommentContent}>{comment.content}</p>
                  <span className={styles.sidebarCommentDate}>
                    {formatDate(comment.createdAt, locale)}
                  </span>
                </>
              )}
            </div>
          ))
        ) : (
          <p className={styles.emptyComments}>{t('candidateDetail.noInternalComments')}</p>
        )}
      </div>

      {canEdit && (
        <div className={styles.addSidebarCommentForm}>
          <input
            type="text"
            className={styles.sidebarCommentInput}
            placeholder={t('candidateDetail.addCommentPlaceholder')}
            value={newComment}
            onChange={(e) => onNewCommentChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={addingComment}
          />
          <button
            className={styles.addSidebarCommentButton}
            onClick={onAddComment}
            disabled={!newComment.trim() || addingComment}
          >
            {addingComment ? '...' : '+'}
          </button>
        </div>
      )}
    </div>
  );
}

export const CommentsPanel = memo(CommentsPanelComponent);
