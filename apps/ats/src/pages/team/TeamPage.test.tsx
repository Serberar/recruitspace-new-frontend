import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeamPage from './TeamPage'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'team.title': 'Equipo',
        'team.subtitle': 'Gestiona los miembros de tu organización',
        'team.newRecruiter': 'Nuevo recruiter',
        'team.newRecruiterTitle': 'Crear nuevo recruiter',
        'team.newRecruiterDesc': 'Añade un nuevo miembro a tu equipo',
        'team.firstNameLabel': 'Nombre',
        'team.lastNameLabel': 'Apellido',
        'team.emailLabel': 'Email',
        'team.emailPlaceholder': 'email@example.com',
        'team.passwordLabel': 'Contraseña',
        'team.passwordHint': 'Mínimo 6 caracteres',
        'team.createRecruiter': 'Crear recruiter',
        'team.recruiterCreated': 'Recruiter creado correctamente',
        'team.recruiterActivated': 'Recruiter activado',
        'team.recruiterDeactivated': 'Recruiter desactivado',
        'team.cannotDeactivateAdmin': 'No puedes desactivar al administrador',
        'team.noMembers': 'No hay miembros en el equipo',
        'team.errorLoading': 'Error al cargar el equipo',
        'team.roles.admin': 'Administrador',
        'team.roles.recruiter': 'Recruiter',
        'app.loading': 'Cargando...',
        'app.retry': 'Reintentar',
        'app.cancel': 'Cancelar',
        'app.creating': 'Creando...',
        'app.activate': 'Activar',
        'app.deactivate': 'Desactivar',
        'status.inactive': 'Inactivo',
        'toast.error': 'Error',
      }
      return translations[key] || key
    },
  }),
}))

// Mock team API
const mockGetOrganizationMembers = vi.fn()
const mockCreateOrgRecruiter = vi.fn()
const mockUpdateRecruiterStatus = vi.fn()

vi.mock('../../services/teamApi', () => ({
  getOrganizationMembers: () => mockGetOrganizationMembers(),
  createOrgRecruiter: (data: Record<string, string>) => mockCreateOrgRecruiter(data),
  updateRecruiterStatus: (id: string, status: boolean) => mockUpdateRecruiterStatus(id, status),
}))

// Mock usePermissions
const mockUsePermissions = vi.fn()
vi.mock('../../hooks/useRole', () => ({
  usePermissions: () => mockUsePermissions(),
}))

// Mock error handler
vi.mock('../../hooks/useErrorHandler', () => ({
  getErrorMessage: (err: Error) => err.message,
}))

