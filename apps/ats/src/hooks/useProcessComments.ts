import { logger } from '@/lib/logger';
/**
 * Hook para gestionar comentarios internos del proceso
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getProcessComments,
  addProcessComment,
  updateProcessComment,
  deleteProcessComment,
  type ProcessComment,
} from '../services/selectionProcessApi';

export interface UseProcessCommentsReturn {
  comments: ProcessComment[];
  loading: boolean;
  newComment: string;
  setNewComment: (value: string) => void;
  addingComment: boolean;
  editingCommentId: string | null;
  editingContent: string;
  setEditingContent: (value: string) => void;
  handleAddComment: () => Promise<void>;
  handleStartEdit: (comment: ProcessComment) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: () => Promise<void>;
  handleDeleteComment: (commentId: string) => Promise<void>;
}

export function useProcessComments(
  processId: string | undefined,
  t: (key: string) => string
): UseProcessCommentsReturn {
  const [comments, setComments] = useState<ProcessComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Cargar comentarios
  useEffect(() => {
    if (!processId) return;

    const fetchComments = async () => {
      setLoading(true);
      try {
        const data = await getProcessComments(processId);
        setComments(data);
      } catch (err) {
        logger.error('Error fetching comments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [processId]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || !processId || addingComment) return;

    setAddingComment(true);
    try {
      const comment = await addProcessComment(processId, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      logger.error('Error adding comment:', err);
    } finally {
      setAddingComment(false);
    }
  }, [newComment, processId, addingComment]);

  const handleStartEdit = useCallback((comment: ProcessComment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent('');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingCommentId || !editingContent.trim()) return;

    try {
      const updated = await updateProcessComment(editingCommentId, editingContent.trim());
      setComments((prev) => prev.map((c) => (c.id === editingCommentId ? updated : c)));
      setEditingCommentId(null);
      setEditingContent('');
    } catch (err) {
      logger.error('Error updating comment:', err);
    }
  }, [editingCommentId, editingContent]);

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!confirm(t('candidateDetail.confirmDeleteComment'))) return;

      try {
        await deleteProcessComment(commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (err) {
        logger.error('Error deleting comment:', err);
      }
    },
    [t]
  );

  return {
    comments,
    loading,
    newComment,
    setNewComment,
    addingComment,
    editingCommentId,
    editingContent,
    setEditingContent,
    handleAddComment,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleDeleteComment,
  };
}
