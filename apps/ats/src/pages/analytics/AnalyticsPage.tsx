import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRecruiterAnalytics } from '../../services/analyticsApi';
import type {
  RecruiterAnalytics,
  AnalyticsPeriod,
} from '../../types/analytics';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import styles from './AnalyticsPage.module.css';

const PERIODS: { value: AnalyticsPeriod; labelKey: string }[] = [
  { value: 'month', labelKey: 'analytics.periodMonth' },
  { value: 'quarter', labelKey: 'analytics.periodQuarter' },
  { value: 'year', labelKey: 'analytics.periodYear' },
  { value: 'all', labelKey: 'analytics.periodAll' },
];

export default function AnalyticsPage() {
  const { t } = useTranslation('common');

  const [analytics, setAnalytics] = useState<RecruiterAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>('month');

  const fetchAnalytics = async (selectedPeriod: AnalyticsPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecruiterAnalytics({ period: selectedPeriod });
      setAnalytics(data);
    } catch (err) {
      setError(getErrorMessage(err) || t('admin.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  const handlePeriodChange = (newPeriod: AnalyticsPeriod) => {
    setPeriod(newPeriod);
  };

  const getConversionClass = (rate: number) => {
    if (rate >= 20) return styles.conversionHigh;
    if (rate >= 10) return styles.conversionMedium;
    return styles.conversionLow;
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
        <button
          className={styles.retryButton}
          onClick={() => fetchAnalytics(period)}
        >
          {t('app.retry')}
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const { summary, byStatus, byClient, byOffer } = analytics;

  return (
    <div className={styles.analytics}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>{t('analytics.title')}</h1>
          <p className={styles.subtitle}>{t('analytics.subtitle')}</p>
        </div>

        <div className={styles.filters}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`${styles.periodButton} ${period === p.value ? styles.active : ''}`}
              onClick={() => handlePeriodChange(p.value)}
            >
              {t(p.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={`${styles.kpiCard} ${styles.primary}`}>
          <div className={styles.kpiLabel}>{t('analytics.activeProcesses')}</div>
          <div className={styles.kpiValue}>{summary.activeProcesses}</div>
          <div className={styles.kpiSubtitle}>{t('analytics.activeProcessesDesc')}</div>
        </div>

        <div className={`${styles.kpiCard} ${styles.success}`}>
          <div className={styles.kpiLabel}>{t('analytics.hired')}</div>
          <div className={styles.kpiValue}>{summary.hiredThisPeriod}</div>
          <div className={styles.kpiSubtitle}>
            {t('analytics.hiredDesc', { rejected: summary.rejectedThisPeriod })}
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.warning}`}>
          <div className={styles.kpiLabel}>{t('analytics.conversionRate')}</div>
          <div className={styles.kpiValue}>{summary.conversionRate}%</div>
          <div className={styles.kpiSubtitle}>
            {t('analytics.conversionRateDesc', { total: summary.totalApplicationsThisPeriod })}
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.info}`}>
          <div className={styles.kpiLabel}>{t('analytics.avgTimeToHire')}</div>
          <div className={styles.kpiValue}>
            {summary.avgTimeToHire !== null ? `${summary.avgTimeToHire}` : '-'}
          </div>
          <div className={styles.kpiSubtitle}>{t('analytics.avgTimeToHireDesc')}</div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className={styles.sectionsGrid}>
        {/* By Status */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('analytics.byStatus')}</h2>
          </div>
          <div className={styles.sectionContent}>
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
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('analytics.byClient')}</h2>
          </div>
          <div className={styles.sectionContent}>
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

        {/* By Offer - Full width */}
        <div className={styles.section} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('analytics.byOffer')}</h2>
          </div>
          <div className={styles.sectionContent}>
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
                      <tr key={offer.offerId}>
                        <td className={styles.offerTitle}>{offer.offerTitle}</td>
                        <td>{offer.clientName}</td>
                        <td className={styles.numericCell}>{offer.totalCandidates}</td>
                        <td className={styles.numericCell}>{offer.hired}</td>
                        <td className={styles.numericCell}>
                          <span
                            className={`${styles.conversionBadge} ${getConversionClass(offer.conversionRate)}`}
                          >
                            {offer.conversionRate.toFixed(1)}%
                          </span>
                        </td>
                        <td>
                          {offer.isActive ? (
                            <span className={styles.activeBadge}>
                              {t('analytics.activeStatus')}
                            </span>
                          ) : (
                            <span className={styles.inactiveBadge}>
                              {t('analytics.closedStatus')}
                            </span>
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
      </div>
    </div>
  );
}
