// Job Offer factory for generating test data

export interface Client {
  id: string
  name: string
  industry?: string
  website?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  active: boolean
  createdAt: string
}

export interface JobOffer {
  id: string
  title: string
  description: string
  requirements: string
  benefits?: string
  location: string
  salary?: string
  modality: 'on_site' | 'remote' | 'hybrid'
  status: 'active' | 'paused' | 'closed'
  clientId: string
  client?: Client
  candidateCount?: number
  createdAt: string
  updatedAt: string
}

let jobOfferIdCounter = 1
let clientIdCounter = 1

export function createClient(overrides: Partial<Client> = {}): Client {
  const id = String(clientIdCounter++)
  return {
    id,
    name: `Company ${id}`,
    industry: 'Technology',
    website: `https://company${id}.com`,
    contactName: `Contact Person ${id}`,
    contactEmail: `contact${id}@company${id}.com`,
    contactPhone: `+3469000000${id}`,
    active: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createJobOffer(overrides: Partial<JobOffer> = {}): JobOffer {
  const id = String(jobOfferIdCounter++)
  const client = overrides.client || createClient()
  return {
    id,
    title: `Job Position ${id}`,
    description: `This is a description for job position ${id}. We are looking for talented professionals.`,
    requirements: `- Requirement 1 for position ${id}\n- Requirement 2\n- Requirement 3`,
    benefits: `- Competitive salary\n- Remote work options\n- Health insurance`,
    location: 'Madrid, Spain',
    salary: '40000-60000',
    modality: 'hybrid',
    status: 'active',
    clientId: client.id,
    client,
    candidateCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createActiveJobOffer(overrides: Partial<JobOffer> = {}): JobOffer {
  return createJobOffer({ status: 'active', ...overrides })
}

export function createPausedJobOffer(overrides: Partial<JobOffer> = {}): JobOffer {
  return createJobOffer({ status: 'paused', ...overrides })
}

export function createClosedJobOffer(overrides: Partial<JobOffer> = {}): JobOffer {
  return createJobOffer({ status: 'closed', ...overrides })
}

export function createRemoteJobOffer(overrides: Partial<JobOffer> = {}): JobOffer {
  return createJobOffer({ modality: 'remote', location: 'Remote', ...overrides })
}

export function createJobOffers(count: number, overrides: Partial<JobOffer> = {}): JobOffer[] {
  return Array.from({ length: count }, () => createJobOffer(overrides))
}

export function createClients(count: number, overrides: Partial<Client> = {}): Client[] {
  return Array.from({ length: count }, () => createClient(overrides))
}

export function resetJobOfferFactory(): void {
  jobOfferIdCounter = 1
  clientIdCounter = 1
}
