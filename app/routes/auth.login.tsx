import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react"
import { useState } from "react"
import { shopApiRequest } from "~/lib/graphql"
import { AUTHENTICATE } from "~/lib/queries"
import { getCurrentUser, validateEmail, getAuthErrorMessage } from "~/lib/auth"
import type { AuthenticateResult } from "~/lib/types"

export const meta: MetaFunction = () => {
  return [
    { title: "Login - Your Store" },
    { name: "description", content: "Sign in to your account" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request)

  // If already logged in, redirect to account page
  if (user) {
    const url = new URL(request.url)
    const redirectTo = url.searchParams.get('redirectTo')
    return redirect(redirectTo || '/account')
  }

  return { user }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const rememberMe = formData.get("rememberMe") === "on"
  const redirectTo = formData.get("redirectTo") as string

  // Validation
  if (!email || !password) {
    return {
      error: "Email and password are required",
      fields: { email, password }
    }
  }

  if (!validateEmail(email)) {
    return {
      error: "Please enter a valid email address",
      fields: { email, password }
    }
  }

  try {
    const result = await shopApiRequest<AuthenticateResult>(
      AUTHENTICATE,
      {
        input: {
          username: email,
          password,
          rememberMe
        }
      },
      request
    )

    const authResult = result.authenticate

    if ('errorCode' in authResult) {
      return {
        error: getAuthErrorMessage(authResult),
        fields: { email, password }
      }
    }

    // Success - redirect to intended destination or account page
    return redirect(redirectTo || '/account')
  } catch (error) {
    console.error('Login error:', error)
    return {
      error: "Login failed. Please try again.",
      fields: { email, password }
    }
  }
}

export default function Login() {
  const { user } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const [showPassword, setShowPassword] = useState(false)

  const isSubmitting = navigation.state === "submitting"

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-brand-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in-up">
          {/* <Link to="/" className="inline-block mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 hover:text-brand-600 transition-colors duration-200">
              grab.mn
            </h1>
          </Link> */}
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Welcome back</h2>
          <p className="text-neutral-600">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-large p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Form method="post" className="space-y-6">
            {/* <input
              type="hidden"
              name="redirectTo"
              value={new URLSearchParams(window.location.search).get('redirectTo') || ''}
            /> */}

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
                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 ${actionData?.error ? 'border-error-300 bg-error-50' : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  defaultValue={actionData?.fields?.password || ''}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 ${actionData?.error ? 'border-error-300 bg-error-50' : 'border-neutral-300 hover:border-neutral-400'
                    }`}
                  placeholder="Enter your password"
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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-neutral-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-neutral-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors duration-200"
              >
                Forgot your password?
              </Link>
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
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Social Login Placeholder */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-3 px-4 border border-neutral-300 rounded-xl shadow-soft bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center py-3 px-4 border border-neutral-300 rounded-xl shadow-soft bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </Form>
        </div>

        {/* Sign Up Link */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-neutral-600">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors duration-200"
            >
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Back to Store */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
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