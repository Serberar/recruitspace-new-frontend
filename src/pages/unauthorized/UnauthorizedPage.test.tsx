import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import UnauthorizedPage from './UnauthorizedPage'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'error.accessDenied': 'Acceso denegado',
        'error.accessDeniedDesc': 'No tienes permisos para acceder a esta página.',
      }
      return translations[key] || key
    },
  }),
}))

describe('UnauthorizedPage', () => {
  it('renders access denied heading', () => {
    render(<UnauthorizedPage />)

    expect(screen.getByRole('heading', { name: 'Acceso denegado' })).toBeInTheDocument()
  })

  it('renders access denied description', () => {
    render(<UnauthorizedPage />)

    expect(screen.getByText('No tienes permisos para acceder a esta página.')).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { container } = render(<UnauthorizedPage />)

    expect(container.querySelector('div')).toBeInTheDocument()
    expect(container.querySelector('h1')).toBeInTheDocument()
    expect(container.querySelector('p')).toBeInTheDocument()
  })
})
