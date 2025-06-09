/**
 * Application configuration
 */
export const config = {
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_stripe_webhook_secret'
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || 'user@example.com',
      pass: process.env.EMAIL_PASS || 'password'
    },
    from: process.env.EMAIL_FROM || 'School Management <no-reply@example.com>'
  },
  storage: {
    profilePictureBucket: 'profile-pictures',
    courseResourcesBucket: 'course-resources',
    certificatesBucket: 'certificates'
  }
}; 