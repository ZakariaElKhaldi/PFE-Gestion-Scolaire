import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema } from '@/validations/auth';
import type { SignInFormData } from '@/types/auth';
import { authService } from '@/services/auth.service';
import { motion } from 'framer-motion';
import { getDashboardUrl } from '@/lib/auth-utils';

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
    try {
      console.log('💡 Sign-in attempt with email:', data.email);
      setIsLoading(true);
      setError(null);
      
      // Test API connection first
      try {
        console.log('🔍 Testing API connectivity before login...');
        const testUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const healthCheck = await fetch(`${testUrl}/health`, { 
          method: 'GET',
          cache: 'no-cache'
        });
        
        if (healthCheck.ok) {
          console.log('✅ API server is reachable - continuing with login');
        } else {
          console.error('❌ API health check failed with status:', healthCheck.status);
          throw new Error(`API server health check failed with status: ${healthCheck.status}`);
        }
      } catch (err) {
        console.error('❌ API connectivity test failed:', err);
        setError('Cannot connect to the server. Please check if the backend is running.');
        setIsLoading(false);
        return;
      }
      
      console.log('📡 Sending login request to auth service');
      const response = await authService.login(data);
      console.log('✅ Login successful, response:', response);
      
      // Redirect based on role using the dashboard URL helper
      const dashboardUrl = getDashboardUrl(response.user.role);
      console.log(`Redirecting user to ${dashboardUrl}`);
      navigate(dashboardUrl);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response object'
      });
      
      if (error.message?.includes('Network Error')) {
        setError('Network error: Unable to connect to the server. Please check your internet connection and verify the backend server is running.');
      } else if (error.response?.status === 401) {
        setError('Invalid email or password. If you recently registered, please check your email to verify your account first.');
      } else if (error.response?.status === 403) {
        setError('Your account is not verified. Please check your email for the verification link.');
      } else {
        setError(error.response?.data?.message || error.message || 'Login failed. Please try again.');
      }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your School Management account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-lg rounded-xl sm:px-10 border border-gray-100">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
              <span>{currentStep === 1 ? 'Enter Credentials' : 'Confirm Details'}</span>
              <span>{currentStep}/{totalSteps}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="inline-flex text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <form 
            className="space-y-6" 
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep === 2) {
                const formData = watch();
                onSubmit(formData);
              }
              return false;
            }}
          >
            {/* Step 1: Credentials */}
            {currentStep === 1 && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={stepVariants}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={`appearance-none block w-full pl-10 pr-3 py-2.5 border ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link to="/auth/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={`appearance-none block w-full pl-10 pr-3 py-2.5 border ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm`}
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                  >
                    Continue
                    <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
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
                className="space-y-5"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Please verify your information</h3>
                      <p className="text-sm text-blue-700 mt-1">You're signing in as:</p>
                      <p className="text-sm font-medium text-blue-900 mt-1">{watch('email')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    {...register('rememberMe')}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    Keep me signed in for 30 days
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                  >
                    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    className={`flex items-center justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                    onClick={() => {
                      console.log("Sign in button clicked directly");
                      const formData = watch();
                      onSubmit(formData);
                    }}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          {/* Sign up link - only show on first step */}
          {currentStep === 1 && (
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  to="/auth/sign-up"
                  className="w-full flex justify-center py-2.5 px-4 border border-primary rounded-lg shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                >
                  Create an account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
