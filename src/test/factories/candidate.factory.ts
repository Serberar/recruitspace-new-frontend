// Candidate factory for generating test data

export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  linkedinUrl?: string
  portfolioUrl?: string
  summary?: string
  cvUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CandidateNote {
  id: string
  candidateId: string
  content: string
  authorId: string
  authorName: string
  createdAt: string
}

let candidateIdCounter = 1
let noteIdCounter = 1

export function createCandidate(overrides: Partial<Candidate> = {}): Candidate {
  const id = String(candidateIdCounter++)
  return {
    id,
    firstName: `Candidate${id}`,
    lastName: 'Test',
    email: `candidate${id}@example.com`,
    phone: `+3461234567${id}`,
    linkedinUrl: `https://linkedin.com/in/candidate${id}`,
    portfolioUrl: `https://candidate${id}.dev`,
    summary: `Experienced professional with diverse skills. Candidate ID: ${id}`,
    cvUrl: `/uploads/cv-${id}.pdf`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createCandidateNote(
  candidateId: string,
  overrides: Partial<CandidateNote> = {}
): CandidateNote {
  const id = String(noteIdCounter++)
  return {
    id,
    candidateId,
    content: `Note content ${id}`,
    authorId: '1',
    authorName: 'Test User',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export function createCandidates(count: number, overrides: Partial<Candidate> = {}): Candidate[] {
  return Array.from({ length: count }, () => createCandidate(overrides))
}

export function createCandidateNotes(
  candidateId: string,
  count: number,
  overrides: Partial<CandidateNote> = {}
): CandidateNote[] {
  return Array.from({ length: count }, () => createCandidateNote(candidateId, overrides))
}

export function resetCandidateFactory(): void {
  candidateIdCounter = 1
  noteIdCounter = 1
}
