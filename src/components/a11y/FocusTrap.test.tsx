import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FocusTrap } from './FocusTrap'

describe('FocusTrap', () => {
  beforeEach(() => {
    // Reset focus to body before each test
    document.body.focus()
  })

  describe('rendering', () => {
    it('renders children', () => {
      render(
        <FocusTrap>
          <div>Content</div>
        </FocusTrap>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('passes through HTML attributes', () => {
      render(
        <FocusTrap data-testid="focus-trap" className="custom-class">
          <div>Content</div>
        </FocusTrap>
      )

      const container = screen.getByTestId('focus-trap')
      expect(container).toHaveClass('custom-class')
    })
  })

  describe('auto focus', () => {
    it('focuses first focusable element when active and autoFocus is true', () => {
      render(
        <FocusTrap active autoFocus>
          <button data-testid="first-button">First</button>
          <button data-testid="second-button">Second</button>
        </FocusTrap>
      )

      expect(screen.getByTestId('first-button')).toHaveFocus()
    })

    it('does not auto focus when autoFocus is false', () => {
      render(
        <FocusTrap active autoFocus={false}>
          <button data-testid="first-button">First</button>
        </FocusTrap>
      )

      expect(screen.getByTestId('first-button')).not.toHaveFocus()
    })

    it('does not auto focus when not active', () => {
      render(
        <FocusTrap active={false} autoFocus>
          <button data-testid="first-button">First</button>
        </FocusTrap>
      )

      expect(screen.getByTestId('first-button')).not.toHaveFocus()
    })

    it('focuses input elements', () => {
      render(
        <FocusTrap active autoFocus>
          <input data-testid="input" type="text" />
          <button>Button</button>
        </FocusTrap>
      )

      expect(screen.getByTestId('input')).toHaveFocus()
    })

    it('focuses link elements', () => {
      render(
        <FocusTrap active autoFocus>
          <a href="#" data-testid="link">Link</a>
          <button>Button</button>
        </FocusTrap>
      )

      expect(screen.getByTestId('link')).toHaveFocus()
    })
  })

  describe('focus trapping on Tab', () => {
    it('wraps focus from last to first element on Tab', async () => {
      const user = userEvent.setup()

      render(
        <FocusTrap active autoFocus>
          <button data-testid="first">First</button>
          <button data-testid="second">Second</button>
          <button data-testid="last">Last</button>
        </FocusTrap>
      )

      // Focus is on first button
      expect(screen.getByTestId('first')).toHaveFocus()

      // Tab to second
      await user.tab()
      expect(screen.getByTestId('second')).toHaveFocus()

      // Tab to last
      await user.tab()
      expect(screen.getByTestId('last')).toHaveFocus()

      // Tab should wrap to first
      await user.tab()
      expect(screen.getByTestId('first')).toHaveFocus()
    })

    it('wraps focus from first to last element on Shift+Tab', async () => {
      const user = userEvent.setup()

      render(
        <FocusTrap active autoFocus>
          <button data-testid="first">First</button>
          <button data-testid="second">Second</button>
          <button data-testid="last">Last</button>
        </FocusTrap>
      )

      // Focus is on first button
      expect(screen.getByTestId('first')).toHaveFocus()

      // Shift+Tab should wrap to last
      await user.tab({ shift: true })
      expect(screen.getByTestId('last')).toHaveFocus()
    })
  })

  describe('inactive state', () => {
    it('does not trap focus when not active', async () => {
      const user = userEvent.setup()

      render(
        <div>
          <button data-testid="outside">Outside</button>
          <FocusTrap active={false}>
            <button data-testid="inside">Inside</button>
          </FocusTrap>
        </div>
      )

      screen.getByTestId('outside').focus()
      expect(screen.getByTestId('outside')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('inside')).toHaveFocus()

      // Should be able to tab out when not active
      await user.tab()
      expect(screen.getByTestId('inside')).not.toHaveFocus()
    })
  })

  describe('return focus', () => {
    it('returns focus to previously focused element on unmount when returnFocus is true', () => {
      const externalButton = document.createElement('button')
      externalButton.textContent = 'External'
      document.body.appendChild(externalButton)
      externalButton.focus()

      const { unmount } = render(
        <FocusTrap active returnFocus autoFocus>
          <button>Inside</button>
        </FocusTrap>
      )

      // Focus should be inside the trap
      expect(screen.getByText('Inside')).toHaveFocus()

      unmount()

      // Focus should return to external button
      expect(externalButton).toHaveFocus()

      document.body.removeChild(externalButton)
    })

    it('does not return focus when returnFocus is false', () => {
      const externalButton = document.createElement('button')
      externalButton.textContent = 'External'
      document.body.appendChild(externalButton)
      externalButton.focus()

      const { unmount } = render(
        <FocusTrap active returnFocus={false} autoFocus>
          <button>Inside</button>
        </FocusTrap>
      )

      unmount()

      // Focus should not return to external button
      expect(externalButton).not.toHaveFocus()

      document.body.removeChild(externalButton)
    })
  })

  describe('focusable elements', () => {
    it('includes all standard focusable elements', () => {
      render(
        <FocusTrap active autoFocus={false}>
          <a href="#" data-testid="link">Link</a>
          <button data-testid="button">Button</button>
          <input data-testid="input" type="text" />
          <select data-testid="select"><option>Option</option></select>
          <textarea data-testid="textarea" />
          <div tabIndex={0} data-testid="tabindex">Focusable div</div>
        </FocusTrap>
      )

      // All elements should be in the document
      expect(screen.getByTestId('link')).toBeInTheDocument()
      expect(screen.getByTestId('button')).toBeInTheDocument()
      expect(screen.getByTestId('input')).toBeInTheDocument()
      expect(screen.getByTestId('select')).toBeInTheDocument()
      expect(screen.getByTestId('textarea')).toBeInTheDocument()
      expect(screen.getByTestId('tabindex')).toBeInTheDocument()
    })

    it('excludes disabled elements', () => {
      render(
        <FocusTrap active autoFocus>
          <button disabled data-testid="disabled">Disabled</button>
          <button data-testid="enabled">Enabled</button>
        </FocusTrap>
      )

      // Should focus the enabled button, not the disabled one
      expect(screen.getByTestId('enabled')).toHaveFocus()
    })

    it('excludes elements with tabindex="-1"', () => {
      render(
        <FocusTrap active autoFocus>
          <div tabIndex={-1} data-testid="not-focusable">Not focusable</div>
          <button data-testid="focusable">Focusable</button>
        </FocusTrap>
      )

      expect(screen.getByTestId('focusable')).toHaveFocus()
    })
  })

  describe('edge cases', () => {
    it('handles empty focus trap gracefully', () => {
      render(
        <FocusTrap active autoFocus>
          <div>No focusable elements</div>
        </FocusTrap>
      )

      // Should not throw error
      expect(screen.getByText('No focusable elements')).toBeInTheDocument()
    })

    it('handles single focusable element', async () => {
      const user = userEvent.setup()

      render(
        <FocusTrap active autoFocus>
          <button data-testid="only-button">Only</button>
        </FocusTrap>
      )

      expect(screen.getByTestId('only-button')).toHaveFocus()

      // Tab should keep focus on the same element
      await user.tab()
      expect(screen.getByTestId('only-button')).toHaveFocus()
    })
  })
})
