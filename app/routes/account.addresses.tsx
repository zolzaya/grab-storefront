import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { useLoaderData, useActionData, Form, useNavigation, Link } from "@remix-run/react"
import { useState } from "react"
import { shopApiRequest } from "~/lib/graphql"
import { 
  GET_CUSTOMER_ADDRESSES, 
  CREATE_CUSTOMER_ADDRESS, 
  UPDATE_CUSTOMER_ADDRESS, 
  DELETE_CUSTOMER_ADDRESS,
  GET_AVAILABLE_COUNTRIES
} from "~/lib/queries"
import { getCurrentUser, requireAuth } from "~/lib/auth"
import type { CurrentUser, CustomerAddress, Country, UpdateAddressInput } from "~/lib/types"

export const meta: MetaFunction = () => {
  return [
    { title: "Addresses - My Account" },
    { name: "description", content: "Manage your shipping and billing addresses" },
  ]
}

interface LoaderData {
  user: CurrentUser
  addresses: CustomerAddress[]
  countries: Country[]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser(request)
  requireAuth(user)

  try {
    const [addressResponse, countryResponse] = await Promise.all([
      shopApiRequest<{ activeCustomer: { addresses: CustomerAddress[] } }>(
        GET_CUSTOMER_ADDRESSES,
        {},
        request
      ),
      shopApiRequest<{ availableCountries: Country[] }>(
        GET_AVAILABLE_COUNTRIES,
        {},
        request
      )
    ])

    return {
      user,
      addresses: addressResponse.activeCustomer?.addresses || [],
      countries: countryResponse.availableCountries || []
    }
  } catch (error) {
    console.error('Failed to fetch addresses:', error)
    throw new Response("Failed to load addresses", { status: 500 })
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getCurrentUser(request)
  requireAuth(user)

  const formData = await request.formData()
  const action = formData.get("_action") as string

  if (action === "create" || action === "update") {
    const fullName = (formData.get("fullName") as string)?.trim()
    const company = (formData.get("company") as string)?.trim()
    const streetLine1 = (formData.get("streetLine1") as string)?.trim()
    const streetLine2 = (formData.get("streetLine2") as string)?.trim()
    const city = (formData.get("city") as string)?.trim()
    const province = (formData.get("province") as string)?.trim()
    const postalCode = (formData.get("postalCode") as string)?.trim()
    const countryCode = formData.get("countryCode") as string
    const phoneNumber = (formData.get("phoneNumber") as string)?.trim()
    const defaultShippingAddress = formData.get("defaultShippingAddress") === "on"
    const defaultBillingAddress = formData.get("defaultBillingAddress") === "on"

    // Validation
    if (!fullName || !streetLine1 || !city || !postalCode || !countryCode) {
      return {
        error: "Full name, street address, city, postal code, and country are required",
        fields: {
          fullName,
          company,
          streetLine1,
          streetLine2,
          city,
          province,
          postalCode,
          countryCode,
          phoneNumber,
          defaultShippingAddress,
          defaultBillingAddress
        },
        action
      }
    }

    const input = {
      fullName,
      company: company || undefined,
      streetLine1,
      streetLine2: streetLine2 || undefined,
      city,
      province: province || undefined,
      postalCode,
      countryCode,
      phoneNumber: phoneNumber || undefined,
      defaultShippingAddress,
      defaultBillingAddress
    }

    try {
      if (action === "create") {
        await shopApiRequest(CREATE_CUSTOMER_ADDRESS, { input }, request)
        return {
          success: true,
          message: "Address created successfully",
          action
        }
      } else {
        const addressId = formData.get("addressId") as string
        if (!addressId) {
          return {
            error: "Address ID is required for update",
            action
          }
        }

        const updateInput: UpdateAddressInput = {
          id: addressId,
          ...input
        }

        await shopApiRequest(UPDATE_CUSTOMER_ADDRESS, { input: updateInput }, request)
        return {
          success: true,
          message: "Address updated successfully",
          action
        }
      }
    } catch (error) {
      console.error('Address mutation error:', error)
      return {
        error: "Failed to save address. Please try again.",
        fields: {
          fullName,
          company,
          streetLine1,
          streetLine2,
          city,
          province,
          postalCode,
          countryCode,
          phoneNumber,
          defaultShippingAddress,
          defaultBillingAddress
        },
        action
      }
    }
  }

  if (action === "delete") {
    const addressId = formData.get("addressId") as string
    if (!addressId) {
      return { error: "Address ID is required", action }
    }

    try {
      const result = await shopApiRequest<{ deleteCustomerAddress: { success: boolean } }>(
        DELETE_CUSTOMER_ADDRESS, 
        { id: addressId }, 
        request
      )

      if (result.deleteCustomerAddress.success) {
        return {
          success: true,
          message: "Address deleted successfully",
          action
        }
      } else {
        return {
          error: "Failed to delete address",
          action
        }
      }
    } catch (error) {
      console.error('Delete address error:', error)
      return {
        error: "Failed to delete address. Please try again.",
        action
      }
    }
  }

  return { error: "Invalid action" }
}

export default function Addresses() {
  const { addresses, countries } = useLoaderData<LoaderData>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const isSubmitting = navigation.state === "submitting"

  const handleEdit = (address: CustomerAddress) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingAddress(null)
  }

