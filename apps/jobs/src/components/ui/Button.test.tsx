import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '../../test/test-utils'
import { Button } from './Button'

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with children text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('renders with default type="button"', () => {
      render(<Button>Test</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })

    it('renders with type="submit" when specified', () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })
  })

  describe('Variants', () => {
    it('renders primary variant by default', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('primary')
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('secondary')
    })

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('danger')
    })

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('ghost')
    })

    it('renders link variant', () => {
      render(<Button variant="link">Link</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('link')
    })
  })

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      render(<Button>Medium</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('md')
    })

    it('renders small size', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('sm')
    })

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('lg')
    })
  })

  describe('Loading state', () => {
    it('shows loading spinner when loading', () => {
      render(<Button loading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(button).toBeDisabled()
    })

    it('hides icons when loading', () => {
      const LeftIcon = () => <span data-testid="left-icon">L</span>
      const RightIcon = () => <span data-testid="right-icon">R</span>

      render(
        <Button loading leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
          Loading
        </Button>
      )

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument()
    })
  })

  describe('Disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('has aria-disabled when disabled', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Icons', () => {
    it('renders left icon', () => {
      const LeftIcon = () => <span data-testid="left-icon">L</span>
      render(<Button leftIcon={<LeftIcon />}>With Icon</Button>)
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('renders right icon', () => {
      const RightIcon = () => <span data-testid="right-icon">R</span>
      render(<Button rightIcon={<RightIcon />}>With Icon</Button>)
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('renders both icons', () => {
      const LeftIcon = () => <span data-testid="left-icon">L</span>
      const RightIcon = () => <span data-testid="right-icon">R</span>

      render(
        <Button leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
          Both Icons
        </Button>
      )

      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })
  })

  describe('Full width', () => {
    it('renders full width when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('fullWidth')
    })
  })

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Click me</Button>)
      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick} disabled>Disabled</Button>)
      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick} loading>Loading</Button>)
      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Forwarded ref', () => {
    it('forwards ref to button element', () => {
      const ref = vi.fn()
      render(<Button ref={ref}>Ref Button</Button>)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
    })
  })
})
