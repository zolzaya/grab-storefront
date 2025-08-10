import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react"
import { shopApiRequest } from "~/lib/graphql"
import { REQUEST_PASSWORD_RESET } from "~/lib/queries"
import { getCurrentUser, validateEmail, getAuthErrorMessage } from "~/lib/auth"
import type { RequestPasswordResetResult } from "~/lib/types"

export const meta: MetaFunction = () => {
  return [
    { title: "Forgot Password - Your Store" },
    { name: "description", content: "Reset your password" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request)
  
  // If already logged in, redirect to account page
  if (user) {
    return redirect('/account')
  }
  
  return { user }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = (formData.get("email") as string)?.trim()

  // Validation
  if (!email) {
    return {
      error: "Email address is required",
      fields: { email }
    }
  }

  if (!validateEmail(email)) {
    return {
      error: "Please enter a valid email address",
      fields: { email }
    }
  }

  try {
    const result = await shopApiRequest<RequestPasswordResetResult>(
      REQUEST_PASSWORD_RESET,
      {
        emailAddress: email
      }
    )

    const resetResult = result.requestPasswordReset

    if ('errorCode' in resetResult) {
      return {
        error: getAuthErrorMessage(resetResult),
        fields: { email }
      }
    }

    // Success - always show success message (for security)
    return {
      success: true,
      email
    }
  } catch (error) {
    console.error('Password reset request error:', error)
    // For security reasons, always show success message
    return {
      success: true,
      email
    }
  }
}

export default function ForgotPassword() {
  const { user } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()

  const isSubmitting = navigation.state === "submitting"

  if (actionData?.success) {
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
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">Check your email</h2>
            <p className="text-neutral-600">
              We've sent password reset instructions to{' '}
              <span className="font-semibold text-neutral-900">{actionData.email}</span>
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-2xl shadow-large p-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="space-y-4 text-sm text-neutral-600">
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
                <p>Click the password reset link in the email</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 mt-0.5">
                  3
                </div>
                <p>Create a new password for your account</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-neutral-50 rounded-xl">
              <p className="text-sm text-neutral-600">
                <strong>Didn't receive the email?</strong> Check your spam folder or{' '}
                <Link to="/auth/forgot-password" className="text-brand-600 hover:text-brand-700 font-medium">
                  try again
                </Link>
              </p>
            </div>
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
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Forgot your password?</h2>
          <p className="text-neutral-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white rounded-2xl shadow-large p-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <Form method="post" className="space-y-6">
            {/* Error Message */}
            {actionData?.error && (
              <div className="bg-error-50 border-2 border-error-200 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-error-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-error-800 font-medium text-sm">{actionData.error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue={actionData?.fields?.email || ''}
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  actionData?.error ? 'border-error-300 bg-error-50' : 'border-neutral-300 hover:border-neutral-400'
                }`}
                placeholder="Enter your email address"
              />
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
                  Sending reset link...
                </div>
              ) : (
                'Send reset link'
              )}
            </button>
          </Form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
            <p className="text-sm text-neutral-600">
              <strong>Remember your password?</strong>{' '}
              <Link to="/auth/login" className="text-brand-600 hover:text-brand-700 font-medium">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Help */}
        <div className="text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <p className="text-sm text-neutral-500">
            Need help? Contact our{' '}
            <Link to="/contact" className="text-brand-600 hover:text-brand-700 font-medium">
              support team
            </Link>
          </p>
        </div>

        {/* Back to Store */}
        <div className="text-center animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to store
          </Link>
        </div>
      </div>
    </div>
  )
}