  const handleDelete = (addressId: string) => {
    setDeleteConfirm(addressId)
  }

  // Close form on successful submission
  if (actionData?.success && showForm) {
    setShowForm(false)
    setEditingAddress(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">Address Book</h1>
              <p className="text-xl text-neutral-600">Manage your shipping and billing addresses</p>
            </div>
            <div className="mt-6 lg:mt-0">
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl hover:from-brand-500 hover:to-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Address
              </button>
            </div>
          </div>
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
          {/* Address Form */}
          {showForm && (
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-large overflow-hidden animate-fade-in-up">
              <div className="px-8 py-6 border-b border-neutral-200 bg-gradient-to-r from-brand-50 to-brand-100">
                <h2 className="text-2xl font-bold text-neutral-900">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <p className="text-neutral-600 mt-1">
                  {editingAddress ? 'Update your address information' : 'Add a new shipping or billing address'}
                </p>
              </div>

              <div className="p-8">
                <Form method="post" className="space-y-6">
                  <input 
                    type="hidden" 
                    name="_action" 
                    value={editingAddress ? "update" : "create"} 
                  />
                  {editingAddress && (
                    <input type="hidden" name="addressId" value={editingAddress.id} />
                  )}

                  {/* Full Name & Company */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-2">
                        Full name *
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        defaultValue={actionData?.fields?.fullName || editingAddress?.fullName || ''}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-neutral-700 mb-2">
                        Company (optional)
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        defaultValue={actionData?.fields?.company || editingAddress?.company || ''}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                        placeholder="Company name"
                      />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label htmlFor="streetLine1" className="block text-sm font-medium text-neutral-700 mb-2">
                      Street address *
                    </label>
                    <input
                      id="streetLine1"
                      name="streetLine1"
                      type="text"
                      required
                      defaultValue={actionData?.fields?.streetLine1 || editingAddress?.streetLine1 || ''}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label htmlFor="streetLine2" className="block text-sm font-medium text-neutral-700 mb-2">
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      id="streetLine2"
                      name="streetLine2"
                      type="text"
                      defaultValue={actionData?.fields?.streetLine2 || editingAddress?.streetLine2 || ''}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                      placeholder="Apartment, suite, unit, etc."
                    />
                  </div>

                  {/* City, Province, Postal Code */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-2">
                        City *
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        defaultValue={actionData?.fields?.city || editingAddress?.city || ''}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label htmlFor="province" className="block text-sm font-medium text-neutral-700 mb-2">
                        State/Province
                      </label>
                      <input
                        id="province"
                        name="province"
                        type="text"
                        defaultValue={actionData?.fields?.province || editingAddress?.province || ''}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                        placeholder="State or Province"
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-neutral-700 mb-2">
                        Postal code *
                      </label>
                      <input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        required
                        defaultValue={actionData?.fields?.postalCode || editingAddress?.postalCode || ''}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                        placeholder="Postal code"
                      />
                    </div>
                  </div>

                  {/* Country & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="countryCode" className="block text-sm font-medium text-neutral-700 mb-2">
                        Country *
                      </label>
                      <select
                        id="countryCode"
                        name="countryCode"
                        required
                        defaultValue={actionData?.fields?.countryCode || editingAddress?.country?.code || ''}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                      >
                        <option value="">Select a country</option>
                        {countries.map((country) => (
                          <option key={country.id} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-neutral-700 mb-2">
                        Phone number
                      </label>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        defaultValue={actionData?.fields?.phoneNumber || editingAddress?.phoneNumber || ''}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:border-neutral-400"
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  {/* Default Address Options */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <p className="font-medium text-neutral-900 mb-3">Default address settings</p>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="defaultShippingAddress"
                          defaultChecked={actionData?.fields?.defaultShippingAddress || editingAddress?.defaultShippingAddress || false}
                          className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500"
                        />
                        <span className="ml-3 text-sm text-neutral-700">
                          Use as default shipping address
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="defaultBillingAddress"
                          defaultChecked={actionData?.fields?.defaultBillingAddress || editingAddress?.defaultBillingAddress || false}
                          className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500"
                        />
                        <span className="ml-3 text-sm text-neutral-700">
                          Use as default billing address
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="px-6 py-3 text-neutral-700 border border-neutral-300 hover:border-neutral-400 rounded-xl transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl hover:from-brand-500 hover:to-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                        editingAddress ? 'Update Address' : 'Save Address'
                      )}
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          )}

          {/* Addresses List */}
          <div className={`${showForm ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-6 animate-fade-in-up`} style={{animationDelay: '0.1s'}}>
            {addresses.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-soft">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center mb-8">
                  <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">No Addresses Saved</h3>
                <p className="text-lg text-neutral-600 mb-8 max-w-md mx-auto">
                  You haven&apos;t added any addresses yet. Add your first address to make checkout faster.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold rounded-xl hover:from-brand-500 hover:to-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${showForm ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                {addresses.map((address, index) => (
                  <div 
                    key={address.id} 
                    className="bg-white rounded-2xl shadow-soft p-6 animate-fade-in-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-neutral-900">{address.fullName}</h3>
                          {(address.defaultShippingAddress || address.defaultBillingAddress) && (
                            <div className="flex space-x-1">
                              {address.defaultShippingAddress && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-100 text-brand-800">
                                  Default Shipping
                                </span>
                              )}
                              {address.defaultBillingAddress && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                                  Default Billing
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {address.company && (
                          <p className="text-neutral-700 text-sm mb-1">{address.company}</p>
                        )}
                        <div className="text-neutral-600 text-sm space-y-1">
                          <p>{address.streetLine1}</p>
                          {address.streetLine2 && <p>{address.streetLine2}</p>}
                          <p>{address.city}, {address.province} {address.postalCode}</p>
                          <p>{address.country.name}</p>
                          {address.phoneNumber && <p>{address.phoneNumber}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                      <button
                        onClick={() => handleEdit(address)}
                        className="text-brand-600 hover:text-brand-700 font-medium text-sm transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="text-error-600 hover:text-error-700 font-medium text-sm transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-large max-w-md w-full p-6 animate-scale-in">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900">Delete Address</h3>
              </div>
              <p className="text-neutral-600 mb-6">
                Are you sure you want to delete this address? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-neutral-700 border border-neutral-300 hover:border-neutral-400 rounded-xl transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <Form method="post" className="inline">
                  <input type="hidden" name="_action" value="delete" />
                  <input type="hidden" name="addressId" value={deleteConfirm} />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-error-600 text-white hover:bg-error-700 rounded-xl transition-colors duration-200 font-medium"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Delete
                  </button>
                </Form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}