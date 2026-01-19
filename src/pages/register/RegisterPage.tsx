import { logger } from '@/lib/logger';
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Form, FormInput } from '../../components/form';
import { Button } from '../../components/ui';
import { AppFooter } from '../../components/footer/AppFooter';
import { EyeIcon, EyeOffIcon, CheckCircleIcon } from '../../components/icons';
import { registerSchema2, type RegisterFormData2 } from '../../lib/validations';
import { registerAPI, resendVerificationAPI } from '../../features/auth/services/authService';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import { getPlanById, type Plan } from '../../features/plans';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<'recruiter' | 'org_admin'>('recruiter');
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(!!planId);

  // Redirect to plans page if no plan is selected
  useEffect(() => {
    if (!planId) {
      navigate('/planes', { replace: true });
    }
  }, [planId, navigate]);

  // Fetch plan info if planId is present
  useEffect(() => {
    if (planId) {
      setLoadingPlan(true);
      getPlanById(planId)
        .then((plan) => {
          setSelectedPlan(plan);
          // Auto-set account type based on plan
          setAccountType(plan.accountType === 'company' ? 'org_admin' : 'recruiter');
        })
        .catch((err) => {
          logger.error('Error fetching plan:', err);
          // If plan is invalid, redirect to plans
          navigate('/planes', { replace: true });
        })
        .finally(() => {
          setLoadingPlan(false);
        });
    }
  }, [planId, navigate]);

  const handleSubmit = async (data: RegisterFormData2) => {
    setError('');
    setLoading(true);

    try {
      await registerAPI({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        type: accountType,
        organizationName: data.organizationName,
        planId: planId || undefined,
      });

      setRegisteredEmail(data.email);
      setSuccess(true);
    } catch (err) {
      logger.error('Error en registro:', err);
      setError(getErrorMessage(err) || 'Error al registrar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!registeredEmail) return;

    setResendLoading(true);
    setResendMessage('');

    try {
      await resendVerificationAPI(registeredEmail);
      setResendMessage('Correo reenviado correctamente. Revisa tu bandeja de entrada.');
    } catch {
      setResendMessage('Error al reenviar el correo. Intenta de nuevo.');
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.successIcon}>
              <CheckCircleIcon size={64} />
            </div>
            <h1 className={styles.successTitle}>Registro exitoso</h1>
            <p className={styles.successText}>
              Hemos enviado un correo de verificacion a tu email.
              Por favor, revisa tu bandeja de entrada y confirma tu cuenta.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Ir a iniciar sesion
            </Button>

            <div className={styles.resendSection}>
              <p className={styles.resendText}>
                No has recibido el correo?
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className={styles.resendLink}
              >
                {resendLoading ? 'Enviando...' : 'Reenviar correo de verificacion'}
              </button>
              {resendMessage && (
                <p className={styles.resendMessage}>{resendMessage}</p>
              )}
            </div>
          </div>
        </div>

        <AppFooter />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Crear cuenta</h1>
            <p className={styles.subtitle}>Comienza a gestionar tus procesos de seleccion</p>
          </div>

          {/* Show loading while fetching plan */}
          {loadingPlan && (
            <div className={styles.planLoading}>Cargando plan...</div>
          )}

          {/* Show selected plan summary */}
          {selectedPlan && !loadingPlan && (
            <div className={styles.selectedPlan}>
              <div className={styles.selectedPlanHeader}>
                <span className={styles.selectedPlanLabel}>Plan seleccionado</span>
                <Link to="/planes" className={styles.changePlanLink}>Cambiar plan</Link>
              </div>
              <div className={styles.selectedPlanInfo}>
                <span className={styles.selectedPlanName}>{selectedPlan.name}</span>
                <span className={styles.selectedPlanPrice}>{selectedPlan.priceDisplay}</span>
              </div>
              <span className={styles.selectedPlanType}>
                {selectedPlan.accountType === 'company' ? 'Plan Empresa' : 'Plan Freelance'}
              </span>
            </div>
          )}

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <Form<RegisterFormData2>
            schema={registerSchema2}
            onSubmit={handleSubmit}
            defaultValues={{
              type: accountType,
              organizationName: '',
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            key={accountType}
          >

            <FormInput<RegisterFormData2>
              name="organizationName"
              label={selectedPlan?.accountType === 'freelance' ? 'Nombre profesional' : 'Nombre de la organizacion'}
              placeholder={selectedPlan?.accountType === 'freelance' ? 'Ej: Juan Garcia Consulting' : 'Mi Empresa S.L.'}
              required
            />

            <div className={styles.row}>
              <FormInput<RegisterFormData2>
                name="firstName"
                label="Nombre"
                placeholder="Juan"
                required
              />
              <FormInput<RegisterFormData2>
                name="lastName"
                label="Apellido"
                placeholder="Garcia"
                required
              />
            </div>

            <FormInput<RegisterFormData2>
              name="email"
              label="Email"
              type="email"
              placeholder="juan@ejemplo.com"
              autoComplete="email"
              required
            />

            <FormInput<RegisterFormData2>
              name="password"
              label="Contrasena"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 12 caracteres, mayuscula, numero y simbolo"
              autoComplete="new-password"
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePassword}
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />

            <FormInput<RegisterFormData2>
              name="confirmPassword"
              label="Confirmar contrasena"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repite tu contrasena"
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Crear cuenta
            </Button>
          </Form>

          <p className={styles.loginLink}>
            Ya tienes cuenta?{' '}
            <Link to="/login">Inicia sesion</Link>
          </p>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
