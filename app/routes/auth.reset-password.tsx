import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useLoaderData, useActionData, Form, useNavigation, Link, useSearchParams } from "@remix-run/react"
import { useState } from "react"
import { shopApiRequest } from "~/lib/graphql"
import { RESET_PASSWORD } from "~/lib/queries"
import { getCurrentUser, validatePassword, getAuthErrorMessage } from "~/lib/auth"
import type { ResetPasswordResult } from "~/lib/types"

export const meta: MetaFunction = () => {
  return [
    { title: "Reset Password - Your Store" },
    { name: "description", content: "Create a new password for your account" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request)
  const url = new URL(request.url)
  const token = url.searchParams.get('token')
  
  // If already logged in, redirect to account page
  if (user) {
    return redirect('/account')
  }

  // If no token, redirect to forgot password page
  if (!token) {
    return redirect('/auth/forgot-password')
  }
  
  return { token }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  // Validation
  if (!token) {
    return {
      error: "Invalid reset token",
    }
  }

  if (!password || !confirmPassword) {
    return {
      error: "Both password fields are required",
    }
  }

  // Validate password
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    return {
      error: passwordValidation.errors[0],
      passwordErrors: passwordValidation.errors
    }
  }

  // Check password confirmation
  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match",
    }
  }

  try {
    const result = await shopApiRequest<ResetPasswordResult>(
      RESET_PASSWORD,
      {
        token,
        password
      },
      request
    )

    const resetResult = result.resetPassword

    if ('errorCode' in resetResult) {
      return {
        error: getAuthErrorMessage(resetResult),
      }
    }

    // Success - redirect to account or login
    return redirect('/auth/login?message=password-reset-success')
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      error: "Password reset failed. Please try again or request a new reset link.",
    }
  }
}

export default function ResetPassword() {
  const { token } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isSubmitting = navigation.state === "submitting"

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
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Create new password</h2>
          <p className="text-neutral-600">
            Enter a new password for your account
          </p>
        </div>

        {/* Reset Password Form */}
        <div className="bg-white rounded-2xl shadow-large p-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <Form method="post" className="space-y-6">
            <input type="hidden" name="token" value={token} />
            
            {/* Error Message */}
            {actionData?.error && (
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

            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`w-full px-4 py-3 pr-12 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    actionData?.error ? 'border-error-300 bg-error-50' : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                  placeholder="Enter your new password"
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
              <div className="mt-2 text-xs text-neutral-500 space-y-1">
                <p>Password must contain:</p>
                <ul className="pl-2 space-y-1">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase and lowercase letter</li>
                  <li>• One number</li>
                </ul>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`w-full px-4 py-3 pr-12 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    actionData?.error ? 'border-error-300 bg-error-50' : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                  placeholder="Confirm your new password"
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
                  Updating password...
                </div>
              ) : (
                'Update password'
              )}
            </button>
          </Form>
        </div>

        {/* Security Note */}
        <div className="bg-white rounded-2xl shadow-soft p-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-neutral-900">Security tip</h3>
              <p className="text-sm text-neutral-600 mt-1">
                Choose a unique password that you don't use anywhere else to keep your account secure.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Sign In */}
        <div className="text-center animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <Link 
            to="/auth/login" 
            className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
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