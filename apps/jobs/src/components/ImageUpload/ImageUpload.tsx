import { useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  currentImageUrl?: string;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => void;
  label: string;
  hint?: string;
  dimensions?: string;
  previewType?: 'logo' | 'header';
  disabled?: boolean;
  maxSizeKB?: number;
  accept?: string;
}

export function ImageUpload({
  currentImageUrl,
  onUpload,
  onRemove,
  label,
  hint,
  dimensions,
  previewType = 'logo',
  disabled = false,
  maxSizeKB = 500,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
}: ImageUploadProps) {
  const { t } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const displayUrl = previewUrl || currentImageUrl;

  const handleClick = useCallback(() => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploading]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validar tamaño
      const maxSizeBytes = maxSizeKB * 1024;
      if (file.size > maxSizeBytes) {
        setError(t('imageUpload.fileTooLarge', { maxSize: maxSizeKB }));
        return;
      }

      // Validar tipo
      const allowedTypes = accept.split(',').map((t) => t.trim());
      if (!allowedTypes.includes(file.type)) {
        setError(t('imageUpload.invalidType'));
        return;
      }

      setError(null);
      setUploading(true);
      setImageError(false);

      // Crear preview local
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      try {
        await onUpload(file);
        // Limpiar preview local, la URL real vendrá del servidor
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('imageUpload.uploadError'));
        // Revertir preview
        URL.revokeObjectURL(localPreview);
        setPreviewUrl(null);
      } finally {
        setUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [accept, maxSizeKB, onUpload, t]
  );

  const handleRemove = useCallback(() => {
    if (onRemove && !disabled && !uploading) {
      onRemove();
      setPreviewUrl(null);
      setImageError(false);
    }
  }, [disabled, onRemove, uploading]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>

      <div className={styles.uploadArea}>
        {displayUrl && !imageError ? (
          <div className={`${styles.preview} ${styles[previewType]}`}>
            <img
              src={displayUrl}
              alt={label}
              className={styles.previewImage}
              onError={handleImageError}
            />
            {uploading && (
              <div className={styles.uploadingOverlay}>
                <div className={styles.spinner} />
              </div>
            )}
            {!disabled && !uploading && (
              <div className={styles.previewActions}>
                <button
                  type="button"
                  className={styles.changeButton}
                  onClick={handleClick}
                >
                  {t('imageUpload.change')}
                </button>
                {onRemove && (
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={handleRemove}
                  >
                    {t('imageUpload.remove')}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className={`${styles.dropzone} ${disabled ? styles.disabled : ''} ${uploading ? styles.uploading : ''}`}
            onClick={handleClick}
            disabled={disabled || uploading}
          >
            {uploading ? (
              <>
                <div className={styles.spinner} />
                <span>{t('imageUpload.uploading')}</span>
              </>
            ) : (
              <>
                <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17,8 12,3 7,8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className={styles.dropzoneText}>{t('imageUpload.clickToUpload')}</span>
                <span className={styles.dropzoneHint}>
                  {t('imageUpload.maxSize', { maxSize: maxSizeKB })}
                </span>
              </>
            )}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className={styles.hiddenInput}
          disabled={disabled || uploading}
        />
      </div>

      {error && <span className={styles.error}>{error}</span>}
      {hint && <span className={styles.hint}>{hint}</span>}
      {dimensions && <span className={styles.dimensions}>{dimensions}</span>}
    </div>
  );
}
