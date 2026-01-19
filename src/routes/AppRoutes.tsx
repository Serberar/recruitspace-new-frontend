import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/login/LoginPage";
import UnauthorizedPage from "../pages/unauthorized/UnauthorizedPage";
import PrivateRoute from "./PrivateRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import CandidatePortalLayout from "../layouts/CandidatePortalLayout";
import { useAppSelector, useAppDispatch } from "../hooks/reduxHooks";
import { routesConfig } from "./routesConfig";
import { checkSession } from "../features/auth/authSlice";

// Lazy loading para rutas publicas
const MixedLandingPage = lazy(() => import("../pages/landing/MixedLandingPage"));
const RecruiterLandingPage = lazy(() => import("../pages/landing/LandingPage"));
const LoginCandidatePage = lazy(() => import("../pages/loginCandidate/LoginCandidatePage"));

const RegisterPage = lazy(() => import("../pages/register/RegisterPage"));
const RegisterCandidatePage = lazy(() => import("../pages/registerCandidate/RegisterCandidatePage"));
const PlansPage = lazy(() => import("../pages/plans/PlansPage"));
const VerifyEmailPage = lazy(() => import("../pages/verifyEmail/VerifyEmailPage"));
const ClaimAccountPage = lazy(() => import("../pages/claimAccount/ClaimAccountPage"));
const ForgotPasswordPage = lazy(() => import("../pages/forgotPassword/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/resetPassword/ResetPasswordPage"));
const CandidateProcessPage = lazy(() => import("../pages/candidateProcess/CandidateProcessPage"));
const SharedCandidatePage = lazy(() => import("../pages/sharedCandidate/SharedCandidatePage"));

// Portal publico de empleos
const JobsListPage = lazy(() => import("../pages/public/JobsListPage"));
const JobDetailPage = lazy(() => import("../pages/public/JobDetailPage"));
const JobApplyPage = lazy(() => import("../pages/public/JobApplyPage"));

// Portal publico de empleos por organizacion usa el mismo JobsListPage unificado

// Páginas legales
const PrivacyPolicyPage = lazy(() => import("../pages/legal/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("../pages/legal/TermsOfServicePage"));
const CookiePolicyPage = lazy(() => import("../pages/legal/CookiePolicyPage"));
const ContactPage = lazy(() => import("../pages/legal/ContactPage"));

// Portal del candidato (autenticado)
const CandidateDashboardPage = lazy(() => import("../pages/candidatePortal/CandidateDashboardPage"));
const CandidateProfilePage = lazy(() => import("../pages/candidatePortal/CandidateProfilePage"));
const CandidateCVPage = lazy(() => import("../pages/candidatePortal/CandidateCVPage"));

export default function AppRoutes() {
  const dispatch = useAppDispatch();
  const { isLoggedIn, isAuthLoading } = useAppSelector((state) => state.auth);

  // Verificar sesión al cargar la app
  useEffect(() => {
    dispatch(checkSession());
  }, [dispatch]);

  return (
    <Routes>
      {/* Landing page - Pagina inicial mixta */}
      <Route
        path="/"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <MixedLandingPage />
          </Suspense>
        }
      />

      {/* Landing page para recruiters */}
      <Route
        path="/recruiter"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <RecruiterLandingPage />
          </Suspense>
        }
      />

      {/* Login de recruiters */}
      <Route path="/login" element={<LoginPage />} />

      {/* Login de candidatos */}
      <Route
        path="/login-candidate"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <LoginCandidatePage />
          </Suspense>
        }
      />

      {/* Pagina de seleccion de planes */}
      <Route
        path="/plans"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <PlansPage />
          </Suspense>
        }
      />
      {/* Alias en español para planes */}
      <Route
        path="/planes"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <PlansPage />
          </Suspense>
        }
      />

      {/* Registro de recruiters/empresas */}
      <Route
        path="/register"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <RegisterPage />
          </Suspense>
        }
      />

      {/* Registro de candidatos */}
      <Route
        path="/register-candidate"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <RegisterCandidatePage />
          </Suspense>
        }
      />

      {/* Verificacion de email */}
      <Route
        path="/auth/verify-email"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <VerifyEmailPage />
          </Suspense>
        }
      />

      {/* Confirmacion de cuenta (claim) para candidatos que postularon sin cuenta */}
      <Route
        path="/auth/claim-account"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <ClaimAccountPage />
          </Suspense>
        }
      />

      {/* Recuperacion de contrasena */}
      <Route
        path="/forgot-password"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <ForgotPasswordPage />
          </Suspense>
        }
      />
      <Route
        path="/auth/reset-password"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <ResetPasswordPage />
          </Suspense>
        }
      />

      {/* Pagina de acceso denegado */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Ruta publica - Proceso del candidato (via token) */}
      <Route
        path="/candidate/process/:publicToken"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <CandidateProcessPage />
          </Suspense>
        }
      />

      {/* Ruta publica - Candidato compartido (via token con password) */}
      <Route
        path="/shared/candidate/:token"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <SharedCandidatePage />
          </Suspense>
        }
      />

      {/* Portal publico de ofertas de empleo */}
      <Route
        path="/jobs"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <JobsListPage />
          </Suspense>
        }
      />
      <Route
        path="/jobs/:jobId"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <JobDetailPage />
          </Suspense>
        }
      />
      <Route
        path="/jobs/:jobId/apply"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <JobApplyPage />
          </Suspense>
        }
      />

      {/* Portal publico de empleos por organizacion (usa componente unificado) */}
      <Route
        path="/org/:orgSlug/jobs"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <JobsListPage />
          </Suspense>
        }
      />
      <Route
        path="/org/:orgSlug/jobs/:jobId"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <JobDetailPage />
          </Suspense>
        }
      />
      <Route
        path="/org/:orgSlug/jobs/:jobId/apply"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <JobApplyPage />
          </Suspense>
        }
      />

      {/* Páginas legales */}
      <Route
        path="/privacy"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <PrivacyPolicyPage />
          </Suspense>
        }
      />
      <Route
        path="/terms"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <TermsOfServicePage />
          </Suspense>
        }
      />
      <Route
        path="/cookies"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <CookiePolicyPage />
          </Suspense>
        }
      />
      <Route
        path="/contact"
        element={
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
            <ContactPage />
          </Suspense>
        }
      />

      {/* Portal del candidato (requiere auth con rol candidate) */}
      <Route
        path="/portal"
        element={
          <PrivateRoute allowedRoles={["candidate"]}>
            <CandidatePortalLayout>
              <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
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
              <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
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
              <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
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
              <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>}>
                <CandidateProcessPage />
              </Suspense>
            </CandidatePortalLayout>
          </PrivateRoute>
        }
      />

      {/* Rutas privadas */}
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

      {/* Ruta comodin - redirige a dashboard o landing */}
      <Route
        path="*"
        element={
          isAuthLoading ? null : (isLoggedIn ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/" replace />)
        }
      />
    </Routes>
  );
}
