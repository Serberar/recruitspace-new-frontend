import { useRef, useState } from 'react';
import { useFormContext, useController, type FieldPath, type FieldValues } from 'react-hook-form';
import styles from './FormFileInput.module.css';

export interface FormFileInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  label?: string;
  accept?: string;
  hint?: string;
  required?: boolean;
  maxSizeMB?: number;
  className?: string;
}

export function FormFileInput<T extends FieldValues>({
  name,
  label,
  accept,
  hint,
  required,
  maxSizeMB = 10,
  className = '',
}: FormFileInputProps<T>) {
  const { control } = useFormContext<T>();
  const {
    field: { onChange, value },
    fieldState: { error },
  } = useController({ name, control });

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const errorMessage = error?.message as string | undefined;
  const id = `file-${name}`;
  const file = value as File | null;

  const handleFileChange = (files: FileList | null) => {
    const selectedFile = files?.[0];
    if (selectedFile) {
      onChange(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div
        className={`${styles.dropzone} ${dragActive ? styles.active : ''} ${errorMessage ? styles.error : ''}`}
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-describedby={errorMessage ? `${id}-error` : hint ? `${id}-hint` : undefined}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          className={styles.input}
          onChange={(e) => handleFileChange(e.target.files)}
          aria-invalid={!!errorMessage}
        />

        {file ? (
          <div className={styles.fileInfo}>
            <span className={styles.fileName}>{file.name}</span>
            <span className={styles.fileSize}>{formatSize(file.size)}</span>
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="Eliminar archivo"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <svg
              className={styles.uploadIcon}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <span className={styles.placeholderText}>
              Haz clic o arrastra un archivo
            </span>
            {hint && (
              <span id={`${id}-hint`} className={styles.placeholderHint}>
                {hint}
              </span>
            )}
            {!hint && accept && (
              <span className={styles.placeholderHint}>
                Max {maxSizeMB}MB
              </span>
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <span id={`${id}-error`} className={styles.errorText} role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
}

export default FormFileInput;
