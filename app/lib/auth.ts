import { shopApiRequest } from './graphql'
import { ME, LOGOUT } from './queries'
import type { CurrentUser } from './types'

export interface AuthSession {
  user: CurrentUser | null
  isAuthenticated: boolean
}

export async function getCurrentUser(request?: Request): Promise<CurrentUser | null> {
  try {
    const { me } = await shopApiRequest<{ me: CurrentUser | null }>(
      ME,
      undefined,
      request
    )
    return me
  } catch (error) {
    console.log('Not authenticated or session expired')
    return null
  }
}

export async function logout(request?: Request): Promise<boolean> {
  try {
    const { logout } = await shopApiRequest<{ logout: { success: boolean } }>(
      LOGOUT,
      undefined,
      request
    )
    return logout.success
  } catch (error) {
    console.error('Logout failed:', error)
    return false
  }
}

export function getFullName(user: CurrentUser | null): string {
  if (!user) return 'Guest'

  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }

  if (user.firstName) return user.firstName
  if (user.lastName) return user.lastName

  // Fall back to email username
  return user.emailAddress.split('@')[0]
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateName(name: string): {
  isValid: boolean
  error?: string
} {
  if (!name.trim()) {
    return { isValid: false, error: 'Name cannot be empty' }
  }

  if (name.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' }
  }

  if (name.length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' }
  }

  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' }
  }

  return { isValid: true }
}

export function validatePhone(phone: string): {
  isValid: boolean
  error?: string
} {
  if (!phone.trim()) {
    return { isValid: true } // Phone is optional
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '')

  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must be at least 10 digits' }
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number must be less than 15 digits' }
  }

  return { isValid: true }
}

export function formatPhone(phone: string): string {
  if (!phone) return ''

  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')

  // Format as (XXX) XXX-XXXX for US numbers
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`
  }

  // For international numbers, just return with spaces every 3 digits
  return digitsOnly.replace(/(\d{3})(?=\d)/g, '$1 ')
}

export function isAuthError(error: unknown): error is { errorCode: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'errorCode' in error &&
    'message' in error
  )
}

export function getAuthErrorMessage(error: unknown): string {
  if (isAuthError(error)) {
    switch (error.errorCode) {
      case 'INVALID_CREDENTIALS_ERROR':
        return 'Invalid email or password'
      case 'NOT_VERIFIED_ERROR':
        return 'Please check your email to verify your account'
      case 'MISSING_PASSWORD_ERROR':
        return 'Password is required'
      case 'PASSWORD_VALIDATION_ERROR':
        return error.message || 'Password does not meet requirements'
      case 'EMAIL_ADDRESS_CONFLICT_ERROR':
        return 'An account with this email address already exists'
      case 'VERIFICATION_TOKEN_INVALID_ERROR':
        return 'Verification link is invalid'
      case 'VERIFICATION_TOKEN_EXPIRED_ERROR':
        return 'Verification link has expired'
      case 'PASSWORD_RESET_TOKEN_INVALID_ERROR':
        return 'Password reset link is invalid'
      case 'PASSWORD_RESET_TOKEN_EXPIRED_ERROR':
        return 'Password reset link has expired'
      case 'PASSWORD_ALREADY_SET_ERROR':
        return 'Password has already been set for this account'
      case 'NATIVE_AUTH_STRATEGY_ERROR':
        return 'Authentication error occurred'
      default:
        return error.message || 'An error occurred'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}

export function requireAuth(user: CurrentUser | null): CurrentUser {
  if (!user) {
    throw new Response('Unauthorized', { status: 401 })
  }
  return user
}