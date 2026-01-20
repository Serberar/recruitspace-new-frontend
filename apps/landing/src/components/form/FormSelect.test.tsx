import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import { Form } from './Form'
import { FormSelect, type SelectOption } from './FormSelect'

const options: SelectOption[] = [
  { value: 'option1', label: 'Opcion 1' },
  { value: 'option2', label: 'Opcion 2' },
  { value: 'option3', label: 'Opcion 3', disabled: true },
]

const testSchema = z.object({
  selection: z.string().min(1, 'Seleccion requerida'),
})

type TestFormData = z.infer<typeof testSchema>

describe('FormSelect', () => {
  const renderWithForm = (
    props: Partial<React.ComponentProps<typeof FormSelect<TestFormData>>> = {},
    onSubmit = vi.fn()
  ) => {
    return render(
      <Form
        schema={testSchema}
        defaultValues={{ selection: '' }}
        onSubmit={onSubmit}
      >
        <FormSelect<TestFormData>
          name="selection"
          options={options}
          {...props}
        />
        <button type="submit">Submit</button>
      </Form>
    )
  }

  describe('rendering', () => {
    it('renders select with options', () => {
      renderWithForm()

      const select = screen.getByRole('combobox')
      expect(select).toBeInTheDocument()

      expect(screen.getByText('Opcion 1')).toBeInTheDocument()
      expect(screen.getByText('Opcion 2')).toBeInTheDocument()
      expect(screen.getByText('Opcion 3')).toBeInTheDocument()
    })

    it('renders with label', () => {
      renderWithForm({ label: 'Selecciona una opcion' })

      expect(screen.getByLabelText(/selecciona una opcion/i)).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      renderWithForm({ placeholder: 'Elige...' })

      expect(screen.getByText('Elige...')).toBeInTheDocument()
    })

    it('renders with default placeholder', () => {
      renderWithForm()

      expect(screen.getByText('Seleccionar...')).toBeInTheDocument()
    })

    it('renders required indicator', () => {
      renderWithForm({ label: 'Selection', required: true })

      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('renders hint when no error', () => {
      renderWithForm({ hint: 'Ayuda para seleccionar' })

      expect(screen.getByText('Ayuda para seleccionar')).toBeInTheDocument()
    })

    it('renders disabled options correctly', () => {
      renderWithForm()

      const disabledOption = screen.getByText('Opcion 3').closest('option')
      expect(disabledOption).toBeDisabled()
    })
  })

  describe('selection', () => {
    it('allows selecting an option', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      renderWithForm({}, onSubmit)

      const select = screen.getByRole('combobox')
      await user.selectOptions(select, 'option1')

      expect(select).toHaveValue('option1')
    })

    it('submits with selected value', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      renderWithForm({}, onSubmit)

      await user.selectOptions(screen.getByRole('combobox'), 'option2')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
        expect(onSubmit.mock.calls[0][0]).toEqual({
          selection: 'option2'
        })
      }, { timeout: 3000 })
    })
  })

  describe('validation', () => {
    it('shows error when required field is empty', async () => {
      const user = userEvent.setup()
      renderWithForm()

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Seleccion requerida')
      })
    })

    it('hides hint when showing error', async () => {
      const user = userEvent.setup()
      renderWithForm({ hint: 'Este es un hint' })

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
        expect(screen.queryByText('Este es un hint')).not.toBeInTheDocument()
      })
    })

    it('clears error when valid selection is made', async () => {
      const user = userEvent.setup()
      renderWithForm()

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      await user.selectOptions(screen.getByRole('combobox'), 'option1')
      await user.tab()

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })
  })

  describe('accessibility', () => {
    it('associates label with select', () => {
      renderWithForm({ label: 'My Select' })

      const select = screen.getByLabelText(/my select/i)
      expect(select).toBeInTheDocument()
    })

    it('sets aria-invalid when there is an error', async () => {
      const user = userEvent.setup()
      renderWithForm()

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('sets aria-describedby to error when present', async () => {
      const user = userEvent.setup()
      renderWithForm()

      const select = screen.getByRole('combobox')

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        const describedBy = select.getAttribute('aria-describedby')
        expect(describedBy).toContain('-error')
      })
    })

    it('sets aria-describedby to hint when no error', () => {
      renderWithForm({ hint: 'Hint text' })

      const select = screen.getByRole('combobox')
      const describedBy = select.getAttribute('aria-describedby')
      expect(describedBy).toContain('-hint')
    })
  })

  describe('disabled state', () => {
    it('can be disabled', () => {
      renderWithForm({ disabled: true })

      expect(screen.getByRole('combobox')).toBeDisabled()
    })
  })

  describe('custom className', () => {
    it('applies custom className', () => {
      renderWithForm({ className: 'custom-select' })

      expect(screen.getByRole('combobox')).toHaveClass('custom-select')
    })
  })
})
