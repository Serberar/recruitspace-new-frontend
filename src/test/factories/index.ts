// Test data factories
export * from './user.factory'
export * from './candidate.factory'
export * from './jobOffer.factory'

// Reset all factories (useful in beforeEach)
import { resetUserFactory } from './user.factory'
import { resetCandidateFactory } from './candidate.factory'
import { resetJobOfferFactory } from './jobOffer.factory'

export function resetAllFactories(): void {
  resetUserFactory()
  resetCandidateFactory()
  resetJobOfferFactory()
}
