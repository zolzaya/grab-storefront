import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react"
import { useState } from "react"
import { shopApiRequest } from "~/lib/graphql"
import { ME, UPDATE_CUSTOMER } from "~/lib/queries"
import { getCurrentUser, requireAuth, validateName, validatePhone, formatPhone, getAuthErrorMessage } from "~/lib/auth"
import type { CurrentUser, UpdateCustomerResult } from "~/lib/types"

export const meta: MetaFunction = () => {
  return [
    { title: "Profile - My Account" },
    { name: "description", content: "Update your profile information" },
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
  const firstName = (formData.get("firstName") as string)?.trim()
  const lastName = (formData.get("lastName") as string)?.trim()
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim()

  const fields = { firstName, lastName, phoneNumber }

  // Validation
  if (!firstName || !lastName) {
    return {
      error: "First name and last name are required",
      fields
    }
  }

  // Validate first name
  const firstNameValidation = validateName(firstName)
  if (!firstNameValidation.isValid) {
    return {
      error: `First name: ${firstNameValidation.error}`,
      fields
    }
  }

  // Validate last name
  const lastNameValidation = validateName(lastName)
  if (!lastNameValidation.isValid) {
    return {
      error: `Last name: ${lastNameValidation.error}`,
      fields
    }
  }

  // Validate phone (if provided)
  if (phoneNumber) {
    const phoneValidation = validatePhone(phoneNumber)
    if (!phoneValidation.isValid) {
      return {
        error: phoneValidation.error,
        fields
      }
    }
  }

  try {
    const result = await shopApiRequest<UpdateCustomerResult>(
      UPDATE_CUSTOMER,
      {
        input: {
          firstName,
          lastName,
          phoneNumber: phoneNumber || undefined
        }
      },
      request
    )

    const updateResult = result.updateCustomer

    if ('errorCode' in updateResult) {
      return {
        error: getAuthErrorMessage(updateResult),
        fields
      }
    }

    return {
      success: true,
      message: "Profile updated successfully"
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return {
      error: "Failed to update profile. Please try again.",
      fields
    }
  }
}

export default function Profile() {
  const { user } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()

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
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">Profile Settings</h1>
          <p className="text-xl text-neutral-600">Manage your personal information</p>
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

        {actionData?.error && (
          <div className="mb-8 bg-error-50 border-2 border-error-200 rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-error-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-error-800 font-medium">{actionData.error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-large overflow-hidden animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <div className="px-8 py-6 border-b border-neutral-200 bg-gradient-to-r from-brand-50 to-brand-100">
                <h2 className="text-2xl font-bold text-neutral-900">Personal Information</h2>
                <p className="text-neutral-600 mt-1">Update your personal details</p>
              </div>

              <div className="p-8">
                <Form method="post" className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-2">
                        First name *
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        defaultValue={actionData?.fields?.firstName || user.firstName || ''}
                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                          actionData?.error ? 'border-error-300 bg-error-50' : 'border-neutral-300 hover:border-neutral-400'
                        }`}
                        placeholder="Enter your first name"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-2">
                        Last name *
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        defaultValue={actionData?.fields?.lastName || user.lastName || ''}
                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                          actionData?.error ? 'border-error-300 bg-error-50' : 'border-neutral-300 hover:border-neutral-400'
                        }`}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  {/* Email Field (Read-only) */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={user.emailAddress}
                        disabled
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-neutral-100 text-neutral-600 cursor-not-allowed"
                      />
                      <Link 
                        to="/account/security" 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-600 hover:text-brand-700 text-sm font-medium"
                      >
                        Change →
                      </Link>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      To change your email address, visit the Security section
                    </p>
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-neutral-700 mb-2">
                      Phone number (optional)
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      defaultValue={actionData?.fields?.phoneNumber || user.phoneNumber || ''}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                      placeholder="+1 (555) 123-4567"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Used for order updates and shipping notifications
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-neutral-200">
                    <Link 
                      to="/account"
                      className="px-6 py-3 text-neutral-700 font-medium hover:text-neutral-900 transition-colors duration-200"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white font-semibold rounded-xl hover:from-neutral-800 hover:to-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </div>
                      ) : (
                        'Save changes'
                      )}
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            {/* Profile Picture */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Profile Picture</h3>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-large mb-4">
                  {user.firstName?.charAt(0) || user.emailAddress.charAt(0).toUpperCase()}
                </div>
                <button className="text-brand-600 hover:text-brand-700 font-medium text-sm">
                  Upload photo
                </button>
                <p className="text-xs text-neutral-500 mt-2 text-center">
                  JPG, GIF or PNG. Max size of 2MB
                </p>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Account Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Member since</span>
                  <span className="text-neutral-900 font-medium">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Account status</span>
                  <span className="text-success-600 font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Email verified</span>
                  <span className="text-success-600 font-medium">✓ Verified</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/account/security" 
                  className="flex items-center text-neutral-600 hover:text-brand-600 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  Security settings →
                </Link>
                <Link 
                  to="/account/addresses" 
                  className="flex items-center text-neutral-600 hover:text-brand-600 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Manage addresses →
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}