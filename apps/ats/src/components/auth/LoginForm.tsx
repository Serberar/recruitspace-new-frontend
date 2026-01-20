import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { loginSuccess, type AuthUser } from '@/store/slices/authSlice';
import {
  loginAPI,
  loginCandidateAPI,
  resendVerificationAPI,
  getCurrentUserAPI,
} from '@/services/authService';
import { Form, FormInput } from '@/components/form';
import { Button } from '@/components/ui';
import { Logo } from '@/components/logo';
import { AppFooter } from '@/components/footer/AppFooter';
import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { getErrorMessage } from '@/hooks/useErrorHandler';
import styles from './LoginForm.module.css';

export type UserType = 'recruiter' | 'candidate';

interface LoginFormProps {
  userType: UserType;
}

interface LoginConfig {
  title: string;
  subtitle: string;
  registerPath: string;
  registerText: string;
  alternatePath: string;
  alternateText: string;
  alternateLabel: string;
  redirectPath: string;
  loginFn: typeof loginAPI;
}

const CONFIG: Record<UserType, LoginConfig> = {
  recruiter: {
    title: 'Panel de Reclutamiento',
    subtitle: 'Inicia sesion en tu cuenta de recruiter',
    registerPath: '/planes',
    registerText: 'Registrate como recruiter',
    alternatePath: '/login-candidate',
    alternateText: 'Inicia sesion aqui',
    alternateLabel: 'Eres candidato?',
    redirectPath: '/app/dashboard',
    loginFn: loginAPI,
  },
  candidate: {
    title: 'Portal de Candidatos',
    subtitle: 'Inicia sesion para acceder a tus candidaturas',
    registerPath: '/register-candidate',
    registerText: 'Registrate como candidato',
    alternatePath: '/login',
    alternateText: 'Inicia sesion aqui',
    alternateLabel: 'Eres recruiter o empresa?',
    redirectPath: '/portal',
    loginFn: loginCandidateAPI,
  },
};

export function LoginForm({ userType }: LoginFormProps) {
  const { t } = useTranslation(['common', 'auth']);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const config = CONFIG[userType];

  const handleSubmit = async (data: LoginFormData) => {
    setError('');
    setLoading(true);

    try {
      await config.loginFn({
        email: data.email,
        password: data.password,
      });

      const user = await getCurrentUserAPI();
      dispatch(loginSuccess(user as AuthUser));
      navigate(config.redirectPath);
    } catch (err) {
      logger.error('Error en login:', err);
      setError(getErrorMessage(err) || t('common:login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResendLoading(true);
    setResendMessage('');

    try {
      await resendVerificationAPI(resendEmail);
      setResendMessage('Si el email existe y no esta verificado, recibiras un correo.');
    } catch {
      setResendMessage('Error al enviar. Intenta de nuevo.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.logoWrapper}>
              <Logo size="lg" />
            </div>
            <h1 className={styles.title}>{config.title}</h1>
            <p className={styles.subtitle}>{config.subtitle}</p>
          </div>

          {error && (
            <div className={styles.error} role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <Form<LoginFormData>
            schema={loginSchema}
            onSubmit={handleSubmit}
            defaultValues={{ email: '', password: '' }}
          >
            <FormInput<LoginFormData>
              name="email"
              label="Correo electronico"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              required
              data-testid="login-email"
            />

            <FormInput<LoginFormData>
              name="password"
              label={t('common:login.passwordLabel')}
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              autoComplete="current-password"
              required
              data-testid="login-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePassword}
                  aria-label={showPassword ? t('common:login.hidePassword') : t('common:login.showPassword')}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />

            <div className={styles.forgotPassword}>
              <Link to="/forgot-password">Olvidaste tu contrasena?</Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              data-testid="login-submit"
            >
              {t('common:login.submit')}
            </Button>
          </Form>

          <p className={styles.registerLink}>
            No tienes cuenta?{' '}
            <Link to={config.registerPath}>{config.registerText}</Link>
          </p>

          <p className={styles.alternateLink}>
            {config.alternateLabel}{' '}
            <Link to={config.alternatePath}>{config.alternateText}</Link>
          </p>

          <div className={styles.resendSection}>
            <button
              type="button"
              onClick={() => setShowResendModal(!showResendModal)}
              className={styles.resendToggle}
              aria-expanded={showResendModal}
              aria-controls="resend-form"
            >
              No has recibido el correo de verificacion?
            </button>

            {showResendModal && (
              <form
                id="resend-form"
                onSubmit={handleResendVerification}
                className={styles.resendForm}
              >
                <label htmlFor="resend-email" className="sr-only">
                  Email para reenviar verificacion
                </label>
                <input
                  id="resend-email"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Tu email"
                  className={styles.resendInput}
                  required
                  aria-describedby={resendMessage ? 'resend-message' : undefined}
                />
                <button
                  type="submit"
                  disabled={resendLoading}
                  className={styles.resendButton}
                >
                  {resendLoading ? 'Enviando...' : 'Reenviar'}
                </button>
                {resendMessage && (
                  <p id="resend-message" className={styles.resendMessage} role="status">
                    {resendMessage}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}

export default LoginForm;
