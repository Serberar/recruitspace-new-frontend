import { describe, it, expect } from 'vitest'
import { clientSimpleSchema, clientSchema, clientFilterSchema } from './client.schema'

describe('Client Schemas', () => {
  describe('clientSimpleSchema', () => {
    const validData = {
      name: 'Empresa Test',
      contact: 'Juan Perez',
      email: 'contact@empresa.com',
      phone: '+34612345678',
    }

    it('validates correct client data', () => {
      const result = clientSimpleSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates with only required fields', () => {
      const result = clientSimpleSchema.safeParse({ name: 'Empresa' })
      expect(result.success).toBe(true)
    })

    describe('name validation', () => {
      it('fails when name is empty', () => {
        const result = clientSimpleSchema.safeParse({ ...validData, name: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El nombre es requerido')
        }
      })

      it('fails when name exceeds 100 characters', () => {
        const result = clientSimpleSchema.safeParse({ ...validData, name: 'a'.repeat(101) })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El nombre no puede exceder 100 caracteres')
        }
      })

      it('passes with exactly 100 characters', () => {
        const result = clientSimpleSchema.safeParse({ ...validData, name: 'a'.repeat(100) })
        expect(result.success).toBe(true)
      })
    })

    describe('contact validation', () => {
      it('allows empty contact', () => {
        const result = clientSimpleSchema.safeParse({ name: 'Empresa' })
        expect(result.success).toBe(true)
      })

      it('fails when contact exceeds 100 characters', () => {
        const result = clientSimpleSchema.safeParse({ ...validData, contact: 'a'.repeat(101) })
        expect(result.success).toBe(false)
      })
    })

    describe('email validation', () => {
      it('allows empty email', () => {
        const result = clientSimpleSchema.safeParse({ name: 'Empresa', email: '' })
        expect(result.success).toBe(true)
      })

      it('validates correct email format', () => {
        const result = clientSimpleSchema.safeParse({ ...validData, email: 'test@example.com' })
        expect(result.success).toBe(true)
      })

      it('fails with invalid email format', () => {
        const result = clientSimpleSchema.safeParse({ ...validData, email: 'invalid-email' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email no valido')
        }
      })

      it('fails when email has no domain', () => {
        const result = clientSimpleSchema.safeParse({ ...validData, email: 'test@' })
        expect(result.success).toBe(false)
      })
    })

    describe('phone validation', () => {
      it('allows empty phone', () => {
        const result = clientSimpleSchema.safeParse({ name: 'Empresa' })
        expect(result.success).toBe(true)
      })

      it('fails when phone exceeds 20 characters', () => {
        const result = clientSimpleSchema.safeParse({ ...validData, phone: '1'.repeat(21) })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('clientSchema (full)', () => {
    const validData = {
      name: 'Empresa Completa',
      industry: 'Tecnologia',
      website: 'https://empresa.com',
      contactName: 'Maria Garcia',
      contactEmail: 'maria@empresa.com',
      contactPhone: '+34612345678',
      notes: 'Cliente importante',
    }

    it('validates correct complete client data', () => {
      const result = clientSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates with only required fields', () => {
      const result = clientSchema.safeParse({ name: 'Empresa' })
      expect(result.success).toBe(true)
    })

    describe('website validation', () => {
      it('allows empty website', () => {
        const result = clientSchema.safeParse({ name: 'Empresa' })
        expect(result.success).toBe(true)
      })

      it('validates https URL', () => {
        const result = clientSchema.safeParse({ ...validData, website: 'https://example.com' })
        expect(result.success).toBe(true)
      })

      it('validates http URL', () => {
        const result = clientSchema.safeParse({ ...validData, website: 'http://example.com' })
        expect(result.success).toBe(true)
      })

      it('fails without protocol', () => {
        const result = clientSchema.safeParse({ ...validData, website: 'example.com' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('URL no valida (debe comenzar con http:// o https://)')
        }
      })
    })

    describe('industry validation', () => {
      it('fails when industry exceeds 50 characters', () => {
        const result = clientSchema.safeParse({ ...validData, industry: 'a'.repeat(51) })
        expect(result.success).toBe(false)
      })
    })

    describe('notes validation', () => {
      it('allows long notes up to 2000 characters', () => {
        const result = clientSchema.safeParse({ ...validData, notes: 'a'.repeat(2000) })
        expect(result.success).toBe(true)
      })

      it('fails when notes exceed 2000 characters', () => {
        const result = clientSchema.safeParse({ ...validData, notes: 'a'.repeat(2001) })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('clientFilterSchema', () => {
    it('validates empty filter', () => {
      const result = clientFilterSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('validates with search term', () => {
      const result = clientFilterSchema.safeParse({ search: 'empresa' })
      expect(result.success).toBe(true)
    })

    it('validates with active filter', () => {
      const result = clientFilterSchema.safeParse({ active: true })
      expect(result.success).toBe(true)
    })

    it('validates complete filter', () => {
      const result = clientFilterSchema.safeParse({ search: 'tech', active: false })
      expect(result.success).toBe(true)
    })
  })
})
