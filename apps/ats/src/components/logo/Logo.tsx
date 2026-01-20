import styles from './Logo.module.css';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /** Variante de color: 'dark' para fondos claros, 'light' para fondos oscuros */
  variant?: 'dark' | 'light';
  className?: string;
}

export default function Logo({ size = 'md', variant = 'dark', className = '' }: LogoProps) {
  const variantClass = variant === 'light' ? styles.light : '';

  return (
    <div className={`${styles.logoContainer} ${styles[size]} ${variantClass} ${className}`}>
      <span className={styles.textLogo}>
        <span className={styles.gradientR}>R</span>
        <span className={styles.darkText}>ecruitSpace</span>
      </span>
    </div>
  );
}
