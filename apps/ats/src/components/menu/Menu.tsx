import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getGroupedMenuItems, type MenuItem } from "../../routes/menuConfig";
import { useRole } from "../../hooks/useRole";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { logout } from "../../store/slices/authSlice";
import { logoutUser } from "../../services/authService";
import { Logo } from "../logo";
import styles from "./Menu.module.css";

export default function Menu() {
  const { t } = useTranslation(['common', 'auth']);
  const role = useRole();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuGroups = role ? getGroupedMenuItems(role) : { main: [], settings: [], org_admin: [] };
  const allItems = [...menuGroups.main, ...menuGroups.settings, ...menuGroups.org_admin];

  const handleLogout = async () => {
    const ok = await logoutUser();
    if (ok) {
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const renderNavItems = (items: MenuItem[]) => (
    <ul className={styles.navList}>
      {items.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            <span className={styles.navLabel}>{t(`common:${item.label}`)}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* Logo */}
        <NavLink to="/app" className={styles.logoLink} onClick={closeMobileMenu}>
          <Logo size="sm" />
        </NavLink>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          {renderNavItems(allItems)}
        </nav>

        {/* Right section */}
        <div className={styles.rightSection}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            {t('common:nav.logout')}
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
          {renderNavItems(allItems)}
        </nav>
        <div className={styles.mobileFooter}>
          <button className={styles.mobileLogoutButton} onClick={handleLogout}>
            {t('common:nav.logout')}
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
