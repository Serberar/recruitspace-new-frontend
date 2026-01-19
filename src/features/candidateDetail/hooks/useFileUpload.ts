import { logger } from '@/lib/logger';
/**
 * Hook para gestionar la subida de archivos de prueba técnica
 */
import { useState, useCallback, useRef } from 'react';
import { uploadTechTestFile } from '../../selectionProcess/services/selectionProcessApi';
import { getErrorMessage } from '../../../hooks/useErrorHandler';

export interface UseFileUploadReturn {
  uploading: boolean;
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: () => void;
  handleFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    processId: string,
    onRefresh: () => Promise<void>,
    t: (key: string) => string
  ) => Promise<void>;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      processId: string,
      onRefresh: () => Promise<void>,
      t: (key: string) => string
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setError(null);

      try {
        await uploadTechTestFile(processId, file);
        await onRefresh();
      } catch (err) {
        logger.error('Error uploading file:', err);
        setError(getErrorMessage(err) || t('candidateDetail.uploadError'));
      } finally {
        setUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    []
  );

  return {
    uploading,
    error,
    fileInputRef,
    handleFileSelect,
    handleFileChange,
  };
}
