import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '../../components/ui/Toast'
import { PrivacyPolicyPage } from './PrivacyPolicyPage'
import { TermsOfServicePage } from './TermsOfServicePage'
import { CookiePolicyPage } from './CookiePolicyPage'
import { ContactPage } from './ContactPage'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'app.back': 'Volver',
        'legal.lastUpdated': 'Ultima actualizacion',
        // Privacy
        'legal.privacy.title': 'Politica de Privacidad',
        'legal.privacy.intro.title': 'Introduccion',
        'legal.privacy.intro.text': 'Esta politica describe como manejamos tus datos.',
        'legal.privacy.dataCollected.title': 'Datos que recopilamos',
        'legal.privacy.dataCollected.text': 'Recopilamos los siguientes datos:',
        'legal.privacy.dataCollected.item1': 'Datos de contacto',
        'legal.privacy.dataCollected.item2': 'Datos de uso',
        'legal.privacy.dataCollected.item3': 'Datos tecnicos',
        'legal.privacy.dataCollected.item4': 'Preferencias',
        'legal.privacy.purpose.title': 'Proposito',
        'legal.privacy.purpose.text': 'Usamos tus datos para:',
        'legal.privacy.purpose.item1': 'Proporcionar el servicio',
        'legal.privacy.purpose.item2': 'Mejorar la experiencia',
        'legal.privacy.purpose.item3': 'Comunicarnos contigo',
        'legal.privacy.rights.title': 'Tus derechos',
        'legal.privacy.rights.text': 'Tienes derecho a:',
        'legal.privacy.rights.item1': 'Acceder a tus datos',
        'legal.privacy.rights.item2': 'Rectificar tus datos',
        'legal.privacy.rights.item3': 'Eliminar tus datos',
        'legal.privacy.rights.item4': 'Portabilidad de datos',
        'legal.privacy.contact.title': 'Contacto',
        'legal.privacy.contact.text': 'Contactanos para cualquier consulta.',
        // Terms
        'legal.terms.title': 'Terminos de Servicio',
        'legal.terms.acceptance.title': 'Aceptacion de terminos',
        'legal.terms.acceptance.text': 'Al usar el servicio aceptas estos terminos.',
        'legal.terms.service.title': 'Descripcion del servicio',
        'legal.terms.service.text': 'El servicio esta destinado a reclutamiento.',
        'legal.terms.obligations.title': 'Obligaciones del usuario',
        'legal.terms.obligations.text': 'Te comprometes a:',
        'legal.terms.obligations.item1': 'Proporcionar informacion veraz',
        'legal.terms.obligations.item2': 'No abusar del servicio',
        'legal.terms.obligations.item3': 'Respetar la privacidad',
        'legal.terms.obligations.item4': 'Cumplir las leyes',
        'legal.terms.intellectual.title': 'Propiedad intelectual',
        'legal.terms.intellectual.text': 'Todos los contenidos son propiedad nuestra.',
        'legal.terms.limitation.title': 'Limitacion de responsabilidad',
        'legal.terms.limitation.text': 'Nuestra responsabilidad esta limitada.',
        'legal.terms.modifications.title': 'Modificaciones',
        'legal.terms.modifications.text': 'Podemos modificar estos terminos.',
        // Cookies
        'legal.cookies.title': 'Politica de Cookies',
        'legal.cookies.what.title': 'Que son las cookies',
        'legal.cookies.what.text': 'Las cookies son pequenos archivos de texto.',
        'legal.cookies.types.title': 'Tipos de cookies',
        'legal.cookies.types.text': 'Usamos los siguientes tipos:',
        'legal.cookies.types.essential.name': 'Esenciales',
        'legal.cookies.types.essential.desc': 'Necesarias para el funcionamiento.',
        'legal.cookies.types.functional.name': 'Funcionales',
        'legal.cookies.types.functional.desc': 'Para mejorar la experiencia.',
        'legal.cookies.types.analytics.name': 'Analiticas',
        'legal.cookies.types.analytics.desc': 'Para mejorar el servicio.',
        'legal.cookies.manage.title': 'Gestion de cookies',
        'legal.cookies.manage.text': 'Puedes gestionar las cookies en tu navegador.',
        'legal.cookies.thirdParty.title': 'Cookies de terceros',
        'legal.cookies.thirdParty.text': 'Algunos servicios externos usan cookies.',
        // Contact
        'legal.contact.title': 'Contacto',
        'legal.contact.intro': 'Estamos aqui para ayudarte.',
        'legal.contact.email.title': 'Email',
        'legal.contact.email.text': 'Escribenos a soporte@recruitspace.com',
        'legal.contact.form.title': 'Formulario',
        'legal.contact.form.text': 'Usa el boton de feedback.',
        'legal.contact.social.title': 'Redes sociales',
        'legal.contact.social.text': 'Siguenos en nuestras redes.',
        // Footer translations
        'footer.privacy': 'Privacidad',
        'footer.terms': 'Terminos',
        'footer.cookies': 'Cookies',
        'footer.contact': 'Contacto',
        'footer.reportProblem': 'Reportar problema',
        'app.language': 'Idioma',
      }
      return translations[key] || key
    },
    i18n: {
      language: 'es',
      changeLanguage: vi.fn(),
    },
  }),
}))

