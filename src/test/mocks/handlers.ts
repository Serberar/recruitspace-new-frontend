import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:3000/api'

// Mock data
export const mockUser = {
  id: '1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  role: 'org_admin',
}

export const mockClient = {
  id: '1',
  name: 'Test Company',
  industry: 'Technology',
  website: 'https://testcompany.com',
  contactName: 'John Doe',
  contactEmail: 'john@testcompany.com',
  contactPhone: '+34612345678',
  active: true,
  createdAt: '2024-01-01T00:00:00.000Z',
}

export const mockJobOffer = {
  id: '1',
  title: 'Senior React Developer',
  description: 'We are looking for a senior React developer...',
  requirements: 'At least 5 years of experience...',
  benefits: 'Remote work, flexible hours...',
  location: 'Madrid, Spain',
  salary: '50000-70000',
  modality: 'hybrid',
  status: 'active',
  clientId: '1',
  client: mockClient,
  createdAt: '2024-01-01T00:00:00.000Z',
}

export const mockCandidate = {
  id: '1',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '+34612345678',
  linkedinUrl: 'https://linkedin.com/in/janedoe',
  portfolioUrl: 'https://janedoe.dev',
  summary: 'Experienced developer with 10+ years...',
  createdAt: '2024-01-01T00:00:00.000Z',
}

