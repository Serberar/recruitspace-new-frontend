import { useTranslation } from 'react-i18next';
import { getModalityLabel, type FilterOptions } from '../../features/publicJobs/services/publicJobsApi';
import styles from './JobFilters.module.css';

interface JobFiltersProps {
  filterOptions: FilterOptions;
  category: string;
  location: string;
  modality: string;
  contractType: string;
  onFilterChange: (filterName: string, value: string) => void;
}

export function JobFilters({
  filterOptions,
  category,
  location,
  modality,
  contractType,
  onFilterChange,
}: JobFiltersProps) {
  const { t } = useTranslation('common');

  return (
    <div className={styles.filters}>
      {filterOptions.categories.length > 0 && (
        <div className={styles.filterWrapper}>
          <svg className={styles.filterIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <select
            className={`${styles.filterSelect} ${category ? styles.hasValue : ''}`}
            value={category}
            onChange={(e) => onFilterChange('category', e.target.value)}
          >
            <option value="">{t('public.jobsList.allCategories')}</option>
            {filterOptions.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {filterOptions.locations.length > 0 && (
        <div className={styles.filterWrapper}>
          <svg className={styles.filterIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <select
            className={`${styles.filterSelect} ${location ? styles.hasValue : ''}`}
            value={location}
            onChange={(e) => onFilterChange('location', e.target.value)}
          >
            <option value="">{t('public.jobsList.allLocations')}</option>
            {filterOptions.locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      )}

      {filterOptions.modalities.length > 0 && (
        <div className={styles.filterWrapper}>
          <svg className={styles.filterIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <select
            className={`${styles.filterSelect} ${modality ? styles.hasValue : ''}`}
            value={modality}
            onChange={(e) => onFilterChange('modality', e.target.value)}
          >
            <option value="">{t('public.jobsList.allModalities')}</option>
            {filterOptions.modalities.map((mod) => (
              <option key={mod} value={mod}>
                {getModalityLabel(mod)}
              </option>
            ))}
          </select>
        </div>
      )}

      {filterOptions.contractTypes.length > 0 && (
        <div className={styles.filterWrapper}>
          <svg className={styles.filterIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <select
            className={`${styles.filterSelect} ${contractType ? styles.hasValue : ''}`}
            value={contractType}
            onChange={(e) => onFilterChange('contractType', e.target.value)}
          >
            <option value="">{t('public.jobsList.allContractTypes')}</option>
            {filterOptions.contractTypes.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
