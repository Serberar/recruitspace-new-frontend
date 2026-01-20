import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import UnauthorizedPage from "../pages/unauthorized/UnauthorizedPage";
import PrivateRoute from "./PrivateRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAppSelector, useAppDispatch } from "../hooks/reduxHooks";
import { routesConfig } from "./routesConfig";
import { checkSession } from "../store/slices/authSlice";

// Footer pages
const PrivacyPolicyPage = lazy(() => import("../pages/footer/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("../pages/footer/TermsOfServicePage"));
const CookiePolicyPage = lazy(() => import("../pages/footer/CookiePolicyPage"));
const ContactPage = lazy(() => import("../pages/footer/ContactPage"));

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <div className="spinner" />
  </div>
);

export default function AppRoutes() {
  const dispatch = useAppDispatch();
  const { isLoggedIn, isAuthLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Acceso denegado */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Páginas del footer */}
      <Route path="/privacy" element={<Suspense fallback={<LoadingSpinner />}><PrivacyPolicyPage /></Suspense>} />
      <Route path="/terms" element={<Suspense fallback={<LoadingSpinner />}><TermsOfServicePage /></Suspense>} />
      <Route path="/cookies" element={<Suspense fallback={<LoadingSpinner />}><CookiePolicyPage /></Suspense>} />
      <Route path="/contact" element={<Suspense fallback={<LoadingSpinner />}><ContactPage /></Suspense>} />

      {/* Rutas privadas del ATS */}
      {routesConfig.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <PrivateRoute allowedRoles={route.allowedRoles}>
              <DashboardLayout>
                {route.element}
              </DashboardLayout>
            </PrivateRoute>
          }
        />
      ))}

      {/* Redireccion de raiz al dashboard */}
      <Route
        path="/"
        element={
          isAuthLoading ? null : (isLoggedIn ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/login" replace />)
        }
      />

      {/* Ruta comodin */}
      <Route
        path="*"
        element={
          isAuthLoading ? null : (isLoggedIn ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/login" replace />)
        }
      />
    </Routes>
  );
}
