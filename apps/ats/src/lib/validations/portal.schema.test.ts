import { describe, it, expect } from 'vitest'
import {
  portalSettingsSchema,
  teamInviteSchema,
  createRecruiterSchema,
  smtpSettingsSchema,
} from './portal.schema'

describe('portalSettingsSchema', () => {
  describe('domain validation', () => {
    it('accepts valid domain names', () => {
      const result = portalSettingsSchema.safeParse({
        domain: 'my-company',
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
      })
      expect(result.success).toBe(true)
    })

    it('accepts domain with numbers', () => {
      const result = portalSettingsSchema.safeParse({
        domain: 'company123',
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
      })
      expect(result.success).toBe(true)
    })

    it('accepts empty domain', () => {
      const result = portalSettingsSchema.safeParse({
        domain: '',
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
      })
      expect(result.success).toBe(true)
    })

    it('accepts undefined domain', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
      })
      expect(result.success).toBe(true)
    })

    it('rejects domain with uppercase letters', () => {
      const result = portalSettingsSchema.safeParse({
        domain: 'MyCompany',
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Solo letras minusculas, numeros y guiones')
    })

    it('rejects domain starting with hyphen', () => {
      const result = portalSettingsSchema.safeParse({
        domain: '-company',
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
      })
      expect(result.success).toBe(false)
    })

    it('rejects domain ending with hyphen', () => {
      const result = portalSettingsSchema.safeParse({
        domain: 'company-',
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
      })
      expect(result.success).toBe(false)
    })

    it('rejects domain with special characters', () => {
      const result = portalSettingsSchema.safeParse({
        domain: 'company@123',
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('URL validations', () => {
    it('accepts valid https URL for logoUrl', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: 'https://example.com/logo.png',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid http URL for logoUrl', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: 'http://example.com/logo.png',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
      })
      expect(result.success).toBe(true)
    })

    it('accepts empty URL for logoUrl', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
      })
      expect(result.success).toBe(true)
    })

    it('trims whitespace from URL', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: '  https://example.com/logo.png  ',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.logoUrl).toBe('https://example.com/logo.png')
      }
    })

    it('rejects invalid URL format', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: 'not-a-url',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('La URL debe empezar con http:// o https://')
    })

    it('validates all URL fields', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: 'https://example.com/logo.png',
        headerImageUrl: 'https://example.com/header.png',
        candidatePageLogoUrl: 'https://example.com/candidate-logo.png',
        candidatePageHeaderImageUrl: 'https://example.com/candidate-header.png',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('title and subtitle validations', () => {
    it('accepts valid portalTitle', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
        portalTitle: 'Mi Portal de Empleo',
      })
      expect(result.success).toBe(true)
    })

    it('rejects portalTitle over 100 characters', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
        portalTitle: 'a'.repeat(101),
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('El titulo no puede exceder 100 caracteres')
    })

    it('accepts valid portalSubtitle', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
        portalSubtitle: 'Encuentra tu empleo ideal',
      })
      expect(result.success).toBe(true)
    })

    it('rejects portalSubtitle over 200 characters', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
        portalSubtitle: 'a'.repeat(201),
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('La frase no puede exceder 200 caracteres')
    })

    it('validates candidatePageTitle max length', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
        candidatePageTitle: 'a'.repeat(101),
      })
      expect(result.success).toBe(false)
    })

    it('validates candidatePageSubtitle max length', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
        candidatePageSubtitle: 'a'.repeat(201),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('boolean fields', () => {
    it('accepts useBrandingOnCandidatePage boolean', () => {
      const result = portalSettingsSchema.safeParse({
        logoUrl: '',
        headerImageUrl: '',
        candidatePageLogoUrl: '',
        candidatePageHeaderImageUrl: '',
        useBrandingOnCandidatePage: true,
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('teamInviteSchema', () => {
  describe('email validation', () => {
    it('accepts valid email', () => {
      const result = teamInviteSchema.safeParse({
        email: 'test@example.com',
        role: 'recruiter',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty email', () => {
      const result = teamInviteSchema.safeParse({
        email: '',
        role: 'recruiter',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('El email es requerido')
    })

    it('rejects invalid email format', () => {
      const result = teamInviteSchema.safeParse({
        email: 'not-an-email',
        role: 'recruiter',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Email no valido')
    })
  })

  describe('role validation', () => {
    it('accepts org_admin role', () => {
      const result = teamInviteSchema.safeParse({
        email: 'test@example.com',
        role: 'org_admin',
      })
      expect(result.success).toBe(true)
    })

    it('accepts recruiter role', () => {
      const result = teamInviteSchema.safeParse({
        email: 'test@example.com',
        role: 'recruiter',
      })
      expect(result.success).toBe(true)
    })

    it('accepts org_recruiter role', () => {
      const result = teamInviteSchema.safeParse({
        email: 'test@example.com',
        role: 'org_recruiter',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid role', () => {
      const result = teamInviteSchema.safeParse({
        email: 'test@example.com',
        role: 'invalid_role',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Selecciona un rol valido')
    })
  })
})

describe('createRecruiterSchema', () => {
  const validData = {
    firstName: 'Juan',
    lastName: 'Garcia',
    email: 'juan@example.com',
    password: 'securepassword123',
  }

  describe('firstName validation', () => {
    it('accepts valid firstName', () => {
      const result = createRecruiterSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty firstName', () => {
      const result = createRecruiterSchema.safeParse({
        ...validData,
        firstName: '',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('El nombre es requerido')
    })

    it('rejects firstName over 50 characters', () => {
      const result = createRecruiterSchema.safeParse({
        ...validData,
        firstName: 'a'.repeat(51),
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('El nombre no puede exceder 50 caracteres')
    })
  })

  describe('lastName validation', () => {
    it('accepts valid lastName', () => {
      const result = createRecruiterSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty lastName', () => {
      const result = createRecruiterSchema.safeParse({
        ...validData,
        lastName: '',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('El apellido es requerido')
    })

    it('rejects lastName over 50 characters', () => {
      const result = createRecruiterSchema.safeParse({
        ...validData,
        lastName: 'a'.repeat(51),
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('El apellido no puede exceder 50 caracteres')
    })
  })

  describe('email validation', () => {
    it('rejects empty email', () => {
      const result = createRecruiterSchema.safeParse({
        ...validData,
        email: '',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const result = createRecruiterSchema.safeParse({
        ...validData,
        email: 'invalid',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Email no valido')
    })
  })

  describe('password validation', () => {
    it('accepts password with 8+ characters', () => {
      const result = createRecruiterSchema.safeParse({
        ...validData,
        password: '12345678',
      })
      expect(result.success).toBe(true)
    })

    it('rejects password under 8 characters', () => {
      const result = createRecruiterSchema.safeParse({
        ...validData,
        password: '1234567',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Minimo 8 caracteres')
    })
  })
})

describe('smtpSettingsSchema', () => {
  const validData = {
    host: 'smtp.example.com',
    port: 587,
    user: 'smtp_user',
    password: 'smtp_password',
    fromEmail: 'noreply@example.com',
    fromName: 'My App',
    secure: true,
  }

  describe('host validation', () => {
    it('accepts valid host', () => {
      const result = smtpSettingsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty host', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        host: '',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('El host es requerido')
    })
  })

  describe('port validation', () => {
    it('accepts valid port 587', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        port: 587,
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid port 465', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        port: 465,
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid port 25', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        port: 25,
      })
      expect(result.success).toBe(true)
    })

    it('rejects port 0', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        port: 0,
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('El puerto es requerido')
    })

    it('rejects port over 65535', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        port: 65536,
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Puerto no valido')
    })
  })

  describe('user validation', () => {
    it('rejects empty user', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        user: '',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('El usuario es requerido')
    })
  })

  describe('password validation', () => {
    it('rejects empty password', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        password: '',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('La contrasena es requerida')
    })
  })

  describe('fromEmail validation', () => {
    it('accepts valid fromEmail', () => {
      const result = smtpSettingsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty fromEmail', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        fromEmail: '',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('El email de envio es requerido')
    })

    it('rejects invalid fromEmail format', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        fromEmail: 'not-an-email',
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Email no valido')
    })
  })

  describe('fromName validation', () => {
    it('accepts fromName under 100 characters', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        fromName: 'My Application',
      })
      expect(result.success).toBe(true)
    })

    it('accepts empty fromName (optional)', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        fromName: undefined,
      })
      expect(result.success).toBe(true)
    })

    it('rejects fromName over 100 characters', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        fromName: 'a'.repeat(101),
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('El nombre no puede exceder 100 caracteres')
    })
  })

  describe('secure validation', () => {
    it('accepts secure true', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        secure: true,
      })
      expect(result.success).toBe(true)
    })

    it('accepts secure false', () => {
      const result = smtpSettingsSchema.safeParse({
        ...validData,
        secure: false,
      })
      expect(result.success).toBe(true)
    })

    it('defaults to true when not provided', () => {
      const dataWithoutSecure = { ...validData }
      delete (dataWithoutSecure as { secure?: boolean }).secure

      const result = smtpSettingsSchema.safeParse(dataWithoutSecure)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.secure).toBe(true)
      }
    })
  })
})
