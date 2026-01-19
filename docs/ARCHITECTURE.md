# Arquitectura

## Vision General

RecruitSpace Frontend implementa una arquitectura **Feature-Based** con componentes compartidos, estado global centralizado y separacion clara de responsabilidades.

```
┌─────────────────────────────────────────────────────────────┐
│                         APP                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                     PROVIDERS                         │   │
│  │         Redux | Router | i18n | ErrorBoundary        │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                      LAYOUTS                          │   │
│  │      Dashboard | Sysadmin | CandidatePortal          │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                      ROUTES                           │   │
│  │         Public | Private | Sysadmin                   │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                     FEATURES                          │   │
│  │   Auth | JobOffers | Candidates | Dashboard | ...     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │                   COMPONENTS                          │   │
│  │          UI | Form | Menu | Error | ...               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Estructura de Carpetas

```
src/
├── app/                    # Configuracion Redux
│   └── store.ts           # Store centralizado
│
├── api/                    # Cliente HTTP
│   └── axios.ts           # Instancia Axios + interceptores
│
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (Button, Input, Modal)
│   ├── form/             # Componentes de formulario
│   ├── menu/             # Navegacion
│   ├── error/            # Error Boundary
│   ├── pipeline/         # Componentes del pipeline
│   └── ...
│
├── config/               # Configuracion global
│   ├── constants.ts      # Constantes
│   ├── api.ts           # Endpoints
│   └── routes.ts        # Rutas
│
├── features/            # Modulos de features
│   ├── auth/            # Autenticacion
│   ├── jobOffers/       # Ofertas
│   ├── clients/         # Clientes
│   ├── dashboard/       # Dashboard
│   ├── analytics/       # Analitica
│   ├── candidateDetail/ # Detalle candidato
│   ├── candidatePortal/ # Portal candidato
│   ├── publicJobs/      # Ofertas publicas
│   ├── team/            # Equipo
│   ├── email/           # Email
│   ├── sysadmin/        # Administracion
│   └── ...
│
├── hooks/               # Custom hooks
│   ├── reduxHooks.ts    # Hooks tipados Redux
│   ├── useRole.ts       # Rol de usuario
│   ├── useDebounce.ts   # Debounce
│   └── ...
│
├── layouts/             # Layouts de pagina
│   ├── DashboardLayout.tsx
│   ├── SysadminLayout.tsx
│   └── CandidatePortalLayout.tsx
│
├── lib/                 # Utilidades
│   ├── i18n.ts          # Configuracion i18next
│   ├── logger.ts        # Logger
│   └── validations/     # Schemas Zod
│
├── locales/             # Traducciones
│   ├── es/
│   └── en/
│
├── pages/               # Componentes de pagina
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   └── ...
│
├── routes/              # Configuracion de rutas
│   ├── AppRoutes.tsx
│   ├── routesConfig.tsx
│   ├── PrivateRoute.tsx
│   └── SysadminPrivateRoute.tsx
│
├── test/                # Testing
│   ├── setup.ts
│   ├── test-utils.tsx
│   └── mocks/
│
├── types/               # Tipos compartidos
│   └── index.ts
│
└── utils/               # Helpers
    └── dateUtils.ts
```

## Patrones Arquitectonicos

### Feature-Based Architecture

Cada feature es un modulo autocontenido:

```
features/jobOffers/
├── hooks/
│   ├── index.ts
│   └── useOffers.ts        # Hook de datos
├── services/
│   ├── jobOffersApi.ts     # Llamadas API
│   └── jobOffersApi.test.ts
├── components/             # Componentes especificos (opcional)
├── types/                  # Tipos especificos (opcional)
└── utils/                  # Utilidades (opcional)
```

**Beneficios:**
- Modulos independientes y cohesivos
- Facil de escalar y mantener
- Bajo acoplamiento entre features

### Separation of Concerns

| Capa | Responsabilidad |
|------|-----------------|
| Components | Renderizado y UI |
| Hooks | Logica reutilizable |
| Services | Comunicacion con API |
| Store | Estado global |
| Types | Contratos de datos |

### Container/Presenter Pattern

```typescript
// Container (logica)
function OffersPage() {
  const { offers, loading, error, createOffer } = useOffers();

  if (loading) return <Skeleton />;
  if (error) return <Error message={error} />;

  return <OffersList offers={offers} onAdd={createOffer} />;
}

// Presenter (UI pura)
function OffersList({ offers, onAdd }) {
  return (
    <div>
      {offers.map(offer => <OfferCard key={offer.id} offer={offer} />)}
      <Button onClick={onAdd}>Nueva Oferta</Button>
    </div>
  );
}
```

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                          USER ACTION                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        COMPONENT                             │
│                  (dispatch action / call hook)               │
└────────────────────────────┬────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
     ┌──────────┐    ┌──────────────┐   ┌─────────┐
     │  REDUX   │    │   SERVICE    │   │  HOOK   │
     │  SLICE   │    │   (API)      │   │ (local) │
     └────┬─────┘    └──────┬───────┘   └────┬────┘
          │                 │                 │
          │                 ▼                 │
          │          ┌──────────────┐         │
          │          │   BACKEND    │         │
          │          │     API      │         │
          │          └──────┬───────┘         │
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                        STATE UPDATE                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        RE-RENDER                             │
└─────────────────────────────────────────────────────────────┘
```

