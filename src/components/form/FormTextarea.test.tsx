import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import { Form } from './Form'
import { FormTextarea } from './FormTextarea'

const testSchema = z.object({
  description: z.string().min(10, 'Minimo 10 caracteres').max(500, 'Maximo 500 caracteres'),
})

type TestFormData = z.infer<typeof testSchema>

describe('FormTextarea', () => {
  const renderWithForm = (
    props: Partial<React.ComponentProps<typeof FormTextarea<TestFormData>>> = {},
    onSubmit = vi.fn()
  ) => {
    return render(
      <Form
        schema={testSchema}
        defaultValues={{ description: '' }}
        onSubmit={onSubmit}
      >
        <FormTextarea<TestFormData>
          name="description"
          {...props}
        />
        <button type="submit">Submit</button>
      </Form>
    )
  }

  describe('rendering', () => {
    it('renders textarea', () => {
      renderWithForm()

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders with label', () => {
      renderWithForm({ label: 'Descripcion' })

      expect(screen.getByLabelText(/descripcion/i)).toBeInTheDocument()
    })

    it('renders required indicator', () => {
      renderWithForm({ label: 'Description', required: true })

      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('renders hint when no error', () => {
      renderWithForm({ hint: 'Escribe una descripcion detallada' })

      expect(screen.getByText('Escribe una descripcion detallada')).toBeInTheDocument()
    })

    it('passes through textarea props', () => {
      renderWithForm({
        label: 'Description',
        rows: 5,
        placeholder: 'Escribe aqui...',
        disabled: true,
      })

      const textarea = screen.getByLabelText(/description/i)
      expect(textarea).toHaveAttribute('rows', '5')
      expect(textarea).toHaveAttribute('placeholder', 'Escribe aqui...')
      expect(textarea).toBeDisabled()
    })
  })

  describe('input handling', () => {
    it('accepts text input', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Description' })

      const textarea = screen.getByLabelText(/description/i)
      await user.type(textarea, 'This is a test description')

      expect(textarea).toHaveValue('This is a test description')
    })

    it('handles multiline input', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Description' })

      const textarea = screen.getByLabelText(/description/i)
      await user.type(textarea, 'Line 1{enter}Line 2{enter}Line 3')

      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3')
    })
  })

  describe('validation', () => {
    it('shows error for text too short', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Description' })

      const textarea = screen.getByLabelText(/description/i)
      await user.type(textarea, 'short')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Minimo 10 caracteres')
      })
    })

    it('shows error for text too long', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Description' })

      const textarea = screen.getByLabelText(/description/i)
      const longText = 'a'.repeat(501)
      await user.type(textarea, longText)
      await user.tab()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Maximo 500 caracteres')
      })
    })

    it('hides hint when showing error', async () => {
      const user = userEvent.setup()
      renderWithForm({
        label: 'Description',
        hint: 'Este es un hint'
      })

      await user.type(screen.getByLabelText(/description/i), 'short')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.queryByText('Este es un hint')).not.toBeInTheDocument()
      })
    })

    it('clears error when input becomes valid', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Description' })

      const textarea = screen.getByLabelText(/description/i)
      await user.type(textarea, 'short')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      await user.clear(textarea)
      await user.type(textarea, 'This is a valid description with more than 10 characters')
      await user.tab()

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('submits with textarea value', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      renderWithForm({ label: 'Description' }, onSubmit)

      await user.type(screen.getByLabelText(/description/i), 'Valid description text with more than 10 chars')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
        expect(onSubmit.mock.calls[0][0]).toEqual({
          description: 'Valid description text with more than 10 chars'
        })
      }, { timeout: 3000 })
    })
  })

  describe('accessibility', () => {
    it('associates label with textarea', () => {
      renderWithForm({ label: 'My Textarea' })

      const textarea = screen.getByLabelText(/my textarea/i)
      expect(textarea).toBeInTheDocument()
    })

    it('sets aria-invalid when there is an error', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Description' })

      const textarea = screen.getByLabelText(/description/i)
      await user.type(textarea, 'short')
      await user.tab()

      await waitFor(() => {
        expect(textarea).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('sets aria-describedby to error when present', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Description' })

      const textarea = screen.getByLabelText(/description/i)
      await user.type(textarea, 'short')
      await user.tab()

      await waitFor(() => {
        const describedBy = textarea.getAttribute('aria-describedby')
        expect(describedBy).toContain('-error')
      })
    })

    it('sets aria-describedby to hint when no error', () => {
      renderWithForm({
        label: 'Description',
        hint: 'Hint text'
      })

      const textarea = screen.getByLabelText(/description/i)
      const describedBy = textarea.getAttribute('aria-describedby')
      expect(describedBy).toContain('-hint')
    })
  })

  describe('custom className', () => {
    it('applies custom className', () => {
      renderWithForm({
        label: 'Description',
        className: 'custom-textarea'
      })

      expect(screen.getByLabelText(/description/i)).toHaveClass('custom-textarea')
    })
  })
})
