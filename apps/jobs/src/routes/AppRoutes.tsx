import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UnauthorizedPage from "../pages/unauthorized/UnauthorizedPage";
import PrivateRoute from "./PrivateRoute";
import CandidatePortalLayout from "../layouts/CandidatePortalLayout";
import { useAppDispatch } from "../hooks/reduxHooks";
import { checkSession } from "../features/auth/authSlice";

// Portal público de empleos
const JobsListPage = lazy(() => import("../pages/public/JobsListPage"));
const JobDetailPage = lazy(() => import("../pages/public/JobDetailPage"));
const JobApplyPage = lazy(() => import("../pages/public/JobApplyPage"));

// Proceso del candidato (público via token)
const CandidateProcessPage = lazy(() => import("../pages/candidateProcess/CandidateProcessPage"));
const SharedCandidatePage = lazy(() => import("../pages/sharedCandidate/SharedCandidatePage"));

// Auth de candidatos
const LoginCandidatePage = lazy(() => import("../pages/loginCandidate/LoginCandidatePage"));
const RegisterCandidatePage = lazy(() => import("../pages/registerCandidate/RegisterCandidatePage"));

// Portal del candidato (autenticado)
const CandidateDashboardPage = lazy(() => import("../pages/candidatePortal/CandidateDashboardPage"));
const CandidateProfilePage = lazy(() => import("../pages/candidatePortal/CandidateProfilePage"));
const CandidateCVPage = lazy(() => import("../pages/candidatePortal/CandidateCVPage"));

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

  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  return (
    <Routes>
      {/* Portal público de ofertas de empleo */}
      <Route
        path="/"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <JobsListPage />
          </Suspense>
        }
      />
      <Route
        path="/jobs"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <JobsListPage />
          </Suspense>
        }
      />
      <Route
        path="/jobs/:jobId"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <JobDetailPage />
          </Suspense>
        }
      />
      <Route
        path="/jobs/:jobId/apply"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <JobApplyPage />
          </Suspense>
        }
      />

      {/* Portal de empleos por organización */}
      <Route
        path="/org/:orgSlug/jobs"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <JobsListPage />
          </Suspense>
        }
      />
      <Route
        path="/org/:orgSlug/jobs/:jobId"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <JobDetailPage />
          </Suspense>
        }
      />
      <Route
        path="/org/:orgSlug/jobs/:jobId/apply"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <JobApplyPage />
          </Suspense>
        }
      />

      {/* Proceso del candidato (público via token) */}
      <Route
        path="/candidate/process/:publicToken"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <CandidateProcessPage />
          </Suspense>
        }
      />

      {/* Candidato compartido */}
      <Route
        path="/shared/candidate/:token"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SharedCandidatePage />
          </Suspense>
        }
      />

      {/* Login de candidatos */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <LoginCandidatePage />
          </Suspense>
        }
      />

      {/* Registro de candidatos */}
      <Route
        path="/register"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <RegisterCandidatePage />
          </Suspense>
        }
      />

      {/* Portal del candidato (autenticado) */}
      <Route
        path="/portal"
        element={
          <PrivateRoute allowedRoles={["candidate"]}>
            <CandidatePortalLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <CandidateDashboardPage />
              </Suspense>
            </CandidatePortalLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/profile"
        element={
          <PrivateRoute allowedRoles={["candidate"]}>
            <CandidatePortalLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <CandidateProfilePage />
              </Suspense>
            </CandidatePortalLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/cv"
        element={
          <PrivateRoute allowedRoles={["candidate"]}>
            <CandidatePortalLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <CandidateCVPage />
              </Suspense>
            </CandidatePortalLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/portal/process/:processId"
        element={
          <PrivateRoute allowedRoles={["candidate"]}>
            <CandidatePortalLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <CandidateProcessPage />
              </Suspense>
            </CandidatePortalLayout>
          </PrivateRoute>
        }
      />

      {/* Páginas del footer */}
      <Route path="/privacy" element={<Suspense fallback={<LoadingSpinner />}><PrivacyPolicyPage /></Suspense>} />
      <Route path="/terms" element={<Suspense fallback={<LoadingSpinner />}><TermsOfServicePage /></Suspense>} />
      <Route path="/cookies" element={<Suspense fallback={<LoadingSpinner />}><CookiePolicyPage /></Suspense>} />
      <Route path="/contact" element={<Suspense fallback={<LoadingSpinner />}><ContactPage /></Suspense>} />

      {/* Acceso denegado */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Ruta comodín */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
