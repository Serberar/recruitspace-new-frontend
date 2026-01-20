import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import { Form } from './Form'
import { FormInput } from './FormInput'

// Simple test schema
const testSchema = z.object({
  email: z.string().min(1, 'Email es requerido').email('Email no valido'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
})

type TestFormData = z.infer<typeof testSchema>

describe('Form', () => {
  const defaultValues: TestFormData = {
    email: '',
    password: '',
  }

  describe('rendering', () => {
    it('renders children correctly', () => {
      render(
        <Form schema={testSchema} defaultValues={defaultValues} onSubmit={vi.fn()}>
          <FormInput<TestFormData> name="email" label="Email" />
          <FormInput<TestFormData> name="password" label="Password" type="password" />
          <button type="submit">Submit</button>
        </Form>
      )

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    })

    it('renders with render prop pattern', () => {
      render(
        <Form schema={testSchema} defaultValues={defaultValues} onSubmit={vi.fn()}>
          {(methods) => (
            <>
              <FormInput<TestFormData> name="email" label="Email" />
              <button type="submit" disabled={methods.formState.isSubmitting}>
                Submit
              </button>
            </>
          )}
        </Form>
      )

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(
        <Form
          schema={testSchema}
          defaultValues={defaultValues}
          onSubmit={vi.fn()}
          className="custom-form"
        >
          <button type="submit">Submit</button>
        </Form>
      )

      expect(container.querySelector('form')).toHaveClass('custom-form')
    })

    it('sets noValidate on form', () => {
      const { container } = render(
        <Form schema={testSchema} defaultValues={defaultValues} onSubmit={vi.fn()}>
          <button type="submit">Submit</button>
        </Form>
      )

      expect(container.querySelector('form')).toHaveAttribute('novalidate')
    })
  })

  describe('validation', () => {
    it('shows validation errors on blur', async () => {
      const user = userEvent.setup()
      render(
        <Form schema={testSchema} defaultValues={defaultValues} onSubmit={vi.fn()}>
          <FormInput<TestFormData> name="email" label="Email" />
          <button type="submit">Submit</button>
        </Form>
      )

      const emailInput = screen.getByLabelText(/email/i)
      await user.click(emailInput)
      await user.tab()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Email es requerido')
      })
    })

    it('shows multiple validation errors on submit', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(
        <Form schema={testSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
          <FormInput<TestFormData> name="email" label="Email" />
          <FormInput<TestFormData> name="password" label="Password" type="password" />
          <button type="submit">Submit</button>
        </Form>
      )

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        const alerts = screen.getAllByRole('alert')
        expect(alerts.length).toBeGreaterThanOrEqual(1)
      })

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('validates email format', async () => {
      const user = userEvent.setup()

      render(
        <Form schema={testSchema} defaultValues={defaultValues} onSubmit={vi.fn()}>
          <FormInput<TestFormData> name="email" label="Email" />
          <button type="submit">Submit</button>
        </Form>
      )

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Email no valido')
      })
    })

    it('validates minimum password length', async () => {
      const user = userEvent.setup()

      render(
        <Form schema={testSchema} defaultValues={defaultValues} onSubmit={vi.fn()}>
          <FormInput<TestFormData> name="password" label="Password" type="password" />
          <button type="submit">Submit</button>
        </Form>
      )

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, '12345')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Minimo 6 caracteres')
      })
    })
  })

  describe('submission', () => {
    it('calls onSubmit with form data when valid', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(
        <Form schema={testSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
          <FormInput<TestFormData> name="email" label="Email" />
          <FormInput<TestFormData> name="password" label="Password" type="password" />
          <button type="submit">Submit</button>
        </Form>
      )

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
        expect(onSubmit.mock.calls[0][0]).toEqual({
          email: 'test@example.com',
          password: 'password123'
        })
      }, { timeout: 3000 })
    })

    it('calls onError when validation fails on submit', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      const onError = vi.fn()

      render(
        <Form
          schema={testSchema}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onError={onError}
        >
          <FormInput<TestFormData> name="email" label="Email" />
          <button type="submit">Submit</button>
        </Form>
      )

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(onError).toHaveBeenCalled()
      })
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('resets form on success when resetOnSuccess is true', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(
        <Form
          schema={testSchema}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          resetOnSuccess
        >
          <FormInput<TestFormData> name="email" label="Email" />
          <FormInput<TestFormData> name="password" label="Password" type="password" />
          <button type="submit">Submit</button>
        </Form>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(emailInput).toHaveValue('')
        expect(passwordInput).toHaveValue('')
      })
    })

    it('does not reset form when resetOnSuccess is false', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(
        <Form
          schema={testSchema}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          resetOnSuccess={false}
        >
          <FormInput<TestFormData> name="email" label="Email" />
          <FormInput<TestFormData> name="password" label="Password" type="password" />
          <button type="submit">Submit</button>
        </Form>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      }, { timeout: 3000 })

      expect(emailInput).toHaveValue('test@example.com')
    })
  })

  describe('default values', () => {
    it('populates form with default values', () => {
      render(
        <Form
          schema={testSchema}
          defaultValues={{ email: 'default@example.com', password: 'defaultpass' }}
          onSubmit={vi.fn()}
        >
          <FormInput<TestFormData> name="email" label="Email" />
          <FormInput<TestFormData> name="password" label="Password" type="password" />
          <button type="submit">Submit</button>
        </Form>
      )

      expect(screen.getByLabelText(/email/i)).toHaveValue('default@example.com')
      expect(screen.getByLabelText(/password/i)).toHaveValue('defaultpass')
    })
  })
})
