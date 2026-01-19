# Testing

## Stack de Testing

| Herramienta | Proposito |
|-------------|-----------|
| Vitest | Test runner (unit/integration) |
| Playwright | Tests E2E |
| @testing-library/react | Renderizado de componentes |
| @testing-library/user-event | Simulacion de interacciones |
| @testing-library/jest-dom | Matchers de DOM |
| MSW | Mock de API |
| jsdom | Entorno de navegador |

## Configuracion

### Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        global: {
          branches: 60,
          functions: 60,
          lines: 60,
          statements: 60,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Setup Global

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { server } from './mocks/server';
import i18n from '@/lib/i18n';

// Configurar idioma para tests
i18n.changeLanguage('es');

// MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// Mocks globales
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = ResizeObserverMock;

class IntersectionObserverMock {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.IntersectionObserver = IntersectionObserverMock as any;
```

## Utilidades de Test

### test-utils.tsx

```typescript
// src/test/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import sysadminReducer from '@/features/sysadmin/sysadminSlice';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  route?: string;
}

function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      sysadmin: sysadminReducer,
    },
    preloadedState,
  });
}

function customRender(
  ui: React.ReactElement,
  {
    preloadedState,
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }: { children: React.ReactNode }) {
    const store = createTestStore(preloadedState);
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Estados predefinidos
function createAuthenticatedState(overrides = {}): Partial<RootState> {
  return {
    auth: {
      user: {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'org_admin',
        organizationId: 'test-org-id',
        isVerified: true,
      },
      isLoggedIn: true,
      isAuthLoading: false,
      error: null,
      ...overrides,
    },
  };
}

function createUnauthenticatedState(): Partial<RootState> {
  return {
    auth: {
      user: null,
      isLoggedIn: false,
      isAuthLoading: false,
      error: null,
    },
  };
}

// Helpers
function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export * from '@testing-library/react';
export { customRender as render, createTestStore, createAuthenticatedState, createUnauthenticatedState, wait };
```

## MSW (Mock Service Worker)

### Server Config

```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Handlers

```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3000/api';

export const handlers = [
  // Auth
  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({
      id: 'user-1',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'org_admin',
      organizationId: 'org-1',
    });
  }),

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json();
    if (body.username === 'valid' && body.password === 'password') {
      return HttpResponse.json({
        user: { id: 'user-1', email: 'test@test.com' },
      });
    }
    return HttpResponse.json(
      { error: 'Credenciales invalidas' },
      { status: 401 }
    );
  }),

  // Job Offers
  http.get(`${API_URL}/job-offer`, () => {
    return HttpResponse.json([
      { id: '1', title: 'Developer', active: true },
      { id: '2', title: 'Designer', active: false },
    ]);
  }),

  http.post(`${API_URL}/job-offer`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: 'new-id', ...body }, { status: 201 });
  }),

  // Clients
  http.get(`${API_URL}/client`, () => {
    return HttpResponse.json([
      { id: '1', name: 'Client A' },
      { id: '2', name: 'Client B' },
    ]);
  }),
];
```

### Override Handlers

```typescript
// En un test especifico
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

test('muestra error cuando API falla', async () => {
  server.use(
    http.get('/api/job-offer', () => {
      return HttpResponse.json(
        { error: 'Error del servidor' },
        { status: 500 }
      );
    })
  );

  render(<OffersPage />);
  expect(await screen.findByText(/error/i)).toBeInTheDocument();
});
```

## Tipos de Tests

### Test de Componente

```typescript
// components/ui/Button.test.tsx
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant styles', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-danger');
  });
});
```

### Test de Hook

```typescript
// hooks/useDebounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('cancels pending debounce on unmount', () => {
    const { result, unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('initial');
  });
});
```

### Test de Servicio

```typescript
// features/jobOffers/services/jobOffersApi.test.ts
import { jobOffersApi } from './jobOffersApi';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('jobOffersApi', () => {
  describe('getAll', () => {
    it('fetches all offers', async () => {
      const offers = await jobOffersApi.getAll();
      expect(offers).toHaveLength(2);
      expect(offers[0].title).toBe('Developer');
    });

    it('passes filters as query params', async () => {
      let capturedUrl: string | undefined;

      server.use(
        http.get('/api/job-offer', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json([]);
        })
      );

      await jobOffersApi.getAll({ active: true, search: 'dev' });

      expect(capturedUrl).toContain('active=true');
      expect(capturedUrl).toContain('search=dev');
    });
  });

  describe('create', () => {
    it('creates new offer', async () => {
      const newOffer = await jobOffersApi.create({
        title: 'New Position',
        description: 'Description',
        clientId: 'client-1',
      });

      expect(newOffer.id).toBe('new-id');
      expect(newOffer.title).toBe('New Position');
    });
  });
});
```

### Test de Integracion

```typescript
// features/auth/Login.integration.test.tsx
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '@/pages/login/LoginPage';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('Login Integration', () => {
  it('logs in successfully with valid credentials', async () => {
    const user = userEvent.setup();

    render(<LoginPage />, { preloadedState: createUnauthenticatedState() });

    await user.type(screen.getByLabelText(/usuario/i), 'valid');
    await user.type(screen.getByLabelText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /iniciar/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/app/dashboard');
    });
  });

  it('shows error with invalid credentials', async () => {
    const user = userEvent.setup();

    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json(
          { error: 'Credenciales invalidas' },
          { status: 401 }
        );
      })
    );

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/usuario/i), 'wrong');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /iniciar/i }));

    expect(await screen.findByText(/credenciales invalidas/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /iniciar/i }));

    expect(await screen.findByText(/usuario.*requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/password.*requerido/i)).toBeInTheDocument();
  });
});
```

### Test de Schema (Zod)

```typescript
// lib/validations/auth.schema.test.ts
import { loginSchema, registerSchema } from './auth.schema';

describe('loginSchema', () => {
  it('accepts valid data', () => {
    const result = loginSchema.safeParse({
      username: 'testuser',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty username', () => {
    const result = loginSchema.safeParse({
      username: '',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      username: 'testuser',
      password: '123',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('validates email format', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    });
    expect(result.success).toBe(false);
  });

  it('requires strong password', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'weak',
      firstName: 'Test',
      lastName: 'User',
    });
    expect(result.success).toBe(false);
  });
});
```

## Comandos

### Unit/Integration Tests (Vitest)

```bash
# Ejecutar todos los tests
npm test

# Ejecutar una vez (CI)
npm run test:run

# Con cobertura
npm run test:coverage

# UI interactiva
npm run test:ui

# Tests especificos
npm test -- Button
npm test -- --grep "login"

# Watch de archivo especifico
npm test -- components/Button.test.tsx
```

### E2E Tests (Playwright)

```bash
# Ejecutar todos los E2E tests
npm run e2e

# UI interactiva (recomendado)
npm run e2e:ui

# Ver browser mientras ejecuta
npm run e2e:headed

# Modo debug con inspector
npm run e2e:debug

# Ver ultimo reporte
npm run e2e:report

# Solo tests de auth
npx playwright test e2e/auth/

# Solo en Chromium
npx playwright test --project=chromium
```

## Best Practices

### Queries Preferidas

```typescript
// Preferir (accesibles)
getByRole('button', { name: /submit/i })
getByLabelText(/email/i)
getByPlaceholderText(/buscar/i)
getByText(/no hay resultados/i)

// Evitar
getByTestId('submit-button')  // Solo si no hay alternativa
container.querySelector('.btn')  // Nunca
```

### Async Testing

```typescript
// Esperar elementos
const element = await screen.findByText(/cargando/i);

// Esperar que desaparezca
await waitForElementToBeRemoved(() => screen.queryByText(/cargando/i));

// Esperar condicion
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled();
});
```

### User Events

```typescript
const user = userEvent.setup();

// Preferir userEvent sobre fireEvent
await user.click(button);
await user.type(input, 'texto');
await user.selectOptions(select, 'option-value');
await user.upload(fileInput, file);
```

### Aislamiento

```typescript
// Cada test debe ser independiente
beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup
  cleanup();
  server.resetHandlers();
});
```

## E2E Tests con Playwright

### Estructura

```
e2e/
├── auth/                       # Tests de autenticacion
│   ├── login.spec.ts
│   ├── register.spec.ts
│   └── password-reset.spec.ts
├── offers/                     # Tests de ofertas
│   ├── create-offer.spec.ts
│   └── manage-candidates.spec.ts
├── candidates/                 # Tests del portal
│   └── candidate-portal.spec.ts
├── fixtures/
│   └── test-data.ts           # Datos de prueba
├── auth.setup.ts              # Setup de autenticacion
└── playwright.config.ts       # Configuracion
```

### Ejemplo de Test E2E

```typescript
import { test, expect } from "@playwright/test";
import { testUsers, urls, selectors } from "../fixtures/test-data";

test.describe("Login", () => {
  test("should login successfully", async ({ page }) => {
    await page.goto(urls.login);

    await page.fill(selectors.usernameInput, testUsers.admin.username);
    await page.fill(selectors.passwordInput, testUsers.admin.password);
    await page.click(selectors.loginButton);

    await page.waitForURL(urls.dashboard);
    expect(page.url()).toContain(urls.dashboard);
  });
});
```

### Selectores

Usamos `data-testid` para selectores estables:

```typescript
// En el componente
<button data-testid="login-button">Login</button>

// En el test
await page.click('[data-testid="login-button"]');
```

Ver mas detalles en [e2e/README.md](../e2e/README.md).
