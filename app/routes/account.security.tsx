import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react"
import { useState } from "react"
import { shopApiRequest } from "~/lib/graphql"
import { UPDATE_CUSTOMER_PASSWORD, UPDATE_CUSTOMER_EMAIL_ADDRESS } from "~/lib/queries"
import { getCurrentUser, requireAuth, validateEmail, validatePassword, getAuthErrorMessage } from "~/lib/auth"
import type { CurrentUser, UpdateCustomerPasswordResult, UpdateCustomerEmailResult } from "~/lib/types"

export const meta: MetaFunction = () => {
  return [
    { title: "Security - My Account" },
    { name: "description", content: "Update your password and security settings" },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request)
  requireAuth(user)

  return { user }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getCurrentUser(request)
  requireAuth(user)

  const formData = await request.formData()
  const action = formData.get("_action") as string

  if (action === "change-password") {
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        error: "All password fields are required",
        action: "change-password"
      }
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      return {
        error: passwordValidation.errors[0],
        passwordErrors: passwordValidation.errors,
        action: "change-password"
      }
    }

    // Check password confirmation
    if (newPassword !== confirmPassword) {
      return {
        error: "New passwords do not match",
        action: "change-password"
      }
    }

    try {
      const result = await shopApiRequest<UpdateCustomerPasswordResult>(
        UPDATE_CUSTOMER_PASSWORD,
        {
          currentPassword,
          newPassword
        },
        request
      )

      const updateResult = result.updateCustomerPassword

      if ('errorCode' in updateResult) {
        return {
          error: getAuthErrorMessage(updateResult),
          action: "change-password"
        }
      }

      return {
        success: true,
        message: "Password updated successfully",
        action: "change-password"
      }
    } catch (error) {
      console.error('Password update error:', error)
      return {
        error: "Failed to update password. Please try again.",
        action: "change-password"
      }
    }
  }

  if (action === "change-email") {
    const password = formData.get("password") as string
    const newEmailAddress = (formData.get("newEmailAddress") as string)?.trim()

    // Validation
    if (!password || !newEmailAddress) {
      return {
        error: "Password and new email address are required",
        fields: { newEmailAddress },
        action: "change-email"
      }
    }

    if (!validateEmail(newEmailAddress)) {
      return {
        error: "Please enter a valid email address",
        fields: { newEmailAddress },
        action: "change-email"
      }
    }

    if (newEmailAddress === user.emailAddress) {
      return {
        error: "New email address must be different from current email",
        fields: { newEmailAddress },
        action: "change-email"
      }
    }

    try {
      const result = await shopApiRequest<UpdateCustomerEmailResult>(
        UPDATE_CUSTOMER_EMAIL_ADDRESS,
        {
          password,
          newEmailAddress
        },
        request
      )

      const updateResult = result.updateCustomerEmailAddress

      if ('errorCode' in updateResult) {
        return {
          error: getAuthErrorMessage(updateResult),
          fields: { newEmailAddress },
          action: "change-email"
        }
      }

      return {
        success: true,
        message: "Email address updated successfully. Please log in again with your new email.",
        action: "change-email"
      }
    } catch (error) {
      console.error('Email update error:', error)
      return {
        error: "Failed to update email address. Please try again.",
        fields: { newEmailAddress },
        action: "change-email"
      }
    }
  }

  return { error: "Invalid action" }
}

