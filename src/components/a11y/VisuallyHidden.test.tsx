import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VisuallyHidden } from './VisuallyHidden'

describe('VisuallyHidden', () => {
  describe('rendering', () => {
    it('renders children', () => {
      render(<VisuallyHidden>Hidden text</VisuallyHidden>)

      expect(screen.getByText('Hidden text')).toBeInTheDocument()
    })

    it('renders as a span element', () => {
      render(<VisuallyHidden>Content</VisuallyHidden>)

      const element = screen.getByText('Content')
      expect(element.tagName).toBe('SPAN')
    })
  })

  describe('CSS classes', () => {
    it('applies visuallyHidden class', () => {
      render(<VisuallyHidden>Hidden</VisuallyHidden>)

      const element = screen.getByText('Hidden')
      expect(element).toHaveAttribute('class')
      expect(element.className).toContain('visuallyHidden')
    })

    it('applies focusable class when focusable is true', () => {
      render(<VisuallyHidden focusable>Focusable hidden</VisuallyHidden>)

      const element = screen.getByText('Focusable hidden')
      expect(element.className).toContain('focusable')
    })

    it('does not apply focusable class by default', () => {
      render(<VisuallyHidden>Not focusable</VisuallyHidden>)

      const element = screen.getByText('Not focusable')
      expect(element.className).not.toContain('focusable')
    })

    it('includes custom className', () => {
      render(<VisuallyHidden className="custom">Content</VisuallyHidden>)

      const element = screen.getByText('Content')
      expect(element).toHaveClass('custom')
    })

    it('combines all classes correctly', () => {
      render(
        <VisuallyHidden focusable className="my-class">
          Combined
        </VisuallyHidden>
      )

      const element = screen.getByText('Combined')
      expect(element.className).toContain('visuallyHidden')
      expect(element.className).toContain('focusable')
      expect(element).toHaveClass('my-class')
    })
  })

  describe('HTML attributes', () => {
    it('passes through HTML attributes', () => {
      render(
        <VisuallyHidden id="my-id" data-testid="hidden-element">
          Attributes
        </VisuallyHidden>
      )

      const element = screen.getByTestId('hidden-element')
      expect(element).toHaveAttribute('id', 'my-id')
    })

    it('supports aria attributes', () => {
      render(
        <VisuallyHidden aria-label="Label" aria-describedby="desc">
          Aria
        </VisuallyHidden>
      )

      const element = screen.getByText('Aria')
      expect(element).toHaveAttribute('aria-label', 'Label')
      expect(element).toHaveAttribute('aria-describedby', 'desc')
    })
  })

  describe('content types', () => {
    it('renders text content', () => {
      render(<VisuallyHidden>Simple text</VisuallyHidden>)

      expect(screen.getByText('Simple text')).toBeInTheDocument()
    })

    it('renders element content', () => {
      render(
        <VisuallyHidden>
          <strong>Bold text</strong>
        </VisuallyHidden>
      )

      expect(screen.getByText('Bold text')).toBeInTheDocument()
      expect(screen.getByText('Bold text').tagName).toBe('STRONG')
    })

    it('renders multiple children', () => {
      render(
        <VisuallyHidden>
          <span>First</span>
          <span>Second</span>
        </VisuallyHidden>
      )

      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('content is accessible to screen readers', () => {
      render(
        <button>
          <span aria-hidden="true">X</span>
          <VisuallyHidden>Close modal</VisuallyHidden>
        </button>
      )

      // The visually hidden text should be accessible
      expect(screen.getByText('Close modal')).toBeInTheDocument()
    })

    it('works as accessible label for icons', () => {
      render(
        <a href="/home">
          <svg aria-hidden="true" />
          <VisuallyHidden>Go to homepage</VisuallyHidden>
        </a>
      )

      expect(screen.getByRole('link')).toHaveAccessibleName('Go to homepage')
    })
  })
})
