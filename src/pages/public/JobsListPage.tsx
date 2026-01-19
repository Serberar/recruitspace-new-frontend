import { logger } from '@/lib/logger';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getPublicJobOffers,
  getPublicJobOffersByOrganization,
  getPublicOrganization,
  getPublicFilterOptions,
  getPublicFilterOptionsByOrganization,
  type PublicJobOffer,
  type PublicOrganization,
  type FilterOptions,
} from '../../features/publicJobs/services/publicJobsApi';
import { SEO, OrganizationSEO } from '../../components/seo';
import { PublicFooter, PublicHeader, JobCard, JobSearchBar } from '../../components/public';
import Logo from '../../components/logo/Logo';
import { getViewedJobIds } from '../../utils/viewedJobs';
import styles from './JobsListPage.module.css';

const JOB_FILTERS_KEY = 'job-filters';

interface SavedFilters {
  category?: string;
  location?: string;
  modality?: string;
  contractType?: string;
}

const getSavedFilters = (orgSlug?: string): SavedFilters => {
  try {
    const key = orgSlug ? `${JOB_FILTERS_KEY}-${orgSlug}` : JOB_FILTERS_KEY;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveFilters = (filters: SavedFilters, orgSlug?: string) => {
  const key = orgSlug ? `${JOB_FILTERS_KEY}-${orgSlug}` : JOB_FILTERS_KEY;
  localStorage.setItem(key, JSON.stringify(filters));
};

export default function JobsListPage() {
  const { t } = useTranslation('common');
  const { orgSlug } = useParams<{ orgSlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode: organization-specific or global
  const isOrgMode = !!orgSlug;

  // Organization data (only in org mode)
  const [organization, setOrganization] = useState<PublicOrganization | null>(null);

  // Jobs and filters
  const [jobs, setJobs] = useState<PublicJobOffer[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    locations: [],
    contractTypes: [],
    modalities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filters from URL params first, then localStorage
  const savedFilters = getSavedFilters(orgSlug);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || savedFilters.category || '');
  const [location, setLocation] = useState(searchParams.get('location') || savedFilters.location || '');
  const [modality, setModality] = useState(searchParams.get('modality') || savedFilters.modality || '');
  const [contractType, setContractType] = useState(searchParams.get('contractType') || savedFilters.contractType || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewedJobIds, setViewedJobIds] = useState<Set<string>>(new Set());

  // Save filters to localStorage when they change
  const persistFilters = useCallback(() => {
    saveFilters({ category, location, modality, contractType }, orgSlug);
  }, [category, location, modality, contractType, orgSlug]);

  useEffect(() => {
    persistFilters();
  }, [persistFilters]);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isOrgMode && orgSlug) {
        // Organization mode: fetch org info and jobs
        const [org, jobsResponse] = await Promise.all([
          organization ? Promise.resolve(organization) : getPublicOrganization(orgSlug),
          getPublicJobOffersByOrganization(orgSlug, {
            search: search || undefined,
            category: category || undefined,
            location: location || undefined,
            modality: modality || undefined,
            contractType: contractType || undefined,
          }),
        ]);
        setOrganization(org);
        setJobs(jobsResponse.data);
        setTotalPages(1); // Org mode doesn't have pagination yet
      } else {
        // Global mode: fetch all jobs with pagination
        const result = await getPublicJobOffers({
          search: search || undefined,
          category: category || undefined,
          location: location || undefined,
          modality: modality || undefined,
          contractType: contractType || undefined,
          page,
          limit: 10,
        });
        setJobs(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || t('public.jobsList.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const options = isOrgMode && orgSlug
        ? await getPublicFilterOptionsByOrganization(orgSlug)
        : await getPublicFilterOptions();
      setFilterOptions(options);
    } catch (err) {
      logger.error('Error loading filter options:', err);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    setViewedJobIds(getViewedJobIds());
  }, [orgSlug]);

  useEffect(() => {
    fetchJobs();
  }, [page, category, location, modality, contractType, orgSlug]);

  const buildSearchParams = (overrides: Record<string, string> = {}) => {
    const params: Record<string, string> = {};
    const currentValues = {
      page: String(page),
      search,
      category,
      location,
      modality,
      contractType,
      ...overrides,
    };
    Object.entries(currentValues).forEach(([key, value]) => {
      if (value && value !== '1' || key === 'page') {
        if (value) params[key] = value;
      }
    });
    return params;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchParams(buildSearchParams({ page: '1' }));
    fetchJobs();
  };

  const handleFilterChange = (filterName: string, value: string) => {
    switch (filterName) {
      case 'category':
        setCategory(value);
        break;
      case 'location':
        setLocation(value);
        break;
      case 'modality':
        setModality(value);
        break;
      case 'contractType':
        setContractType(value);
        break;
    }
    setPage(1);
    setSearchParams(buildSearchParams({ [filterName]: value, page: '1' }));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams(buildSearchParams({ page: String(newPage) }));
  };

  // Error state for org mode when org not found
  if (isOrgMode && !loading && (error || !organization)) {
    return (
      <div className={styles.page}>
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <h2>{t('public.jobsList.loadError')}</h2>
            <p>{error || t('app.error')}</p>
            <Link to="/jobs" className={styles.errorBackLink}>
              {t('public.jobDetail.backToOffers')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine header configuration
  const hasCustomHeader = isOrgMode && organization?.headerImageUrl;
  const showOrgLogo = isOrgMode && organization?.logoUrl;
  const headerTitle = isOrgMode && organization
    ? (organization.portalTitle || organization.name)
    : null;
  const headerSubtitle = isOrgMode && organization
    ? (organization.portalSubtitle || t('public.jobsList.subtitle'))
    : t('public.jobsList.subtitle');

  return (
    <div className={styles.page}>
      {/* SEO */}
      {isOrgMode && organization ? (
        <OrganizationSEO
          name={organization.name}
          description={`Ofertas de empleo en ${organization.name}. Encuentra tu proximo trabajo.`}
          logo={organization.logoUrl}
          url={window.location.href}
        />
      ) : (
        <SEO
          title={t('public.jobsList.title')}
          description={t('public.jobsList.subtitle')}
          keywords="empleo, trabajo, ofertas de trabajo, reclutamiento"
        />
      )}

      {/* Header */}
      <PublicHeader
        logoUrl={isOrgMode ? organization?.logoUrl : undefined}
        organizationName={isOrgMode ? headerTitle || undefined : undefined}
        showBranding={!isOrgMode || !organization?.logoUrl}
      />

      {/* Hero Header */}
      <header className={`${styles.header} ${hasCustomHeader ? styles.hasCustomHeader : ''} ${isOrgMode ? styles.orgMode : ''}`}>
        {hasCustomHeader ? (
          <>
            <img
              src={organization!.headerImageUrl}
              alt=""
              className={styles.customHeaderImage}
            />
            <div className={styles.customHeaderOverlay} />
          </>
        ) : (
          <div className={styles.headerBackground} />
        )}
        <div className={styles.headerContent}>
          {isOrgMode ? (
            // Organization mode header
            <>
              {showOrgLogo && (
                <div className={styles.orgLogoWrapper}>
                  <img
                    src={organization!.logoUrl}
                    alt={organization!.name}
                    className={styles.orgLogo}
                  />
                </div>
              )}
              <div className={styles.headerText}>
                <h1 className={styles.title}>{headerTitle}</h1>
                <p className={styles.subtitle}>{headerSubtitle}</p>
              </div>
            </>
          ) : (
            // Global mode header
            <>
              <h1 className={styles.brand}>
                <Logo size="lg" variant="light" />
                <span className={styles.brandJobs}>Jobs</span>
              </h1>
              <p className={styles.subtitle}>{headerSubtitle}</p>
            </>
          )}
        </div>
      </header>

      {/* Search and Filters */}
      <JobSearchBar
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearch}
        filterOptions={filterOptions}
        category={category}
        location={location}
        modality={modality}
        contractType={contractType}
        onFilterChange={handleFilterChange}
      />

      {/* Content */}
      <main className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner} />
            <p>{t('public.jobsList.loading')}</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button className={styles.retryButton} onClick={fetchJobs}>
              {t('public.jobsList.retry')}
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>
              {t('public.jobsList.noOffers')}
            </p>
            {isOrgMode && (
              <Link to="/jobs" className={styles.viewAllLink}>
                {t('public.jobDetail.backToOffers')}
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={styles.jobsList}>
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isViewed={viewedJobIds.has(job.id)}
                  showCompany={!isOrgMode || !!job.displayName}
                  orgSlug={isOrgMode ? orgSlug : undefined}
                />
              ))}
            </div>

            {/* Pagination (only in global mode) */}
            {!isOrgMode && totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageButton}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  ← {t('public.jobsList.previous')}
                </button>
                <span className={styles.pageInfo}>
                  {t('public.jobsList.pageInfo', { page, totalPages })}
                </span>
                <button
                  className={styles.pageButton}
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  {t('public.jobsList.next')} →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
