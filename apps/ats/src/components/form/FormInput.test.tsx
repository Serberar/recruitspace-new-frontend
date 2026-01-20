import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import { Form } from './Form'
import { FormInput } from './FormInput'

const testSchema = z.object({
  username: z.string().min(3, 'Minimo 3 caracteres'),
  email: z.string().email('Email no valido'),
})

type TestFormData = z.infer<typeof testSchema>

describe('FormInput', () => {
  const renderWithForm = (children: React.ReactNode, onSubmit = vi.fn()) => {
    return render(
      <Form
        schema={testSchema}
        defaultValues={{ username: '', email: '' }}
        onSubmit={onSubmit}
      >
        {children}
      </Form>
    )
  }

  describe('rendering', () => {
    it('renders input with label', () => {
      renderWithForm(
        <FormInput<TestFormData> name="username" label="Username" />
      )

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    })

    it('renders input without label', () => {
      renderWithForm(
        <FormInput<TestFormData> name="username" placeholder="Enter username" />
      )

      expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument()
    })

    it('passes through input props', () => {
      renderWithForm(
        <FormInput<TestFormData>
          name="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          disabled
        />
      )

      const input = screen.getByLabelText(/email/i)
      expect(input).toHaveAttribute('type', 'email')
      expect(input).toHaveAttribute('placeholder', 'tu@email.com')
      expect(input).toBeDisabled()
    })

    it('shows required indicator', () => {
      renderWithForm(
        <FormInput<TestFormData> name="username" label="Username" required />
      )

      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })

  describe('validation', () => {
    it('displays error message from validation', async () => {
      const user = userEvent.setup()
      renderWithForm(
        <>
          <FormInput<TestFormData> name="username" label="Username" />
          <button type="submit">Submit</button>
        </>
      )

      await user.type(screen.getByLabelText(/username/i), 'ab')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Minimo 3 caracteres')
      })
    })

    it('clears error when input becomes valid', async () => {
      const user = userEvent.setup()
      renderWithForm(
        <>
          <FormInput<TestFormData> name="username" label="Username" />
          <button type="submit">Submit</button>
        </>
      )

      const input = screen.getByLabelText(/username/i)

      await user.type(input, 'ab')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      await user.clear(input)
      await user.type(input, 'valid')
      await user.tab()

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })
  })

  describe('form integration', () => {
    it('registers with form context', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      renderWithForm(
        <>
          <FormInput<TestFormData> name="username" label="Username" />
          <FormInput<TestFormData> name="email" label="Email" />
          <button type="submit">Submit</button>
        </>,
        onSubmit
      )

      await user.type(screen.getByLabelText(/username/i), 'testuser')
      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
        expect(onSubmit.mock.calls[0][0]).toEqual({
          username: 'testuser',
          email: 'test@example.com'
        })
      }, { timeout: 3000 })
    })
  })

  describe('accessibility', () => {
    it('associates label with input', () => {
      renderWithForm(
        <FormInput<TestFormData> name="username" label="Username" />
      )

      const input = screen.getByLabelText(/username/i)
      expect(input).toHaveAttribute('id')
    })

    it('sets aria-invalid when there is an error', async () => {
      const user = userEvent.setup()
      renderWithForm(
        <>
          <FormInput<TestFormData> name="username" label="Username" />
          <button type="submit">Submit</button>
        </>
      )

      const input = screen.getByLabelText(/username/i)
      await user.type(input, 'ab')
      await user.tab()

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })
  })

  describe('input types', () => {
    it('handles password input', async () => {
      const user = userEvent.setup()
      const passwordSchema = z.object({
        password: z.string().min(1),
      })

      render(
        <Form
          schema={passwordSchema}
          defaultValues={{ password: '' }}
          onSubmit={vi.fn()}
        >
          <FormInput<{ password: string }> name="password" label="Password" type="password" />
        </Form>
      )

      const input = screen.getByLabelText(/password/i)
      expect(input).toHaveAttribute('type', 'password')

      await user.type(input, 'secret123')
      expect(input).toHaveValue('secret123')
    })

    it('handles number input', async () => {
      const user = userEvent.setup()
      const numberSchema = z.object({
        age: z.coerce.number().min(18),
      })

      render(
        <Form
          schema={numberSchema}
          defaultValues={{ age: 0 }}
          onSubmit={vi.fn()}
        >
          <FormInput<{ age: number }> name="age" label="Age" type="number" />
        </Form>
      )

      const input = screen.getByLabelText(/age/i)
      expect(input).toHaveAttribute('type', 'number')

      await user.clear(input)
      await user.type(input, '25')
      expect(input).toHaveValue(25)
    })
  })
})
