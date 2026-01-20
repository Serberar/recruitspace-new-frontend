import { describe, it, expect } from 'vitest'
import { jobOfferSchema, jobOfferFilterSchema } from './jobOffer.schema'

describe('Job Offer Schemas', () => {
  describe('jobOfferSchema', () => {
    const validData = {
      title: 'Frontend Developer',
      description: 'Buscamos desarrollador frontend con experiencia en React',
      requirements: 'React, TypeScript, 3 anos experiencia',
      benefits: 'Teletrabajo, seguro medico',
      location: 'Madrid',
      salary: '40.000 - 50.000 EUR',
      modality: 'hybrid' as const,
      clientId: 'client-123',
      category: 'Tecnologia',
      contractType: 'Indefinido',
      isPublic: true,
      salaryPublic: false,
      active: true,
      publicDisplayName: 'Tech Company',
    }

    it('validates correct job offer data', () => {
      const result = jobOfferSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates with only required fields', () => {
      const result = jobOfferSchema.safeParse({
        title: 'Developer',
        description: 'Job description',
        clientId: 'client-123',
      })
      expect(result.success).toBe(true)
    })

    describe('title validation', () => {
      it('fails when title is empty', () => {
        const result = jobOfferSchema.safeParse({ ...validData, title: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El titulo es requerido')
        }
      })

      it('fails when title exceeds 100 characters', () => {
        const result = jobOfferSchema.safeParse({ ...validData, title: 'a'.repeat(101) })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El titulo no puede exceder 100 caracteres')
        }
      })
    })

    describe('description validation', () => {
      it('fails when description is empty', () => {
        const result = jobOfferSchema.safeParse({ ...validData, description: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('La descripcion es requerida')
        }
      })

      it('fails when description exceeds 10000 characters', () => {
        const result = jobOfferSchema.safeParse({ ...validData, description: 'a'.repeat(10001) })
        expect(result.success).toBe(false)
      })

      it('allows description up to 10000 characters', () => {
        const result = jobOfferSchema.safeParse({ ...validData, description: 'a'.repeat(10000) })
        expect(result.success).toBe(true)
      })
    })

    describe('requirements validation', () => {
      it('allows empty requirements', () => {
        const { requirements: _, ...data } = validData
        const result = jobOfferSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('fails when requirements exceed 5000 characters', () => {
        const result = jobOfferSchema.safeParse({ ...validData, requirements: 'a'.repeat(5001) })
        expect(result.success).toBe(false)
      })
    })

    describe('benefits validation', () => {
      it('allows empty benefits', () => {
        const { benefits: _, ...data } = validData
        const result = jobOfferSchema.safeParse(data)
        expect(result.success).toBe(true)
      })

      it('fails when benefits exceed 5000 characters', () => {
        const result = jobOfferSchema.safeParse({ ...validData, benefits: 'a'.repeat(5001) })
        expect(result.success).toBe(false)
      })
    })

    describe('modality validation', () => {
      it('accepts onsite modality', () => {
        const result = jobOfferSchema.safeParse({ ...validData, modality: 'onsite' })
        expect(result.success).toBe(true)
      })

      it('accepts remote modality', () => {
        const result = jobOfferSchema.safeParse({ ...validData, modality: 'remote' })
        expect(result.success).toBe(true)
      })

      it('accepts hybrid modality', () => {
        const result = jobOfferSchema.safeParse({ ...validData, modality: 'hybrid' })
        expect(result.success).toBe(true)
      })

      it('fails with invalid modality', () => {
        const result = jobOfferSchema.safeParse({ ...validData, modality: 'invalid' })
        expect(result.success).toBe(false)
      })

      it('allows undefined modality', () => {
        const { modality: _, ...data } = validData
        const result = jobOfferSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    describe('clientId validation', () => {
      it('fails when clientId is empty', () => {
        const result = jobOfferSchema.safeParse({ ...validData, clientId: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El cliente es requerido')
        }
      })
    })

    describe('location validation', () => {
      it('fails when location exceeds 100 characters', () => {
        const result = jobOfferSchema.safeParse({ ...validData, location: 'a'.repeat(101) })
        expect(result.success).toBe(false)
      })
    })

    describe('salary validation', () => {
      it('fails when salary exceeds 50 characters', () => {
        const result = jobOfferSchema.safeParse({ ...validData, salary: 'a'.repeat(51) })
        expect(result.success).toBe(false)
      })
    })

    describe('boolean fields', () => {
      it('accepts boolean isPublic', () => {
        const result = jobOfferSchema.safeParse({ ...validData, isPublic: true })
        expect(result.success).toBe(true)
      })

      it('accepts boolean salaryPublic', () => {
        const result = jobOfferSchema.safeParse({ ...validData, salaryPublic: false })
        expect(result.success).toBe(true)
      })

      it('accepts boolean active', () => {
        const result = jobOfferSchema.safeParse({ ...validData, active: false })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('jobOfferFilterSchema', () => {
    it('validates empty filter', () => {
      const result = jobOfferFilterSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('validates with search term', () => {
      const result = jobOfferFilterSchema.safeParse({ search: 'developer' })
      expect(result.success).toBe(true)
    })

    it('validates with status filter', () => {
      const statuses = ['active', 'paused', 'closed'] as const
      statuses.forEach((status) => {
        const result = jobOfferFilterSchema.safeParse({ status })
        expect(result.success).toBe(true)
      })
    })

    it('fails with invalid status', () => {
      const result = jobOfferFilterSchema.safeParse({ status: 'invalid' })
      expect(result.success).toBe(false)
    })

    it('validates with clientId filter', () => {
      const result = jobOfferFilterSchema.safeParse({ clientId: 'client-123' })
      expect(result.success).toBe(true)
    })

    it('validates with modality filter', () => {
      const modalities = ['onsite', 'remote', 'hybrid'] as const
      modalities.forEach((modality) => {
        const result = jobOfferFilterSchema.safeParse({ modality })
        expect(result.success).toBe(true)
      })
    })

    it('validates complete filter', () => {
      const result = jobOfferFilterSchema.safeParse({
        search: 'developer',
        status: 'active',
        clientId: 'client-123',
        modality: 'remote',
      })
      expect(result.success).toBe(true)
    })
  })
})
