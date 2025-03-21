import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema } from '@/validations/auth';
import type { SignInFormData } from '@/types/auth';
import { authService } from '@/services/auth.service';
import { motion } from 'framer-motion';

export const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, trigger, watch } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: {
      rememberMe: false
    }
  });

  const totalSteps = 2;
  
  const goToNextStep = async () => {
    // For step 1, validate email and password fields
    if (currentStep === 1) {
      const isStepValid = await trigger(['email', 'password']);
      if (isStepValid) {
        setCurrentStep(2);
      }
    }
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(1);
  };

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', { email: data.email });
      const response = await authService.login(data);
      console.log('Login response:', response);
      
      // Validate response from server
      if (!response || !response.token || !response.user) {
        throw new Error('Invalid response from server');
      }
      
      // Validate user object has required fields
      if (!response.user.id || !response.user.email || !response.user.role) {
        throw new Error('Invalid user data received');
      }

      // Clear any existing auth data first to avoid conflicts
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');

      // Store auth data based on rememberMe preference
      // Always store in localStorage for consistent app-wide access
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // If rememberMe is false, we don't need to do anything special
      // since localStorage will be cleared when the browser is closed
      
      console.log('User role:', response.user.role);
      // Redirect based on user role
      switch (response.user.role) {
        case 'administrator':
          navigate('/dashboard/admin');
          break;
        case 'teacher':
          navigate('/dashboard/teacher');
          break;
        case 'student':
          navigate('/dashboard/student');
          break;
        case 'parent':
          navigate('/dashboard/parent');
          break;
        default:
          console.error('Unknown role:', response.user.role);
          setError(`Invalid role: ${response.user.role}`);
          // Clear auth data for invalid role
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: '20%' },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '-20%' }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 
                    ${currentStep === step 
                      ? 'border-primary bg-primary text-white' 
                      : currentStep > step 
                        ? 'border-primary bg-primary/20 text-primary' 
                        : 'border-gray-300 text-gray-500'}`}
                  >
                    {currentStep > step ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${currentStep === step ? 'text-primary font-medium' : 'text-gray-500'}`}>
                    {step === 1 ? 'Credentials' : 'Security'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between items-center">
              <div className="w-full h-1 bg-gray-200 rounded">
                <div 
                  className="h-1 bg-primary rounded transition-all duration-300" 
                  style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            
            {/* Step 1: Credentials */}
            {currentStep === 1 && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={stepVariants}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      {...register('password')}
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Security Check */}
            {currentStep === 2 && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={stepVariants}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="border border-gray-200 rounded-md p-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Verify your information</h3>
                  <p className="text-sm text-gray-500 mb-2">You're signing in as:</p>
                  <p className="text-sm font-medium text-gray-900">{watch('email')}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      {...register('rememberMe')}
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="/auth/forgot-password" className="font-medium text-primary hover:text-primary/80">
                      Forgot your password?
                    </a>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          {/* Only show sign up link on first step */}
          {currentStep === 1 && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="/auth/sign-up"
                  className="w-full flex justify-center py-2 px-4 border border-primary rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Sign up
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
