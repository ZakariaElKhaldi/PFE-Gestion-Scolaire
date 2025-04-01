import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { api } from '@/lib/axios';

// Form validation schema
const registerFormSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
  confirmPassword: z.string(),
  phoneNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

const ParentVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [relationshipData, setRelationshipData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    'pending' | 'verified' | 'rejected' | 'pending_parent_registration' | null
  >(null);

  // Load relationship data using token
  useEffect(() => {
    if (!token) {
      setError('Verification token is missing.');
      return;
    }

    const fetchRelationshipData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/parent-verification/relationship/${token}`);
        setRelationshipData(response.data.data);
        
        // Check relationship status
        if (response.data.data.relationship.status === 'verified') {
          setVerificationStatus('verified');
        } else if (response.data.data.relationship.status === 'rejected') {
          setVerificationStatus('rejected');
        } else if (response.data.data.relationship.status === 'pending_parent_registration') {
          setVerificationStatus('pending_parent_registration');
          
          // Pre-fill the form with any provided parent info
          if (response.data.data.relationship.parentEmail) {
            form.setValue('email', response.data.data.relationship.parentEmail);
          }
          if (response.data.data.relationship.parentFirstName) {
            form.setValue('firstName', response.data.data.relationship.parentFirstName);
          }
          if (response.data.data.relationship.parentLastName) {
            form.setValue('lastName', response.data.data.relationship.parentLastName);
          }
        } else {
          setVerificationStatus('pending');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load relationship data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelationshipData();
  }, [token]);

  // Form setup
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: RegisterFormValues) => {
    if (!token) return;

    setIsLoading(true);
    try {
      await api.post('/parent-verification/register-and-verify', {
        token,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber,
      });

      toast({
        title: 'Account Created',
        description: 'Your account has been created and verified successfully.',
      });

      // Redirect to login page
      navigate('/auth/sign-in', { 
        state: { 
          message: 'Account created successfully. Please log in with your credentials.' 
        } 
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification actions
  const handleVerify = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      await api.put(`/parent-verification/verify/${token}`);
      setVerificationStatus('verified');
      toast({
        title: 'Relationship Verified',
        description: 'You have successfully verified the relationship.',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify relationship.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      await api.put(`/parent-verification/reject/${token}`);
      setVerificationStatus('rejected');
      toast({
        title: 'Relationship Rejected',
        description: 'You have rejected the relationship request.',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject relationship.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !relationshipData) {
    return (
      <div className="container max-w-md flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-gray-500">Loading verification details...</p>
        </div>
      </div>
    );
  }

  if (error && !relationshipData) {
    return (
      <div className="container max-w-md py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!relationshipData) {
    return null;
  }

  // Already verified
  if (verificationStatus === 'verified') {
    return (
      <div className="container max-w-md py-8">
        <Card>
          <CardHeader>
            <CardTitle>Already Verified</CardTitle>
            <CardDescription>
              This relationship has already been verified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>The relationship between you and {relationshipData.student.firstName} {relationshipData.student.lastName} is already verified.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/dashboard/parent')} className="w-full">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Already rejected
  if (verificationStatus === 'rejected') {
    return (
      <div className="container max-w-md py-8">
        <Card>
          <CardHeader>
            <CardTitle>Relationship Rejected</CardTitle>
            <CardDescription>
              This relationship has been rejected.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>You have rejected the relationship request with {relationshipData.student.firstName} {relationshipData.student.lastName}.</p>
            <p className="mt-2">If this was a mistake, please contact support.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Parent needs to register (student-initiated flow)
  if (verificationStatus === 'pending_parent_registration') {
    return (
      <div className="container max-w-md py-8">
        <Card>
          <CardHeader>
            <CardTitle>Parent Registration</CardTitle>
            <CardDescription>
              Create your account to verify your relationship with {relationshipData.student.firstName} {relationshipData.student.lastName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              <p className="text-sm text-gray-600">
                Your child has added you as their parent/guardian in our school management system. 
                Please create an account to verify this relationship and access your child's information.
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Confirm Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Account & Verify
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending verification - display options to verify or register
  return (
    <div className="container max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>Parent Verification</CardTitle>
          <CardDescription>
            You have been asked to verify your relationship with {relationshipData.student.firstName} {relationshipData.student.lastName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Student Information</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>First Name</Label>
                <div className="rounded-md border border-input p-2">{relationshipData.student.firstName}</div>
              </div>
              <div>
                <Label>Last Name</Label>
                <div className="rounded-md border border-input p-2">{relationshipData.student.lastName}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Verify Relationship</h3>
            <p className="text-sm text-gray-600">
              Please verify or reject your relationship with this student. Verifying will give you access to their academic information.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            onClick={handleVerify} 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verify Relationship
          </Button>
          <Button 
            onClick={handleReject} 
            variant="outline"
            className="w-full" 
            disabled={isLoading}
          >
            Reject Relationship
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ParentVerificationPage; 