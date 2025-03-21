import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input')
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: ResetPasswordData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Show confirmation step
      setStep('confirm')
      setIsLoading(false)
    } catch (error) {
      console.error('Reset password error:', error)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const onConfirm = async () => {
    setIsLoading(true)
    
    try {
      // TODO: Replace with actual API call when backend is ready
      console.log('Reset password request:', { email: watch('email') })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock successful email sending for development
      setIsEmailSent(true)
      setStep('success')
    } catch (error) {
      console.error('Reset password error:', error)
      setError('An error occurred while sending the reset instructions. Please try again.')
      setStep('input')
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  }

  const contentVariants = {
    hidden: { x: '20%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { x: '-20%', opacity: 0, transition: { duration: 0.3 } }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {step === 'success' ? (
            <>
              <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Check your email</h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                We've sent password reset instructions to <span className="font-medium">{watch('email')}</span>.
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {step === 'input' 
                  ? "Enter your email address and we'll send you instructions to reset your password." 
                  : "Please confirm that you want to receive password reset instructions."}
              </p>
            </>
          )}
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {step === 'input' && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="your.email@example.com"
                      {...register('email')}
                      className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading || Boolean(errors.email)}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? 'Processing...' : 'Continue'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
              className="space-y-6"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-blue-700">
                      We will send password reset instructions to the following email:
                    </p>
                    <p className="text-sm font-medium text-blue-700 mt-1">
                      {watch('email')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-md p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h3>
                <ul className="list-disc pl-5 space-y-2 text-xs text-gray-500">
                  <li>You'll receive an email with a secure link to reset your password</li>
                  <li>The link will expire after 15 minutes for security</li>
                  <li>You'll be able to create a new password after clicking the link</li>
                </ul>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Sending...' : 'Send reset instructions'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Change email
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
              className="space-y-6"
            >
              <div className="rounded-md p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Next steps:</h3>
                <ul className="list-disc pl-5 space-y-2 text-xs text-gray-500">
                  <li>Check your email inbox (and spam folder) for a message from us</li>
                  <li>Click the reset link in the email</li>
                  <li>Follow the instructions to create a new password</li>
                </ul>
              </div>

              <div className="flex flex-col space-y-3">
                <Link
                  to="/auth/sign-in"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Return to sign in
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setStep('input');
                    setIsEmailSent(false);
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Try a different email
                </button>
              </div>
            </motion.div>
          )}

          {step === 'input' && (
            <div className="mt-6">
              <div className="relative">
                <div className="relative flex justify-center text-sm">
                  <Link
                    to="/auth/sign-in"
                    className="font-medium text-primary hover:text-primary-dark"
                  >
                    Back to sign in
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage;
