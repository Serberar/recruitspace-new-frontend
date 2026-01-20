/**
 * useOfferFilters - Hook para gestionar filtros de candidatos en ofertas
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { logger } from '@/lib/logger';
import { updateOfferFilters } from '@/services/jobOffersApi';
import type { SelectionProcess } from '@/types';

export interface FilterState {
  searchQuery: string;
  selectedSkills: string[];
  selectedEducation: string[];
  reviewStatus: 'all' | 'reviewed' | 'unreviewed';
  dismissedSkillSuggestions: string[];
  dismissedEducationSuggestions: string[];
}

const FILTER_STORAGE_KEY = 'recruitspace_offer_filters_';

const getStoredFilters = (offerId: string): FilterState | null => {
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY + offerId);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
};

const saveFiltersToStorage = (offerId: string, filters: FilterState) => {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY + offerId, JSON.stringify(filters));
  } catch {
    // Ignore storage errors
  }
};

const clearStoredFilters = (offerId: string) => {
  try {
    localStorage.removeItem(FILTER_STORAGE_KEY + offerId);
  } catch {
    // Ignore storage errors
  }
};

const getDefaultFilters = (): FilterState => ({
  searchQuery: '',
  selectedSkills: [],
  selectedEducation: [],
  reviewStatus: 'all',
  dismissedSkillSuggestions: [],
  dismissedEducationSuggestions: [],
});

interface UseOfferFiltersProps {
  offerId: string | undefined;
  processes: SelectionProcess[];
  initialSavedSkillFilters: string[];
  initialSavedEducationFilters: string[];
}

export function useOfferFilters({
  offerId,
  processes,
  initialSavedSkillFilters,
  initialSavedEducationFilters,
}: UseOfferFiltersProps) {
  const [persistFilters, setPersistFilters] = useState(() => {
    try {
      return localStorage.getItem(FILTER_STORAGE_KEY + 'persist_' + offerId) === 'true';
    } catch {
      return false;
    }
  });

  const [filters, setFilters] = useState<FilterState>(() => {
    if (offerId && persistFilters) {
      const stored = getStoredFilters(offerId);
      if (stored) return stored;
    }
    return getDefaultFilters();
  });

  const [savedSkillFilters, setSavedSkillFilters] = useState<string[]>(initialSavedSkillFilters);
  const [savedEducationFilters, setSavedEducationFilters] = useState<string[]>(initialSavedEducationFilters);
  const [savingFilters, setSavingFilters] = useState(false);
  const saveFiltersTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update saved filters when props change
  useEffect(() => {
    setSavedSkillFilters(initialSavedSkillFilters);
    setSavedEducationFilters(initialSavedEducationFilters);
  }, [initialSavedSkillFilters, initialSavedEducationFilters]);

  // Save/clear filters based on persist preference
  useEffect(() => {
    if (offerId) {
      if (persistFilters) {
        const hasActiveFilters =
          filters.searchQuery !== '' ||
          filters.selectedSkills.length > 0 ||
          filters.selectedEducation.length > 0 ||
          filters.reviewStatus !== 'all';

        if (hasActiveFilters) {
          saveFiltersToStorage(offerId, filters);
        } else {
          clearStoredFilters(offerId);
        }
      } else {
        clearStoredFilters(offerId);
      }
    }
  }, [filters, offerId, persistFilters]);

  // Save persist preference
  useEffect(() => {
    if (offerId) {
      try {
        if (persistFilters) {
          localStorage.setItem(FILTER_STORAGE_KEY + 'persist_' + offerId, 'true');
        } else {
          localStorage.removeItem(FILTER_STORAGE_KEY + 'persist_' + offerId);
        }
      } catch {
        // Ignore storage errors
      }
    }
  }, [persistFilters, offerId]);

  // Extract unique skills and education from candidates
  const { candidateSkills, candidateEducation } = useMemo(() => {
    const skillsSet = new Set<string>();
    const educationSet = new Set<string>();

    processes.forEach((process) => {
      if (process.candidate?.skills) {
        process.candidate.skills.forEach((skill) => {
          if (!savedSkillFilters.includes(skill)) {
            skillsSet.add(skill);
          }
        });
      }
      if (process.candidate?.education) {
        process.candidate.education.forEach((edu) => {
          if (edu.degree && !savedEducationFilters.includes(edu.degree)) {
            educationSet.add(edu.degree);
          }
        });
      }
    });

    return {
      candidateSkills: Array.from(skillsSet).sort(),
      candidateEducation: Array.from(educationSet).sort(),
    };
  }, [processes, savedSkillFilters, savedEducationFilters]);

  // Filter processes based on current filters
  const filteredProcesses = useMemo(() => {
    return processes.filter((process) => {
      const candidate = process.candidate;

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const nameMatch = candidate?.fullName?.toLowerCase().includes(query);
        const emailMatch = candidate?.email?.toLowerCase().includes(query);
        if (!nameMatch && !emailMatch) return false;
      }

      // Skills filter (AND)
      if (filters.selectedSkills.length > 0) {
        const candidateSkills = candidate?.skills || [];
        const hasAllSkills = filters.selectedSkills.every((filterSkill) => {
          const filterLower = filterSkill.toLowerCase();
          return candidateSkills.some((candidateSkill) =>
            candidateSkill.toLowerCase().includes(filterLower)
          );
        });
        if (!hasAllSkills) return false;
      }

      // Education filter (AND)
      if (filters.selectedEducation.length > 0) {
        const candidateEducation = candidate?.education || [];
        const hasAllEducation = filters.selectedEducation.every((filterEdu) => {
          const filterLower = filterEdu.toLowerCase();
          return candidateEducation.some((e) =>
            e.degree?.toLowerCase().includes(filterLower)
          );
        });
        if (!hasAllEducation) return false;
      }

      // Review status filter
      if (filters.reviewStatus === 'reviewed' && !process.reviewed) return false;
      if (filters.reviewStatus === 'unreviewed' && process.reviewed) return false;

      return true;
    });
  }, [processes, filters]);

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.selectedSkills.length > 0 ||
    filters.selectedEducation.length > 0 ||
    filters.reviewStatus !== 'all';

  // Actions
  const clearFilters = useCallback(() => {
    setFilters(getDefaultFilters());
    if (offerId) {
      clearStoredFilters(offerId);
    }
  }, [offerId]);

  const toggleSkillFilter = useCallback((skill: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter((s) => s !== skill)
        : [...prev.selectedSkills, skill],
    }));
  }, []);

  const removeSkillFilter = useCallback((skill: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.filter((s) => s !== skill),
    }));
  }, []);

  const toggleEducationFilter = useCallback((education: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedEducation: prev.selectedEducation.includes(education)
        ? prev.selectedEducation.filter((e) => e !== education)
        : [...prev.selectedEducation, education],
    }));
  }, []);

  const removeEducationFilter = useCallback((education: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedEducation: prev.selectedEducation.filter((e) => e !== education),
    }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setReviewStatus = useCallback((status: 'all' | 'reviewed' | 'unreviewed') => {
    setFilters((prev) => ({ ...prev, reviewStatus: status }));
  }, []);

  const clearReviewStatusFilter = useCallback(() => {
    setFilters((prev) => ({ ...prev, reviewStatus: 'all' }));
  }, []);

  // API sync for saved filters
  const saveFiltersToApi = useCallback(async (skills: string[], education: string[]) => {
    if (!offerId) return;

    if (saveFiltersTimeoutRef.current) {
      clearTimeout(saveFiltersTimeoutRef.current);
    }

    saveFiltersTimeoutRef.current = setTimeout(async () => {
      setSavingFilters(true);
      try {
        await updateOfferFilters(offerId, {
          skillFilters: skills,
          educationFilters: education,
        });
      } catch (err) {
        logger.error('Error saving filters:', err);
      } finally {
        setSavingFilters(false);
      }
    }, 500);
  }, [offerId]);

  const addSavedSkillFilter = useCallback((skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !savedSkillFilters.includes(trimmedSkill)) {
      const newFilters = [...savedSkillFilters, trimmedSkill];
      setSavedSkillFilters(newFilters);
      saveFiltersToApi(newFilters, savedEducationFilters);
    }
  }, [savedSkillFilters, savedEducationFilters, saveFiltersToApi]);

  const removeSavedSkillFilter = useCallback((skill: string) => {
    const newFilters = savedSkillFilters.filter((s) => s !== skill);
    setSavedSkillFilters(newFilters);
    saveFiltersToApi(newFilters, savedEducationFilters);
  }, [savedSkillFilters, savedEducationFilters, saveFiltersToApi]);

  const addSavedEducationFilter = useCallback((education: string) => {
    const trimmedEducation = education.trim();
    if (trimmedEducation && !savedEducationFilters.includes(trimmedEducation)) {
      const newFilters = [...savedEducationFilters, trimmedEducation];
      setSavedEducationFilters(newFilters);
      saveFiltersToApi(savedSkillFilters, newFilters);
    }
  }, [savedSkillFilters, savedEducationFilters, saveFiltersToApi]);

  const removeSavedEducationFilter = useCallback((education: string) => {
    const newFilters = savedEducationFilters.filter((e) => e !== education);
    setSavedEducationFilters(newFilters);
    saveFiltersToApi(savedSkillFilters, newFilters);
  }, [savedSkillFilters, savedEducationFilters, saveFiltersToApi]);

  const dismissSkillSuggestion = useCallback((skill: string) => {
    if (savedSkillFilters.includes(skill)) {
      removeSavedSkillFilter(skill);
    } else {
      setFilters((prev) => ({
        ...prev,
        dismissedSkillSuggestions: [...prev.dismissedSkillSuggestions, skill],
      }));
    }
  }, [savedSkillFilters, removeSavedSkillFilter]);

  const dismissEducationSuggestion = useCallback((education: string) => {
    if (savedEducationFilters.includes(education)) {
      removeSavedEducationFilter(education);
    } else {
      setFilters((prev) => ({
        ...prev,
        dismissedEducationSuggestions: [...prev.dismissedEducationSuggestions, education],
      }));
    }
  }, [savedEducationFilters, removeSavedEducationFilter]);

  return {
    filters,
    filteredProcesses,
    hasActiveFilters,
    persistFilters,
    setPersistFilters,
    candidateSkills,
    candidateEducation,
    savedSkillFilters,
    savedEducationFilters,
    savingFilters,
    // Actions
    clearFilters,
    toggleSkillFilter,
    removeSkillFilter,
    toggleEducationFilter,
    removeEducationFilter,
    setSearchQuery,
    setReviewStatus,
    clearReviewStatusFilter,
    addSavedSkillFilter,
    removeSavedSkillFilter,
    addSavedEducationFilter,
    removeSavedEducationFilter,
    dismissSkillSuggestion,
    dismissEducationSuggestion,
  };
}
