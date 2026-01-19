import { useTranslation } from 'react-i18next';
import styles from './LanguageSelector.module.css';

const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'minimal';
  className?: string;
  showLabel?: boolean;
  theme?: 'light' | 'dark';
}

export default function LanguageSelector({ variant = 'default', className = '', showLabel = true, theme = 'light' }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation('common');
  const themeClass = theme === 'dark' ? styles.dark : '';

  // Normalizar idioma (ej: es-ES -> es)
  const currentLang = i18n.language?.split('-')[0] || 'es';

  const handleChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  // Verificar si un idioma está activo
  const isActive = (code: string) => currentLang === code;

  if (variant === 'minimal') {
    return (
      <div className={`${styles.minimal} ${themeClass} ${className}`}>
        {showLabel && <span className={styles.label}>{t('app.language')}</span>}
        <div className={styles.buttons}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              className={`${styles.minimalButton} ${isActive(lang.code) ? styles.active : ''}`}
              aria-label={lang.name}
              title={lang.name}
            >
              {lang.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.selector} ${themeClass} ${className}`}>
      <select
        value={currentLang}
        onChange={(e) => handleChange(e.target.value)}
        className={styles.select}
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
