/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

// Lazy loading de paginas
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const OffersPage = lazy(() => import("../pages/offers/OffersPage"));
const OfferDetailPage = lazy(() => import("../pages/offers/OfferDetailPage"));
const OfferCreatePage = lazy(() => import("../pages/offers/OfferCreatePage"));
const OfferEditPage = lazy(() => import("../pages/offers/OfferEditPage"));
const CandidateDetailPage = lazy(() => import("../pages/candidates/CandidateDetailPage"));
const PipelineSettingsPage = lazy(() => import("../pages/settings/PipelineSettingsPage"));
const EmailSettingsPage = lazy(() => import("../pages/settings/EmailSettingsPage"));
const ClientsPage = lazy(() => import("../pages/clients/ClientsPage"));
const TeamPage = lazy(() => import("../pages/team/TeamPage"));
const PortalSettingsPage = lazy(() => import("../pages/portal/PortalSettingsPage"));
const ProfileSettingsPage = lazy(() => import("../pages/profile/ProfileSettingsPage"));
const AnalyticsPage = lazy(() => import("../pages/analytics/AnalyticsPage"));
const BillingPage = lazy(() => import("../pages/billing/BillingPage"));

// Loading fallback
function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <div className="spinner" />
    </div>
  );
}

// Wrapper para Suspense
function withSuspense(Component: React.LazyExoticComponent<React.ComponentType<unknown>>): ReactNode {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );
}

// Interfaz central de rutas
export interface AppRoute {
  path: string;
  element: ReactNode;
  allowedRoles: string[];
  label?: string;
  showInMenu?: boolean;
}

// Config centralizada - Rutas de la aplicacion
export const routesConfig: AppRoute[] = [
  // Dashboard
  {
    path: "/app/dashboard",
    element: withSuspense(DashboardPage),
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    label: "nav.dashboard",
    showInMenu: true,
  },
  // Estadísticas (oculto del menú - integrado en el dashboard para admin)
  {
    path: "/app/analytics",
    element: withSuspense(AnalyticsPage),
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    label: "nav.analytics",
    showInMenu: false,
  },
  // Ofertas
  {
    path: "/app/offers",
    element: withSuspense(OffersPage),
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    label: "nav.offers",
    showInMenu: true,
  },
  {
    path: "/app/offers/new",
    element: withSuspense(OfferCreatePage),
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    showInMenu: false,
  },
  {
    path: "/app/offers/:offerId",
    element: withSuspense(OfferDetailPage),
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    showInMenu: false,
  },
  {
    path: "/app/offers/:offerId/edit",
    element: withSuspense(OfferEditPage),
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    showInMenu: false,
  },
  // Candidatos (vista desde proceso)
  {
    path: "/app/process/:processId",
    element: withSuspense(CandidateDetailPage),
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    showInMenu: false,
  },
  // Configuracion - Pipeline (Ya no se muestra en menu, se configura por oferta)
  {
    path: "/app/settings/pipeline",
    element: withSuspense(PipelineSettingsPage),
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    label: "nav.pipeline",
    showInMenu: false,
  },
  // Configuracion - Correo (SMTP + Notificaciones)
  {
    path: "/app/settings/email",
    element: withSuspense(EmailSettingsPage),
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    label: "nav.email",
    showInMenu: true,
  },
  // Rutas legacy - Redirects a nueva ruta unificada
  {
    path: "/app/settings/email-templates",
    element: <Navigate to="/app/settings/email" replace />,
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    showInMenu: false,
  },
  {
    path: "/app/settings/smtp",
    element: <Navigate to="/app/settings/email" replace />,
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    showInMenu: false,
  },
  {
    path: "/app/settings/notifications",
    element: <Navigate to="/app/settings/email" replace />,
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    showInMenu: false,
  },
  // Clientes
  {
    path: "/app/clients",
    element: withSuspense(ClientsPage),
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    label: "nav.clients",
    showInMenu: true,
  },
  // Equipo (admin y org_recruiter pueden ver, admin puede gestionar)
  {
    path: "/app/team",
    element: withSuspense(TeamPage),
    allowedRoles: ["org_admin", "org_recruiter"],
    label: "nav.team",
    showInMenu: true,
  },
  // Configuracion - Portal (admin y recruiter independiente, org_recruiter no gestiona portal)
  {
    path: "/app/settings/portal",
    element: withSuspense(PortalSettingsPage),
    allowedRoles: ["org_admin", "recruiter"],
    label: "nav.portal",
    showInMenu: true,
  },
  // Configuracion - Perfil
  {
    path: "/app/settings/profile",
    element: withSuspense(ProfileSettingsPage),
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    label: "nav.profile",
    showInMenu: true,
  },
  // Facturacion y Suscripcion (admin y recruiter independiente)
  {
    path: "/app/settings/billing",
    element: withSuspense(BillingPage),
    allowedRoles: ["org_admin", "recruiter"],
    label: "nav.billing",
    showInMenu: true,
  },
  // Ruta legacy - Redirect a nueva ruta
  {
    path: "/dashboard",
    element: <Navigate to="/app/dashboard" replace />,
    allowedRoles: ["org_admin", "recruiter", "org_recruiter"],
    showInMenu: false,
  },
];
