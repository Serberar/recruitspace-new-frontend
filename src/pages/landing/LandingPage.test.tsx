import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LandingPage from './LandingPage'
import { ToastProvider } from '../../components/ui/Toast'

// Mock i18n
const mockChangeLanguage = vi.fn()
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'app.language': 'Idioma',
        'footer.privacy': 'Privacidad',
        'footer.terms': 'Términos',
        'footer.cookies': 'Cookies',
        'footer.contact': 'Contacto',
        'footer.reportProblem': 'Reportar problema',
      }
      return translations[key] || key
    },
    i18n: {
      language: 'es',
      changeLanguage: mockChangeLanguage,
    },
  }),
}))

const renderPage = () => {
  return render(
    <ToastProvider>
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    </ToastProvider>
  )
}

describe('LandingPage', () => {
  describe('header', () => {
    it('renders logo', () => {
      renderPage()

      // Multiple logos may appear (header + footer), just check at least one exists
      expect(screen.getAllByText('R').length).toBeGreaterThan(0)
      expect(screen.getAllByText('ecruitSpace').length).toBeGreaterThan(0)
    })

    it('renders login link', () => {
      renderPage()

      const loginLinks = screen.getAllByRole('link', { name: /entrar|acceder/i })
      expect(loginLinks.length).toBeGreaterThan(0)
    })

    it('renders register link in header', () => {
      renderPage()

      const registerLinks = screen.getAllByRole('link', { name: /registrarse/i })
      expect(registerLinks.length).toBeGreaterThan(0)
    })
  })

  describe('hero section', () => {
    it('renders hero title', () => {
      renderPage()

      expect(screen.getByText(/gestiona tu recruiting/i)).toBeInTheDocument()
      expect(screen.getByText(/sin complicaciones/i)).toBeInTheDocument()
    })

    it('renders badge', () => {
      renderPage()

      expect(screen.getByText(/ATS \+ CRM \+ Portal de empleo/)).toBeInTheDocument()
    })

    it('renders CTA buttons', () => {
      renderPage()

      expect(screen.getByRole('link', { name: /crear cuenta gratis/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /acceder a mi cuenta/i })).toBeInTheDocument()
    })

    it('CTA buttons have correct hrefs', () => {
      renderPage()

      const registerCta = screen.getByRole('link', { name: /crear cuenta gratis/i })
      expect(registerCta).toHaveAttribute('href', '/register')

      const loginCta = screen.getByRole('link', { name: /acceder a mi cuenta/i })
      expect(loginCta).toHaveAttribute('href', '/login')
    })
  })

  describe('problem/solution section', () => {
    it('renders problem heading', () => {
      renderPage()

      expect(screen.getByText(/El recruiting no debería ser caótico/i)).toBeInTheDocument()
    })

    it('renders problem items', () => {
      renderPage()

      expect(screen.getByText(/CVs dispersos/i)).toBeInTheDocument()
      expect(screen.getByText(/Excel para trackear candidatos/i)).toBeInTheDocument()
    })

    it('renders solution box', () => {
      renderPage()

      expect(screen.getByText(/RecruitSpace lo centraliza todo/i)).toBeInTheDocument()
    })
  })

  describe('what is section', () => {
    it('renders section heading', () => {
      renderPage()

      expect(screen.getByText('Qué es RecruitSpace')).toBeInTheDocument()
      expect(screen.getByText(/La herramienta completa para recruiters/i)).toBeInTheDocument()
    })

    it('renders feature cards', () => {
      renderPage()

      expect(screen.getByText('ATS completo')).toBeInTheDocument()
      expect(screen.getByText('CRM ligero')).toBeInTheDocument()
      // Portal de empleo appears in multiple places, use getAllByText
      expect(screen.getAllByText(/Portal de empleo/).length).toBeGreaterThan(0)
      expect(screen.getByText('Pipeline visual')).toBeInTheDocument()
      // Equipos appears in multiple places
      expect(screen.getAllByText(/Equipos/).length).toBeGreaterThan(0)
    })
  })

  describe('features section', () => {
    it('renders features heading', () => {
      renderPage()

      expect(screen.getByText('Funcionalidades')).toBeInTheDocument()
      expect(screen.getByText(/Todo lo que necesitas, nada que no uses/i)).toBeInTheDocument()
    })

    it('renders feature cards', () => {
      renderPage()

      expect(screen.getByText('ATS y pipeline')).toBeInTheDocument()
      expect(screen.getByText('Portal de empleo público')).toBeInTheDocument()
      expect(screen.getByText('Organizaciones y equipos')).toBeInTheDocument()
      expect(screen.getByText('Página por candidato')).toBeInTheDocument()
      // Email corporativo appears in both features and security sections
      expect(screen.getAllByText('Email corporativo').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Dashboard claro')).toBeInTheDocument()
    })
  })

  describe('workflow section', () => {
    it('renders workflow heading', () => {
      renderPage()

      expect(screen.getByText('Cómo funciona')).toBeInTheDocument()
    })

    it('renders workflow steps', () => {
      renderPage()

      expect(screen.getByText('Crea la oferta')).toBeInTheDocument()
      expect(screen.getByText('Recibe candidatos')).toBeInTheDocument()
      expect(screen.getByText('Gestiona el proceso')).toBeInTheDocument()
      expect(screen.getByText('Cierra la posición')).toBeInTheDocument()
    })

    it('renders step numbers', () => {
      renderPage()

      // Step numbers appear multiple times on page (in workflow and possibly stats mockup)
      // Check that at least these numbers exist
      expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('4').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('differentiators section', () => {
    it('renders differentiators heading', () => {
      renderPage()

      expect(screen.getByText('Por qué RecruitSpace')).toBeInTheDocument()
      expect(screen.getByText('Diferencias que importan')).toBeInTheDocument()
    })

    it('renders differentiator cards', () => {
      renderPage()

      expect(screen.getByText('Pipeline 100% personalizable')).toBeInTheDocument()
      expect(screen.getByText('Página por proceso')).toBeInTheDocument()
      expect(screen.getByText('Eliminación automática de datos')).toBeInTheDocument()
      expect(screen.getByText('Parsing de CV inteligente')).toBeInTheDocument()
    })
  })

  describe('security section', () => {
    it('renders security heading', () => {
      renderPage()

      expect(screen.getByText('Seguridad')).toBeInTheDocument()
      expect(screen.getByText('Datos protegidos, siempre')).toBeInTheDocument()
    })

    it('renders security cards', () => {
      renderPage()

      expect(screen.getByText('Cifrado de datos')).toBeInTheDocument()
      expect(screen.getByText('Cumplimiento GDPR')).toBeInTheDocument()
      expect(screen.getByText('SaaS real')).toBeInTheDocument()
    })
  })

  describe('final CTA section', () => {
    it('renders final CTA', () => {
      renderPage()

      expect(screen.getByText('Empieza a reclutar mejor')).toBeInTheDocument()
    })

    it('renders create account button', () => {
      renderPage()

      const ctaButton = screen.getByRole('link', { name: /crear mi cuenta/i })
      expect(ctaButton).toHaveAttribute('href', '/register')
    })
  })

  describe('footer', () => {
    it('renders footer logo', () => {
      renderPage()

      const footer = screen.getByRole('contentinfo')
      // Logo component splits the brand name - footer has "ecruitSpace" text
      const footerLogo = within(footer).getByText('ecruitSpace')
      expect(footerLogo).toBeInTheDocument()
    })

    it('renders footer links', () => {
      renderPage()

      const footer = screen.getByRole('contentinfo')
      const footerLinks = footer.querySelectorAll('a')
      expect(footerLinks.length).toBeGreaterThan(0)
    })

    it('renders copyright', () => {
      renderPage()

      const currentYear = new Date().getFullYear()
      // AppFooter shows year differently
      expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument()
    })
  })

  describe('mockup', () => {
    it('renders app mockup content', () => {
      renderPage()

      expect(screen.getByText('Senior Frontend Developer')).toBeInTheDocument()
      expect(screen.getByText('TechCorp Solutions')).toBeInTheDocument()
    })

    it('renders pipeline stages in mockup', () => {
      renderPage()

      expect(screen.getByText('Aplicados')).toBeInTheDocument()
      expect(screen.getByText('Entrevista HR')).toBeInTheDocument()
      expect(screen.getByText('Prueba técnica')).toBeInTheDocument()
      expect(screen.getByText('Contratado')).toBeInTheDocument()
    })
  })
})
