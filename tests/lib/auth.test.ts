import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword, validateName, validatePhone, formatPhone, getFullName, getAuthErrorMessage } from '~/lib/auth'
import type { CurrentUser } from '~/lib/types'

describe('Auth Utilities', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(validateEmail('user@subdomain.domain.com')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('invalid@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const result = validatePassword('StrongPass123')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('rejects weak passwords', () => {
      const shortPassword = validatePassword('Short1')
      expect(shortPassword.isValid).toBe(false)
      expect(shortPassword.errors).toContain('Password must be at least 8 characters long')

      const noUppercase = validatePassword('lowercase123')
      expect(noUppercase.isValid).toBe(false)
      expect(noUppercase.errors).toContain('Password must contain at least one uppercase letter')

      const noLowercase = validatePassword('UPPERCASE123')
      expect(noLowercase.isValid).toBe(false)
      expect(noLowercase.errors).toContain('Password must contain at least one lowercase letter')

      const noNumber = validatePassword('NoNumbers')
      expect(noNumber.isValid).toBe(false)
      expect(noNumber.errors).toContain('Password must contain at least one number')
    })
  })

  describe('validateName', () => {
    it('validates correct names', () => {
      expect(validateName('John').isValid).toBe(true)
      expect(validateName('Mary-Jane').isValid).toBe(true)
      expect(validateName("O'Connor").isValid).toBe(true)
      expect(validateName('Jean Pierre').isValid).toBe(true)
    })

    it('rejects invalid names', () => {
      expect(validateName('').isValid).toBe(false)
      expect(validateName(' ').isValid).toBe(false)
      expect(validateName('A').isValid).toBe(false)
      expect(validateName('John123').isValid).toBe(false)
      expect(validateName('a'.repeat(51)).isValid).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('validates correct phone numbers', () => {
      expect(validatePhone('1234567890').isValid).toBe(true)
      expect(validatePhone('+1 (555) 123-4567').isValid).toBe(true)
      expect(validatePhone('555-123-4567').isValid).toBe(true)
    })

    it('allows empty phone numbers', () => {
      expect(validatePhone('').isValid).toBe(true)
      expect(validatePhone('   ').isValid).toBe(true)
    })

    it('rejects invalid phone numbers', () => {
      expect(validatePhone('123').isValid).toBe(false)
      expect(validatePhone('12345678901234567890').isValid).toBe(false)
    })
  })

  describe('formatPhone', () => {
    it('formats US phone numbers', () => {
      expect(formatPhone('1234567890')).toBe('(123) 456-7890')
      expect(formatPhone('555-123-4567')).toBe('(555) 123-4567')
    })

    it('formats international phone numbers', () => {
      expect(formatPhone('123456789012')).toBe('123 456 789 012')
    })

    it('handles empty input', () => {
      expect(formatPhone('')).toBe('')
      expect(formatPhone('   ')).toBe('')
    })
  })

  describe('getFullName', () => {
    it('returns full name when both first and last name exist', () => {
      const user: CurrentUser = {
        id: '1',
        identifier: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'test@example.com',
        channels: []
      }
      expect(getFullName(user)).toBe('John Doe')
    })

    it('returns first name only when last name is missing', () => {
      const user: CurrentUser = {
        id: '1',
        identifier: 'test@example.com',
        firstName: 'John',
        emailAddress: 'test@example.com',
        channels: []
      }
      expect(getFullName(user)).toBe('John')
    })

    it('returns last name only when first name is missing', () => {
      const user: CurrentUser = {
        id: '1',
        identifier: 'test@example.com',
        lastName: 'Doe',
        emailAddress: 'test@example.com',
        channels: []
      }
      expect(getFullName(user)).toBe('Doe')
    })

    it('returns email username when no names are provided', () => {
      const user: CurrentUser = {
        id: '1',
        identifier: 'test@example.com',
        emailAddress: 'johndoe@example.com',
        channels: []
      }
      expect(getFullName(user)).toBe('johndoe')
    })

    it('returns Guest for null user', () => {
      expect(getFullName(null)).toBe('Guest')
    })
  })

  describe('getAuthErrorMessage', () => {
    it('returns specific messages for known error codes', () => {
      expect(getAuthErrorMessage({ errorCode: 'INVALID_CREDENTIALS_ERROR', message: 'Invalid' }))
        .toBe('Invalid email or password')
      
      expect(getAuthErrorMessage({ errorCode: 'NOT_VERIFIED_ERROR', message: 'Not verified' }))
        .toBe('Please check your email to verify your account')
      
      expect(getAuthErrorMessage({ errorCode: 'EMAIL_ADDRESS_CONFLICT_ERROR', message: 'Conflict' }))
        .toBe('An account with this email address already exists')
    })

    it('returns generic message for unknown error codes', () => {
      expect(getAuthErrorMessage({ errorCode: 'UNKNOWN_ERROR', message: 'Something went wrong' }))
        .toBe('Something went wrong')
    })

    it('handles non-auth errors', () => {
      expect(getAuthErrorMessage(new Error('Network error')))
        .toBe('Network error')
      
      expect(getAuthErrorMessage('String error'))
        .toBe('An unexpected error occurred')
    })
  })
})