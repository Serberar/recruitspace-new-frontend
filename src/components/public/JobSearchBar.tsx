import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type FilterOptions } from '../../features/publicJobs/services/publicJobsApi';
import { JobFilters } from './JobFilters';
import styles from './JobSearchBar.module.css';

const FILTERS_EXPANDED_KEY = 'job-filters-expanded';

interface JobSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  filterOptions: FilterOptions;
  category: string;
  location: string;
  modality: string;
  contractType: string;
  onFilterChange: (filterName: string, value: string) => void;
}

export function JobSearchBar({
  search,
  onSearchChange,
  onSearchSubmit,
  filterOptions,
  category,
  location,
  modality,
  contractType,
  onFilterChange,
}: JobSearchBarProps) {
  const { t } = useTranslation('common');

  const [filtersExpanded, setFiltersExpanded] = useState(() => {
    const saved = localStorage.getItem(FILTERS_EXPANDED_KEY);
    return saved !== null ? saved === 'true' : false;
  });

  useEffect(() => {
    localStorage.setItem(FILTERS_EXPANDED_KEY, String(filtersExpanded));
  }, [filtersExpanded]);

  const hasFilters = filterOptions.categories.length > 0 ||
    filterOptions.locations.length > 0 ||
    filterOptions.modalities.length > 0 ||
    filterOptions.contractTypes.length > 0;

  const activeFiltersCount = [category, location, modality, contractType].filter(Boolean).length;

  return (
    <div className={styles.searchSection}>
      <form className={styles.searchForm} onSubmit={onSearchSubmit}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('public.jobsList.searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button type="submit" className={styles.searchButton}>
          {t('public.jobsList.search')}
        </button>
      </form>

      {hasFilters && (
        <>
          <button
            type="button"
            className={styles.filtersToggle}
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <svg className={styles.filtersToggleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
            </svg>
            <span>{t('public.jobsList.filters')}</span>
            {activeFiltersCount > 0 && (
              <span className={styles.filtersBadge}>{activeFiltersCount}</span>
            )}
            <svg
              className={`${styles.filtersChevron} ${filtersExpanded ? styles.filtersChevronExpanded : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <div className={`${styles.filtersCollapsible} ${filtersExpanded ? styles.filtersExpanded : ''}`}>
            <JobFilters
              filterOptions={filterOptions}
              category={category}
              location={location}
              modality={modality}
              contractType={contractType}
              onFilterChange={onFilterChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
