import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const ParentVerificationPage = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying parent connection...');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyParentConnection = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          setStatus('error');
          setMessage('Verification token is missing. Please check your email link.');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/auth/verify-parent?token=${token}`);
        
        if (response.data && !response.data.error) {
          setStatus('success');
          setMessage('Parent connection has been successfully verified!');
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Failed to verify parent connection. Please try again.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Failed to verify parent connection. The verification link may have expired.'
        );
      }
    };

    verifyParentConnection();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Parent Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {status === 'loading' && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-gray-700 text-center">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  {message}
                </AlertDescription>
              </Alert>
              
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 mb-4">
                  You can now sign in to your account to access your child's information.
                </p>
                <Button
                  onClick={() => navigate('/auth/sign-in')}
                  className="w-full"
                >
                  Go to Sign In
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-5 w-5" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
              
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 mb-4">
                  Please try again or contact support if the problem persists.
                </p>
                <Button
                  onClick={() => navigate('/auth/sign-in')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentVerificationPage; 