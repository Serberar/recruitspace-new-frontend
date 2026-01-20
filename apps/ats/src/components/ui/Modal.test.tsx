import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent, waitFor } from '../../test/test-utils'
import { Modal } from './Modal'

describe('Modal', () => {
  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Modal content
        </Modal>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}}>
          Modal content
        </Modal>
      )
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders title when provided', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal Title">
          Content
        </Modal>
      )
      expect(screen.getByText('Modal Title')).toBeInTheDocument()
    })

    it('renders children content', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Modal body content</p>
        </Modal>
      )
      expect(screen.getByText('Modal body content')).toBeInTheDocument()
    })

    it('renders footer when provided', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} footer={<button>Save</button>}>
          Content
        </Modal>
      )
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      )
      const modal = screen.getByRole('dialog')
      expect(modal.className).toContain('md')
    })

    it('renders small size', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} size="sm">
          Content
        </Modal>
      )
      const modal = screen.getByRole('dialog')
      expect(modal.className).toContain('sm')
    })

    it('renders large size', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} size="lg">
          Content
        </Modal>
      )
      const modal = screen.getByRole('dialog')
      expect(modal.className).toContain('lg')
    })

    it('renders extra large size', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} size="xl">
          Content
        </Modal>
      )
      const modal = screen.getByRole('dialog')
      expect(modal.className).toContain('xl')
    })
  })

  describe('Close button', () => {
    it('renders close button by default', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      )
      expect(screen.getByRole('button', { name: /cerrar modal/i })).toBeInTheDocument()
    })

    it('does not render close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} showCloseButton={false}>
          Content
        </Modal>
      )
      expect(screen.queryByRole('button', { name: /cerrar modal/i })).not.toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen={true} onClose={handleClose}>
          Content
        </Modal>
      )

      await user.click(screen.getByRole('button', { name: /cerrar modal/i }))
      expect(handleClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Overlay click', () => {
    it('closes on overlay click by default', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen={true} onClose={handleClose}>
          Content
        </Modal>
      )

      // Click the overlay (parent of the dialog)
      const overlay = screen.getByRole('dialog').parentElement
      if (overlay) {
        await user.click(overlay)
        expect(handleClose).toHaveBeenCalledTimes(1)
      }
    })

    it('does not close on overlay click when closeOnOverlayClick is false', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={false}>
          Content
        </Modal>
      )

      const overlay = screen.getByRole('dialog').parentElement
      if (overlay) {
        await user.click(overlay)
        expect(handleClose).not.toHaveBeenCalled()
      }
    })

    it('does not close when clicking inside the modal', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen={true} onClose={handleClose}>
          <button>Inside button</button>
        </Modal>
      )

      await user.click(screen.getByRole('button', { name: 'Inside button' }))
      // Only the close button click should trigger onClose, not clicking inside
      expect(handleClose).not.toHaveBeenCalled()
    })
  })

  describe('Escape key', () => {
    it('closes on Escape key press by default', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen={true} onClose={handleClose}>
          Content
        </Modal>
      )

      await user.keyboard('{Escape}')
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('does not close on Escape when closeOnEscape is false', async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen={true} onClose={handleClose} closeOnEscape={false}>
          Content
        </Modal>
      )

      await user.keyboard('{Escape}')
      expect(handleClose).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has role="dialog"', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has aria-modal="true"', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('has aria-labelledby when title is provided', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Test Title">
          Content
        </Modal>
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title')
    })

    it('focuses the modal when opened', async () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      )

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toHaveFocus()
      })
    })
  })

  describe('Body scroll lock', () => {
    it('prevents body scroll when open', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      )
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('restores body scroll when closed', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      )

      rerender(
        <Modal isOpen={false} onClose={() => {}}>
          Content
        </Modal>
      )

      expect(document.body.style.overflow).toBe('')
    })
  })
})
