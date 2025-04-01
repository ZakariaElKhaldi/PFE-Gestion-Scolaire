import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  role: z.enum(['student', 'teacher', 'parent'], { required_error: 'Please select a role' }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  studentEmail: z.string().email('Invalid student email').optional(),
  parentEmail: z.string().email('Invalid parent email').optional(),
  parentFirstName: z.string().min(2, 'Parent first name must be at least 2 characters').optional(),
  parentLastName: z.string().min(2, 'Parent last name must be at least 2 characters').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
.refine(
  (data) => data.role !== 'parent' || data.studentEmail,
  {
    message: "Student email is required for parent registration",
    path: ["studentEmail"],
  }
);

console.log('signUpSchema:', signUpSchema);
