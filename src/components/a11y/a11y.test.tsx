import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkipLink } from './SkipLink'
import { FocusTrap } from './FocusTrap'
import { VisuallyHidden } from './VisuallyHidden'
import { LiveRegion, Announcer } from './LiveRegion'

describe('SkipLink', () => {
  it('renders with default text', () => {
    render(<SkipLink />)

    expect(screen.getByText('Saltar al contenido principal')).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    render(<SkipLink>Skip to main</SkipLink>)

    expect(screen.getByText('Skip to main')).toBeInTheDocument()
  })

  it('has default href to #main-content', () => {
    render(<SkipLink />)

    const link = screen.getByRole('link', { name: 'Saltar al contenido principal' })
    expect(link).toHaveAttribute('href', '#main-content')
  })

  it('uses custom href when provided', () => {
    render(<SkipLink href="#custom-target" />)

    const link = screen.getByRole('link', { name: 'Saltar al contenido principal' })
    expect(link).toHaveAttribute('href', '#custom-target')
  })

  it('applies skip link styles', () => {
    const { container } = render(<SkipLink />)

    expect(container.querySelector('[class*="skipLink"]')).toBeInTheDocument()
  })
})

describe('FocusTrap', () => {
  beforeEach(() => {
    // Create a focus target before the trap
    const before = document.createElement('button')
    before.textContent = 'Before'
    before.id = 'before-trap'
    document.body.insertBefore(before, document.body.firstChild)
  })

  afterEach(() => {
    const before = document.getElementById('before-trap')
    before?.remove()
  })

  it('renders children', () => {
    render(
      <FocusTrap>
        <div>Trap content</div>
      </FocusTrap>
    )

    expect(screen.getByText('Trap content')).toBeInTheDocument()
  })

  it('auto-focuses first focusable element when active', () => {
    render(
      <FocusTrap active={true}>
        <button>First button</button>
        <button>Second button</button>
      </FocusTrap>
    )

    expect(screen.getByText('First button')).toHaveFocus()
  })

  it('does not auto-focus when autoFocus is false', () => {
    render(
      <FocusTrap active={true} autoFocus={false}>
        <button>First button</button>
      </FocusTrap>
    )

    expect(screen.getByText('First button')).not.toHaveFocus()
  })

  it('does not trap focus when inactive', () => {
    render(
      <FocusTrap active={false}>
        <button>First button</button>
      </FocusTrap>
    )

    expect(screen.getByText('First button')).not.toHaveFocus()
  })

  it('traps focus within container on Tab', async () => {
    const user = userEvent.setup()
    render(
      <FocusTrap active={true}>
        <button>First</button>
        <button>Second</button>
        <button>Third</button>
      </FocusTrap>
    )

    // First button should be focused
    expect(screen.getByText('First')).toHaveFocus()

    // Tab to second
    await user.tab()
    expect(screen.getByText('Second')).toHaveFocus()

    // Tab to third
    await user.tab()
    expect(screen.getByText('Third')).toHaveFocus()

    // Tab should cycle back to first
    await user.tab()
    expect(screen.getByText('First')).toHaveFocus()
  })

  it('traps focus on Shift+Tab', async () => {
    const user = userEvent.setup()
    render(
      <FocusTrap active={true}>
        <button>First</button>
        <button>Second</button>
      </FocusTrap>
    )

    // First button should be focused
    expect(screen.getByText('First')).toHaveFocus()

    // Shift+Tab should go to last element
    await user.tab({ shift: true })
    expect(screen.getByText('Second')).toHaveFocus()
  })

  it('passes additional props to container', () => {
    render(
      <FocusTrap data-testid="trap-container" className="custom-class">
        <button>Content</button>
      </FocusTrap>
    )

    const container = screen.getByTestId('trap-container')
    expect(container).toHaveClass('custom-class')
  })
})

describe('VisuallyHidden', () => {
  it('renders children', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>)

    expect(screen.getByText('Hidden text')).toBeInTheDocument()
  })

  it('applies visually hidden styles', () => {
    const { container } = render(<VisuallyHidden>Hidden</VisuallyHidden>)

    expect(container.querySelector('[class*="visuallyHidden"]')).toBeInTheDocument()
  })

  it('applies focusable class when focusable is true', () => {
    const { container } = render(<VisuallyHidden focusable>Focusable hidden</VisuallyHidden>)

    expect(container.querySelector('[class*="focusable"]')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<VisuallyHidden className="custom">Hidden</VisuallyHidden>)

    expect(container.firstChild?.className).toContain('custom')
  })

  it('passes additional props', () => {
    render(<VisuallyHidden data-testid="hidden-span">Hidden</VisuallyHidden>)

    expect(screen.getByTestId('hidden-span')).toBeInTheDocument()
  })

  it('renders as span element', () => {
    render(<VisuallyHidden>Hidden</VisuallyHidden>)

    expect(screen.getByText('Hidden').tagName).toBe('SPAN')
  })
})

describe('LiveRegion', () => {
  it('renders children', () => {
    render(<LiveRegion>Announcement</LiveRegion>)

    expect(screen.getByText('Announcement')).toBeInTheDocument()
  })

  it('has role="status"', () => {
    render(<LiveRegion>Content</LiveRegion>)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('sets aria-live to polite by default', () => {
    render(<LiveRegion>Content</LiveRegion>)

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('sets aria-live to assertive when politeness is assertive', () => {
    render(<LiveRegion politeness="assertive">Urgent</LiveRegion>)

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'assertive')
  })

  it('sets aria-atomic to true by default', () => {
    render(<LiveRegion>Content</LiveRegion>)

    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true')
  })

  it('sets aria-relevant correctly', () => {
    render(<LiveRegion relevant="additions">Content</LiveRegion>)

    expect(screen.getByRole('status')).toHaveAttribute('aria-relevant', 'additions')
  })

  it('is visually hidden by default', () => {
    const { container } = render(<LiveRegion>Hidden announcement</LiveRegion>)

    expect(container.querySelector('[class*="visuallyHidden"]')).toBeInTheDocument()
  })

  it('is visible when visuallyHidden is false', () => {
    const { container } = render(
      <LiveRegion visuallyHidden={false} className="visible">
        Visible
      </LiveRegion>
    )

    expect(container.querySelector('.visible')).toBeInTheDocument()
    expect(container.querySelector('[class*="visuallyHidden"]')).not.toBeInTheDocument()
  })
})

describe('Announcer', () => {
  it('renders nothing when message is null', () => {
    const { container } = render(<Announcer message={null} />)

    expect(container.firstChild).toBeNull()
  })

  it('renders message when provided', () => {
    render(<Announcer message="Hello world" />)

    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('has polite aria-live', () => {
    render(<Announcer message="Polite message" />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('is visually hidden', () => {
    const { container } = render(<Announcer message="Hidden" />)

    expect(container.querySelector('[class*="visuallyHidden"]')).toBeInTheDocument()
  })
})
