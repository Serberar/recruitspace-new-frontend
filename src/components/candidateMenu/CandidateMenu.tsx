import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { logout } from "../../features/auth/authSlice";
import { logoutUser } from "../../features/auth/services/authService";
import { Logo } from "../logo";
import styles from "./CandidateMenu.module.css";

interface CandidateMenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

// Iconos SVG simples
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const menuItems: CandidateMenuItem[] = [
  { path: "/portal", label: "candidatePortal.menu.dashboard", icon: <HomeIcon /> },
  { path: "/portal/cv", label: "candidatePortal.menu.cv", icon: <FileIcon /> },
  { path: "/portal/profile", label: "candidatePortal.menu.profile", icon: <UserIcon /> },
  { path: "/jobs", label: "candidatePortal.menu.jobOffers", icon: <BriefcaseIcon /> },
];

export default function CandidateMenu() {
  const { t } = useTranslation('common');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const ok = await logoutUser();
    if (ok) {
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const renderNavItems = () => (
    <ul className={styles.navList}>
      {menuItems.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            end={item.path === "/portal"}
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{t(item.label)}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* Logo */}
        <NavLink to="/portal" className={styles.logoLink} onClick={closeMobileMenu}>
          <Logo size="sm" />
        </NavLink>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          {renderNavItems()}
        </nav>

        {/* Right section */}
        <div className={styles.rightSection}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            {t('nav.logout')}
          </button>

          {/* Mobile hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.hamburgerOpen : ''}`} />
            <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.hamburgerOpen : ''}`} />
            <span className={`${styles.hamburgerLine} ${mobileMenuOpen ? styles.hamburgerOpen : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <nav className={styles.mobileNav}>
          {renderNavItems()}
        </nav>
        <div className={styles.mobileFooter}>
          <button className={styles.mobileLogoutButton} onClick={handleLogout}>
            {t('nav.logout')}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div className={styles.overlay} onClick={closeMobileMenu} />
      )}
    </header>
  );
}
