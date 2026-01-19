import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerCandidateAPI, resendVerificationAPI } from '../../features/auth/services/authService';
import { getErrorMessage } from '../../hooks/useErrorHandler';
import { Button } from '../../components/ui';
import { Logo } from '../../components/logo';
import { AppFooter } from '../../components/footer/AppFooter';
import { EyeIcon, EyeOffIcon, CheckCircleIcon } from '../../components/icons';
import { passwordSchema } from '../../lib/validations';
import styles from './RegisterCandidatePage.module.css';

// Schema de validación
const registerCandidateSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email no valido'),
  phone: z.string().optional(),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

type RegisterCandidateFormData = z.infer<typeof registerCandidateSchema>;

export default function RegisterCandidatePage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCandidateFormData>({
    resolver: zodResolver(registerCandidateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterCandidateFormData) => {
    setError('');
    setLoading(true);

    try {
      await registerCandidateAPI({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
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
              Hemos enviado un correo de verificacion a <strong>{registeredEmail}</strong>.
              <br />
              Por favor, revisa tu bandeja de entrada y confirma tu cuenta para poder acceder.
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
            <div className={styles.logoWrapper}>
              <Logo size="lg" />
            </div>
            <h1 className={styles.title}>Crear cuenta de candidato</h1>
            <p className={styles.subtitle}>
              Registrate para acceder al portal de empleo y gestionar tus candidaturas
            </p>
          </div>

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="firstName" className={styles.label}>
                  Nombre <span className={styles.required}>*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName')}
                  className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                  placeholder="Juan"
                />
                {errors.firstName && (
                  <span className={styles.errorText}>{errors.firstName.message}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="lastName" className={styles.label}>
                  Apellido <span className={styles.required}>*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName')}
                  className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                  placeholder="Garcia"
                />
                {errors.lastName && (
                  <span className={styles.errorText}>{errors.lastName.message}</span>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                placeholder="tu@email.com"
                autoComplete="email"
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="phone" className={styles.label}>
                Telefono <span className={styles.optional}>(opcional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className={styles.input}
                placeholder="+34 600 000 000"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Contrasena <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                  placeholder="Min. 12 caracteres, mayuscula, numero y simbolo"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePassword}
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <span className={styles.errorText}>{errors.password.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirmar contrasena <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Repite tu contrasena"
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && (
                <span className={styles.errorText}>{errors.confirmPassword.message}</span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
            >
              Crear cuenta
            </Button>
          </form>

          <p className={styles.loginLink}>
            Ya tienes cuenta?{' '}
            <Link to="/login-candidate">Inicia sesion</Link>
          </p>

          <div className={styles.divider}>
            <span>o</span>
          </div>

          <p className={styles.recruiterLink}>
            Eres recruiter o empresa?{' '}
            <Link to="/register">Registrate aqui</Link>
          </p>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
