# Features

## Vision General

RecruitSpace Frontend organiza la funcionalidad en features independientes. Cada feature encapsula su logica, servicios y componentes.

```
features/
├── auth/               # Autenticacion
├── dashboard/          # Dashboard principal
├── jobOffers/          # Ofertas de empleo
├── clients/            # Clientes
├── team/               # Equipo
├── analytics/          # Analitica
├── candidateDetail/    # Detalle de candidato
├── candidatePortal/    # Portal del candidato
├── candidateProcess/   # Proceso de candidato
├── publicJobs/         # Portal publico
├── portal/             # Configuracion portal
├── profile/            # Perfil de usuario
├── email/              # Gestion de email
├── featureFlags/       # Feature flags dinamicos
├── processStatus/      # Estados del pipeline
├── selectionProcess/   # Procesos de seleccion
└── sysadmin/           # Panel de administracion
```

## Auth

Sistema de autenticacion y manejo de sesion.

### Componentes

- Login de recruiters
- Login de candidatos
- Registro de empresa
- Registro de candidato
- Recuperacion de password
- Verificacion de email

### State (Redux)

```typescript
interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  error: string | null;
}

interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string | null;
  isVerified: boolean;
}
```

### Actions

```typescript
// Sincronas
loginSuccess(user)    // Login exitoso
logout()              // Cerrar sesion
setUser(user)         // Actualizar usuario

// Asincronas (Thunks)
checkSession()        // Verificar sesion activa
refreshSession()      // Renovar token
```

### Flujo de Autenticacion

```
1. App.tsx → checkSession()
   ├── GET /auth/me
   ├── Si 200: loginSuccess(user)
   └── Si 401: Mantener deslogueado

2. Login
   ├── POST /auth/login
   ├── Backend set cookies httpOnly
   └── loginSuccess(user)

3. Request autenticado
   ├── Axios envia cookies automaticamente
   ├── Si 401: refreshSession()
   └── Si refresh falla: logout()

4. Logout
   ├── POST /auth/logout
   └── logout() → Redirect /login
```

## Dashboard

Panel principal del recruiter.

### Componentes

- Metricas principales (KPIs)
- Pipeline overview
- Actividad reciente
- Ofertas activas
- Candidatos pendientes

### Hook

```typescript
function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard().then(setData).catch(handleError);
  }, []);

  return { data, loading, error, refresh };
}
```

### Datos

```typescript
interface DashboardData {
  kpis: {
    totalCandidates: number;
    activeCandidates: number;
    hiredThisMonth: number;
    avgTimeToHire: number;
  };
  pipelineByStatus: {
    statusName: string;
    count: number;
    color: string;
  }[];
  recentActivity: Activity[];
  activeOffers: JobOffer[];
}
```

## Job Offers

Gestion de ofertas de empleo.

### Componentes

- Lista de ofertas con filtros
- Formulario crear/editar
- Detalle de oferta
- Pipeline de candidatos
- Asignacion de recruiters

### Hook

```typescript
function useOffers() {
  const { isAdmin } = useRole();
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async (filters?: OfferFilters) => {
    const data = isAdmin
      ? await jobOffersApi.getAll(filters)
      : await jobOffersApi.getMyOffers(filters);
    setOffers(data);
  };

  const createOffer = async (data: CreateOfferDTO) => {
    const newOffer = await jobOffersApi.create(data);
    setOffers(prev => [newOffer, ...prev]);
    return newOffer;
  };

  const updateOffer = async (id: string, data: UpdateOfferDTO) => {
    const updated = await jobOffersApi.update(id, data);
    setOffers(prev => prev.map(o => o.id === id ? updated : o));
    return updated;
  };

  return { offers, loading, fetchOffers, createOffer, updateOffer };
}
```

### Filtros

```typescript
interface OfferFilters {
  search?: string;
  clientId?: string;
  status?: 'active' | 'paused' | 'all';
  isPublic?: boolean;
}
```

## Clients

Gestion de clientes (CRM).

### Componentes

- Lista de clientes
- Formulario crear/editar
- Detalle de cliente
- Ofertas del cliente

### Hook

```typescript
function useClients() {
  const { isAdmin } = useRole();
  const [clients, setClients] = useState<Client[]>([]);

  const fetchClients = async () => {
    const data = isAdmin
      ? await clientsApi.getAll()
      : await clientsApi.getMyClients();
    setClients(data);
  };

  return { clients, loading, createClient, updateClient };
}
```

## Team

Gestion de equipo (solo admin).

### Componentes

- Lista de miembros
- Invitar nuevo recruiter
- Cambiar rol
- Activar/desactivar usuario

### Roles