describe('TeamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePermissions.mockReturnValue({
      canCreateRecruiter: true,
      canToggleRecruiterActive: true,
    })
  })

  describe('loading state', () => {
    it('shows loading spinner while fetching members', () => {
      mockGetOrganizationMembers.mockImplementation(() => new Promise(() => {}))
      render(<TeamPage />)

      expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty message when no members', async () => {
      mockGetOrganizationMembers.mockResolvedValue([])
      render(<TeamPage />)

      await waitFor(() => {
        expect(screen.getByText('No hay miembros en el equipo')).toBeInTheDocument()
      })
    })
  })

  describe('with members', () => {
    const mockMembers = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'org_admin',
        isActive: true,
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'org_recruiter',
        isActive: true,
      },
    ]

    it('renders member list', async () => {
      mockGetOrganizationMembers.mockResolvedValue(mockMembers)
      render(<TeamPage />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      })
    })

    it('displays member emails', async () => {
      mockGetOrganizationMembers.mockResolvedValue(mockMembers)
      render(<TeamPage />)

      await waitFor(() => {
        expect(screen.getByText('john@example.com')).toBeInTheDocument()
        expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      })
    })

    it('displays role badges', async () => {
      mockGetOrganizationMembers.mockResolvedValue(mockMembers)
      render(<TeamPage />)

      await waitFor(() => {
        expect(screen.getByText('Administrador')).toBeInTheDocument()
        expect(screen.getByText('Recruiter')).toBeInTheDocument()
      })
    })

    it('shows deactivate button for non-admin members', async () => {
      mockGetOrganizationMembers.mockResolvedValue(mockMembers)
      render(<TeamPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Desactivar' })).toBeInTheDocument()
      })
    })

    it('does not show deactivate button for admin', async () => {
      mockGetOrganizationMembers.mockResolvedValue(mockMembers)
      render(<TeamPage />)

      await waitFor(() => {
        const deactivateButtons = screen.getAllByRole('button', { name: 'Desactivar' })
        // Only one button for non-admin member
        expect(deactivateButtons).toHaveLength(1)
      })
    })
  })

  describe('create recruiter button', () => {
    it('shows create button when user has permission', async () => {
      mockGetOrganizationMembers.mockResolvedValue([])
      mockUsePermissions.mockReturnValue({
        canCreateRecruiter: true,
        canToggleRecruiterActive: true,
      })
      render(<TeamPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Nuevo recruiter' })).toBeInTheDocument()
      })
    })

    it('hides create button when user lacks permission', async () => {
      mockGetOrganizationMembers.mockResolvedValue([])
      mockUsePermissions.mockReturnValue({
        canCreateRecruiter: false,
        canToggleRecruiterActive: false,
      })
      render(<TeamPage />)

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Nuevo recruiter' })).not.toBeInTheDocument()
      })
    })
  })

  describe('create recruiter modal', () => {
    it('opens modal on button click', async () => {
      const user = userEvent.setup()
      mockGetOrganizationMembers.mockResolvedValue([])
      render(<TeamPage />)

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Nuevo recruiter' }))
      })

      expect(screen.getByText('Crear nuevo recruiter')).toBeInTheDocument()
    })

    it('renders form fields in modal', async () => {
      const user = userEvent.setup()
      mockGetOrganizationMembers.mockResolvedValue([])
      render(<TeamPage />)

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Nuevo recruiter' }))
      })

      expect(screen.getByText('Nombre')).toBeInTheDocument()
      expect(screen.getByText('Apellido')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Contraseña')).toBeInTheDocument()
    })

    it('closes modal on cancel', async () => {
      const user = userEvent.setup()
      mockGetOrganizationMembers.mockResolvedValue([])
      render(<TeamPage />)

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Nuevo recruiter' }))
      })

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(screen.queryByText('Crear nuevo recruiter')).not.toBeInTheDocument()
    })

    it('submits form and creates recruiter', async () => {
      const user = userEvent.setup()
      mockGetOrganizationMembers.mockResolvedValue([])
      mockCreateOrgRecruiter.mockResolvedValue({ id: 'new-recruiter' })
      render(<TeamPage />)

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Nuevo recruiter' }))
      })

      const firstNameInput = screen.getAllByRole('textbox')[0]
      const lastNameInput = screen.getAllByRole('textbox')[1]
      const emailInput = screen.getAllByRole('textbox')[2]
      const passwordInput = screen.getByPlaceholderText('Mínimo 6 caracteres')

      await user.type(firstNameInput, 'New')
      await user.type(lastNameInput, 'Recruiter')
      await user.type(emailInput, 'new@example.com')
      await user.type(passwordInput, 'password123')

      await user.click(screen.getByRole('button', { name: 'Crear recruiter' }))

      await waitFor(() => {
        expect(mockCreateOrgRecruiter).toHaveBeenCalledWith({
          firstName: 'New',
          lastName: 'Recruiter',
          email: 'new@example.com',
          password: 'password123',
        })
      })
    })
  })

  describe('toggle status', () => {
    const mockMembers = [
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'org_recruiter',
        isActive: true,
      },
    ]

    it('calls updateRecruiterStatus on toggle', async () => {
      const user = userEvent.setup()
      mockGetOrganizationMembers.mockResolvedValue(mockMembers)
      mockUpdateRecruiterStatus.mockResolvedValue({})
      render(<TeamPage />)

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Desactivar' }))
      })

      expect(mockUpdateRecruiterStatus).toHaveBeenCalledWith('2', false)
    })
  })

  describe('error handling', () => {
    it('shows error message on API failure', async () => {
      mockGetOrganizationMembers.mockRejectedValue(new Error('Network error'))
      render(<TeamPage />)

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('has retry button on error', async () => {
      mockGetOrganizationMembers.mockRejectedValue(new Error('Network error'))
      render(<TeamPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
      })
    })
  })
})
