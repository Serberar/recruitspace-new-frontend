# Gestion de Estado

## Vision General

RecruitSpace utiliza una estrategia hibrida de estado:

| Tipo de Estado | Tecnologia | Uso |
|----------------|------------|-----|
| Global (auth) | Redux Toolkit | Sesion de usuario |
| Servidor | Custom Hooks | Datos de API |
| Local | useState | Estado de componente |
| Persistente | localStorage | Preferencias |

```
┌─────────────────────────────────────────────────────────────┐
│                      ESTADO GLOBAL                           │
│                   (Redux Toolkit)                            │
│    ┌──────────────┐    ┌──────────────┐                     │
│    │   authSlice  │    │sysadminSlice │                     │
│    │  - user      │    │  - sysadmin  │                     │
│    │  - isLogged  │    │  - isLogged  │                     │
│    └──────────────┘    └──────────────┘                     │
├─────────────────────────────────────────────────────────────┤
│                    ESTADO DE SERVIDOR                        │
│                   (Custom Hooks)                             │
│  useOffers() | useClients() | useDashboard() | ...          │
├─────────────────────────────────────────────────────────────┤
│                     ESTADO LOCAL                             │
│                   (useState/useReducer)                      │
│  Modales | Formularios | UI temporal                        │
└─────────────────────────────────────────────────────────────┘
```

## Redux Toolkit

### Store

```typescript
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import sysadminReducer from '@/features/sysadmin/sysadminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sysadmin: sysadminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Hooks Tipados

```typescript
// src/hooks/reduxHooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/app/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Auth Slice

```typescript
// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  isAuthLoading: true,
  error: null,
};

// Thunks
export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch {
      return rejectWithValue('No session');
    }
  }
);

export const refreshSession = createAsyncThunk(
  'auth/refreshSession',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/refresh');
      const response = await api.get('/auth/me');
      return response.data;
    } catch {
      return rejectWithValue('Refresh failed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.isAuthLoading = false;
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
      state.isAuthLoading = false;
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    finishAuthLoading(state) {
      state.isAuthLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSession.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.isAuthLoading = false;
      })
      .addCase(checkSession.rejected, (state) => {
        state.isAuthLoading = false;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.isLoggedIn = false;
      });
  },
});

export const { loginSuccess, logout, setUser, finishAuthLoading } = authSlice.actions;
export default authSlice.reducer;
```

### Selectors

```typescript
// Uso basico
const user = useAppSelector(state => state.auth.user);
const isLoggedIn = useAppSelector(state => state.auth.isLoggedIn);

// Selector compuesto
const selectIsAdmin = (state: RootState) =>
  state.auth.user?.role === 'org_admin';

const isAdmin = useAppSelector(selectIsAdmin);
```

## Custom Hooks (Server State)

### Patron Base

```typescript
function useServerData<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.get<T>('/endpoint');
      setData(result.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, loading, error, refetch: fetch };
}
```

### useOffers

```typescript
function useOffers(filters?: OfferFilters) {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useRole();

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const data = isAdmin
        ? await jobOffersApi.getAll(filters)
        : await jobOffersApi.getMyOffers(filters);
      setOffers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filters]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

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

  const deleteOffer = async (id: string) => {
    await jobOffersApi.delete(id);
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  return {
    offers,
    loading,
    error,
    refetch: fetchOffers,
    createOffer,
    updateOffer,
    deleteOffer,
  };
}
```

### useClients

```typescript
function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useRole();

  const fetchClients = useCallback(async () => {
    const data = isAdmin
      ? await clientsApi.getAll()
      : await clientsApi.getMyClients();
    setClients(data);
  }, [isAdmin]);

  const createClient = async (data: CreateClientDTO) => {
    const newClient = await clientsApi.create(data);
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  return { clients, loading, createClient, updateClient, deleteClient };
}
```

### useDashboard

```typescript
function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getData().then(setData);
  }, []);

  return { data, loading, refresh };
}
```

## Estado Local

### useState

```typescript
// Estado simple
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
```

### useReducer

```typescript
// Estado complejo
interface FormState {
  step: number;
  data: Partial<FormData>;
  errors: Record<string, string>;
}

type FormAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_DATA'; payload: Partial<FormData> }
  | { type: 'SET_ERRORS'; payload: Record<string, string> };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'PREV_STEP':
      return { ...state, step: state.step - 1 };
    case 'SET_DATA':
      return { ...state, data: { ...state.data, ...action.payload } };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    default:
      return state;
  }
}

function MultiStepForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  // ...
}
```

## Estado Persistente

### useLocalStorage

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// Uso
const [theme, setTheme] = useLocalStorage('theme', 'light');
const [sidebarOpen, setSidebarOpen] = useLocalStorage('sidebar', true);
```

## Hooks de Utilidad

### useRole

```typescript
function useRole() {
  const user = useAppSelector(state => state.auth.user);

  return {
    role: user?.role,
    isAdmin: user?.role === 'org_admin',
    isRecruiter: ['org_admin', 'org_recruiter', 'recruiter'].includes(user?.role || ''),
    isCandidate: user?.role === 'candidate',
  };
}
```

### usePermissions

```typescript
function usePermissions() {
  const { role, isAdmin, isRecruiter } = useRole();

  return {
    canCreateOffer: isRecruiter,
    canEditOffer: isRecruiter,
    canDeleteOffer: isAdmin,
    canViewCandidates: isRecruiter,
    canManageTeam: isAdmin,
    canViewAnalytics: isRecruiter,
    canConfigureOrg: isAdmin,
  };
}
```

### useDebounce

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Uso
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  fetchResults(debouncedSearch);
}, [debouncedSearch]);
```

### useThrottle

```typescript
function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecuted = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeElapsed = now - lastExecuted.current;

    if (timeElapsed >= interval) {
      lastExecuted.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval - timeElapsed);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}
```

### usePrevious

```typescript
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

### useErrorHandler

```typescript
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

  return { error, handleError, clearError, setError };
}
```

## Flujo de Datos

### Autenticacion

```
1. App.tsx monta
   └── useEffect: dispatch(checkSession())

2. checkSession() (thunk)
   └── GET /auth/me
       ├── 200: fulfilled → loginSuccess(user)
       └── 401: rejected → isAuthLoading = false

3. PrivateRoute verifica
   ├── isAuthLoading: muestra Skeleton
   ├── !isLoggedIn: redirect /login
   └── isLoggedIn: renderiza children
```

### Carga de Datos

```
1. Componente monta
   └── useOffers() ejecuta fetchOffers()

2. fetchOffers()
   ├── setLoading(true)
   ├── api.get('/job-offer')
   ├── setOffers(data)
   └── setLoading(false)

3. Componente renderiza
   ├── loading: Skeleton
   ├── error: ErrorMessage
   └── data: Lista de ofertas
```

### Mutaciones

```
1. Usuario crea oferta
   └── createOffer(data)

2. createOffer()
   ├── api.post('/job-offer', data)
   ├── setOffers([newOffer, ...prev])
   └── showToast('Oferta creada')

3. Lista actualizada automaticamente
```
