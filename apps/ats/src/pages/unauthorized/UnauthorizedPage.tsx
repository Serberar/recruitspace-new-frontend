import { useTranslation } from 'react-i18next';

export default function UnauthorizedPage() {
  const { t } = useTranslation('common');

  return (
    <div>
      <h1>{t('error.accessDenied')}</h1>
      <p>{t('error.accessDeniedDesc')}</p>
    </div>
  );
}
