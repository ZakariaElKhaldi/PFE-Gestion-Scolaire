import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authService } from '@/services/auth.service'

const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type UpdatePasswordData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [validations, setValidations] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    passwordsMatch: false
  })
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<UpdatePasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange'
  })

  const watchedPassword = watch('newPassword', '')
  const watchedConfirmPassword = watch('confirmPassword', '')

  // Update password validation states as user types
  useEffect(() => {
    const validations = {
      minLength: watchedPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(watchedPassword),
      hasLowercase: /[a-z]/.test(watchedPassword),
      hasNumber: /[0-9]/.test(watchedPassword),
      hasSpecial: /[^A-Za-z0-9]/.test(watchedPassword),
      passwordsMatch: watchedPassword === watchedConfirmPassword && watchedPassword !== ''
    }
    
    setValidations(validations)
    
    // Calculate password strength (0-4)
    const strength = Object.values(validations)
      .filter(Boolean)
      .length - (validations.passwordsMatch ? 1 : 0)
    
    setPasswordStrength(Math.max(0, Math.min(4, strength)))
  }, [watchedPassword, watchedConfirmPassword])

  const onSubmit = async (data: UpdatePasswordData) => {
    if (!token) {
      setError('No reset token provided. Please use the link from your email or request a new reset link.')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Resetting password with token:', token.substring(0, 10) + '...');
      
      // Call the auth service to reset the password
      await authService.resetPassword(token, data.newPassword);
      
      setIsSuccess(true)
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate('/auth/sign-in')
      }, 3000)
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      // Provide more helpful error messages based on the error
      if (error.message?.includes('expired')) {
        setError('Your password reset link has expired. Please request a new one.');
      } else if (error.message?.includes('invalid')) {
        setError('This password reset link is invalid. Please request a new one.');
      } else {
        setError(error instanceof Error 
          ? error.message 
          : 'An error occurred while resetting your password. Please try again.');
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Invalid reset link</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This password reset link is invalid or has expired.
          </p>
          <div className="mt-4 text-center">
            <Link to="/auth/forgot-password" className="font-medium text-primary hover:text-primary-dark">
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Password reset successful</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your password has been reset successfully. You will be redirected to the sign in page shortly.
            </p>
            <div className="mt-6 text-center">
              <Link 
                to="/auth/sign-in" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Sign in now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create a new password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your password must be different from previous passwords.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New password
              </label>
              <div className="mt-1 relative">
                <input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter your new password"
                  {...register('newPassword')}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.newPassword ? 'border-red-300' : validations.minLength ? 'border-green-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                />
                {errors.newPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
                )}
              </div>
            </div>

            {/* Password strength meter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-xs font-medium text-gray-500">Password strength</div>
                <div className={`text-xs font-medium ${
                  passwordStrength === 0 ? 'text-gray-400' : 
                  passwordStrength === 1 ? 'text-red-500' : 
                  passwordStrength === 2 ? 'text-orange-500' : 
                  passwordStrength === 3 ? 'text-yellow-500' : 
                  'text-green-500'
                }`}>
                  {getStrengthText()}
                </div>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStrengthColor()} transition-all duration-300`} 
                  style={{ width: `${passwordStrength * 25}%` }}
                ></div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
                  {...register('confirmPassword')}
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.confirmPassword ? 'border-red-300' : 
                    validations.passwordsMatch && watchedConfirmPassword ? 'border-green-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
                {validations.passwordsMatch && watchedConfirmPassword && (
                  <p className="mt-2 text-sm text-green-600">Passwords match</p>
                )}
              </div>
            </div>

            <div className="mt-1">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Password requirements:</p>
                <ul className="space-y-1">
                  <li className={`flex items-center ${validations.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1.5 ${validations.minLength ? 'text-green-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                      {validations.minLength ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      )}
                    </svg>
                    At least 8 characters
                  </li>
                  <li className={`flex items-center ${validations.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1.5 ${validations.hasUppercase ? 'text-green-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                      {validations.hasUppercase ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      )}
                    </svg>
                    At least one uppercase letter
                  </li>
                  <li className={`flex items-center ${validations.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1.5 ${validations.hasLowercase ? 'text-green-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                      {validations.hasLowercase ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      )}
                    </svg>
                    At least one lowercase letter
                  </li>
                  <li className={`flex items-center ${validations.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1.5 ${validations.hasNumber ? 'text-green-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                      {validations.hasNumber ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      )}
                    </svg>
                    At least one number
                  </li>
                  <li className={`flex items-center ${validations.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1.5 ${validations.hasSpecial ? 'text-green-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                      {validations.hasSpecial ? (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      )}
                    </svg>
                    At least one special character
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !Object.values(validations).every(Boolean)}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200`}
              >
                {isLoading ? 'Resetting...' : 'Reset password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage;
