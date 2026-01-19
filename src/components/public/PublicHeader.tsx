import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';
import { logoutUser } from '../../features/auth/services/authService';
import { Logo } from '../logo';
import styles from './PublicHeader.module.css';

interface PublicHeaderProps {
  /** Logo personalizado de la organización (opcional) */
  logoUrl?: string;
  /** Nombre de la organización para el alt del logo */
  organizationName?: string;
  /** Si es true, muestra el branding de RecruitSpace en lugar del logo */
  showBranding?: boolean;
}

export function PublicHeader({
  logoUrl,
  organizationName,
  showBranding = false,
}: PublicHeaderProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state: RootState) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Extraer rol del usuario
  const role = user?.role;
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : '';

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignorar errores de logout en el servidor
    }
    dispatch(logout());
    setMenuOpen(false);
    navigate('/jobs');
  };

  // Determinar la ruta del portal según el rol
  const getPortalLink = () => {
    if (role === 'candidate') {
      return '/portal';
    }
    return '/app/dashboard';
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo / Branding */}
        <div className={styles.logoSection}>
          {showBranding ? (
            <Link to="/jobs" className={styles.brandLink}>
              <Logo size="sm" />
            </Link>
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt={organizationName || 'Logo'}
              className={styles.logo}
            />
          ) : (
            <span className={styles.orgName}>{organizationName}</span>
          )}
        </div>

        {/* Auth Actions */}
        <nav className={styles.authNav}>
          {isLoggedIn ? (
            <div className={styles.userMenu} ref={menuRef}>
              <button
                className={styles.userMenuButton}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <span className={styles.userAvatar}>
                  {displayName.charAt(0).toUpperCase() || '?'}
                </span>
                <span className={styles.userName}>{displayName || t('public.header.myAccount')}</span>
                <svg
                  className={`${styles.chevron} ${menuOpen ? styles.chevronUp : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {menuOpen && (
                <div className={styles.dropdown}>
                  <Link
                    to={getPortalLink()}
                    className={styles.dropdownItem}
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    {t('public.header.myPortal')}
                  </Link>
                  {role === 'candidate' && (
                    <Link
                      to="/portal/profile"
                      className={styles.dropdownItem}
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {t('public.header.myProfile')}
                    </Link>
                  )}
                  <div className={styles.dropdownDivider} />
                  <button
                    className={styles.dropdownItemLogout}
                    onClick={handleLogout}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {t('public.header.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login-candidate" className={styles.loginLink}>
                {t('public.header.login')}
              </Link>
              <Link to="/register-candidate" className={styles.registerButton}>
                {t('public.header.register')}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
