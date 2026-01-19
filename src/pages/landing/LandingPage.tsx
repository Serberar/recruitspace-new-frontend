import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";
import Logo from "../../components/logo/Logo";
import { AppFooter } from "../../components/footer/AppFooter";

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      {/* Header */}
      <header className={styles.header}>
        <nav className={`${styles.container} ${styles.nav}`}>
          <Link to="/" className={styles.logo}>
            <Logo size="md" />
          </Link>
          <div className={styles.navLinks}>
            <Link to="/login" className={styles.navLink}>
              Entrar
            </Link>
            <Link to="/planes" className={styles.navCta}>
              Registrarse
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>
              ATS + CRM + Portal de empleo
            </span>
            <h1 className={styles.heroTitle}>
              Gestiona tu recruiting{" "}
              <span className={styles.heroTitleGradient}>sin complicaciones</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Todo lo que necesitas para gestionar candidatos, ofertas y procesos
              de selección en un solo lugar. Sin ruido. Sin herramientas dispersas.
            </p>
            <div className={styles.heroCtas}>
              <Link to="/planes" className={styles.ctaPrimary}>
                Crear cuenta gratis
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/login" className={styles.ctaSecondary}>
                Acceder a mi cuenta
              </Link>
            </div>
          </div>

          {/* Hero Mockup - RecruitSpace UI */}
          <div className={styles.heroMockup}>
            <div className={styles.mockupWrapper}>
              <div className={styles.mockupPlaceholder}>
                {/* Browser Chrome */}
                <div className={styles.mockupBrowser}>
                  <span className={`${styles.mockupDot} ${styles.mockupDotRed}`} />
                  <span className={`${styles.mockupDot} ${styles.mockupDotYellow}`} />
                  <span className={`${styles.mockupDot} ${styles.mockupDotGreen}`} />
                </div>
                {/* App Header - Horizontal Menu */}
                <div className={styles.mockupAppHeader}>
                  <span className={styles.mockupAppName}>RecruitSpace</span>
                  <div className={styles.mockupNav}>
                    <span className={styles.mockupNavItem}>Dashboard</span>
                    <span className={`${styles.mockupNavItem} ${styles.mockupNavItemActive}`}>Ofertas</span>
                    <span className={styles.mockupNavItem}>Clientes</span>
                    <span className={styles.mockupNavItem}>Equipo</span>
                  </div>
                </div>
                {/* Content Area */}
                <div className={styles.mockupContent}>
                  {/* Offer Header */}
                  <div className={styles.mockupOfferHeader}>
                    <div className={styles.mockupOfferTitle}>
                      <span className={styles.mockupOfferName}>Senior Frontend Developer</span>
                      <span className={styles.mockupOfferClient}>TechCorp Solutions</span>
                    </div>
                    <span className={styles.mockupBadgeActive}>Activa</span>
                  </div>
                  {/* Stats */}
                  <div className={styles.mockupStats}>
                    <div className={styles.mockupStat}>
                      <span className={styles.mockupStatNumber}>24</span>
                      <span className={styles.mockupStatLabel}>Candidatos</span>
                    </div>
                    <div className={styles.mockupStat}>
                      <span className={styles.mockupStatNumber}>8</span>
                      <span className={styles.mockupStatLabel}>Sin revisar</span>
                    </div>
                  </div>
                  {/* Vertical Pipeline Timeline */}
                  <div className={styles.mockupPipeline}>
                    <div className={styles.mockupTimelineItem}>
                      <div className={styles.mockupTimelineDot} />
                      <div className={styles.mockupTimelineLine} />
                      <div className={styles.mockupTimelineContent}>
                        <div className={styles.mockupStatusHeader}>
                          <span className={styles.mockupStatusName}>Aplicados</span>
                          <span className={styles.mockupStatusBadge}>12</span>
                          <span className={styles.mockupStatusBadgeNew}>3</span>
                        </div>
                        <div className={styles.mockupCandidateList}>
                          <div className={styles.mockupCandidateRow}>
                            <span className={styles.mockupNewDot} />
                            <span>María García</span>
                            <span className={styles.mockupArrow}>→</span>
                          </div>
                          <div className={styles.mockupCandidateRow}>
                            <span className={styles.mockupNewDot} />
                            <span>Juan López</span>
                            <span className={styles.mockupArrow}>→</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.mockupTimelineItem}>
                      <div className={styles.mockupTimelineDot} />
                      <div className={styles.mockupTimelineLine} />
                      <div className={styles.mockupTimelineContent}>
                        <div className={styles.mockupStatusHeader}>
                          <span className={styles.mockupStatusName}>Entrevista HR</span>
                          <span className={styles.mockupStatusBadge}>5</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.mockupTimelineItem}>
                      <div className={styles.mockupTimelineDot} />
                      <div className={styles.mockupTimelineLine} />
                      <div className={styles.mockupTimelineContent}>
                        <div className={styles.mockupStatusHeader}>
                          <span className={styles.mockupStatusName}>Prueba técnica</span>
                          <span className={styles.mockupStatusBadge}>4</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.mockupTimelineItem}>
                      <div className={styles.mockupTimelineDot} />
                      <div className={styles.mockupTimelineContent}>
                        <div className={styles.mockupStatusHeader}>
                          <span className={styles.mockupStatusName}>Contratado</span>
                          <span className={styles.mockupStatusBadgeFinal}>Final</span>
                          <span className={styles.mockupStatusBadge}>2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className={styles.problem}>
        <div className={styles.container}>
          <div className={styles.problemGrid}>
            <div className={styles.problemContent}>
              <h2>El recruiting no debería ser caótico</h2>
              <ul className={styles.problemList}>
                <li className={styles.problemItem}>
                  <span className={`${styles.problemIcon} ${styles.problemIconBad}`}>✕</span>
                  <span className={styles.problemText}>
                    CVs dispersos entre emails, WhatsApp y carpetas compartidas
                  </span>
                </li>
                <li className={styles.problemItem}>
                  <span className={`${styles.problemIcon} ${styles.problemIconBad}`}>✕</span>
                  <span className={styles.problemText}>
                    Excel para trackear candidatos que nadie actualiza
                  </span>
                </li>
                <li className={styles.problemItem}>
                  <span className={`${styles.problemIcon} ${styles.problemIconBad}`}>✕</span>
                  <span className={styles.problemText}>
                    Cinco herramientas distintas que no se integran entre sí
                  </span>
                </li>
                <li className={styles.problemItem}>
                  <span className={`${styles.problemIcon} ${styles.problemIconBad}`}>✕</span>
                  <span className={styles.problemText}>
                    Sin visibilidad real del estado de cada proceso
                  </span>
                </li>
              </ul>
            </div>
            <div className={styles.solutionBox}>
              <h3>RecruitSpace lo centraliza todo</h3>
              <p>
                Un único espacio donde gestionas ofertas, candidatos, comunicación y
                seguimiento. Cada proceso tiene su propio pipeline visual. Cada candidato
                tiene su página dedicada. Todo conectado, todo accesible, todo bajo control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is RecruitSpace */}
      <section className={styles.whatIs}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Qué es RecruitSpace</span>
            <h2 className={styles.sectionTitle}>
              La herramienta completa para recruiters profesionales
            </h2>
            <p className={styles.sectionSubtitle}>
              No es solo un ATS. Es tu centro de operaciones para recruiting.
            </p>
          </div>
          <div className={styles.whatIsGrid}>
            <div className={styles.whatIsCard}>
              <div className={styles.whatIsIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h4>ATS completo</h4>
              <p>Gestión de candidatos y procesos de selección</p>
            </div>
            <div className={styles.whatIsCard}>
              <div className={styles.whatIsIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h4>CRM ligero</h4>
              <p>Historial y relación con cada candidato</p>
            </div>
            <div className={styles.whatIsCard}>
              <div className={styles.whatIsIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <h4>Portal de empleo</h4>
              <p>Página pública para tus ofertas activas</p>
            </div>
            <div className={styles.whatIsCard}>
              <div className={styles.whatIsIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </div>
              <h4>Pipeline visual</h4>
              <p>Etapas personalizables por oferta</p>
            </div>
            <div className={styles.whatIsCard}>
              <div className={styles.whatIsIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h4>Equipos</h4>
              <p>Gestión de organizaciones y roles</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Funcionalidades</span>
            <h2 className={styles.sectionTitle}>
              Todo lo que necesitas, nada que no uses
            </h2>
            <p className={styles.sectionSubtitle}>
              Funcionalidades pensadas para el día a día real del recruiter.
            </p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <h3>ATS y pipeline</h3>
              <p>
                Crea ofertas, define etapas, mueve candidatos por tu pipeline.
                Visualiza el estado de cada proceso de un vistazo.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3>Portal de empleo público</h3>
              <p>
                Página personalizada con tu marca donde los candidatos
                pueden ver tus ofertas activas y aplicar directamente.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Organizaciones y equipos</h3>
              <p>
                Gestiona múltiples organizaciones. Asigna roles,
                controla accesos y colabora con tu equipo.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </div>
              <h3>Página por candidato</h3>
              <p>
                Cada candidato tiene su página con CV, notas, historial
                de comunicación y estado del proceso.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3>Email corporativo</h3>
              <p>
                Envía comunicaciones desde tu correo corporativo.
                Templates personalizables. Todo centralizado.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <h3>Dashboard claro</h3>
              <p>
                Métricas relevantes, procesos activos, tareas pendientes.
                Vista rápida para empezar el día con foco.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15.6 11.6L22 7v10l-6.4-4.5v-1zM4 5h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7c0-1.1.9-2 2-2z" />
                </svg>
              </div>
              <h3>Videoconferencia integrada</h3>
              <p>
                Realiza entrevistas sin salir de la plataforma.
                Sin instalar nada. Graba y revisa después.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3>Carga de archivos</h3>
              <p>
                CVs, portfolios, certificados. Todo organizado
                por candidato y accesible en un clic.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                  <line x1="12" y1="2" x2="12" y2="22" />
                </svg>
              </div>
              <h3>Pruebas técnicas</h3>
              <p>
                Envía tests y ejercicios a los candidatos.
                Evalúa respuestas directamente en el proceso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className={styles.workflow}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Cómo funciona</span>
            <h2 className={styles.sectionTitle}>
              De la oferta al cierre, sin fricciones
            </h2>
            <p className={styles.sectionSubtitle}>
              Un flujo limpio que respeta tu forma de trabajar.
            </p>
          </div>
          <div className={styles.workflowSteps}>
            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Crea la oferta</h4>
                <p>Define requisitos, salario y pipeline personalizado</p>
              </div>
            </div>
            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Recibe candidatos</h4>
                <p>Aplican desde tu portal o los añades manualmente</p>
              </div>
            </div>
            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Gestiona el proceso</h4>
                <p>Muévelos por etapas, comunícate, añade notas</p>
              </div>
            </div>
            <div className={styles.workflowStep}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Cierra la posición</h4>
                <p>Contrata al elegido, archiva el proceso limpio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className={styles.differentiators}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Por qué RecruitSpace</span>
            <h2 className={styles.sectionTitle}>
              Diferencias que importan
            </h2>
            <p className={styles.sectionSubtitle}>
              Funcionalidades pensadas para el recruiting real.
            </p>
          </div>
          <div className={styles.diffGrid}>
            <div className={styles.diffCard}>
              <div className={styles.diffIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className={styles.diffContent}>
                <h4>Pipeline 100% personalizable</h4>
                <p>
                  Define las etapas que necesitas para cada oferta.
                  No te adaptas a la herramienta, la herramienta se adapta a ti.
                </p>
              </div>
            </div>
            <div className={styles.diffCard}>
              <div className={styles.diffIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className={styles.diffContent}>
                <h4>Página por proceso</h4>
                <p>
                  Cada candidato tiene un espacio dedicado con todo su historial:
                  CV, notas, comunicación, archivos y estado actual.
                </p>
              </div>
            </div>
            <div className={styles.diffCard}>
              <div className={styles.diffIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </div>
              <div className={styles.diffContent}>
                <h4>Eliminación automática de datos</h4>
                <p>
                  Al cerrar un proceso, los datos se eliminan según la normativa.
                  GDPR sin esfuerzo adicional.
                </p>
              </div>
            </div>
            <div className={styles.diffCard}>
              <div className={styles.diffIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M12 18v-6M9 15h6" />
                </svg>
              </div>
              <div className={styles.diffContent}>
                <h4>Parsing de CV inteligente</h4>
                <p>
                  Extrae datos automáticamente del CV. Detecta duplicados
                  para evitar candidatos repetidos en tus procesos.
                </p>
              </div>
            </div>
            <div className={styles.diffCard}>
              <div className={styles.diffIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className={styles.diffContent}>
                <h4>Infraestructura sólida</h4>
                <p>
                  No es un proyecto experimental. Es una plataforma SaaS real
                  construida para escalar contigo.
                </p>
              </div>
            </div>
            <div className={styles.diffCard}>
              <div className={styles.diffIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <div className={styles.diffContent}>
                <h4>Sin sobre-ingeniería</h4>
                <p>
                  Funcionalidades que usas, no features de marketing.
                  Producto limpio, enfocado, que hace lo que promete.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className={styles.security}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Seguridad</span>
            <h2 className={styles.sectionTitle}>
              Datos protegidos, siempre
            </h2>
            <p className={styles.sectionSubtitle}>
              Infraestructura profesional con las mejores prácticas de seguridad.
            </p>
          </div>
          <div className={styles.securityGrid}>
            <div className={styles.securityCard}>
              <div className={styles.securityIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h4>Cifrado de datos</h4>
              <p>Toda la información se transmite y almacena cifrada</p>
            </div>
            <div className={styles.securityCard}>
              <div className={styles.securityIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h4>Email corporativo</h4>
              <p>Comunicación desde tu propio dominio, sin intermediarios</p>
            </div>
            <div className={styles.securityCard}>
              <div className={styles.securityIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h4>Cumplimiento GDPR</h4>
              <p>Eliminación automática de datos y gestión de consentimientos</p>
            </div>
            <div className={styles.securityCard}>
              <div className={styles.securityIcon}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="8" rx="2" />
                  <rect x="2" y="14" width="20" height="8" rx="2" />
                  <line x1="6" y1="6" x2="6.01" y2="6" />
                  <line x1="6" y1="18" x2="6.01" y2="18" />
                </svg>
              </div>
              <h4>SaaS real</h4>
              <p>Backups automáticos, alta disponibilidad, monitorización 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className={styles.ctaFinal}>
        <div className={styles.container}>
          <div className={styles.ctaFinalContent}>
            <h2>Empieza a reclutar mejor</h2>
            <p>
              Crea tu cuenta en menos de un minuto. Sin tarjeta de crédito.
              Sin compromisos.
            </p>
            <Link to="/planes" className={styles.ctaFinalButton}>
              Crear mi cuenta
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <AppFooter theme="dark" />
    </div>
  );
}