// Mock feedbackApi
vi.mock('../../services/feedbackApi', () => ({
  feedbackApi: { create: vi.fn().mockResolvedValue({}) },
  getBrowserInfo: vi.fn().mockReturnValue('Test Browser'),
}))

const renderPage = (Page: React.ComponentType) => {
  return render(
    <ToastProvider>
      <BrowserRouter>
        <Page />
      </BrowserRouter>
    </ToastProvider>
  )
}

describe('Legal Pages', () => {
  describe('PrivacyPolicyPage', () => {
    it('renders privacy policy title', () => {
      renderPage(PrivacyPolicyPage)
      expect(screen.getByRole('heading', { name: 'Politica de Privacidad' })).toBeInTheDocument()
    })

    it('renders back link to home', () => {
      renderPage(PrivacyPolicyPage)
      const backLink = screen.getByRole('link', { name: /Volver/i })
      expect(backLink).toHaveAttribute('href', '/')
    })

    it('renders logo link', () => {
      renderPage(PrivacyPolicyPage)
      expect(screen.getAllByText('ecruitSpace').length).toBeGreaterThan(0)
    })

    it('renders all privacy sections', () => {
      renderPage(PrivacyPolicyPage)
      expect(screen.getByText('Introduccion')).toBeInTheDocument()
      expect(screen.getByText('Datos que recopilamos')).toBeInTheDocument()
      expect(screen.getByText('Proposito')).toBeInTheDocument()
      expect(screen.getByText('Tus derechos')).toBeInTheDocument()
      // "Contacto" appears in both content section and footer, use heading level 2
      expect(screen.getByRole('heading', { name: 'Contacto', level: 2 })).toBeInTheDocument()
    })

    it('renders footer', () => {
      renderPage(PrivacyPolicyPage)
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('renders main content area', () => {
      renderPage(PrivacyPolicyPage)
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })

  describe('TermsOfServicePage', () => {
    it('renders terms title', () => {
      renderPage(TermsOfServicePage)
      expect(screen.getByRole('heading', { name: 'Terminos de Servicio' })).toBeInTheDocument()
    })

    it('renders back link', () => {
      renderPage(TermsOfServicePage)
      const backLink = screen.getByRole('link', { name: /Volver/i })
      expect(backLink).toHaveAttribute('href', '/')
    })

    it('renders all terms sections', () => {
      renderPage(TermsOfServicePage)
      expect(screen.getByText('Aceptacion de terminos')).toBeInTheDocument()
      expect(screen.getByText('Descripcion del servicio')).toBeInTheDocument()
      expect(screen.getByText('Obligaciones del usuario')).toBeInTheDocument()
      expect(screen.getByText('Propiedad intelectual')).toBeInTheDocument()
      expect(screen.getByText('Limitacion de responsabilidad')).toBeInTheDocument()
      expect(screen.getByText('Modificaciones')).toBeInTheDocument()
    })
  })

  describe('CookiePolicyPage', () => {
    it('renders cookies title', () => {
      renderPage(CookiePolicyPage)
      expect(screen.getByRole('heading', { name: 'Politica de Cookies' })).toBeInTheDocument()
    })

    it('renders back link', () => {
      renderPage(CookiePolicyPage)
      const backLink = screen.getByRole('link', { name: /Volver/i })
      expect(backLink).toHaveAttribute('href', '/')
    })

    it('renders cookie sections', () => {
      renderPage(CookiePolicyPage)
      expect(screen.getByText('Que son las cookies')).toBeInTheDocument()
      expect(screen.getByText('Tipos de cookies')).toBeInTheDocument()
      expect(screen.getByText('Gestion de cookies')).toBeInTheDocument()
      expect(screen.getByText('Cookies de terceros')).toBeInTheDocument()
    })
  })

  describe('ContactPage', () => {
    it('renders contact title', () => {
      renderPage(ContactPage)
      expect(screen.getByRole('heading', { name: 'Contacto' })).toBeInTheDocument()
    })

    it('renders back link', () => {
      renderPage(ContactPage)
      const backLink = screen.getByRole('link', { name: /Volver/i })
      expect(backLink).toHaveAttribute('href', '/')
    })

    it('renders contact form', () => {
      renderPage(ContactPage)
      // Check form elements exist
      expect(screen.getByLabelText(/legal.contact.name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/legal.contact.email/)).toBeInTheDocument()
      expect(screen.getByLabelText(/legal.contact.subject/)).toBeInTheDocument()
      expect(screen.getByLabelText(/legal.contact.message/)).toBeInTheDocument()
    })

    it('renders submit button', () => {
      renderPage(ContactPage)
      expect(screen.getByRole('button', { name: /app.send/i })).toBeInTheDocument()
    })

    it('renders footer', () => {
      renderPage(ContactPage)
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })
  })
})
