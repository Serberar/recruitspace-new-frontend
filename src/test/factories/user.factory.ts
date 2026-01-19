// User factory for generating test data

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'org_admin' | 'recruiter' | 'org_recruiter' | 'candidate'
  organizationId?: string
  createdAt: string
  updatedAt: string
}

let userIdCounter = 1

export function createUser(overrides: Partial<User> = {}): User {
  const id = String(userIdCounter++)
  return {
    id,
    firstName: `User${id}`,
    lastName: `Test`,
    email: `user${id}@example.com`,
    role: 'recruiter',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createAdmin(overrides: Partial<User> = {}): User {
  return createUser({ role: 'org_admin', ...overrides })
}

export function createRecruiter(overrides: Partial<User> = {}): User {
  return createUser({ role: 'recruiter', ...overrides })
}

export function createOrgRecruiter(overrides: Partial<User> = {}): User {
  return createUser({ role: 'org_recruiter', ...overrides })
}

export function createCandidateUser(overrides: Partial<User> = {}): User {
  return createUser({ role: 'candidate', ...overrides })
}

export function createUsers(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, () => createUser(overrides))
}

export function resetUserFactory(): void {
  userIdCounter = 1
}
