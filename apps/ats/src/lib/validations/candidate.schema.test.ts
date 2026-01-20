import { describe, it, expect } from 'vitest'
import {
  candidateApplicationSchema,
  candidateProfileSchema,
  candidateNoteSchema,
} from './candidate.schema'

// Helper to create a mock File
function createMockFile(
  name: string,
  size: number,
  type: string
): File {
  const content = new Array(size).fill('a').join('')
  const blob = new Blob([content], { type })
  return new File([blob], name, { type })
}

describe('Candidate Schemas', () => {
  describe('candidateApplicationSchema', () => {
    const validPdfFile = createMockFile('cv.pdf', 1024, 'application/pdf')

    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      cv: validPdfFile,
    }

    it('validates correct application data', () => {
      const result = candidateApplicationSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates with optional phone', () => {
      const result = candidateApplicationSchema.safeParse({
        ...validData,
        phone: '+34 612 345 678',
      })
      expect(result.success).toBe(true)
    })

    describe('firstName validation', () => {
      it('fails when firstName is empty', () => {
        const result = candidateApplicationSchema.safeParse({ ...validData, firstName: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El nombre es requerido')
        }
      })

      it('fails when firstName exceeds 50 characters', () => {
        const result = candidateApplicationSchema.safeParse({ ...validData, firstName: 'a'.repeat(51) })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El nombre no puede exceder 50 caracteres')
        }
      })
    })

    describe('lastName validation', () => {
      it('fails when lastName is empty', () => {
        const result = candidateApplicationSchema.safeParse({ ...validData, lastName: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El apellido es requerido')
        }
      })
    })

    describe('email validation', () => {
      it('fails when email is empty', () => {
        const result = candidateApplicationSchema.safeParse({ ...validData, email: '' })
        expect(result.success).toBe(false)
      })

      it('fails when email is invalid', () => {
        const result = candidateApplicationSchema.safeParse({ ...validData, email: 'invalid' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email no valido')
        }
      })
    })

    describe('phone validation', () => {
      it('passes with valid phone formats', () => {
        const validPhones = [
          '+34612345678',
          '612 345 678',
          '+1 (555) 123-4567',
          '123456',
        ]

        validPhones.forEach((phone) => {
          const result = candidateApplicationSchema.safeParse({ ...validData, phone })
          expect(result.success).toBe(true)
        })
      })

      it('fails with invalid phone format', () => {
        const result = candidateApplicationSchema.safeParse({ ...validData, phone: 'abc' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Numero de telefono no valido')
        }
      })

      it('passes when phone is empty (optional)', () => {
        const result = candidateApplicationSchema.safeParse({ ...validData, phone: '' })
        expect(result.success).toBe(true)
      })

      it('passes when phone is undefined', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { phone: _phone, ...dataWithoutPhone } = validData
        const result = candidateApplicationSchema.safeParse(dataWithoutPhone)
        expect(result.success).toBe(true)
      })
    })

    describe('cv validation', () => {
      it('fails when cv is not a File', () => {
        const result = candidateApplicationSchema.safeParse({ ...validData, cv: 'not a file' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El CV es requerido')
        }
      })

      it('fails when cv exceeds 10MB', () => {
        const largeFile = createMockFile('large.pdf', 11 * 1024 * 1024, 'application/pdf')
        const result = candidateApplicationSchema.safeParse({ ...validData, cv: largeFile })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El archivo no puede superar 10MB')
        }
      })

      it('passes with exactly 10MB file', () => {
        const maxFile = createMockFile('max.pdf', 10 * 1024 * 1024, 'application/pdf')
        const result = candidateApplicationSchema.safeParse({ ...validData, cv: maxFile })
        expect(result.success).toBe(true)
      })

      it('fails with invalid file type', () => {
        const invalidFile = createMockFile('cv.txt', 1024, 'text/plain')
        const result = candidateApplicationSchema.safeParse({ ...validData, cv: invalidFile })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Solo se permiten archivos PDF o DOCX')
        }
      })

      it('passes with PDF file', () => {
        const pdfFile = createMockFile('cv.pdf', 1024, 'application/pdf')
        const result = candidateApplicationSchema.safeParse({ ...validData, cv: pdfFile })
        expect(result.success).toBe(true)
      })

      it('passes with DOCX file', () => {
        const docxFile = createMockFile(
          'cv.docx',
          1024,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        const result = candidateApplicationSchema.safeParse({ ...validData, cv: docxFile })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('candidateProfileSchema', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    }

    it('validates correct profile data', () => {
      const result = candidateProfileSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates with all optional fields', () => {
      const result = candidateProfileSchema.safeParse({
        ...validData,
        phone: '+34612345678',
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        portfolioUrl: 'https://johndoe.dev',
        summary: 'Experienced developer',
      })
      expect(result.success).toBe(true)
    })

    describe('linkedinUrl validation', () => {
      it('passes with valid LinkedIn URL', () => {
        const result = candidateProfileSchema.safeParse({
          ...validData,
          linkedinUrl: 'https://linkedin.com/in/johndoe',
        })
        expect(result.success).toBe(true)
      })

      it('passes with linkedin.com anywhere in URL', () => {
        const result = candidateProfileSchema.safeParse({
          ...validData,
          linkedinUrl: 'https://www.linkedin.com/in/johndoe',
        })
        expect(result.success).toBe(true)
      })

      it('fails with non-LinkedIn URL', () => {
        const result = candidateProfileSchema.safeParse({
          ...validData,
          linkedinUrl: 'https://facebook.com/johndoe',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('URL de LinkedIn no valida')
        }
      })

      it('passes when empty (optional)', () => {
        const result = candidateProfileSchema.safeParse({
          ...validData,
          linkedinUrl: '',
        })
        expect(result.success).toBe(true)
      })
    })

    describe('portfolioUrl validation', () => {
      it('passes with http URL', () => {
        const result = candidateProfileSchema.safeParse({
          ...validData,
          portfolioUrl: 'http://portfolio.example.com',
        })
        expect(result.success).toBe(true)
      })

      it('passes with https URL', () => {
        const result = candidateProfileSchema.safeParse({
          ...validData,
          portfolioUrl: 'https://portfolio.example.com',
        })
        expect(result.success).toBe(true)
      })

      it('fails with URL without protocol', () => {
        const result = candidateProfileSchema.safeParse({
          ...validData,
          portfolioUrl: 'portfolio.example.com',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('URL no valida')
        }
      })

      it('passes when empty (optional)', () => {
        const result = candidateProfileSchema.safeParse({
          ...validData,
          portfolioUrl: '',
        })
        expect(result.success).toBe(true)
      })
    })

    describe('summary validation', () => {
      it('passes with valid summary', () => {
        const result = candidateProfileSchema.safeParse({
          ...validData,
          summary: 'I am an experienced developer with 10 years of experience.',
        })
        expect(result.success).toBe(true)
      })

      it('fails when summary exceeds 1000 characters', () => {
        const result = candidateProfileSchema.safeParse({
          ...validData,
          summary: 'a'.repeat(1001),
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El resumen no puede exceder 1000 caracteres')
        }
      })

      it('passes with exactly 1000 characters', () => {
        const result = candidateProfileSchema.safeParse({
          ...validData,
          summary: 'a'.repeat(1000),
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('candidateNoteSchema', () => {
    it('validates correct note data', () => {
      const result = candidateNoteSchema.safeParse({
        content: 'This is a note about the candidate.',
      })
      expect(result.success).toBe(true)
    })

    it('fails when content is empty', () => {
      const result = candidateNoteSchema.safeParse({ content: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El contenido es requerido')
      }
    })

    it('fails when content exceeds 5000 characters', () => {
      const result = candidateNoteSchema.safeParse({
        content: 'a'.repeat(5001),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El contenido no puede exceder 5000 caracteres')
      }
    })

    it('passes with exactly 5000 characters', () => {
      const result = candidateNoteSchema.safeParse({
        content: 'a'.repeat(5000),
      })
      expect(result.success).toBe(true)
    })

    it('passes with multiline content', () => {
      const result = candidateNoteSchema.safeParse({
        content: 'Line 1\nLine 2\nLine 3',
      })
      expect(result.success).toBe(true)
    })
  })
})
