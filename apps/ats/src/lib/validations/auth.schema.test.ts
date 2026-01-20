import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  registerSchema2,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema'

describe('Auth Schemas', () => {
  describe('loginSchema', () => {
    it('validates correct login data with email', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates correct login data with username', () => {
      const validData = {
        email: 'myusername',
        password: 'password123',
      }
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    describe('email/username validation', () => {
      it('fails when email/username is empty', () => {
        const result = loginSchema.safeParse({ email: '', password: 'password123' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El usuario o correo es requerido')
        }
      })

      it('accepts username without @ symbol', () => {
        const result = loginSchema.safeParse({ email: 'myusername', password: 'password123' })
        expect(result.success).toBe(true)
      })

      it('accepts email with @ symbol', () => {
        const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' })
        expect(result.success).toBe(true)
      })
    })

    describe('password validation', () => {
      it('fails when password is empty', () => {
        const result = loginSchema.safeParse({ email: 'test@example.com', password: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('La contrasena es requerida')
        }
      })

      it('fails when password is too short', () => {
        const result = loginSchema.safeParse({ email: 'test@example.com', password: '12345' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('La contrasena debe tener al menos 6 caracteres')
        }
      })

      it('passes with exactly 6 characters', () => {
        const result = loginSchema.safeParse({ email: 'test@example.com', password: '123456' })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('registerSchema', () => {
    const validData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
    }

    it('validates correct registration data', () => {
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    describe('firstName validation', () => {
      it('fails when firstName is empty', () => {
        const result = registerSchema.safeParse({ ...validData, firstName: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El nombre es requerido')
        }
      })

      it('fails when firstName exceeds 50 characters', () => {
        const result = registerSchema.safeParse({ ...validData, firstName: 'a'.repeat(51) })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El nombre no puede exceder 50 caracteres')
        }
      })
    })

    describe('lastName validation', () => {
      it('fails when lastName is empty', () => {
        const result = registerSchema.safeParse({ ...validData, lastName: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El apellido es requerido')
        }
      })

      it('fails when lastName exceeds 50 characters', () => {
        const result = registerSchema.safeParse({ ...validData, lastName: 'a'.repeat(51) })
        expect(result.success).toBe(false)
      })
    })

    describe('password validation', () => {
      it('fails when password is less than 8 characters', () => {
        const result = registerSchema.safeParse({ ...validData, password: 'Pass1', confirmPassword: 'Pass1' })
        expect(result.success).toBe(false)
      })

      it('fails when password has no uppercase', () => {
        const result = registerSchema.safeParse({
          ...validData,
          password: 'password1',
          confirmPassword: 'password1',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          const messages = result.error.issues.map((i) => i.message)
          expect(messages).toContain('Debe contener al menos una mayuscula')
        }
      })

      it('fails when password has no lowercase', () => {
        const result = registerSchema.safeParse({
          ...validData,
          password: 'PASSWORD1',
          confirmPassword: 'PASSWORD1',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          const messages = result.error.issues.map((i) => i.message)
          expect(messages).toContain('Debe contener al menos una minuscula')
        }
      })

      it('fails when password has no number', () => {
        const result = registerSchema.safeParse({
          ...validData,
          password: 'Password',
          confirmPassword: 'Password',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          const messages = result.error.issues.map((i) => i.message)
          expect(messages).toContain('Debe contener al menos un numero')
        }
      })

      it('passes with valid strong password', () => {
        const result = registerSchema.safeParse({
          ...validData,
          password: 'StrongPass123',
          confirmPassword: 'StrongPass123',
        })
        expect(result.success).toBe(true)
      })
    })

    describe('confirmPassword validation', () => {
      it('fails when passwords do not match', () => {
        const result = registerSchema.safeParse({
          ...validData,
          password: 'Password1',
          confirmPassword: 'Password2',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          const messages = result.error.issues.map((i) => i.message)
          expect(messages).toContain('Las contrasenas no coinciden')
        }
      })

      it('fails when confirmPassword is empty', () => {
        const result = registerSchema.safeParse({
          ...validData,
          confirmPassword: '',
        })
        expect(result.success).toBe(false)
      })
    })
  })

  describe('forgotPasswordSchema', () => {
    it('validates correct email', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'test@example.com' })
      expect(result.success).toBe(true)
    })

    it('fails when email is empty', () => {
      const result = forgotPasswordSchema.safeParse({ email: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El email es requerido')
      }
    })

    it('fails when email is invalid', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'invalid' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email no valido')
      }
    })
  })

  describe('resetPasswordSchema', () => {
    it('validates correct reset password data', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      })
      expect(result.success).toBe(true)
    })

    it('fails when password is too short', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'short',
        confirmPassword: 'short',
      })
      expect(result.success).toBe(false)
    })

    it('fails when passwords do not match', () => {
      const result = resetPasswordSchema.safeParse({
        password: 'password123',
        confirmPassword: 'different123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message)
        expect(messages).toContain('Las contrasenas no coinciden')
      }
    })

    it('fails when password is empty', () => {
      const result = resetPasswordSchema.safeParse({
        password: '',
        confirmPassword: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema2 (registro con organizacion)', () => {
    const validData = {
      type: 'recruiter' as const,
      organizationName: 'Mi Empresa',
      firstName: 'Juan',
      lastName: 'Garcia',
      username: 'juangarcia',
      email: 'juan@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    }

    it('validates correct registration data with recruiter type', () => {
      const result = registerSchema2.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates correct registration data with admin type', () => {
      const result = registerSchema2.safeParse({ ...validData, type: 'org_admin' })
      expect(result.success).toBe(true)
    })

    describe('organizationName validation', () => {
      it('fails when organizationName is empty', () => {
        const result = registerSchema2.safeParse({ ...validData, organizationName: '' })
        expect(result.success).toBe(false)
      })

      it('fails when organizationName is too short', () => {
        const result = registerSchema2.safeParse({ ...validData, organizationName: 'A' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El nombre de la organizacion debe tener al menos 2 caracteres')
        }
      })

      it('fails when organizationName exceeds 100 characters', () => {
        const result = registerSchema2.safeParse({ ...validData, organizationName: 'a'.repeat(101) })
        expect(result.success).toBe(false)
      })
    })

    describe('username validation', () => {
      it('fails when username is too short', () => {
        const result = registerSchema2.safeParse({ ...validData, username: 'ab' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('El nombre de usuario debe tener al menos 3 caracteres')
        }
      })

      it('fails when username has invalid characters', () => {
        const result = registerSchema2.safeParse({ ...validData, username: 'user@name' })
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Solo letras, numeros y guiones bajos')
        }
      })

      it('passes with underscores', () => {
        const result = registerSchema2.safeParse({ ...validData, username: 'user_name_123' })
        expect(result.success).toBe(true)
      })
    })

    describe('type validation', () => {
      it('fails when type is invalid', () => {
        const result = registerSchema2.safeParse({ ...validData, type: 'invalid' })
        expect(result.success).toBe(false)
      })
    })

    describe('password confirmation', () => {
      it('fails when passwords do not match', () => {
        const result = registerSchema2.safeParse({
          ...validData,
          password: 'password123',
          confirmPassword: 'different123',
        })
        expect(result.success).toBe(false)
        if (!result.success) {
          const messages = result.error.issues.map((i) => i.message)
          expect(messages).toContain('Las contrasenas no coinciden')
        }
      })
    })
  })
})
