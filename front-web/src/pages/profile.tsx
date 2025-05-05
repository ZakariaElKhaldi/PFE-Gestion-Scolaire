import { useState } from 'react'
import { DashboardLayout } from '../components/dashboard/layout/dashboard-layout'
import { User } from '../types/auth'
import { toast, Toaster } from 'react-hot-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface ProfilePageProps {
  user: User
}

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const ProfilePage = ({ user }: ProfilePageProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      bio: user.bio || '',
    }
  })

  const handleSaveProfile = async (formData: ProfileFormData) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, you would update the user profile in the backend
      console.log('Updating profile with data:', formData);
      
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  return (
    <DashboardLayout user={user}>
      <Toaster />
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90"
                >
                  Edit Profile
                </button>
              ) : null}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(handleSaveProfile)} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="firstName"
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
                      Last Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="lastName"
                        {...register('lastName')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                      {errors.lastName && (
                        <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        id="email"
                        {...register('email')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                      Phone Number (Optional)
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        id="phoneNumber"
                        {...register('phoneNumber')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio (Optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="bio"
                        rows={4}
                        {...register('bio')}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Tell us about yourself"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-2xl">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">{user.firstName} {user.lastName}</h2>
                    <p className="text-sm text-gray-500 mt-1">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.phoneNumber || 'Not provided'}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Bio</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.bio || 'No bio provided'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage
