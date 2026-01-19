import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { Badge, StatusBadge } from './Badge'

describe('Badge', () => {
  describe('Rendering', () => {
    it('renders children text', () => {
      render(<Badge>Active</Badge>)
      expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('renders as span element', () => {
      render(<Badge>Test</Badge>)
      const badge = screen.getByText('Test')
      expect(badge.tagName).toBe('SPAN')
    })
  })

  describe('Variants', () => {
    it('renders default variant by default', () => {
      render(<Badge>Default</Badge>)
      const badge = screen.getByText('Default')
      expect(badge.className).toContain('default')
    })

    it('renders primary variant', () => {
      render(<Badge variant="primary">Primary</Badge>)
      const badge = screen.getByText('Primary')
      expect(badge.className).toContain('primary')
    })

    it('renders success variant', () => {
      render(<Badge variant="success">Success</Badge>)
      const badge = screen.getByText('Success')
      expect(badge.className).toContain('success')
    })

    it('renders warning variant', () => {
      render(<Badge variant="warning">Warning</Badge>)
      const badge = screen.getByText('Warning')
      expect(badge.className).toContain('warning')
    })

    it('renders error variant', () => {
      render(<Badge variant="error">Error</Badge>)
      const badge = screen.getByText('Error')
      expect(badge.className).toContain('error')
    })

    it('renders info variant', () => {
      render(<Badge variant="info">Info</Badge>)
      const badge = screen.getByText('Info')
      expect(badge.className).toContain('info')
    })
  })

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      render(<Badge>Medium</Badge>)
      const badge = screen.getByText('Medium')
      expect(badge.className).toContain('md')
    })

    it('renders small size', () => {
      render(<Badge size="sm">Small</Badge>)
      const badge = screen.getByText('Small')
      expect(badge.className).toContain('sm')
    })

    it('renders large size', () => {
      render(<Badge size="lg">Large</Badge>)
      const badge = screen.getByText('Large')
      expect(badge.className).toContain('lg')
    })
  })

  describe('Pill shape', () => {
    it('does not have pill class by default', () => {
      render(<Badge>Not Pill</Badge>)
      const badge = screen.getByText('Not Pill')
      expect(badge.className).not.toContain('pill')
    })

    it('has pill class when pill prop is true', () => {
      render(<Badge pill>Pill</Badge>)
      const badge = screen.getByText('Pill')
      expect(badge.className).toContain('pill')
    })
  })

  describe('Dot indicator', () => {
    it('does not show dot by default', () => {
      const { container } = render(<Badge>No Dot</Badge>)
      expect(container.querySelector('.dotIndicator')).not.toBeInTheDocument()
    })

    it('shows dot indicator when dot prop is true', () => {
      const { container } = render(<Badge dot>With Dot</Badge>)
      expect(container.querySelector('[class*="dotIndicator"]')).toBeInTheDocument()
    })
  })

  describe('Icon', () => {
    it('renders icon when provided', () => {
      const Icon = () => <span data-testid="badge-icon">★</span>
      render(<Badge icon={<Icon />}>With Icon</Badge>)
      expect(screen.getByTestId('badge-icon')).toBeInTheDocument()
    })

    it('does not render icon wrapper when no icon provided', () => {
      const { container } = render(<Badge>No Icon</Badge>)
      expect(container.querySelector('[class*="icon"]')).not.toBeInTheDocument()
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<Badge className="custom-badge">Custom</Badge>)
      const badge = screen.getByText('Custom')
      expect(badge.className).toContain('custom-badge')
    })
  })

  describe('HTML attributes', () => {
    it('passes through HTML attributes', () => {
      render(<Badge data-testid="test-badge" title="Badge tooltip">Test</Badge>)
      const badge = screen.getByTestId('test-badge')
      expect(badge).toHaveAttribute('title', 'Badge tooltip')
    })
  })
})

describe('StatusBadge', () => {
  describe('Status presets', () => {
    it('renders active status correctly', () => {
      render(<StatusBadge status="active" />)
      expect(screen.getByText('Activo')).toBeInTheDocument()
    })

    it('renders inactive status correctly', () => {
      render(<StatusBadge status="inactive" />)
      expect(screen.getByText('Inactivo')).toBeInTheDocument()
    })

    it('renders pending status correctly', () => {
      render(<StatusBadge status="pending" />)
      expect(screen.getByText('Pendiente')).toBeInTheDocument()
    })

    it('renders error status correctly', () => {
      render(<StatusBadge status="error" />)
      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('renders success status correctly', () => {
      render(<StatusBadge status="success" />)
      expect(screen.getByText('Completado')).toBeInTheDocument()
    })
  })

  describe('Custom label', () => {
    it('uses custom label when provided', () => {
      render(<StatusBadge status="active" label="Enabled" />)
      expect(screen.getByText('Enabled')).toBeInTheDocument()
      expect(screen.queryByText('Activo')).not.toBeInTheDocument()
    })
  })

  describe('Dot indicator', () => {
    it('always shows dot indicator', () => {
      const { container } = render(<StatusBadge status="active" />)
      expect(container.querySelector('[class*="dotIndicator"]')).toBeInTheDocument()
    })
  })

  describe('Variant mapping', () => {
    it('uses success variant for active status', () => {
      render(<StatusBadge status="active" />)
      const badge = screen.getByText('Activo')
      expect(badge.className).toContain('success')
    })

    it('uses warning variant for pending status', () => {
      render(<StatusBadge status="pending" />)
      const badge = screen.getByText('Pendiente')
      expect(badge.className).toContain('warning')
    })

    it('uses error variant for error status', () => {
      render(<StatusBadge status="error" />)
      const badge = screen.getByText('Error')
      expect(badge.className).toContain('error')
    })
  })
})