export default function Security() {
  const { user } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showEmailPassword, setShowEmailPassword] = useState(false)

  const isSubmitting = navigation.state === "submitting"

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center space-x-4 mb-6">
            <Link 
              to="/account" 
              className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Account
            </Link>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">Security Settings</h1>
          <p className="text-xl text-neutral-600">Manage your password and account security</p>
        </div>

        {/* Success/Error Messages */}
        {actionData?.success && (
          <div className="mb-8 bg-success-50 border-2 border-success-200 rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-success-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-success-800 font-medium">{actionData.message}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Security Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow-large overflow-hidden animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="px-8 py-6 border-b border-neutral-200 bg-gradient-to-r from-brand-50 to-brand-100">
                <h2 className="text-2xl font-bold text-neutral-900">Change Password</h2>
                <p className="text-neutral-600 mt-1">Update your account password</p>
              </div>

              <div className="p-8">
                {actionData?.error && actionData.action === "change-password" && (
                  <div className="mb-6 bg-error-50 border-2 border-error-200 rounded-xl p-4 animate-fade-in">
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

                <Form method="post" className="space-y-6">
                  <input type="hidden" name="_action" value="change-password" />

                  {/* Current Password */}
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                      Current password
                    </label>
                    <div className="relative">
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        <svg 
                          className="w-5 h-5 text-neutral-400 hover:text-neutral-600 transition-colors duration-200" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          {showCurrentPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.76 7.76m0 0L5.64 5.64m0 0L12 12m-6.36-6.36L12 12m0 0l2.122 2.122M12 12L9.878 9.878" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        <svg 
                          className="w-5 h-5 text-neutral-400 hover:text-neutral-600 transition-colors duration-200" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          {showNewPassword ? (
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

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
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
                  <div className="flex items-center justify-end pt-6 border-t border-neutral-200">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white font-semibold rounded-xl hover:from-neutral-800 hover:to-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting && navigation.formData?.get("_action") === "change-password" ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </div>
                      ) : (
                        'Update password'
                      )}
                    </button>
                  </div>
                </Form>
              </div>
            </div>

            {/* Change Email */}
            <div className="bg-white rounded-2xl shadow-large overflow-hidden animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="px-8 py-6 border-b border-neutral-200 bg-gradient-to-r from-warning-50 to-warning-100">
                <h2 className="text-2xl font-bold text-neutral-900">Change Email Address</h2>
                <p className="text-neutral-600 mt-1">Update your account email address</p>
              </div>

              <div className="p-8">
                {actionData?.error && actionData.action === "change-email" && (
                  <div className="mb-6 bg-error-50 border-2 border-error-200 rounded-xl p-4 animate-fade-in">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-error-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-error-800 font-medium text-sm">{actionData.error}</p>
                    </div>
                  </div>
                )}

                <Form method="post" className="space-y-6">
                  <input type="hidden" name="_action" value="change-email" />

                  {/* Current Email (Read-only) */}
                  <div>
                    <label htmlFor="currentEmail" className="block text-sm font-medium text-neutral-700 mb-2">
                      Current email address
                    </label>
                    <input
                      id="currentEmail"
                      type="email"
                      value={user.emailAddress}
                      disabled
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-neutral-100 text-neutral-600 cursor-not-allowed"
                    />
                  </div>

                  {/* New Email */}
                  <div>
                    <label htmlFor="newEmailAddress" className="block text-sm font-medium text-neutral-700 mb-2">
                      New email address
                    </label>
                    <input
                      id="newEmailAddress"
                      name="newEmailAddress"
                      type="email"
                      required
                      defaultValue={actionData?.fields?.newEmailAddress || ''}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                      placeholder="Enter your new email address"
                    />
                  </div>

                  {/* Password Confirmation */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                      Confirm with password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showEmailPassword ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowEmailPassword(!showEmailPassword)}
                      >
                        <svg 
                          className="w-5 h-5 text-neutral-400 hover:text-neutral-600 transition-colors duration-200" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          {showEmailPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.76 7.76m0 0L5.64 5.64m0 0L12 12m-6.36-6.36L12 12m0 0l2.122 2.122M12 12L9.878 9.878" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          )}
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Enter your password to confirm this change
                    </p>
                  </div>

                  {/* Warning */}
                  <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-warning-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-warning-800 font-medium text-sm">Important:</p>
                        <p className="text-warning-700 text-sm mt-1">
                          Changing your email address will require you to verify the new email and log in again.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end pt-6 border-t border-neutral-200">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-warning-600 to-warning-500 text-white font-semibold rounded-xl hover:from-warning-500 hover:to-warning-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning-500 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting && navigation.formData?.get("_action") === "change-email" ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </div>
                      ) : (
                        'Update email address'
                      )}
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            {/* Account Security */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Account Security</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Account status</span>
                  <span className="text-success-600 font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Email verified</span>
                  <span className="text-success-600 font-medium">✓ Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Password strength</span>
                  <span className="text-success-600 font-medium">Strong</span>
                </div>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Security Tips</h3>
              <div className="space-y-3 text-sm text-neutral-600">
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-brand-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p>Use a unique password you don't use anywhere else</p>
                </div>
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-brand-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p>Enable two-factor authentication for extra security</p>
                </div>
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-brand-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p>Keep your password private and secure</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/account/profile" 
                  className="flex items-center text-neutral-600 hover:text-brand-600 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Edit profile →
                </Link>
                <Link 
                  to="/account/orders" 
                  className="flex items-center text-neutral-600 hover:text-brand-600 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1z" />
                  </svg>
                  Order history →
                </Link>
                <Form method="post" action="/auth/logout" className="block">
                  <button 
                    type="submit"
                    className="flex items-center w-full text-left text-error-600 hover:text-error-700 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out →
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}