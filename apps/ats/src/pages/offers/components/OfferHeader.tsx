/**
 * OfferHeader - Encabezado de detalle de oferta
 */

import { useTranslation } from 'react-i18next';
import type { JobOffer } from '@/types';
import styles from '../OfferDetailPage.module.css';

interface OfferHeaderProps {
  offer: JobOffer;
  onBack: () => void;
  onViewPublic: () => void;
  onCopyLink: () => void;
  onEdit: () => void;
  canEdit?: boolean;
}

export function OfferHeader({
  offer,
  onBack,
  onViewPublic,
  onCopyLink,
  onEdit,
  canEdit = true,
}: OfferHeaderProps) {
  const { t } = useTranslation('common');

  const getStatusBadge = () => {
    if (offer.active) {
      return <span className={`badge ${styles.statusActive}`}>{t('status.active')}</span>;
    }
    return <span className={`badge ${styles.statusPaused}`}>{t('status.paused')}</span>;
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerInfo}>
        <button className={styles.backButton} onClick={onBack}>
          ← {t('offerDetail.backToOffers')}
        </button>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{offer.title}</h1>
          {canEdit && (
            <button className={styles.editIconButton} onClick={onEdit}>
              ✎ {t('offerDetail.edit')}
            </button>
          )}
        </div>
        <div className={styles.meta}>
          {offer.client && (
            <span className={styles.clientName}>
              {t('offerDetail.client')}: {offer.client.name}
            </span>
          )}
          {getStatusBadge()}
        </div>
      </div>

      <div className={styles.headerActions}>
        <button className={styles.copyLinkButton} onClick={onCopyLink}>
          {t('offerDetail.copyPublicLink')}
        </button>
        <button className={styles.viewPublicButton} onClick={onViewPublic}>
          {t('offerDetail.viewPublicOffer')}
        </button>
      </div>
    </div>
  );
}
