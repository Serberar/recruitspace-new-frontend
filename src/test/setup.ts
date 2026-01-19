/* eslint-disable @typescript-eslint/no-unused-vars */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { server } from './mocks/server'

// Initialize i18n for tests
import i18n from '../lib/i18n'

// Set default language to Spanish for tests
i18n.changeLanguage('es')

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// MSW Server setup
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  constructor(
    private callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit
  ) {}

  observe(_target: Element): void {}
  unobserve(_target: Element): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
})

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe(_target: Element, _options?: ResizeObserverOptions): void {}
  unobserve(_target: Element): void {}
  disconnect(): void {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
})

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})

// Suppress console errors during tests (optional, comment out for debugging)
// vi.spyOn(console, 'error').mockImplementation(() => {})
// vi.spyOn(console, 'warn').mockImplementation(() => {})
