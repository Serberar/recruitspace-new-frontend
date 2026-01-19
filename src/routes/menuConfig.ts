import { routesConfig } from "./routesConfig";

export interface MenuItem {
  path: string;
  label: string;
  icon: string;
  section: 'main' | 'settings' | 'org_admin';
}

// Mapeo de rutas a iconos y secciones
const menuMeta: Record<string, { icon: string; section: MenuItem['section'] }> = {
  '/app/dashboard': { icon: 'dashboard', section: 'main' },
  '/app/analytics': { icon: 'chart', section: 'main' },
  '/app/offers': { icon: 'briefcase', section: 'main' },
  '/app/clients': { icon: 'building', section: 'main' },
  '/app/team': { icon: 'users', section: 'main' },
  '/app/settings/email': { icon: 'mail', section: 'settings' },
  '/app/settings/organization': { icon: 'settings', section: 'settings' },
  '/app/settings/profile': { icon: 'user', section: 'settings' },
  '/app/settings/billing': { icon: 'creditCard', section: 'settings' },
};

// Genera los items del menu filtrando por rol del usuario
export const getMenuItems = (userRole: string): MenuItem[] => {
  return routesConfig
    .filter(route => route.allowedRoles.includes(userRole) && route.showInMenu)
    .map(route => ({
      path: route.path,
      label: route.label || route.path.split('/').pop()?.toUpperCase() || "Menu",
      icon: menuMeta[route.path]?.icon || 'circle',
      section: menuMeta[route.path]?.section || 'main',
    }));
};

// Agrupa items por seccion
export const getGroupedMenuItems = (userRole: string): Record<MenuItem['section'], MenuItem[]> => {
  const items = getMenuItems(userRole);
  return {
    main: items.filter(item => item.section === 'main'),
    settings: items.filter(item => item.section === 'settings'),
    org_admin: items.filter(item => item.section === 'org_admin'),
  };
};
