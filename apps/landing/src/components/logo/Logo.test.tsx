import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Logo from './Logo'

describe('Logo', () => {
  describe('rendering', () => {
    it('renders the logo with brand name', () => {
      render(<Logo />)

      expect(screen.getByText('R')).toBeInTheDocument()
      expect(screen.getByText('ecruitSpace')).toBeInTheDocument()
    })

    it('renders gradient R letter', () => {
      const { container } = render(<Logo />)

      const gradientR = container.querySelector('[class*="gradientR"]')
      expect(gradientR).toBeInTheDocument()
      expect(gradientR).toHaveTextContent('R')
    })
  })

  describe('sizes', () => {
    it('applies sm size class', () => {
      const { container } = render(<Logo size="sm" />)

      const logoContainer = container.firstChild
      expect(logoContainer?.className).toContain('sm')
    })

    it('applies md size class by default', () => {
      const { container } = render(<Logo />)

      const logoContainer = container.firstChild
      expect(logoContainer?.className).toContain('md')
    })

    it('applies lg size class', () => {
      const { container } = render(<Logo size="lg" />)

      const logoContainer = container.firstChild
      expect(logoContainer?.className).toContain('lg')
    })
  })

  describe('variants', () => {
    it('applies dark variant by default', () => {
      const { container } = render(<Logo />)

      const logoContainer = container.firstChild
      expect(logoContainer?.className).not.toContain('light')
    })

    it('applies light variant when specified', () => {
      const { container } = render(<Logo variant="light" />)

      const logoContainer = container.firstChild
      expect(logoContainer?.className).toContain('light')
    })
  })

  describe('custom className', () => {
    it('applies custom className', () => {
      const { container } = render(<Logo className="custom-class" />)

      const logoContainer = container.firstChild
      expect(logoContainer?.className).toContain('custom-class')
    })
  })

  describe('structure', () => {
    it('has correct DOM structure', () => {
      const { container } = render(<Logo />)

      const logoContainer = container.querySelector('[class*="logoContainer"]')
      expect(logoContainer).toBeInTheDocument()

      const textLogo = container.querySelector('[class*="textLogo"]')
      expect(textLogo).toBeInTheDocument()

      const darkText = container.querySelector('[class*="darkText"]')
      expect(darkText).toHaveTextContent('ecruitSpace')
    })
  })
})
