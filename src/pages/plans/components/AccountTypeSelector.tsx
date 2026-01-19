/**
 * AccountTypeSelector Component
 *
 * Selector de tipo de cuenta: Freelance o Empresa.
 * Diseño moderno estilo pills/toggle.
 */

import type { AccountType } from '@/features/plans';
import styles from '../PlansPage.module.css';

interface AccountTypeSelectorProps {
  selected: AccountType;
  onChange: (type: AccountType) => void;
}

export function AccountTypeSelector({ selected, onChange }: AccountTypeSelectorProps) {
  return (
    <div className={styles.accountTypeSelector}>
      <div className={styles.accountTypeSelectorWrapper}>
        <button
          className={`${styles.accountTypeButton} ${selected === 'freelance' ? styles.accountTypeButtonActive : ''}`}
          onClick={() => onChange('freelance')}
          aria-pressed={selected === 'freelance'}
        >
          <span className={styles.accountTypeIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="5" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
          </span>
          <span className={styles.accountTypeContent}>
            <span className={styles.accountTypeLabel}>Freelance</span>
            <span className={styles.accountTypeDesc}>Profesionales independientes</span>
          </span>
        </button>

        <button
          className={`${styles.accountTypeButton} ${selected === 'company' ? styles.accountTypeButtonActive : ''}`}
          onClick={() => onChange('company')}
          aria-pressed={selected === 'company'}
        >
          <span className={styles.accountTypeIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4v18" />
              <path d="M19 21V11l-6-4" />
              <path d="M9 9v.01" />
              <path d="M9 12v.01" />
              <path d="M9 15v.01" />
              <path d="M9 18v.01" />
            </svg>
          </span>
          <span className={styles.accountTypeContent}>
            <span className={styles.accountTypeLabel}>Empresa</span>
            <span className={styles.accountTypeDesc}>Equipos y organizaciones</span>
          </span>
        </button>
      </div>
    </div>
  );
}