```typescript
const USER_ROLES = {
  ORG_ADMIN: 'org_admin',
  ORG_RECRUITER: 'org_recruiter',
  RECRUITER: 'recruiter',
  CANDIDATE: 'candidate',
};
```

## Analytics

Estadisticas y reportes.

### Componentes

- Graficos de conversion
- Metricas por periodo
- Comparativas
- Exportacion de datos

### Hook

```typescript
function useAnalytics(dateRange: DateRange) {
  const [metrics, setMetrics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics(dateRange).then(setMetrics);
  }, [dateRange]);

  return { metrics, loading, error };
}
```

## Candidate Detail

Detalle completo de un candidato en un proceso.

### Componentes

- Perfil del candidato
- Timeline del proceso
- Comentarios internos
- Mensajes con candidato
- Documentos (CV)
- Pasos del proceso
- Evaluaciones

### Hooks

```typescript
// Hook principal
function useProcessData(processId: string) {
  const [process, setProcess] = useState<ProcessDetail | null>(null);
  // Carga datos del proceso, candidato, oferta, pasos
  return { process, loading, refresh };
}

// Hooks especificos
function useProcessComments(processId: string);
function useProcessMessages(processId: string);
function useStatusChange(processId: string);
function useFileUpload(processId: string);
function useVideoCallSchedule(processId: string);
```

## Candidate Portal

Portal para candidatos autenticados.

### Componentes

- Dashboard del candidato
- Perfil editable
- Lista de procesos
- Detalle de proceso
- Subir CV
- Ver ofertas

### Rutas

```
/portal/dashboard     # Dashboard
/portal/profile       # Mi perfil
/portal/processes     # Mis procesos
/portal/process/:id   # Detalle de proceso
```

## Public Jobs

Portal publico de ofertas.

### Componentes

- Listado de ofertas publicas
- Filtros (categoria, ubicacion, modalidad)
- Buscador
- Detalle de oferta
- Formulario de aplicacion

### Rutas

```
/jobs                 # Lista de ofertas
/jobs/:id             # Detalle
/jobs/:id/apply       # Aplicar
```

## Email

Gestion de configuracion de email.

### Componentes

- Configuracion SMTP
- Plantillas de email
- Test de envio

### Configuracion SMTP

```typescript
interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}
```

## Process Status

Configuracion de estados del pipeline.

### Componentes

- Lista de estados
- Crear/editar estado
- Reordenar (drag & drop)
- Colores y acciones

### Estado

```typescript
interface ProcessStatus {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
  isTerminal: boolean;
  action?: 'VIDEO_CALL' | 'FILE_UPLOAD';
  sendNotification: boolean;
}
```

## Feature Flags

Sistema de feature flags dinamicos consumidos del backend.

### Estructura

```
featureFlags/
├── components/
│   └── FeatureGate.tsx       # Componentes de renderizado condicional
├── context/
│   └── FeatureFlagsContext.tsx # Provider y estado global
├── hooks/
│   └── useFeatureFlag.ts     # Hooks para consumir flags
├── services/
│   └── featureFlagsApi.ts    # API del backend
└── index.ts
```

### Hooks

```typescript
// Hook basico para un flag
const { isEnabled, isLoading } = useFeatureFlag('new-feature');

// Hook para multiples flags
const { flags, isLoading } = useFeatureFlags(['flag-a', 'flag-b']);

// Hook para todos los flags con refresh
const { flags, refresh } = useAllFeatureFlags();
```

### Componentes

```typescript
// Gate simple
<FeatureGate
  flag="new-dashboard"
  fallback={<OldDashboard />}
  loading={<Skeleton />}
>
  <NewDashboard />
</FeatureGate>

// Gate con multiples flags
<MultiFeatureGate
  flags={['beta-ui', 'premium']}
  requireAll={true}
  fallback={<StandardUI />}
>
  <PremiumUI />
</MultiFeatureGate>
```

### Integracion

```typescript
// En App.tsx
import { FeatureFlagsProvider } from '@/features/featureFlags';

function App() {
  return (
    <Provider store={store}>
      <FeatureFlagsProvider defaultFlags={{ 'dark-mode': false }}>
        <Router />
      </FeatureFlagsProvider>
    </Provider>
  );
}
```

### API

```typescript
// Obtener todos los flags
const response = await featureFlagsApi.getFlags();
// { flags: { 'new-ui': true, 'beta': false } }

// Verificar flag especifico
const enabled = await featureFlagsApi.isEnabled('new-ui');
```

## Sysadmin

Panel de administracion del sistema.

### Componentes

- Dashboard con metricas globales
- Lista de organizaciones
- Gestion de usuarios
- Logs de auditoria
- Configuracion del sistema

### Auth Separado

```typescript
// sysadminSlice.ts
interface SysadminState {
  sysadmin: SysadminUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

// Login separado del auth normal
POST /sysadmin/login
```

