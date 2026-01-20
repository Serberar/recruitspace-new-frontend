import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LanguageSelector from './LanguageSelector'

const mockChangeLanguage = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'app.language': 'Idioma',
      }
      return translations[key] || key
    },
    i18n: {
      language: 'es',
      changeLanguage: mockChangeLanguage,
    },
  }),
}))

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('default variant', () => {
    it('renders a select element', () => {
      render(<LanguageSelector />)

      const select = screen.getByLabelText('Select language')
      expect(select).toBeInTheDocument()
      expect(select.tagName).toBe('SELECT')
    })

    it('shows Spanish and English options', () => {
      render(<LanguageSelector />)

      const select = screen.getByLabelText('Select language')
      expect(select).toHaveDisplayValue(/Español/)
    })

    it('changes language when option is selected', async () => {
      const user = userEvent.setup()
      render(<LanguageSelector />)

      const select = screen.getByLabelText('Select language')
      await user.selectOptions(select, 'en')

      expect(mockChangeLanguage).toHaveBeenCalledWith('en')
    })

    it('applies custom className', () => {
      const { container } = render(<LanguageSelector className="custom-class" />)

      expect(container.firstChild?.className).toContain('custom-class')
    })
  })

  describe('minimal variant', () => {
    it('renders buttons instead of select', () => {
      render(<LanguageSelector variant="minimal" />)

      expect(screen.getByRole('button', { name: 'Español' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument()
    })

    it('shows language label by default', () => {
      render(<LanguageSelector variant="minimal" />)

      expect(screen.getByText('Idioma')).toBeInTheDocument()
    })

    it('hides language label when showLabel is false', () => {
      render(<LanguageSelector variant="minimal" showLabel={false} />)

      expect(screen.queryByText('Idioma')).not.toBeInTheDocument()
    })

    it('changes language when button is clicked', async () => {
      const user = userEvent.setup()
      render(<LanguageSelector variant="minimal" />)

      await user.click(screen.getByRole('button', { name: 'English' }))

      expect(mockChangeLanguage).toHaveBeenCalledWith('en')
    })

    it('highlights active language button', () => {
      render(<LanguageSelector variant="minimal" />)

      const esButton = screen.getByRole('button', { name: 'Español' })
      expect(esButton.className).toContain('active')
    })

    it('shows language codes in uppercase', () => {
      render(<LanguageSelector variant="minimal" />)

      expect(screen.getByText('ES')).toBeInTheDocument()
      expect(screen.getByText('EN')).toBeInTheDocument()
    })
  })

  describe('dark theme', () => {
    it('applies dark class when theme is dark', () => {
      const { container } = render(<LanguageSelector theme="dark" />)

      expect(container.firstChild?.className).toContain('dark')
    })

    it('applies dark class in minimal variant', () => {
      const { container } = render(<LanguageSelector variant="minimal" theme="dark" />)

      expect(container.firstChild?.className).toContain('dark')
    })
  })
})
