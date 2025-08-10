import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useLoaderData, useActionData, Form, useNavigation, Link, useSearchParams } from "@remix-run/react"
import { useState, useEffect } from "react"
import { shopApiRequest } from "~/lib/graphql"
import { VERIFY_CUSTOMER_ACCOUNT, REQUEST_PASSWORD_RESET } from "~/lib/queries"
import { getCurrentUser, validatePassword, getAuthErrorMessage } from "~/lib/auth"
import type { VerifyAccountResult, RequestPasswordResetResult } from "~/lib/types"

export const meta: MetaFunction = () => {
  return [
    { title: "Verify Account - Your Store" },
    { name: "description", content: "Verify your account to complete registration" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request)
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  const email = url.searchParams.get('email')
  
  // If already logged in, redirect to account page
  if (user) {
    return redirect('/account')
  }
  
  return { token, email }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const action = formData.get("_action") as string
  
  if (action === "verify") {
    const token = formData.get("token") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Validation
    if (!token) {
      return {
        error: "Invalid verification token",
        action: "verify"
      }
    }

    if (password) {
      // Validate password if provided
      const passwordValidation = validatePassword(password)
      if (!passwordValidation.isValid) {
        return {
          error: passwordValidation.errors[0],
          passwordErrors: passwordValidation.errors,
          action: "verify"
        }
      }

      // Check password confirmation
      if (password !== confirmPassword) {
        return {
          error: "Passwords do not match",
          action: "verify"
        }
      }
    }

    try {
      const result = await shopApiRequest<VerifyAccountResult>(
        VERIFY_CUSTOMER_ACCOUNT,
        {
          token,
          password: password || undefined
        },
        request
      )

      const verifyResult = result.verifyCustomerAccount

      if ('errorCode' in verifyResult) {
        return {
          error: getAuthErrorMessage(verifyResult),
          action: "verify"
        }
      }

      // Success - redirect to account page
      return redirect('/account?welcome=true')
    } catch (error) {
      console.error('Account verification error:', error)
      return {
        error: "Account verification failed. Please try again or request a new verification email.",
        action: "verify"
      }
    }
  }

  if (action === "resend") {
    const email = formData.get("email") as string

    if (!email) {
      return {
        error: "Email address is required to resend verification",
        action: "resend"
      }
    }

    try {
      // Use password reset to resend verification (Vendure handles this)
      await shopApiRequest<RequestPasswordResetResult>(
        REQUEST_PASSWORD_RESET,
        { emailAddress: email }
      )

      return {
        success: true,
        message: "Verification email has been sent",
        action: "resend"
      }
    } catch (error) {
      return {
        success: true, // For security, always show success
        message: "If an account exists with that email, a verification email has been sent",
        action: "resend"
      }
    }
  }

  return { error: "Invalid action" }
}

export default function Verify() {
  const { token, email } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [needsPassword, setNeedsPassword] = useState(false)

  const isSubmitting = navigation.state === "submitting"
  const emailFromParams = email || searchParams.get('email') || ''

  // Auto-verify if token is provided
  useEffect(() => {
    if (token && !actionData) {
      // Auto-submit verification
      const form = document.getElementById('verify-form') as HTMLFormElement
      if (form) {
        form.submit()
      }
    }
  }, [token, actionData])

  if (token) {
    // Show verification form (with optional password setting)
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-brand-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <Link to="/" className="inline-block mb-8">
              <h1 className="text-3xl font-bold text-neutral-900 hover:text-brand-600 transition-colors duration-200">
                grab.mn
              </h1>
            </Link>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Verify your account</h2>
            <p className="text-neutral-600">
              Complete your account setup
            </p>
          </div>

          {/* Verification Form */}
          <div className="bg-white rounded-2xl shadow-large p-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <Form id="verify-form" method="post" className="space-y-6">
              <input type="hidden" name="_action" value="verify" />
              <input type="hidden" name="token" value={token} />
              
              {/* Error Message */}
              {actionData?.error && actionData.action === "verify" && (
                <div className="bg-error-50 border-2 border-error-200 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-error-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-error-800 font-medium text-sm">{actionData.error}</p>
                      {actionData.passwordErrors && (
                        <ul className="mt-2 text-xs text-error-700 space-y-1">
                          {actionData.passwordErrors.map((error: string, index: number) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Password Section (optional) */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="setPassword"
                    name="setPassword"
                    type="checkbox"
                    checked={needsPassword}
                    onChange={(e) => setNeedsPassword(e.target.checked)}
                    className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-neutral-300 rounded"
                  />
                  <label htmlFor="setPassword" className="ml-2 block text-sm text-neutral-700">
                    Set a password for your account (optional)
                  </label>
                </div>

                {needsPassword && (
                  <>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                          placeholder="Enter a password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <svg 
                            className="w-5 h-5 text-neutral-400 hover:text-neutral-600 transition-colors duration-200" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            {showPassword ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.76 7.76m0 0L5.64 5.64m0 0L12 12m-6.36-6.36L12 12m0 0l2.122 2.122M12 12L9.878 9.878" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                        Confirm password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <svg 
                            className="w-5 h-5 text-neutral-400 hover:text-neutral-600 transition-colors duration-200" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            {showConfirmPassword ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.76 7.76m0 0L5.64 5.64m0 0L12 12m-6.36-6.36L12 12m0 0l2.122 2.122M12 12L9.878 9.878" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-neutral-900 to-neutral-800 text-white py-3 px-4 rounded-xl font-semibold text-lg hover:from-neutral-800 hover:to-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying account...
                  </div>
                ) : (
                  'Verify account'
                )}
              </button>
            </Form>
          </div>
        </div>
      </div>
    )
  }

  // Show verification instructions/resend form
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-brand-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in-up">
          <Link to="/" className="inline-block mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 hover:text-brand-600 transition-colors duration-200">
              grab.mn
            </h1>
          </Link>
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Check your email</h2>
          <p className="text-neutral-600">
            We've sent a verification link to{' '}
            {emailFromParams && <span className="font-semibold text-neutral-900">{emailFromParams}</span>}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-large p-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          {actionData?.success && actionData.action === "resend" ? (
            <div className="bg-success-50 border-2 border-success-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-success-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-success-800 font-medium text-sm">{actionData.message}</p>
              </div>
            </div>
          ) : null}

          {actionData?.error && actionData.action === "resend" && (
            <div className="bg-error-50 border-2 border-error-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-error-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-error-800 font-medium text-sm">{actionData.error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4 text-sm text-neutral-600 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                1
              </div>
              <p>Check your email inbox (and spam/junk folder)</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                2
              </div>
              <p>Click the verification link in the email</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                3
              </div>
              <p>Complete your account setup</p>
            </div>
          </div>

          {emailFromParams && (
            <Form method="post">
              <input type="hidden" name="_action" value="resend" />
              <input type="hidden" name="email" value={emailFromParams} />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-brand-600 to-brand-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-brand-500 hover:to-brand-400 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Sending...' : 'Resend verification email'}
              </button>
            </Form>
          )}
        </div>

        {/* Back to Sign In */}
        <div className="text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <Link 
            to="/auth/login" 
            className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}