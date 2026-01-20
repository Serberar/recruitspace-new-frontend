import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeedbackModal } from './FeedbackModal'
import { ToastProvider } from '../ui/Toast'

const mockCreate = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'feedback.title': 'Enviar feedback',
        'feedback.type': 'Tipo',
        'feedback.typeBug': 'Bug',
        'feedback.typeSuggestion': 'Sugerencia',
        'feedback.typeQuestion': 'Pregunta',
        'feedback.description': 'Descripcion',
        'feedback.descriptionPlaceholder': 'Describe el problema...',
        'feedback.descriptionRequired': 'La descripcion es requerida',
        'feedback.email': 'Email (opcional)',
        'feedback.emailPlaceholder': 'tu@email.com',
        'feedback.emailHint': 'Te contactaremos si necesitamos mas informacion',
        'feedback.submit': 'Enviar',
        'feedback.sending': 'Enviando...',
        'feedback.success': 'Feedback enviado correctamente',
        'feedback.error': 'Error al enviar el feedback',
        'app.cancel': 'Cancelar',
      }
      return translations[key] || key
    },
  }),
}))

vi.mock('../../services/feedbackApi', () => ({
  feedbackApi: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
  getBrowserInfo: vi.fn().mockReturnValue('Test Browser Info'),
}))

const renderModal = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  }
  return render(
    <ToastProvider>
      <FeedbackModal {...defaultProps} {...props} />
    </ToastProvider>
  )
}

describe('FeedbackModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockResolvedValue({})
  })

  describe('visibility', () => {
    it('renders when isOpen is true', () => {
      renderModal({ isOpen: true })
      expect(screen.getByText('Enviar feedback')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      renderModal({ isOpen: false })
      expect(screen.queryByText('Enviar feedback')).not.toBeInTheDocument()
    })
  })

  describe('form elements', () => {
    it('renders type selection buttons', () => {
      renderModal()

      expect(screen.getByRole('button', { name: /Bug/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Sugerencia/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Pregunta/i })).toBeInTheDocument()
    })

    it('renders description textarea', () => {
      renderModal()
      expect(screen.getByLabelText(/Descripcion/)).toBeInTheDocument()
    })

    it('renders email input', () => {
      renderModal()
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
    })

    it('renders submit and cancel buttons', () => {
      renderModal()
      expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    })

    it('renders close button', () => {
      renderModal()
      expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
    })
  })

  describe('type selection', () => {
    it('selects BUG type by default', () => {
      renderModal()
      const bugButton = screen.getByRole('button', { name: /Bug/i })
      expect(bugButton.className).toContain('typeButtonActive')
    })

    it('changes type when clicking suggestion button', async () => {
      const user = userEvent.setup()
      renderModal()

      await user.click(screen.getByRole('button', { name: /Sugerencia/i }))

      const suggestionButton = screen.getByRole('button', { name: /Sugerencia/i })
      expect(suggestionButton.className).toContain('typeButtonActive')
    })

    it('changes type when clicking question button', async () => {
      const user = userEvent.setup()
      renderModal()

      await user.click(screen.getByRole('button', { name: /Pregunta/i }))

      const questionButton = screen.getByRole('button', { name: /Pregunta/i })
      expect(questionButton.className).toContain('typeButtonActive')
    })
  })

  describe('form submission', () => {
    it('submits form with correct data', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderModal({ onClose })

      await user.type(screen.getByLabelText(/Descripcion/), 'Test description')
      await user.type(screen.getByLabelText(/Email/), 'test@example.com')
      await user.click(screen.getByRole('button', { name: 'Enviar' }))

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
          type: 'BUG',
          description: 'Test description',
          userEmail: 'test@example.com',
          browserInfo: 'Test Browser Info',
        }))
      })
    })

    it('closes modal after successful submission', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderModal({ onClose })

      await user.type(screen.getByLabelText(/Descripcion/), 'Test description')
      await user.click(screen.getByRole('button', { name: 'Enviar' }))

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })

    it('shows sending state during submission', async () => {
      const user = userEvent.setup()
      mockCreate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      renderModal()

      await user.type(screen.getByLabelText(/Descripcion/), 'Test description')
      await user.click(screen.getByRole('button', { name: 'Enviar' }))

      expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled()
    })

    it('submit button is disabled when description is empty', () => {
      renderModal()

      const submitButton = screen.getByRole('button', { name: 'Enviar' })
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button when description has content', async () => {
      const user = userEvent.setup()
      renderModal()

      await user.type(screen.getByLabelText(/Descripcion/), 'Test description')

      const submitButton = screen.getByRole('button', { name: 'Enviar' })
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('closing modal', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderModal({ onClose })

      await user.click(screen.getByRole('button', { name: 'Cerrar' }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderModal({ onClose })

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when clicking overlay', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const { container } = renderModal({ onClose })

      const overlay = container.querySelector('[class*="overlay"]')
      expect(overlay).toBeInTheDocument()
      await user.click(overlay!)

      expect(onClose).toHaveBeenCalled()
    })

    it('does not close when clicking modal content', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      const { container } = renderModal({ onClose })

      const modal = container.querySelector('[class*="modal"]')
      expect(modal).toBeInTheDocument()
      await user.click(modal!)

      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('shows error toast when submission fails', async () => {
      const user = userEvent.setup()
      mockCreate.mockRejectedValue(new Error('API Error'))
      renderModal()

      await user.type(screen.getByLabelText(/Descripcion/), 'Test description')
      await user.click(screen.getByRole('button', { name: 'Enviar' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Error al enviar el feedback')
      })
    })
  })
})
