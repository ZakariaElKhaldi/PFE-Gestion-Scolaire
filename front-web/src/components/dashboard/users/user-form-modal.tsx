import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { User, UserRole } from '../../../types/auth'

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UserFormData) => void
  user?: User
  title: string
}

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  role: z.enum(['administrator', 'teacher', 'student', 'parent'] as const),
  phoneNumber: z.string().optional(),
  password: z.string().optional(),
})

export type UserFormData = z.infer<typeof userSchema>

const roles: { value: UserRole; label: string }[] = [
  { value: 'administrator', label: 'Administrator' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
]

export const UserFormModal = ({ isOpen, onClose, onSubmit, user, title }: UserFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user ? {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber || '',
      password: '',
    } : {
      email: '',
      firstName: '',
      lastName: '',
      role: 'student',
      phoneNumber: '',
      password: '',
    }
  })

  const handleFormSubmit = async (data: UserFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await onSubmit(data)
      reset()
      onClose()
    } catch (error) {
      console.error('User form error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                
                {error && (
                  <div className="mt-2 mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                
                <div className="mt-4">
                  <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <div className="mt-1">
                          <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            {...register('email')}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          />
                          {errors.email && (
                            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First name
                          </label>
                          <div className="mt-1">
                            <input
                              id="firstName"
                              type="text"
                              autoComplete="given-name"
                              {...register('firstName')}
                              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                            {errors.firstName && (
                              <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last name
                          </label>
                          <div className="mt-1">
                            <input
                              id="lastName"
                              type="text"
                              autoComplete="family-name"
                              {...register('lastName')}
                              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                            {errors.lastName && (
                              <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <div className="mt-1">
                          <select
                            id="role"
                            {...register('role')}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          >
                            {roles.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                          {errors.role && (
                            <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                          Phone number (optional)
                        </label>
                        <div className="mt-1">
                          <input
                            id="phoneNumber"
                            type="tel"
                            autoComplete="tel"
                            {...register('phoneNumber')}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="+1 (555) 123-4567"
                          />
                          {errors.phoneNumber && (
                            <p className="mt-2 text-sm text-red-600">{errors.phoneNumber.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          {user ? 'Password (leave blank to keep current)' : 'Password'}
                        </label>
                        <div className="mt-1">
                          <input
                            id="password"
                            type="password"
                            autoComplete={user ? 'new-password' : 'current-password'}
                            {...register('password')}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          />
                          {errors.password && (
                            <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleSubmit(handleFormSubmit)}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
