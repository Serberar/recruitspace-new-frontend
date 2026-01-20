import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import { Form } from './Form'
import { FormCheckbox } from './FormCheckbox'

const testSchema = z.object({
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los terminos',
  }),
})

type TestFormData = z.infer<typeof testSchema>

describe('FormCheckbox', () => {
  const renderWithForm = (
    props: Partial<React.ComponentProps<typeof FormCheckbox<TestFormData>>> = {},
    onSubmit = vi.fn()
  ) => {
    return render(
      <Form
        schema={testSchema}
        defaultValues={{ acceptTerms: false }}
        onSubmit={onSubmit}
      >
        <FormCheckbox<TestFormData>
          name="acceptTerms"
          label="Acepto los terminos y condiciones"
          {...props}
        />
        <button type="submit">Submit</button>
      </Form>
    )
  }

  describe('rendering', () => {
    it('renders checkbox with label', () => {
      renderWithForm()

      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByText('Acepto los terminos y condiciones')).toBeInTheDocument()
    })

    it('renders with description', () => {
      renderWithForm({
        description: 'Al marcar acepta nuestra politica de privacidad'
      })

      expect(screen.getByText('Al marcar acepta nuestra politica de privacidad')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = renderWithForm({ className: 'custom-checkbox' })

      expect(container.querySelector('.custom-checkbox')).toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    it('toggles checkbox on click', async () => {
      const user = userEvent.setup()
      renderWithForm()

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      expect(checkbox).toBeChecked()

      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('toggles checkbox on label click', async () => {
      const user = userEvent.setup()
      renderWithForm()

      const checkbox = screen.getByRole('checkbox')
      const label = screen.getByText('Acepto los terminos y condiciones')

      expect(checkbox).not.toBeChecked()
      await user.click(label)
      expect(checkbox).toBeChecked()
    })
  })

  describe('validation', () => {
    it('shows error when required checkbox is not checked', async () => {
      const user = userEvent.setup()
      renderWithForm()

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Debes aceptar los terminos')
      })
    })

    it('clears error when checkbox is checked', async () => {
      const user = userEvent.setup()
      renderWithForm()

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('checkbox'))

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('submits with checkbox value true', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      renderWithForm({}, onSubmit)

      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
        expect(onSubmit.mock.calls[0][0]).toEqual({
          acceptTerms: true
        })
      }, { timeout: 3000 })
    })

    it('prevents submission when checkbox is not checked (required)', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      renderWithForm({}, onSubmit)

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(onSubmit).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('associates label with checkbox via htmlFor', () => {
      renderWithForm()

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('id')

      const label = checkbox.closest('label')
      expect(label).toBeInTheDocument()
    })

    it('sets aria-invalid when there is an error', async () => {
      const user = userEvent.setup()
      renderWithForm()

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('sets aria-describedby to description when present', () => {
      renderWithForm({
        description: 'Help text here'
      })

      const checkbox = screen.getByRole('checkbox')
      const describedBy = checkbox.getAttribute('aria-describedby')
      expect(describedBy).toContain('-desc')
    })

    it('sets aria-describedby to error when present', async () => {
      const user = userEvent.setup()
      renderWithForm()

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox')
        const describedBy = checkbox.getAttribute('aria-describedby')
        expect(describedBy).toContain('-error')
      })
    })
  })

  describe('disabled state', () => {
    it('can be disabled', () => {
      renderWithForm({ disabled: true })

      expect(screen.getByRole('checkbox')).toBeDisabled()
    })

    it('cannot be toggled when disabled', async () => {
      const user = userEvent.setup()
      renderWithForm({ disabled: true })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()

      await user.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })
  })
})