## Routing

### Estructura de Rutas

```typescript
// Rutas publicas (sin autenticacion)
/                           # Landing
/login                      # Login recruiter
/login-candidate            # Login candidato
/register                   # Registro
/jobs                       # Portal publico
/jobs/:id                   # Detalle oferta
/jobs/:id/apply             # Aplicar

// Rutas protegidas (requieren auth)
/app/dashboard              # Dashboard
/app/offers                 # Ofertas
/app/offers/:id             # Detalle oferta
/app/clients                # Clientes
/app/team                   # Equipo
/app/analytics              # Analitica
/app/settings/*             # Configuracion

// Portal del candidato
/portal/dashboard           # Dashboard candidato
/portal/profile             # Perfil
/portal/processes           # Mis procesos

// Sysadmin
/sysadmin/login             # Login admin
/sysadmin/dashboard         # Panel admin
```

### Lazy Loading

```typescript
// Carga diferida de rutas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Offers = lazy(() => import('./pages/Offers'));

<Suspense fallback={<Skeleton />}>
  <Routes>
    <Route path="/app/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

### Proteccion de Rutas

```typescript
// PrivateRoute.tsx
function PrivateRoute({ children, allowedRoles }) {
  const { isLoggedIn, user, isAuthLoading } = useAppSelector(state => state.auth);

  if (isAuthLoading) return <Skeleton />;
  if (!isLoggedIn) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/403" />;

  return children;
}

// Uso
<Route
  path="/app/team"
  element={
    <PrivateRoute allowedRoles={['org_admin']}>
      <TeamPage />
    </PrivateRoute>
  }
/>
```

## Comunicacion con API

### Axios Instance

```typescript
// api/axios.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Cookies httpOnly
});

// Interceptor de respuesta
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Intentar refresh
      try {
        await api.post('/auth/refresh');
        return api.request(error.config);
      } catch {
        // Logout si refresh falla
        store.dispatch(logout());
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### Services Pattern

```typescript
// features/jobOffers/services/jobOffersApi.ts
import api from '@/api/axios';

export const jobOffersApi = {
  getAll: (filters?: OfferFilters) =>
    api.get<JobOffer[]>('/job-offer', { params: filters }),

  getById: (id: string) =>
    api.get<JobOffer>(`/job-offer/${id}`),

  create: (data: CreateOfferDTO) =>
    api.post<JobOffer>('/job-offer', data),

  update: (id: string, data: UpdateOfferDTO) =>
    api.put<JobOffer>(`/job-offer/${id}`, data),

  delete: (id: string) =>
    api.delete(`/job-offer/${id}`),
};
```

## Code Splitting

### Por Ruta

```typescript
// Cada ruta carga su bundle independiente
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Offers = lazy(() => import('./pages/Offers'));
const Analytics = lazy(() => import('./pages/Analytics'));
```

### Por Feature

```typescript
// Carga dinamica de features pesadas
const CVPreview = lazy(() => import('./features/candidateDetail/CVPreview'));
const RichTextEditor = lazy(() => import('./components/RichTextEditor'));
```

### Por Componente

```typescript
// Modal pesado cargado on-demand
const OfferFormModal = lazy(() => import('./modals/OfferFormModal'));

function OffersPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Nueva Oferta</Button>
      {showModal && (
        <Suspense fallback={<Spinner />}>
          <OfferFormModal onClose={() => setShowModal(false)} />
        </Suspense>
      )}
    </>
  );
}
```

## Manejo de Errores

### Error Boundary

```typescript
// components/error/ErrorBoundary.tsx
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('React Error:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Hook de Errores

```typescript
// hooks/useErrorHandler.ts
function useErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.error || 'Error de conexion');
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('Error desconocido');
    }
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
}
```

## Performance

### Virtualizacion

```typescript
// react-window para listas largas
import { FixedSizeList } from 'react-window';

function CandidateList({ candidates }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={candidates.length}
      itemSize={80}
    >
      {({ index, style }) => (
        <CandidateRow
          candidate={candidates[index]}
          style={style}
        />
      )}
    </FixedSizeList>
  );
}
```

### Memoization

```typescript
// useMemo para calculos costosos
const filteredOffers = useMemo(
  () => offers.filter(offer => matchesFilters(offer, filters)),
  [offers, filters]
);

// useCallback para callbacks estables
const handleSubmit = useCallback(
  (data) => createOffer(data),
  [createOffer]
);

// React.memo para componentes puros
const OfferCard = memo(function OfferCard({ offer }) {
  return <Card>{offer.title}</Card>;
});
```

### Debounce/Throttle

```typescript
// Busqueda con debounce
function SearchInput({ onSearch }) {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return <Input value={value} onChange={e => setValue(e.target.value)} />;
}
```
