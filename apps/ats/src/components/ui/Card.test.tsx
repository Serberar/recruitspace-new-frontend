import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { Card, CardHeader, CardBody, CardFooter } from './Card'

describe('Card', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('renders as div element', () => {
      const { container } = render(<Card>Content</Card>)
      expect(container.firstChild?.nodeName).toBe('DIV')
    })
  })

  describe('Variants', () => {
    it('renders default variant by default', () => {
      const { container } = render(<Card>Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('default')
    })

    it('renders outlined variant', () => {
      const { container } = render(<Card variant="outlined">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('outlined')
    })

    it('renders elevated variant', () => {
      const { container } = render(<Card variant="elevated">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('elevated')
    })
  })

  describe('Padding', () => {
    it('renders medium padding by default', () => {
      const { container } = render(<Card>Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('padding-md')
    })

    it('renders no padding', () => {
      const { container } = render(<Card padding="none">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('padding-none')
    })

    it('renders small padding', () => {
      const { container } = render(<Card padding="sm">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('padding-sm')
    })

    it('renders large padding', () => {
      const { container } = render(<Card padding="lg">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('padding-lg')
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(<Card className="custom-card">Content</Card>)
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('custom-card')
    })
  })

  describe('Forwarded ref', () => {
    it('forwards ref to div element', () => {
      const ref = vi.fn()
      render(<Card ref={ref}>Content</Card>)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('HTML attributes', () => {
    it('passes through HTML attributes', () => {
      render(<Card data-testid="test-card" role="article">Content</Card>)
      const card = screen.getByTestId('test-card')
      expect(card).toHaveAttribute('role', 'article')
    })
  })
})

describe('CardHeader', () => {
  describe('With title and subtitle', () => {
    it('renders title', () => {
      render(<CardHeader title="Header Title" />)
      expect(screen.getByText('Header Title')).toBeInTheDocument()
    })

    it('renders subtitle', () => {
      render(<CardHeader title="Title" subtitle="Subtitle text" />)
      expect(screen.getByText('Subtitle text')).toBeInTheDocument()
    })

    it('renders title as h3', () => {
      render(<CardHeader title="Header Title" />)
      const title = screen.getByText('Header Title')
      expect(title.tagName).toBe('H3')
    })
  })

  describe('With action', () => {
    it('renders action element', () => {
      render(<CardHeader title="Title" action={<button>Action</button>} />)
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })
  })

  describe('With children', () => {
    it('renders children instead of title/subtitle when provided', () => {
      render(
        <CardHeader>
          <div>Custom header content</div>
        </CardHeader>
      )
      expect(screen.getByText('Custom header content')).toBeInTheDocument()
    })

    it('does not render title/subtitle when children provided', () => {
      render(
        <CardHeader title="Ignored" subtitle="Also ignored">
          <div>Custom content</div>
        </CardHeader>
      )
      expect(screen.queryByText('Ignored')).not.toBeInTheDocument()
      expect(screen.queryByText('Also ignored')).not.toBeInTheDocument()
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(<CardHeader title="Title" className="custom-header" />)
      const header = container.firstChild as HTMLElement
      expect(header.className).toContain('custom-header')
    })
  })
})

describe('CardBody', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<CardBody>Body content</CardBody>)
      expect(screen.getByText('Body content')).toBeInTheDocument()
    })

    it('renders as div element', () => {
      const { container } = render(<CardBody>Content</CardBody>)
      expect(container.firstChild?.nodeName).toBe('DIV')
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(<CardBody className="custom-body">Content</CardBody>)
      const body = container.firstChild as HTMLElement
      expect(body.className).toContain('custom-body')
    })
  })

  describe('HTML attributes', () => {
    it('passes through HTML attributes', () => {
      render(<CardBody data-testid="card-body">Content</CardBody>)
      expect(screen.getByTestId('card-body')).toBeInTheDocument()
    })
  })
})

describe('CardFooter', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<CardFooter>Footer content</CardFooter>)
      expect(screen.getByText('Footer content')).toBeInTheDocument()
    })

    it('renders as div element', () => {
      const { container } = render(<CardFooter>Content</CardFooter>)
      expect(container.firstChild?.nodeName).toBe('DIV')
    })
  })

  describe('Alignment', () => {
    it('aligns right by default', () => {
      const { container } = render(<CardFooter>Content</CardFooter>)
      const footer = container.firstChild as HTMLElement
      expect(footer.className).toContain('align-right')
    })

    it('aligns left', () => {
      const { container } = render(<CardFooter align="left">Content</CardFooter>)
      const footer = container.firstChild as HTMLElement
      expect(footer.className).toContain('align-left')
    })

    it('aligns center', () => {
      const { container } = render(<CardFooter align="center">Content</CardFooter>)
      const footer = container.firstChild as HTMLElement
      expect(footer.className).toContain('align-center')
    })

    it('aligns between (space-between)', () => {
      const { container } = render(<CardFooter align="between">Content</CardFooter>)
      const footer = container.firstChild as HTMLElement
      expect(footer.className).toContain('align-between')
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(<CardFooter className="custom-footer">Content</CardFooter>)
      const footer = container.firstChild as HTMLElement
      expect(footer.className).toContain('custom-footer')
    })
  })
})

describe('Card composition', () => {
  it('renders complete card with all parts', () => {
    render(
      <Card>
        <CardHeader title="Card Title" subtitle="Card subtitle" />
        <CardBody>Body content goes here</CardBody>
        <CardFooter>
          <button>Cancel</button>
          <button>Save</button>
        </CardFooter>
      </Card>
    )

    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card subtitle')).toBeInTheDocument()
    expect(screen.getByText('Body content goes here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })
})
