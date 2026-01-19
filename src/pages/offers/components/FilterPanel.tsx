/**
 * FilterPanel - Panel de filtros para candidatos
 */

import { useTranslation } from 'react-i18next';
import styles from '../OfferDetailPage.module.css';

interface FilterState {
  searchQuery: string;
  selectedSkills: string[];
  selectedEducation: string[];
  reviewStatus: 'all' | 'reviewed' | 'unreviewed';
  dismissedSkillSuggestions: string[];
  dismissedEducationSuggestions: string[];
}

interface FilterPanelProps {
  filters: FilterState;
  showFilters: boolean;
  persistFilters: boolean;
  hasActiveFilters: boolean;
  candidateSkills: string[];
  candidateEducation: string[];
  savedSkillFilters: string[];
  savedEducationFilters: string[];
  showSkillInput: boolean;
  showEducationInput: boolean;
  newSkillInput: string;
  newEducationInput: string;
  onToggleFilters: () => void;
  onPersistFiltersChange: (persist: boolean) => void;
  onClearFilters: () => void;
  onSearchChange: (query: string) => void;
  onReviewStatusChange: (status: 'all' | 'reviewed' | 'unreviewed') => void;
  onToggleSkillFilter: (skill: string) => void;
  onRemoveSkillFilter: (skill: string) => void;
  onToggleEducationFilter: (education: string) => void;
  onRemoveEducationFilter: (education: string) => void;
  onDismissSkillSuggestion: (skill: string) => void;
  onDismissEducationSuggestion: (education: string) => void;
  onShowSkillInput: () => void;
  onShowEducationInput: () => void;
  onSkillInputChange: (value: string) => void;
  onEducationInputChange: (value: string) => void;
  onAddCustomSkill: () => void;
  onAddCustomEducation: () => void;
  onCancelSkillInput: () => void;
  onCancelEducationInput: () => void;
  onSkillInputKeyDown: (e: React.KeyboardEvent) => void;
  onEducationInputKeyDown: (e: React.KeyboardEvent) => void;
}

