import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Solo las dos landings
const MixedLandingPage = lazy(() => import("../pages/landing/MixedLandingPage"));
const RecruiterLandingPage = lazy(() => import("../pages/landing/LandingPage"));

// Páginas del footer
const PrivacyPolicyPage = lazy(() => import("../pages/footer/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("../pages/footer/TermsOfServicePage"));
const CookiePolicyPage = lazy(() => import("../pages/footer/CookiePolicyPage"));
const ContactPage = lazy(() => import("../pages/footer/ContactPage"));

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <div className="spinner" />
  </div>
);

// URLs de las otras apps
const ATS_URL = import.meta.env.VITE_ATS_URL || 'http://localhost:5174';
const JOBS_URL = import.meta.env.VITE_JOBS_URL || 'http://localhost:5175';

// Redirección externa
const ExternalRedirect = ({ to }: { to: string }) => {
  window.location.href = to;
  return null;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Landing principal */}
      <Route
        path="/"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <MixedLandingPage />
          </Suspense>
        }
      />

      {/* Landing para recruiters */}
      <Route
        path="/recruiter"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <RecruiterLandingPage />
          </Suspense>
        }
      />

      {/* Páginas del footer */}
      <Route
        path="/privacy"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <PrivacyPolicyPage />
          </Suspense>
        }
      />
      <Route
        path="/terms"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <TermsOfServicePage />
          </Suspense>
        }
      />
      <Route
        path="/cookies"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <CookiePolicyPage />
          </Suspense>
        }
      />
      <Route
        path="/contact"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ContactPage />
          </Suspense>
        }
      />

      {/* Redirecciones a ATS */}
      <Route path="/login" element={<ExternalRedirect to={`${ATS_URL}/login`} />} />
      <Route path="/register" element={<ExternalRedirect to={`${ATS_URL}/register`} />} />
      <Route path="/plans" element={<ExternalRedirect to={`${ATS_URL}/plans`} />} />
      <Route path="/planes" element={<ExternalRedirect to={`${ATS_URL}/plans`} />} />

      {/* Redirecciones a Jobs */}
      <Route path="/login-candidate" element={<ExternalRedirect to={`${JOBS_URL}/login`} />} />
      <Route path="/register-candidate" element={<ExternalRedirect to={`${JOBS_URL}/register`} />} />
      <Route path="/jobs/*" element={<ExternalRedirect to={`${JOBS_URL}/jobs`} />} />

      {/* Ruta comodín */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
