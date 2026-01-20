import styles from './Skeleton.module.css';

/**
 * Props for the Skeleton component
 */
export interface SkeletonProps {
  /** Shape of the skeleton @default 'text' */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Width of the skeleton (px or CSS unit) */
  width?: string | number;
  /** Height of the skeleton (px or CSS unit) */
  height?: string | number;
  /** Number of text lines to render (only for text variant) @default 1 */
  lines?: number;
  /** Additional CSS classes */
  className?: string;
  /** Animation type @default 'pulse' */
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * A placeholder loading component that mimics content structure.
 * Use during async data loading to improve perceived performance.
 *
 * @example
 * ```tsx
 * // Single text line
 * <Skeleton variant="text" width="200px" />
 *
 * // Multiple text lines
 * <Skeleton variant="text" lines={3} />
 *
 * // Avatar placeholder
 * <Skeleton variant="circular" width={40} height={40} />
 *
 * // Card placeholder
 * <Skeleton variant="rectangular" height={200} />
 * ```
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
  animation = 'pulse',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`${styles.container} ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${styles.skeleton} ${styles.text} ${styles[animation]}`}
            style={{
              ...style,
              width: index === lines - 1 ? '80%' : style.width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${styles[animation]} ${className}`}
      style={style}
    />
  );
}

// Preset skeletons for common use cases

/** Preset skeleton for text content */
export function SkeletonText({ lines = 3, width }: { lines?: number; width?: string }) {
  return <Skeleton variant="text" lines={lines} width={width} />;
}

/** Preset skeleton for avatar/profile images */
export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} />;
}

/** Preset skeleton for buttons */
export function SkeletonButton({ width = 100, height = 36 }: { width?: number; height?: number }) {
  return <Skeleton variant="rounded" width={width} height={height} />;
}

/** Preset skeleton for card components */
export function SkeletonCard({ height = 200 }: { height?: number }) {
  return (
    <div className={styles.cardSkeleton}>
      <Skeleton variant="rectangular" height={height * 0.6} />
      <div className={styles.cardContent}>
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" lines={2} />
      </div>
    </div>
  );
}

/** Preset skeleton for table components */
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className={styles.tableSkeleton}>
      <div className={styles.tableHeader}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width="80%" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={styles.tableRow}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" width={colIndex === 0 ? '60%' : '80%'} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