## Estructura de Feature

Cada feature sigue esta estructura:

```
features/[featureName]/
├── hooks/
│   ├── index.ts           # Re-exports
│   └── use[Feature].ts    # Hook principal
├── services/
│   ├── [feature]Api.ts    # Llamadas API
│   └── [feature]Api.test.ts
├── components/            # Componentes especificos (opcional)
│   └── [Component].tsx
├── types/                 # Tipos especificos (opcional)
│   └── index.ts
└── utils/                 # Utilidades (opcional)
    └── helpers.ts
```

## Patrones Comunes

### Hook de Datos

```typescript
function useFeatureData() {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.getAll();
      setData(result);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
```

### Service API

```typescript
export const featureApi = {
  getAll: () => api.get<Item[]>('/endpoint'),
  getById: (id: string) => api.get<Item>(`/endpoint/${id}`),
  create: (data: CreateDTO) => api.post<Item>('/endpoint', data),
  update: (id: string, data: UpdateDTO) => api.put<Item>(`/endpoint/${id}`, data),
  delete: (id: string) => api.delete(`/endpoint/${id}`),
};
```

## Observability

Sistema de observabilidad frontend para monitoreo y debugging.

### Estructura

```
lib/observability/
├── errorTracking.ts    # Error tracking (Sentry-ready)
├── webVitals.ts        # Core Web Vitals
├── tracing.ts          # Distributed tracing
└── index.ts            # Barrel exports
```

### Error Tracking

Abstraccion para captura de errores preparada para Sentry:

```typescript
import {
  initErrorTracking,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
} from '@/lib/observability';

// Inicializacion (en main.tsx)
initErrorTracking({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: '1.0.0',
});

// Capturar excepcion
try {
  await riskyOperation();
} catch (error) {
  captureException(error, {
    tags: { feature: 'checkout' },
    extra: { orderId: '123' },
    level: 'error',
  });
}

// Capturar mensaje
captureMessage('User reached limit', { level: 'warning' });

// Establecer usuario despues del login
setUser({ id: user.id, email: user.email });

// Breadcrumbs para contexto
addBreadcrumb({
  category: 'navigation',
  message: 'User clicked checkout',
  level: 'info',
});
```

### Web Vitals

Metricas de rendimiento siguiendo Core Web Vitals de Google:

```typescript
import {
  initWebVitals,
  onWebVital,
  stopWebVitals,
} from '@/lib/observability';

// Inicializar medicion
initWebVitals();

// Suscribirse a metricas
const unsubscribe = onWebVital((metric) => {
  console.log(`${metric.name}: ${metric.value} (${metric.rating})`);

  // Enviar a analytics
  analytics.track('web_vital', {
    name: metric.name,      // LCP, FID, CLS, FCP, TTFB
    value: metric.value,
    rating: metric.rating,  // 'good' | 'needs-improvement' | 'poor'
  });
});

// Cleanup
stopWebVitals();
```

**Metricas medidas:**
- **LCP** (Largest Contentful Paint): < 2.5s = good
- **FID** (First Input Delay): < 100ms = good
- **CLS** (Cumulative Layout Shift): < 0.1 = good
- **FCP** (First Contentful Paint): < 1.8s = good
- **TTFB** (Time to First Byte): < 800ms = good

### Distributed Tracing

Correlation IDs para tracing frontend-backend (W3C Trace Context):

```typescript
import {
  startTrace,
  endTrace,
  withTracing,
  getTraceHeaders,
  createTracingInterceptor,
} from '@/lib/observability';

// Tracing manual
const trace = startTrace('checkout-flow', { userId: '123' });
try {
  await processCheckout();
} finally {
  endTrace(trace.traceId);
}

// Wrapper automatico
const result = await withTracing('api-call', async () => {
  return await api.post('/orders', data);
});

// Interceptor para Axios
axios.interceptors.request.use(createTracingInterceptor());

// Headers generados (W3C Trace Context)
const headers = getTraceHeaders();
// {
//   'traceparent': '00-{traceId}-{spanId}-01',
//   'X-Trace-ID': '{traceId}',
//   'X-Span-ID': '{spanId}',
//   'X-Request-ID': '{traceId}'
// }
```

### Integracion Completa

```typescript
// main.tsx
import {
  initErrorTracking,
  initWebVitals,
  onWebVital,
  setUser,
} from '@/lib/observability';

// 1. Error tracking
initErrorTracking({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});

// 2. Web vitals
initWebVitals();
onWebVital((metric) => {
  // Enviar a backend o servicio de analytics
  fetch('/api/vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
});

// 3. Despues del login
onLoginSuccess((user) => {
  setUser({ id: user.id, email: user.email });
});
```
