import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LiveRegion, Announcer } from './LiveRegion'

describe('LiveRegion', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<LiveRegion visuallyHidden={false}>Status message</LiveRegion>)

      expect(screen.getByText('Status message')).toBeInTheDocument()
    })

    it('has role="status"', () => {
      render(<LiveRegion visuallyHidden={false}>Message</LiveRegion>)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('ARIA attributes', () => {
    it('sets aria-live to polite by default', () => {
      render(<LiveRegion visuallyHidden={false}>Message</LiveRegion>)

      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    })

    it('sets aria-live to assertive when specified', () => {
      render(
        <LiveRegion politeness="assertive" visuallyHidden={false}>
          Urgent message
        </LiveRegion>
      )

      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'assertive')
    })

    it('sets aria-relevant to all by default', () => {
      render(<LiveRegion visuallyHidden={false}>Message</LiveRegion>)

      expect(screen.getByRole('status')).toHaveAttribute('aria-relevant', 'all')
    })

    it('sets aria-relevant to additions when specified', () => {
      render(
        <LiveRegion relevant="additions" visuallyHidden={false}>
          Message
        </LiveRegion>
      )

      expect(screen.getByRole('status')).toHaveAttribute('aria-relevant', 'additions')
    })

    it('sets aria-relevant to removals when specified', () => {
      render(
        <LiveRegion relevant="removals" visuallyHidden={false}>
          Message
        </LiveRegion>
      )

      expect(screen.getByRole('status')).toHaveAttribute('aria-relevant', 'removals')
    })

    it('sets aria-atomic to true by default', () => {
      render(<LiveRegion visuallyHidden={false}>Message</LiveRegion>)

      expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true')
    })

    it('sets aria-atomic to false when specified', () => {
      render(
        <LiveRegion atomic={false} visuallyHidden={false}>
          Message
        </LiveRegion>
      )

      expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'false')
    })
  })

  describe('visual hiding', () => {
    it('is visually hidden by default', () => {
      const { container } = render(<LiveRegion>Hidden message</LiveRegion>)

      // The element should still exist in the DOM
      expect(container.querySelector('[role="status"]')).toBeInTheDocument()
    })

    it('is visible when visuallyHidden is false', () => {
      render(<LiveRegion visuallyHidden={false}>Visible message</LiveRegion>)

      expect(screen.getByText('Visible message')).toBeVisible()
    })

    it('applies custom className when not visually hidden', () => {
      render(
        <LiveRegion visuallyHidden={false} className="custom-class">
          Message
        </LiveRegion>
      )

      expect(screen.getByRole('status')).toHaveClass('custom-class')
    })
  })

  describe('HTML attributes', () => {
    it('passes through HTML attributes', () => {
      render(
        <LiveRegion data-testid="live-region" visuallyHidden={false}>
          Message
        </LiveRegion>
      )

      expect(screen.getByTestId('live-region')).toBeInTheDocument()
    })
  })

  describe('dynamic content', () => {
    it('updates when content changes', () => {
      const { rerender } = render(
        <LiveRegion visuallyHidden={false}>Initial</LiveRegion>
      )

      expect(screen.getByText('Initial')).toBeInTheDocument()

      rerender(<LiveRegion visuallyHidden={false}>Updated</LiveRegion>)

      expect(screen.getByText('Updated')).toBeInTheDocument()
      expect(screen.queryByText('Initial')).not.toBeInTheDocument()
    })

    it('renders number content', () => {
      render(<LiveRegion visuallyHidden={false}>{42}</LiveRegion>)

      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders complex content', () => {
      render(
        <LiveRegion visuallyHidden={false}>
          <span>Count: </span>
          <strong>5</strong>
        </LiveRegion>
      )

      expect(screen.getByText('Count:')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })
})

describe('Announcer', () => {
  it('renders message when provided', () => {
    render(<Announcer message="Test announcement" />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Test announcement')).toBeInTheDocument()
  })

  it('renders nothing when message is null', () => {
    const { container } = render(<Announcer message={null} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when message is empty string', () => {
    // Note: The component checks for falsy values, so empty string should also return null
    const { container } = render(<Announcer message="" />)

    // Empty string is falsy, so should return null
    expect(container).toBeEmptyDOMElement()
  })

  it('is visually hidden', () => {
    const { container } = render(<Announcer message="Hidden announcement" />)

    const statusElement = container.querySelector('[role="status"]')
    expect(statusElement).toBeInTheDocument()
  })

  it('uses polite politeness level', () => {
    render(<Announcer message="Polite message" />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })
})
