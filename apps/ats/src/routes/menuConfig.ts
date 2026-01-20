/**
 * Menu Configuration
 *
 * Configuración del menú de navegación basada en routesConfig.
 */

import { routesConfig } from './routesConfig';

export interface MenuItem {
  path: string;
  label: string;
  allowedRoles: string[];
}

export interface GroupedMenuItems {
  main: MenuItem[];
  settings: MenuItem[];
  org_admin: MenuItem[];
}

/**
 * Obtiene los items del menú filtrados por rol
 */
export function getMenuItems(role: string): MenuItem[] {
  return routesConfig
    .filter(route => route.showInMenu && route.label && route.allowedRoles.includes(role))
    .map(route => ({
      path: route.path,
      label: route.label!,
      allowedRoles: route.allowedRoles,
    }));
}

/**
 * Agrupa los items del menú por categoría
 */
export function getGroupedMenuItems(role: string): GroupedMenuItems {
  const items = getMenuItems(role);

  const main: MenuItem[] = [];
  const settings: MenuItem[] = [];
  const org_admin: MenuItem[] = [];

  items.forEach(item => {
    if (item.path.includes('/settings/')) {
      settings.push(item);
    } else if (item.path === '/app/team') {
      org_admin.push(item);
    } else {
      main.push(item);
    }
  });

  return { main, settings, org_admin };
}
