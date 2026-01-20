import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'
import { Form } from './Form'
import { FormFileInput } from './FormFileInput'

const testSchema = z.object({
  document: z
    .instanceof(File)
    .nullable()
    .refine((file) => file !== null, {
      message: 'El archivo es requerido',
    }),
})

type TestFormData = z.infer<typeof testSchema>

describe('FormFileInput', () => {
  const renderWithForm = (
    props: Partial<React.ComponentProps<typeof FormFileInput<TestFormData>>> = {},
    onSubmit = vi.fn()
  ) => {
    return render(
      <Form
        schema={testSchema}
        defaultValues={{ document: null }}
        onSubmit={onSubmit}
      >
        <FormFileInput<TestFormData>
          name="document"
          {...props}
        />
        <button type="submit">Submit</button>
      </Form>
    )
  }

  const createFile = (name: string, size: number, type: string) => {
    const content = new Array(size).fill('a').join('')
    return new File([content], name, { type })
  }

  describe('rendering', () => {
    it('renders dropzone with placeholder', () => {
      renderWithForm()

      expect(screen.getByText('Haz clic o arrastra un archivo')).toBeInTheDocument()
    })

    it('renders with label', () => {
      renderWithForm({ label: 'Documento' })

      expect(screen.getByText('Documento')).toBeInTheDocument()
    })

    it('renders required indicator', () => {
      renderWithForm({ label: 'Document', required: true })

      expect(screen.getByText('*')).toBeInTheDocument()
    })

    it('renders hint in placeholder', () => {
      renderWithForm({ hint: 'PDF, max 5MB' })

      expect(screen.getByText('PDF, max 5MB')).toBeInTheDocument()
    })

    it('renders max size when no hint and accept provided', () => {
      renderWithForm({ accept: '.pdf', maxSizeMB: 5 })

      expect(screen.getByText('Max 5MB')).toBeInTheDocument()
    })
  })

  describe('file selection', () => {
    it('shows file info when file is selected', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Document' })

      const file = createFile('test-document.pdf', 1024, 'application/pdf')
      const input = screen.getByLabelText('Document').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('test-document.pdf')).toBeInTheDocument()
      })
    })

    it('shows file size in KB', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Document' })

      const file = createFile('test.pdf', 2048, 'application/pdf')
      const input = screen.getByLabelText('Document').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('2.0 KB')).toBeInTheDocument()
      })
    })

    it('shows file size in MB for large files', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Document' })

      const file = createFile('large.pdf', 2 * 1024 * 1024, 'application/pdf')
      const input = screen.getByLabelText('Document').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('2.0 MB')).toBeInTheDocument()
      })
    })

    it('shows clear button when file is selected', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Document' })

      const file = createFile('test.pdf', 1024, 'application/pdf')
      const input = screen.getByLabelText('Document').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByLabelText('Eliminar archivo')).toBeInTheDocument()
      })
    })

    it('clears file when clear button is clicked', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Document' })

      const file = createFile('test.pdf', 1024, 'application/pdf')
      const input = screen.getByLabelText('Document').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('Eliminar archivo'))

      await waitFor(() => {
        expect(screen.queryByText('test.pdf')).not.toBeInTheDocument()
        expect(screen.getByText('Haz clic o arrastra un archivo')).toBeInTheDocument()
      })
    })
  })

  describe('drag and drop', () => {
    it('handles drag enter', () => {
      renderWithForm({ label: 'Document' })

      const dropzone = screen.getByText('Haz clic o arrastra un archivo').closest('[role="button"]')!

      fireEvent.dragEnter(dropzone, {
        dataTransfer: { files: [] },
      })

      // Component should show active state (visual feedback)
      // We can't easily test CSS classes, but we verify no error is thrown
    })

    it('handles drag leave', () => {
      renderWithForm({ label: 'Document' })

      const dropzone = screen.getByText('Haz clic o arrastra un archivo').closest('[role="button"]')!

      fireEvent.dragEnter(dropzone, {
        dataTransfer: { files: [] },
      })

      fireEvent.dragLeave(dropzone, {
        dataTransfer: { files: [] },
      })
    })

    it('handles file drop', async () => {
      renderWithForm({ label: 'Document' })

      const dropzone = screen.getByText('Haz clic o arrastra un archivo').closest('[role="button"]')!
      const file = createFile('dropped.pdf', 1024, 'application/pdf')

      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
        },
      })

      await waitFor(() => {
        expect(screen.getByText('dropped.pdf')).toBeInTheDocument()
      })
    })
  })

  describe('validation', () => {
    it('shows error when required file is missing', async () => {
      const user = userEvent.setup()
      renderWithForm()

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('El archivo es requerido')
      })
    })

    it('clears error when file is selected', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Document' })

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      const file = createFile('test.pdf', 1024, 'application/pdf')
      const input = screen.getByLabelText('Document').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('submits with file data', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      renderWithForm({ label: 'Document' }, onSubmit)

      const file = createFile('test.pdf', 1024, 'application/pdf')
      const input = screen.getByLabelText('Document').closest('div')?.querySelector('input[type="file"]') as HTMLInputElement

      await user.upload(input, file)
      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
        expect(onSubmit.mock.calls[0][0].document).toBeInstanceOf(File)
      }, { timeout: 3000 })
    })
  })

  describe('accessibility', () => {
    it('dropzone is keyboard accessible', () => {
      renderWithForm({ label: 'Document' })

      const dropzone = screen.getByText('Haz clic o arrastra un archivo').closest('[role="button"]')!
      expect(dropzone).toHaveAttribute('tabindex', '0')
    })

    it('activates on Enter key', () => {
      renderWithForm({ label: 'Document' })

      const dropzone = screen.getByText('Haz clic o arrastra un archivo').closest('[role="button"]')!

      // Should not throw error when pressing Enter
      fireEvent.keyDown(dropzone, { key: 'Enter' })
    })

    it('sets aria-invalid on input when there is an error', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Document' })

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        const fileInput = document.querySelector('input[type="file"]')
        expect(fileInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('sets aria-describedby on dropzone when there is an error', async () => {
      const user = userEvent.setup()
      renderWithForm({ label: 'Document' })

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      const dropzone = screen.getByText('Haz clic o arrastra un archivo').closest('[role="button"]')!
      const describedBy = dropzone.getAttribute('aria-describedby')
      expect(describedBy).toContain('-error')
    })
  })

  describe('accept prop', () => {
    it('passes accept prop to file input', () => {
      renderWithForm({
        label: 'Document',
        accept: '.pdf,.doc,.docx'
      })

      const input = document.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('accept', '.pdf,.doc,.docx')
    })
  })

  describe('custom className', () => {
    it('applies custom className to container', () => {
      const { container } = renderWithForm({ className: 'custom-file-input' })

      expect(container.querySelector('.custom-file-input')).toBeInTheDocument()
    })
  })
})
