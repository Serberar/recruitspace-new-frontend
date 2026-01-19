import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks/reduxHooks';
import { usePermissions } from '../../hooks/useRole';
import { getRecruiterDashboard } from '../../features/dashboard/services/dashboardApi';
import { getRecruiterAnalytics } from '../../features/analytics/services/analyticsApi';
import type { RecruiterDashboard } from '../../types';
import type { RecruiterAnalytics, AnalyticsPeriod } from '../../features/analytics/types/analytics';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import styles from './DashboardPage.module.css';

const PERIODS: { value: AnalyticsPeriod; labelKey: string }[] = [
  { value: 'month', labelKey: 'analytics.periodMonth' },
  { value: 'quarter', labelKey: 'analytics.periodQuarter' },
  { value: 'year', labelKey: 'analytics.periodYear' },
  { value: 'all', labelKey: 'analytics.periodAll' },
];

export default function DashboardPage() {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { isAdmin } = usePermissions();

  const [dashboard, setDashboard] = useState<RecruiterDashboard | null>(null);
  const [analytics, setAnalytics] = useState<RecruiterAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>('month');

  const fetchData = async (selectedPeriod?: AnalyticsPeriod) => {
    setLoading(true);
    setError(null);
    try {
      if (isAdmin) {
        const data = await getRecruiterAnalytics({ period: selectedPeriod || period });
        setAnalytics(data);
      } else {
        const data = await getRecruiterDashboard();
        setDashboard(data);
      }
    } catch (err) {
      setError(getErrorMessage(err) || t('admin.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const handlePeriodChange = (newPeriod: AnalyticsPeriod) => {
    setPeriod(newPeriod);
    fetchData(newPeriod);
  };

  const getConversionClass = (rate: number) => {
    if (rate >= 20) return styles.conversionHigh;
    if (rate >= 10) return styles.conversionMedium;
    return styles.conversionLow;
  };

  const handleViewOffer = (offerId: string) => {
    navigate(`/app/offers/${offerId}`);
  };

  const handleCreateOffer = () => {
    navigate('/app/offers/new');
  };

  const handleViewProcess = (processId: string) => {
    navigate(`/app/process/${processId}`);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <p>{t('app.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h3>{t('app.error')}</h3>
        <p>{error}</p>
        <button className={styles.retryButton} onClick={() => fetchData()}>
          {t('app.retry')}
        </button>
      </div>
    );
  }

  // Admin Dashboard - Full Analytics View
  if (isAdmin && analytics) {
    const { summary, byStatus, byClient, byOffer } = analytics;

    // Empty state: No offers and no activity (no team)
    const hasNoData = byOffer.length === 0 && summary.activeProcesses === 0;

    if (hasNoData) {
      return (
        <div className={styles.dashboard}>
          <div className={styles.header}>
            <div>
              <h1>{t('dashboard.title')}</h1>
              {user && <p className={styles.greeting}>{t('dashboard.hello', { name: user.firstName })}</p>}
            </div>
          </div>

          <div className={styles.emptyState}>
            <h3>{t('dashboard.admin.noTeamTitle')}</h3>
            <p>{t('dashboard.admin.noTeamDesc')}</p>
            <button className="btn-primary" onClick={() => navigate('/app/team')}>
              {t('dashboard.admin.createRecruiters')}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.dashboard}>
        {/* Header con filtros */}
        <div className={styles.header}>
          <div>
            <h1>{t('dashboard.title')}</h1>
            {user && <p className={styles.greeting}>{t('dashboard.hello', { name: user.firstName })}</p>}
          </div>
          <div className={styles.periodFilters}>
            {PERIODS.map((p) => (
              <button
                key={p.value}
                className={`${styles.periodButton} ${period === p.value ? styles.periodActive : ''}`}
                onClick={() => handlePeriodChange(p.value)}
              >
                {t(p.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Info banner para admin */}
        <div className={styles.infoBanner}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>{t('admin.permissionsInfo')}</span>
        </div>

        {/* KPI Cards */}
        <div className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${styles.kpiPrimary}`}>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>{t('analytics.activeProcesses')}</span>
              <span className={styles.kpiValue}>{summary.activeProcesses}</span>
              <span className={styles.kpiSubtitle}>{t('analytics.activeProcessesDesc')}</span>
            </div>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiSuccess}`}>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>{t('analytics.hired')}</span>
              <span className={styles.kpiValue}>{summary.hiredThisPeriod}</span>
              <span className={styles.kpiSubtitle}>
                {t('analytics.hiredDesc', { rejected: summary.rejectedThisPeriod })}
              </span>
            </div>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiWarning}`}>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>{t('analytics.conversionRate')}</span>
              <span className={styles.kpiValue}>{summary.conversionRate}%</span>
              <span className={styles.kpiSubtitle}>
                {t('analytics.conversionRateDesc', { total: summary.totalApplicationsThisPeriod })}
              </span>
            </div>
          </div>

          <div className={`${styles.kpiCard} ${styles.kpiInfo}`}>
            <div className={styles.kpiContent}>
              <span className={styles.kpiLabel}>{t('analytics.avgTimeToHire')}</span>
              <span className={styles.kpiValue}>
                {summary.avgTimeToHire !== null ? `${summary.avgTimeToHire}` : '-'}
              </span>
              <span className={styles.kpiSubtitle}>{t('analytics.avgTimeToHireDesc')}</span>
            </div>
          </div>
        </div>

        {/* Sections Grid - Status & Clients */}
        <div className={styles.sectionsGrid}>
          {/* By Status */}
          <div className={styles.analyticsSection}>
            <div className={styles.analyticsSectionHeader}>
              <h2 className={styles.analyticsSectionTitle}>{t('analytics.byStatus')}</h2>
            </div>
            <div className={styles.analyticsSectionContent}>
              {byStatus.length === 0 ? (
                <div className={styles.emptySection}>
                  <p>{t('analytics.noData')}</p>
                </div>
              ) : (
                <div className={styles.statusTable}>
                  {byStatus.map((status) => (
                    <div key={status.statusId} className={styles.statusRow}>
                      <div className={styles.statusRowHeader}>
                        <span className={styles.statusName}>
                          <span
                            className={styles.statusDot}
                            style={{ backgroundColor: status.statusColor }}
                          />
                          {status.statusName}
                        </span>
                        <span className={styles.statusCount}>{status.count}</span>
                      </div>
                      <div className={styles.statusBarContainer}>
                        <div
                          className={styles.statusBar}
                          style={{
                            width: `${status.percentage}%`,
                            backgroundColor: status.statusColor,
                          }}
                        />
                      </div>
                      <span className={styles.statusPercentage}>
                        {status.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* By Client */}
          <div className={styles.analyticsSection}>
            <div className={styles.analyticsSectionHeader}>
              <h2 className={styles.analyticsSectionTitle}>{t('analytics.byClient')}</h2>
            </div>
            <div className={styles.analyticsSectionContent}>
              {byClient.length === 0 ? (
                <div className={styles.emptySection}>
                  <p>{t('analytics.noClients')}</p>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>{t('analytics.client')}</th>
                        <th className={styles.numericCell}>{t('analytics.offers')}</th>
                        <th className={styles.numericCell}>{t('analytics.active')}</th>
                        <th className={styles.numericCell}>{t('analytics.hired')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {byClient.map((client) => (
                        <tr key={client.clientId}>
                          <td className={styles.clientName}>{client.clientName}</td>
                          <td className={styles.numericCell}>{client.activeOffers}</td>
                          <td className={styles.numericCell}>{client.activeProcesses}</td>
                          <td className={styles.numericCell}>{client.hired}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* By Offer - Full width */}
        <div className={styles.analyticsSection}>
          <div className={styles.analyticsSectionHeader}>
            <h2 className={styles.analyticsSectionTitle}>{t('analytics.byOffer')}</h2>
          </div>
          <div className={styles.analyticsSectionContent}>
            {byOffer.length === 0 ? (
              <div className={styles.emptySection}>
                <p>{t('analytics.noOffers')}</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>{t('analytics.offer')}</th>
                      <th>{t('analytics.client')}</th>
                      <th className={styles.numericCell}>{t('analytics.candidates')}</th>
                      <th className={styles.numericCell}>{t('analytics.hired')}</th>
                      <th className={styles.numericCell}>{t('analytics.conversion')}</th>
                      <th>{t('analytics.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byOffer.map((offer) => (
                      <tr
                        key={offer.offerId}
                        className={styles.clickableRow}
                        onClick={() => handleViewOffer(offer.offerId)}
                      >
                        <td className={styles.offerTitle}>{offer.offerTitle}</td>
                        <td>{offer.clientName}</td>
                        <td className={styles.numericCell}>{offer.totalCandidates}</td>
                        <td className={styles.numericCell}>{offer.hired}</td>
                        <td className={styles.numericCell}>
                          <span className={`${styles.conversionBadge} ${getConversionClass(offer.conversionRate)}`}>
                            {offer.conversionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td>
                          {offer.isActive ? (
                            <span className={styles.activeBadge}>{t('analytics.activeStatus')}</span>
                          ) : (
                            <span className={styles.inactiveBadge}>{t('analytics.closedStatus')}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button className="btn-secondary" onClick={() => navigate('/app/offers')}>
            {t('dashboard.viewOffers')}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/app/team')}>
            {t('dashboard.admin.manageTeam')}
          </button>
          <button className="btn-primary" onClick={handleCreateOffer}>
            {t('dashboard.createOffer')}
          </button>
        </div>
      </div>
    );
  }

  // Recruiter Dashboard - Task-oriented View
  const activeOffers = dashboard?.assignedOffers.filter(o => o.active) || [];
  const pendingReviewByOffer = dashboard?.pendingReviewByOffer || [];
  const totalPendingReview = pendingReviewByOffer.reduce((sum, item) => sum + item.count, 0);
  const hasPendingReview = totalPendingReview > 0;
  const hasActiveOffers = activeOffers.length > 0;
  const unreadMessages = dashboard?.unreadMessages || [];
  const totalUnreadMessages = dashboard?.totalUnreadMessages || 0;
  const hasUnreadMessages = totalUnreadMessages > 0;

  if (!hasActiveOffers && !hasPendingReview && !hasUnreadMessages) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <div>
            <h1>{t('dashboard.title')}</h1>
            {user && <p className={styles.greeting}>{t('dashboard.hello', { name: user.firstName })}</p>}
          </div>
        </div>

        <div className={styles.emptyState}>
          <h3>{t('dashboard.noOffers')}</h3>
          <button className="btn-primary" onClick={handleCreateOffer}>
            {t('dashboard.createFirstOffer')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1>{t('dashboard.title')}</h1>
          {user && <p className={styles.greeting}>{t('dashboard.hello', { name: user.firstName })}</p>}
        </div>
      </div>

      {/* Candidatos nuevos por oferta */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('dashboard.newCandidates')}</h2>
          {totalPendingReview > 0 && (
            <span className={styles.pendingBadge}>{totalPendingReview}</span>
          )}
        </div>

        {hasPendingReview ? (
          <div className={styles.pendingList}>
            {pendingReviewByOffer.map((item) => (
              <div
                key={item.offerId}
                className={styles.pendingItem}
                onClick={() => handleViewOffer(item.offerId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleViewOffer(item.offerId)}
              >
                <div className={styles.pendingItemInfo}>
                  <span className={styles.newIndicator} />
                  <span className={styles.pendingOfferTitle}>{item.offerTitle}</span>
                  <span className={styles.pendingCount}>
                    {item.count} {item.count === 1 ? t('dashboard.newCandidate') : t('dashboard.newCandidatesCount')}
                  </span>
                </div>
                <span className={styles.cardArrow}>→</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={`${styles.emptyState} ${styles.allCaughtUp}`}>
            <h3>{t('dashboard.allUpToDate')}</h3>
          </div>
        )}
      </section>

      {/* Mensajes sin leer */}
      {hasUnreadMessages && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('dashboard.unreadMessages')}</h2>
            <span className={styles.messageBadge}>{totalUnreadMessages}</span>
          </div>

          <div className={styles.pendingList}>
            {unreadMessages.map((item) => (
              <div
                key={item.processId}
                className={styles.pendingItem}
                onClick={() => handleViewProcess(item.processId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleViewProcess(item.processId)}
              >
                <div className={styles.pendingItemInfo}>
                  <span className={styles.messageIndicator} />
                  <span className={styles.pendingOfferTitle}>{item.candidateName}</span>
                  <span className={styles.pendingCount}>
                    {item.count} {item.count === 1 ? t('dashboard.unreadMessage') : t('dashboard.unreadMessagesCount')} - {item.offerTitle}
                  </span>
                </div>
                <span className={styles.cardArrow}>→</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!hasPendingReview && !hasUnreadMessages && (
        <div className={styles.quickActions}>
          <p>{t('dashboard.allUpToDateDesc')}</p>
          <button className="btn-secondary" onClick={() => navigate('/app/offers')}>
            {t('dashboard.viewOffers')}
          </button>
        </div>
      )}

      {/* Ofertas activas */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('dashboard.activeOffers')}</h2>

        {hasActiveOffers ? (
          <div className={styles.offersGrid}>
            {activeOffers.map((offer) => (
              <div
                key={offer.id}
                className={styles.offerCard}
                onClick={() => handleViewOffer(offer.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleViewOffer(offer.id)}
              >
                <h3 className={styles.offerCardTitle}>{offer.title}</h3>
                <div className={styles.offerCardMeta}>
                  {offer.client && <span>{t('dashboard.client')}: {offer.client.name}</span>}
                  <span className="badge badge-success">{t('status.active')}</span>
                </div>
                {offer.internalNotes && (
                  <div className={styles.offerCardNotes}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                    </svg>
                    <span className={styles.offerCardNotesText}>{offer.internalNotes}</span>
                  </div>
                )}
                <div className={styles.offerCardFooter}>
                  <span className={styles.candidateCount}>
                    <strong>{offer._count?.selectionProcesses || 0}</strong> {t('dashboard.candidates')}
                  </span>
                  <span className={styles.cardArrow}>→</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>{t('dashboard.noActiveOffers')}</h3>
            <p>{t('dashboard.noActiveOffersDesc')}</p>
            <button className="btn-primary" onClick={handleCreateOffer}>
              {t('dashboard.createOffer')}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