export function FilterPanel({
  filters,
  showFilters,
  persistFilters,
  hasActiveFilters,
  candidateSkills,
  candidateEducation,
  savedSkillFilters,
  savedEducationFilters,
  showSkillInput,
  showEducationInput,
  newSkillInput,
  newEducationInput,
  onToggleFilters,
  onPersistFiltersChange,
  onClearFilters,
  onSearchChange,
  onReviewStatusChange,
  onToggleSkillFilter,
  onRemoveSkillFilter,
  onToggleEducationFilter,
  onRemoveEducationFilter,
  onDismissSkillSuggestion,
  onDismissEducationSuggestion,
  onShowSkillInput,
  onShowEducationInput,
  onSkillInputChange,
  onEducationInputChange,
  onAddCustomSkill,
  onAddCustomEducation,
  onCancelSkillInput,
  onCancelEducationInput,
  onSkillInputKeyDown,
  onEducationInputKeyDown,
}: FilterPanelProps) {
  const { t } = useTranslation('common');

  const activeFilterCount =
    filters.selectedSkills.length +
    filters.selectedEducation.length +
    (filters.reviewStatus !== 'all' ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <div className={styles.filterSection}>
      <div className={styles.filterHeader}>
        <button
          className={`${styles.filterToggleButton} ${showFilters ? styles.filterToggleActive : ''}`}
          onClick={onToggleFilters}
        >
          <span className={styles.filterIcon}>⚙</span>
          {t('offerDetail.filters')}
          {hasActiveFilters && (
            <span className={styles.activeFilterCount}>{activeFilterCount}</span>
          )}
        </button>
        <div className={styles.filterHeaderRight}>
          <label className={styles.persistCheckbox}>
            <input
              type="checkbox"
              checked={persistFilters}
              onChange={(e) => onPersistFiltersChange(e.target.checked)}
            />
            <span>{t('offerDetail.keepFilters')}</span>
          </label>
          {hasActiveFilters && (
            <button className={styles.clearFiltersButton} onClick={onClearFilters}>
              {t('offerDetail.clearFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Search input - always visible */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t('offerDetail.searchPlaceholder')}
          value={filters.searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {filters.searchQuery && (
          <button
            className={styles.clearSearchButton}
            onClick={() => onSearchChange('')}
          >
            ×
          </button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className={styles.activeFiltersBar}>
          <span className={styles.activeFiltersLabel}>{t('offerDetail.activeFilters')}:</span>
          <div className={styles.activeFiltersList}>
            {filters.reviewStatus !== 'all' && (
              <span className={styles.activeFilterTag}>
                {filters.reviewStatus === 'reviewed'
                  ? t('offerDetail.reviewedFilter')
                  : t('offerDetail.notReviewed')}
                <button
                  className={styles.removeFilterButton}
                  onClick={() => onReviewStatusChange('all')}
                  aria-label="Remove filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.selectedSkills.map((skill) => (
              <span key={`skill-${skill}`} className={styles.activeFilterTag}>
                {skill}
                <button
                  className={styles.removeFilterButton}
                  onClick={() => onRemoveSkillFilter(skill)}
                  aria-label="Remove filter"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.selectedEducation.map((edu) => (
              <span key={`edu-${edu}`} className={styles.activeFilterTag}>
                {edu}
                <button
                  className={styles.removeFilterButton}
                  onClick={() => onRemoveEducationFilter(edu)}
                  aria-label="Remove filter"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expanded filters */}
      {showFilters && (
        <div className={styles.filterPanel}>
          {/* Review status filter */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t('offerDetail.reviewStatusFilter')}</label>
            <div className={styles.filterOptions}>
              <button
                className={`${styles.filterOption} ${filters.reviewStatus === 'all' ? styles.filterOptionActive : ''}`}
                onClick={() => onReviewStatusChange('all')}
              >
                {t('offerDetail.all')}
              </button>
              <button
                className={`${styles.filterOption} ${filters.reviewStatus === 'unreviewed' ? styles.filterOptionActive : ''}`}
                onClick={() => onReviewStatusChange('unreviewed')}
              >
                {t('offerDetail.notReviewed')}
              </button>
              <button
                className={`${styles.filterOption} ${filters.reviewStatus === 'reviewed' ? styles.filterOptionActive : ''}`}
                onClick={() => onReviewStatusChange('reviewed')}
              >
                {t('offerDetail.reviewedFilter')}
              </button>
            </div>
          </div>

          {/* Skills filter */}
          <div className={styles.filterGroup}>
            <div className={styles.filterLabelRow}>
              <label className={styles.filterLabel}>{t('offerDetail.skillsFilter')}</label>
              {!showSkillInput && (
                <button
                  className={styles.addFilterButtonSmall}
                  onClick={onShowSkillInput}
                  title={t('offerDetail.addSkillPlaceholder')}
                >
                  +
                </button>
              )}
            </div>
            {showSkillInput && (
              <div className={styles.filterInputRow}>
                <input
                  type="text"
                  className={styles.filterInput}
                  placeholder={t('offerDetail.addSkillPlaceholder')}
                  value={newSkillInput}
                  onChange={(e) => onSkillInputChange(e.target.value)}
                  onKeyDown={onSkillInputKeyDown}
                  autoFocus
                />
                <button
                  className={styles.confirmFilterButton}
                  onClick={onAddCustomSkill}
                  disabled={!newSkillInput.trim()}
                  title={t('app.confirm')}
                >
                  ✓
                </button>
                <button
                  className={styles.cancelFilterButton}
                  onClick={onCancelSkillInput}
                  title={t('app.cancel')}
                >
                  ×
                </button>
              </div>
            )}
            {/* Saved filters (manually created) */}
            {savedSkillFilters.filter((skill) => !filters.selectedSkills.includes(skill)).length > 0 && (
              <div className={styles.filterSubsection}>
                <span className={styles.filterSubsectionLabel}>{t('offerDetail.customFilters')}</span>
                <div className={styles.filterChips}>
                  {savedSkillFilters
                    .filter((skill) => !filters.selectedSkills.includes(skill))
                    .map((skill) => (
                      <span key={skill} className={`${styles.filterChip} ${styles.filterChipCustom}`}>
                        <button
                          className={styles.filterChipLabel}
                          onClick={() => onToggleSkillFilter(skill)}
                        >
                          {skill}
                        </button>
                        <button
                          className={styles.dismissSuggestionButton}
                          onClick={() => onDismissSkillSuggestion(skill)}
                          aria-label={t('offerDetail.dismissSuggestion')}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
            {/* Candidate-extracted filters */}
            {candidateSkills.filter(
              (skill) =>
                !filters.selectedSkills.includes(skill) &&
                !filters.dismissedSkillSuggestions.includes(skill)
            ).length > 0 && (
              <div className={styles.filterSubsection}>
                <span className={styles.filterSubsectionLabel}>{t('offerDetail.candidateFilters')}</span>
                <div className={styles.filterChips}>
                  {candidateSkills
                    .filter(
                      (skill) =>
                        !filters.selectedSkills.includes(skill) &&
                        !filters.dismissedSkillSuggestions.includes(skill)
                    )
                    .map((skill) => (
                      <span key={skill} className={styles.filterChip}>
                        <button
                          className={styles.filterChipLabel}
                          onClick={() => onToggleSkillFilter(skill)}
                        >
                          {skill}
                        </button>
                        <button
                          className={styles.dismissSuggestionButton}
                          onClick={() => onDismissSkillSuggestion(skill)}
                          aria-label={t('offerDetail.dismissSuggestion')}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Education filter */}
          <div className={styles.filterGroup}>
            <div className={styles.filterLabelRow}>
              <label className={styles.filterLabel}>{t('offerDetail.educationFilter')}</label>
              {!showEducationInput && (
                <button
                  className={styles.addFilterButtonSmall}
                  onClick={onShowEducationInput}
                  title={t('offerDetail.addEducationPlaceholder')}
                >
                  +
                </button>
              )}
            </div>
            {showEducationInput && (
              <div className={styles.filterInputRow}>
                <input
                  type="text"
                  className={styles.filterInput}
                  placeholder={t('offerDetail.addEducationPlaceholder')}
                  value={newEducationInput}
                  onChange={(e) => onEducationInputChange(e.target.value)}
                  onKeyDown={onEducationInputKeyDown}
                  autoFocus
                />
                <button
                  className={styles.confirmFilterButton}
                  onClick={onAddCustomEducation}
                  disabled={!newEducationInput.trim()}
                  title={t('app.confirm')}
                >
                  ✓
                </button>
                <button
                  className={styles.cancelFilterButton}
                  onClick={onCancelEducationInput}
                  title={t('app.cancel')}
                >
                  ×
                </button>
              </div>
            )}
            {/* Saved filters (manually created) */}
            {savedEducationFilters.filter((edu) => !filters.selectedEducation.includes(edu)).length > 0 && (
              <div className={styles.filterSubsection}>
                <span className={styles.filterSubsectionLabel}>{t('offerDetail.customFilters')}</span>
                <div className={styles.filterChips}>
                  {savedEducationFilters
                    .filter((edu) => !filters.selectedEducation.includes(edu))
                    .map((education) => (
                      <span key={education} className={`${styles.filterChip} ${styles.filterChipCustom}`}>
                        <button
                          className={styles.filterChipLabel}
                          onClick={() => onToggleEducationFilter(education)}
                        >
                          {education}
                        </button>
                        <button
                          className={styles.dismissSuggestionButton}
                          onClick={() => onDismissEducationSuggestion(education)}
                          aria-label={t('offerDetail.dismissSuggestion')}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
            {/* Candidate-extracted filters */}
            {candidateEducation.filter(
              (edu) =>
                !filters.selectedEducation.includes(edu) &&
                !filters.dismissedEducationSuggestions.includes(edu)
            ).length > 0 && (
              <div className={styles.filterSubsection}>
                <span className={styles.filterSubsectionLabel}>{t('offerDetail.candidateFilters')}</span>
                <div className={styles.filterChips}>
                  {candidateEducation
                    .filter(
                      (edu) =>
                        !filters.selectedEducation.includes(edu) &&
                        !filters.dismissedEducationSuggestions.includes(edu)
                    )
                    .map((education) => (
                      <span key={education} className={styles.filterChip}>
                        <button
                          className={styles.filterChipLabel}
                          onClick={() => onToggleEducationFilter(education)}
                        >
                          {education}
                        </button>
                        <button
                          className={styles.dismissSuggestionButton}
                          onClick={() => onDismissEducationSuggestion(education)}
                          aria-label={t('offerDetail.dismissSuggestion')}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
