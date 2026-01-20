import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '../../test/test-utils'
import { Input } from './Input'

describe('Input', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('renders with label', () => {
      render(<Input label="Email" />)
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
    })

    it('renders required indicator when required', () => {
      render(<Input label="Email" required />)
      const label = screen.getByText('Email')
      expect(label.parentElement?.textContent).toContain('*')
    })
  })

  describe('Error state', () => {
    it('shows error message when error prop is provided', () => {
      render(<Input error="This field is required" />)
      expect(screen.getByRole('alert')).toHaveTextContent('This field is required')
    })

    it('has aria-invalid when error is present', () => {
      render(<Input error="Error" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('has error styling when error is present', () => {
      render(<Input error="Error" />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('inputError')
    })
  })

  describe('Hint', () => {
    it('shows hint when provided', () => {
      render(<Input hint="Enter your email address" />)
      expect(screen.getByText('Enter your email address')).toBeInTheDocument()
    })

    it('hides hint when error is present', () => {
      render(<Input hint="Hint text" error="Error text" />)
      expect(screen.queryByText('Hint text')).not.toBeInTheDocument()
      expect(screen.getByText('Error text')).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('renders medium size by default', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('md')
    })

    it('renders small size', () => {
      render(<Input size="sm" />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('sm')
    })

    it('renders large size', () => {
      render(<Input size="lg" />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('lg')
    })
  })

  describe('Icons', () => {
    it('renders left icon', () => {
      const LeftIcon = () => <span data-testid="left-icon">@</span>
      render(<Input leftIcon={<LeftIcon />} />)
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    })

    it('renders right icon', () => {
      const RightIcon = () => <span data-testid="right-icon">X</span>
      render(<Input rightIcon={<RightIcon />} />)
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('applies icon styling to input', () => {
      const LeftIcon = () => <span>@</span>
      render(<Input leftIcon={<LeftIcon />} />)
      const input = screen.getByRole('textbox')
      expect(input.className).toContain('hasLeftIcon')
    })
  })

  describe('Full width', () => {
    it('renders full width by default', () => {
      const { container } = render(<Input />)
      const field = container.querySelector('div')
      expect(field?.className).toContain('fullWidth')
    })

    it('does not render full width when fullWidth is false', () => {
      const { container } = render(<Input fullWidth={false} />)
      const field = container.querySelector('div')
      expect(field?.className).not.toContain('fullWidth')
    })
  })

  describe('Interactions', () => {
    it('handles user input', async () => {
      const user = userEvent.setup()
      render(<Input />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'Hello')

      expect(input).toHaveValue('Hello')
    })

    it('calls onChange when value changes', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      render(<Input onChange={handleChange} />)
      await user.type(screen.getByRole('textbox'), 'Test')

      expect(handleChange).toHaveBeenCalled()
    })

    it('can be focused', async () => {
      const user = userEvent.setup()
      render(<Input />)

      const input = screen.getByRole('textbox')
      await user.click(input)

      expect(input).toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('associates label with input', () => {
      render(<Input label="Username" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAccessibleName('Username')
    })

    it('has aria-describedby for error', () => {
      render(<Input label="Email" error="Invalid email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAccessibleDescription('Invalid email')
    })

    it('has aria-describedby for hint', () => {
      render(<Input label="Email" hint="Enter your work email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAccessibleDescription('Enter your work email')
    })

    it('has aria-required when required', () => {
      render(<Input label="Email" required />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('Forwarded ref', () => {
    it('forwards ref to input element', () => {
      const ref = vi.fn()
      render(<Input ref={ref} />)
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('Custom ID', () => {
    it('uses provided id', () => {
      render(<Input id="custom-id" label="Custom" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('id', 'custom-id')
    })

    it('generates id when not provided', () => {
      render(<Input label="Auto ID" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('id')
    })
  })

  describe('Input types', () => {
    it('renders password type', () => {
      const { container } = render(<Input type="password" />)
      expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
    })

    it('renders email type', () => {
      render(<Input type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('renders number type', () => {
      render(<Input type="number" />)
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    })
  })
})
