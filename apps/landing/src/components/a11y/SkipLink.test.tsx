import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkipLink } from './SkipLink'

describe('SkipLink', () => {
  describe('rendering', () => {
    it('renders a link element', () => {
      render(<SkipLink />)

      expect(screen.getByRole('link')).toBeInTheDocument()
    })

    it('renders default text in Spanish', () => {
      render(<SkipLink />)

      expect(screen.getByText('Saltar al contenido principal')).toBeInTheDocument()
    })

    it('renders custom children', () => {
      render(<SkipLink>Skip to main</SkipLink>)

      expect(screen.getByText('Skip to main')).toBeInTheDocument()
    })
  })

  describe('href attribute', () => {
    it('has default href of #main-content', () => {
      render(<SkipLink />)

      expect(screen.getByRole('link')).toHaveAttribute('href', '#main-content')
    })

    it('accepts custom href', () => {
      render(<SkipLink href="#custom-main" />)

      expect(screen.getByRole('link')).toHaveAttribute('href', '#custom-main')
    })

    it('works with various anchor formats', () => {
      render(<SkipLink href="#content" />)

      expect(screen.getByRole('link')).toHaveAttribute('href', '#content')
    })
  })

  describe('accessibility', () => {
    it('is accessible via keyboard', () => {
      render(<SkipLink />)

      const link = screen.getByRole('link')
      expect(link).not.toHaveAttribute('tabindex', '-1')
    })

    it('can receive focus', () => {
      render(<SkipLink />)

      const link = screen.getByRole('link')
      link.focus()

      expect(link).toHaveFocus()
    })
  })

  describe('styling', () => {
    it('applies skipLink CSS class', () => {
      render(<SkipLink />)

      const link = screen.getByRole('link')
      // The class should be applied (from CSS module)
      expect(link).toHaveAttribute('class')
    })
  })
})
