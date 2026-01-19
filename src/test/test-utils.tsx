/* eslint-disable react-refresh/only-export-components */
import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter, MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import { configureStore, type PreloadedState } from '@reduxjs/toolkit'
import type { RootState } from '../app/store'
import authReducer from '../features/auth/authSlice'
import { ToastProvider } from '../components/ui/Toast'

// Create a test store with optional preloaded state
export function createTestStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  })
}

type TestStore = ReturnType<typeof createTestStore>

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>
  store?: TestStore
  route?: string
  initialEntries?: MemoryRouterProps['initialEntries']
  useMemoryRouter?: boolean
}

// Custom render function with all providers
function customRender(
  ui: ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    route = '/',
    initialEntries,
    useMemoryRouter = false,
    ...renderOptions
  }: ExtendedRenderOptions = {}
): ReturnType<typeof render> & { store: TestStore } {
  function Wrapper({ children }: { children: ReactNode }) {
    const Router = useMemoryRouter ? MemoryRouter : BrowserRouter
    const routerProps = useMemoryRouter && initialEntries ? { initialEntries } : {}

    // Set the initial route for BrowserRouter
    if (!useMemoryRouter && route !== '/') {
      window.history.pushState({}, 'Test page', route)
    }

    return (
      <Provider store={store}>
        <ToastProvider>
          <Router {...routerProps}>{children}</Router>
        </ToastProvider>
      </Provider>
    )
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Render without router (for isolated component testing)
function renderWithStore(
  ui: ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    ...renderOptions
  }: Omit<ExtendedRenderOptions, 'route' | 'initialEntries' | 'useMemoryRouter'> = {}
): ReturnType<typeof render> & { store: TestStore } {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <ToastProvider>{children}</ToastProvider>
      </Provider>
    )
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Render with just router (no Redux)
function renderWithRouter(
  ui: ReactElement,
  {
    route = '/',
    initialEntries,
    useMemoryRouter = false,
    ...renderOptions
  }: Pick<ExtendedRenderOptions, 'route' | 'initialEntries' | 'useMemoryRouter'> &
    Omit<RenderOptions, 'queries'> = {}
): ReturnType<typeof render> {
  function Wrapper({ children }: { children: ReactNode }) {
    if (useMemoryRouter) {
      return (
        <ToastProvider>
          <MemoryRouter initialEntries={initialEntries || [route]}>
            {children}
          </MemoryRouter>
        </ToastProvider>
      )
    }

    window.history.pushState({}, 'Test page', route)
    return (
      <ToastProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ToastProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Export our custom renders
export { customRender as render, renderWithStore, renderWithRouter }

// Export types
export type { TestStore, ExtendedRenderOptions }

// Helper to create authenticated state
export function createAuthenticatedState(overrides?: Partial<RootState['auth']>): PreloadedState<RootState> {
  return {
    auth: {
      id: '1',
      user: 'Test User',
      accessToken: 'mock-token',
      role: 'org_admin',
      isLoggedIn: true,
      ...overrides,
    },
  }
}

// Helper to create unauthenticated state
export function createUnauthenticatedState(): PreloadedState<RootState> {
  return {
    auth: {
      id: null,
      user: null,
      accessToken: null,
      role: null,
      isLoggedIn: false,
    },
  }
}

// Wait helper for async operations
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Helper to mock console methods
export function mockConsole() {
  const originalError = console.error
  const originalWarn = console.warn
  const originalLog = console.log

  beforeEach(() => {
    console.error = vi.fn()
    console.warn = vi.fn()
    console.log = vi.fn()
  })

  afterEach(() => {
    console.error = originalError
    console.warn = originalWarn
    console.log = originalLog
  })
}
