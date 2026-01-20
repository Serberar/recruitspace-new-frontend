import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../store/slices/authSlice'
import { useRole, usePermissions } from './useRole'
import type { ReactNode } from 'react'

// Helper to create a wrapper with specific role
function createWrapper(role: string | null) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        id: role ? '1' : null,
        user: role ? 'Test User' : null,
        accessToken: role ? 'token' : null,
        role,
        isLoggedIn: !!role,
      },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }
}

describe('useRole', () => {
  it('returns null when not authenticated', () => {
    const { result } = renderHook(() => useRole(), {
      wrapper: createWrapper(null),
    })

    expect(result.current).toBeNull()
  })

  it('returns org_admin role', () => {
    const { result } = renderHook(() => useRole(), {
      wrapper: createWrapper('org_admin'),
    })

    expect(result.current).toBe('org_admin')
  })

  it('returns recruiter role', () => {
    const { result } = renderHook(() => useRole(), {
      wrapper: createWrapper('recruiter'),
    })

    expect(result.current).toBe('recruiter')
  })

  it('returns org_recruiter role', () => {
    const { result } = renderHook(() => useRole(), {
      wrapper: createWrapper('org_recruiter'),
    })

    expect(result.current).toBe('org_recruiter')
  })

  it('returns candidate role', () => {
    const { result } = renderHook(() => useRole(), {
      wrapper: createWrapper('candidate'),
    })

    expect(result.current).toBe('candidate')
  })

  it('lowercases the role from the store', () => {
    // The useRole hook calls toLowerCase() on the role from store
    // When role is 'ORG_ADMIN' in store, hook returns 'org_admin'
    const { result } = renderHook(() => useRole(), {
      wrapper: createWrapper('ORG_ADMIN'),
    })

    expect(result.current).toBe('org_admin')
  })
})

describe('usePermissions', () => {
  describe('org_admin permissions', () => {
    it('has all admin permissions', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper('org_admin'),
      })

      expect(result.current.isAdmin).toBe(true)
      expect(result.current.isRecruiter).toBe(false)
      expect(result.current.isOrgRecruiter).toBe(false)
      expect(result.current.isCandidate).toBe(false)
      expect(result.current.isAnyRecruiter).toBe(false)
    })

    it('can manage team', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper('org_admin'),
      })

      expect(result.current.canManageTeam).toBe(true)
      expect(result.current.canCreateRecruiter).toBe(true)
      expect(result.current.canToggleRecruiterActive).toBe(true)
    })

    it('can manage global resources', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper('org_admin'),
      })

      expect(result.current.canEditGlobalPipeline).toBe(true)
      expect(result.current.canEditGlobalTemplates).toBe(true)
      expect(result.current.canManageRoles).toBe(true)
      expect(result.current.canAssignRecruiter).toBe(true)
    })
  })

  describe('recruiter permissions', () => {
    it('has recruiter permissions', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper('recruiter'),
      })

      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isRecruiter).toBe(true)
      expect(result.current.isAnyRecruiter).toBe(true)
    })

    it('can manage own resources', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper('recruiter'),
      })

      expect(result.current.canCreateOffer).toBe(true)
      expect(result.current.canEditOffer).toBe(true)
      expect(result.current.canViewPipeline).toBe(true)
      expect(result.current.canCreateClient).toBe(true)
      expect(result.current.canEditClient).toBe(true)
    })

    it('cannot manage team', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper('recruiter'),
      })

      expect(result.current.canManageTeam).toBe(false)
      expect(result.current.canCreateRecruiter).toBe(false)
    })

    it('can view global history', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper('recruiter'),
      })

      expect(result.current.canViewGlobalHistory).toBe(true)
    })
  })

  describe('org_recruiter permissions', () => {
    it('has org_recruiter permissions', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper('org_recruiter'),
      })

      expect(result.current.isOrgRecruiter).toBe(true)
      expect(result.current.isAnyRecruiter).toBe(true)
    })

    it('can view team but not manage', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper('org_recruiter'),
      })

      expect(result.current.canViewTeam).toBe(true)
      expect(result.current.canManageTeam).toBe(false)
    })

    it('cannot create clients', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper('org_recruiter'),
      })

      expect(result.current.canCreateClient).toBe(false)
      expect(result.current.canEditClient).toBe(false)
    })

    it('cannot view global history', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper('org_recruiter'),
      })

      expect(result.current.canViewGlobalHistory).toBe(false)
    })
  })

  describe('candidate permissions', () => {
    it('has minimal permissions', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper('candidate'),
      })

      expect(result.current.isCandidate).toBe(true)
      expect(result.current.isAnyRecruiter).toBe(false)
    })

    it('cannot access recruiter features', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper('candidate'),
      })

      expect(result.current.canCreateOffer).toBe(false)
      expect(result.current.canViewPipeline).toBe(false)
      expect(result.current.canViewCandidates).toBe(false)
      expect(result.current.canViewTeam).toBe(false)
    })
  })

  describe('null/unauthenticated', () => {
    it('has no permissions when not authenticated', () => {
      const { result } = renderHook(() => usePermissions(), {
        wrapper: createWrapper(null),
      })

      expect(result.current.role).toBeNull()
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isRecruiter).toBe(false)
      expect(result.current.isCandidate).toBe(false)
      expect(result.current.canCreateOffer).toBe(false)
      expect(result.current.canManageTeam).toBe(false)
    })
  })
})