export const mockPipelineStage = {
  id: '1',
  name: 'Screening',
  order: 1,
  color: '#3B82F6',
}

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }

    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        accessToken: 'mock-jwt-token',
        user: mockUser,
      })
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' })
  }),

  http.get(`${API_BASE}/auth/me`, () => {
    return HttpResponse.json(mockUser)
  }),

  // Users endpoints
  http.get(`${API_BASE}/users`, () => {
    return HttpResponse.json([mockUser])
  }),

  http.get(`${API_BASE}/users/:id`, ({ params }) => {
    if (params.id === '1') {
      return HttpResponse.json(mockUser)
    }
    return HttpResponse.json({ message: 'User not found' }, { status: 404 })
  }),

  http.post(`${API_BASE}/users/invite`, async ({ request }) => {
    const body = await request.json() as { email: string; role: string }
    return HttpResponse.json({
      id: '2',
      email: body.email,
      role: body.role,
      invitedAt: new Date().toISOString(),
    })
  }),

  // Clients endpoints
  http.get(`${API_BASE}/clients`, () => {
    return HttpResponse.json({
      data: [mockClient],
      total: 1,
      page: 1,
      limit: 10,
    })
  }),

  http.get(`${API_BASE}/clients/:id`, ({ params }) => {
    if (params.id === '1') {
      return HttpResponse.json(mockClient)
    }
    return HttpResponse.json({ message: 'Client not found' }, { status: 404 })
  }),

  http.post(`${API_BASE}/clients`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: '2',
      ...body,
      createdAt: new Date().toISOString(),
    }, { status: 201 })
  }),

  http.put(`${API_BASE}/clients/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: params.id,
      ...body,
      updatedAt: new Date().toISOString(),
    })
  }),

  http.delete(`${API_BASE}/clients/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Job Offers endpoints
  http.get(`${API_BASE}/job-offers`, () => {
    return HttpResponse.json({
      data: [mockJobOffer],
      total: 1,
      page: 1,
      limit: 10,
    })
  }),

  http.get(`${API_BASE}/job-offers/:id`, ({ params }) => {
    if (params.id === '1') {
      return HttpResponse.json(mockJobOffer)
    }
    return HttpResponse.json({ message: 'Job offer not found' }, { status: 404 })
  }),

  http.post(`${API_BASE}/job-offers`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: '2',
      ...body,
      status: 'active',
      createdAt: new Date().toISOString(),
    }, { status: 201 })
  }),

  http.put(`${API_BASE}/job-offers/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: params.id,
      ...body,
      updatedAt: new Date().toISOString(),
    })
  }),

  http.patch(`${API_BASE}/job-offers/:id/status`, async ({ request, params }) => {
    const body = await request.json() as { status: string }
    return HttpResponse.json({
      ...mockJobOffer,
      id: params.id,
      status: body.status,
    })
  }),

  // Candidates endpoints
  http.get(`${API_BASE}/candidates`, () => {
    return HttpResponse.json({
      data: [mockCandidate],
      total: 1,
      page: 1,
      limit: 10,
    })
  }),

  http.get(`${API_BASE}/candidates/:id`, ({ params }) => {
    if (params.id === '1') {
      return HttpResponse.json(mockCandidate)
    }
    return HttpResponse.json({ message: 'Candidate not found' }, { status: 404 })
  }),

  http.post(`${API_BASE}/candidates/:id/notes`, async ({ request, params }) => {
    const body = await request.json() as { content: string }
    return HttpResponse.json({
      id: '1',
      candidateId: params.id,
      content: body.content,
      createdAt: new Date().toISOString(),
      author: mockUser,
    }, { status: 201 })
  }),

  // Pipeline endpoints
  http.get(`${API_BASE}/pipeline/stages`, () => {
    return HttpResponse.json([
      mockPipelineStage,
      { id: '2', name: 'Interview', order: 2, color: '#10B981' },
      { id: '3', name: 'Technical', order: 3, color: '#F59E0B' },
      { id: '4', name: 'Offer', order: 4, color: '#8B5CF6' },
    ])
  }),

  http.post(`${API_BASE}/pipeline/stages`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: '5',
      ...body,
    }, { status: 201 })
  }),

  http.put(`${API_BASE}/pipeline/stages/:id`, async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      id: params.id,
      ...body,
    })
  }),

  http.delete(`${API_BASE}/pipeline/stages/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API_BASE}/pipeline/stages/reorder`, async ({ request }) => {
    const body = await request.json() as { stages: Array<{ id: string; order: number }> }
    return HttpResponse.json(body.stages)
  }),

  // Organization endpoints
  http.get(`${API_BASE}/organization/settings`, () => {
    return HttpResponse.json({
      name: 'Test Organization',
      domain: 'test-org',
      website: 'https://test-org.com',
    })
  }),

  http.put(`${API_BASE}/organization/settings`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json(body)
  }),

  http.get(`${API_BASE}/organization/smtp`, () => {
    return HttpResponse.json({
      host: 'smtp.example.com',
      port: 587,
      user: 'smtp-user',
      fromEmail: 'noreply@test-org.com',
      fromName: 'Test Organization',
      secure: true,
    })
  }),

  http.put(`${API_BASE}/organization/smtp`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json(body)
  }),

  http.post(`${API_BASE}/organization/smtp/test`, () => {
    return HttpResponse.json({ success: true, message: 'Test email sent' })
  }),

  // Public endpoints
  http.get(`${API_BASE}/public/job-offers`, () => {
    return HttpResponse.json({
      data: [{ ...mockJobOffer, client: { name: mockClient.name } }],
      total: 1,
      page: 1,
      limit: 10,
    })
  }),

  http.get(`${API_BASE}/public/job-offers/:id`, ({ params }) => {
    if (params.id === '1') {
      return HttpResponse.json({
        ...mockJobOffer,
        client: { name: mockClient.name },
      })
    }
    return HttpResponse.json({ message: 'Job offer not found' }, { status: 404 })
  }),

  http.post(`${API_BASE}/public/job-offers/:id/apply`, async ({ request }) => {
    const formData = await request.formData()
    return HttpResponse.json({
      id: '1',
      candidateId: '1',
      jobOfferId: formData.get('jobOfferId'),
      status: 'new',
      createdAt: new Date().toISOString(),
    }, { status: 201 })
  }),

  // Admin endpoints
  http.get(`${API_BASE}/admin/stats`, () => {
    return HttpResponse.json({
      totalUsers: 10,
      totalClients: 5,
      totalJobOffers: 15,
      totalCandidates: 100,
      activeProcesses: 25,
    })
  }),

  http.get(`${API_BASE}/admin/activity`, () => {
    return HttpResponse.json([
      {
        id: '1',
        action: 'user_login',
        userId: '1',
        timestamp: new Date().toISOString(),
      },
    ])
  }),
]
