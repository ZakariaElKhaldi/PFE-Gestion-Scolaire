import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { scale, verticalScale } from '../../utils/responsive';
import { NAVIGATION_THEME } from '../../navigation/constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../components/auth/AuthProvider';
import { Checkbox } from '../../components/ui/Checkbox';
import { RadioGroup } from '../../components/ui/RadioGroup';
import { UserRole } from '../../types/auth';

type SignupFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  parentEmail: string;
  studentEmail: string;
  acceptTerms: boolean;
};

export default function SignupScreen() {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'student',
    parentEmail: '',
    studentEmail: '',
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [networkError, setNetworkError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuth();

  const totalSteps = formData.role === 'student' ? 4 : 3;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const updateFormData = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    clearError();
    setNetworkError('');
  };

  const goToNextStep = () => {
    // Validate fields based on current step
    if (currentStep === 1) {
      // Account info validation
      if (!formData.email.trim()) {
        setNetworkError('Email address is required');
        return;
      }
      
      if (!validateEmail(formData.email)) {
        setNetworkError('Please enter a valid email address');
        return;
      }
      
      if (!formData.password.trim()) {
        setNetworkError('Password is required');
        return;
      }
      
      if (formData.password.length < 6) {
        setNetworkError('Password must be at least 6 characters');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setNetworkError('Passwords do not match');
        return;
      }
    } 
    else if (currentStep === 2) {
      // Personal info validation
      if (!formData.firstName.trim()) {
        setNetworkError('First name is required');
        return;
      }
      
      if (!formData.lastName.trim()) {
        setNetworkError('Last name is required');
        return;
      }
      
      if (formData.phoneNumber && formData.phoneNumber.length < 10) {
        setNetworkError('Please enter a valid phone number');
        return;
      }
    }
    else if (currentStep === 3) {
      // Parent/Student relationship validation (only for students or parents)
      if (formData.role === 'student' && formData.parentEmail) {
        if (!validateEmail(formData.parentEmail)) {
          setNetworkError('Please enter a valid parent email address');
          return;
        }
      }
      else if (formData.role === 'parent' && formData.studentEmail) {
        if (!validateEmail(formData.studentEmail)) {
          setNetworkError('Please enter a valid student email address');
          return;
        }
      }
      else if (formData.role !== 'student' && !formData.acceptTerms) {
        // Terms acceptance for non-students at step 3
        setNetworkError('You must accept the terms and conditions');
        return;
      }
    }
    else if (currentStep === 4) {
      // Terms acceptance for students at step 4
      if (!formData.acceptTerms) {
        setNetworkError('You must accept the terms and conditions');
        return;
      }
    }

    // Clear any errors and proceed to next step
    clearError();
    setNetworkError('');
    setCurrentStep(current => Math.min(current + 1, totalSteps));
  };
  
  const goToPreviousStep = () => {
    clearError();
    setNetworkError('');
    setCurrentStep(current => Math.max(current - 1, 1));
  };

  const handleSignup = async () => {
    try {
      clearError();
      setNetworkError('');
      
      // Test API connection first
      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api'}/health`, {
          method: 'GET',
          cache: 'no-cache',
        });
        
        if (!response.ok) {
          setNetworkError('Cannot connect to the server. Please check if the backend is running.');
          return;
        }
      } catch (err) {
        setNetworkError('Network error: Unable to connect to the server. Please check your internet connection.');
        return;
      }

      // Prepare the data for signup
      const signupData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        phoneNumber: formData.phoneNumber || undefined,
        parentEmail: formData.parentEmail || undefined,
        studentEmail: formData.studentEmail || undefined,
      };
      
      await signUp(signupData);
      setSuccess(true);
    } catch (err) {
      console.error('Signup error:', err);
      setNetworkError(err instanceof Error ? err.message : 'An error occurred during sign up');
    }
  };

  // If registration is successful, show success screen
  if (success) {
    return (
      <LinearGradient
        colors={[NAVIGATION_THEME.colors.surface, NAVIGATION_THEME.colors.surfaceVariant]}
        style={styles.background}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            <Card variant="elevated" style={styles.successCard}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
              </View>
              
              <Text variant="h2" style={styles.successTitle}>Registration Successful</Text>
              
              {formData.role === 'parent' ? (
                <>
                  <Text variant="body" style={styles.successText}>
                    Thank you for signing up as a parent! We've sent a verification email to {formData.email}.
                  </Text>
                  <Text variant="body" style={[styles.successText, styles.successTextMargin]}>
                    A verification link has also been sent to your child's email address {formData.studentEmail} to confirm your relationship.
                  </Text>
                  <Text variant="body" style={[styles.successText, styles.successTextMargin]}>
                    Please check your inbox and await confirmation from your child to complete the connection process.
                  </Text>
                </>
              ) : formData.role === 'student' && formData.parentEmail ? (
                <>
                  <Text variant="body" style={styles.successText}>
                    Thank you for signing up! We've sent a verification email to {formData.email}.
                  </Text>
                  <Text variant="body" style={[styles.successText, styles.successTextMargin]}>
                    A notification has been sent to your parent's email address {formData.parentEmail} to confirm your relationship.
                  </Text>
                </>
              ) : (
                <Text variant="body" style={styles.successText}>
                  Thank you for signing up! We've sent a verification email to {formData.email}. Please check your inbox and verify your account to get started.
                </Text>
              )}
              
              <Button
                title="Go to Login"
                onPress={() => router.push('/login')}
                style={styles.successButton}
                size="large"
              />
            </Card>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[NAVIGATION_THEME.colors.surface, NAVIGATION_THEME.colors.surfaceVariant]}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={NAVIGATION_THEME.colors.onSurface}
              />
            </Pressable>

            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-add-outline" size={48} color={NAVIGATION_THEME.colors.onSurface} />
              </View>
              <Text variant="h1" style={styles.title}>Create Account</Text>
              <Text variant="body" style={styles.subtitle}>
                Sign up to get started with School Management
              </Text>
            </View>

            <Card variant="elevated" style={styles.formCard}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressLabelContainer}>
                  <Text variant="caption" style={styles.progressLabel}>
                    {currentStep === 1 ? 'Account Info' : 
                     currentStep === 2 ? 'Personal Info' : 
                     currentStep === 3 && formData.role === 'student' ? 'Parent Info' :
                     currentStep === 3 ? 'Terms & Conditions' : 'Terms & Conditions'}
                  </Text>
                  <Text variant="caption" style={styles.progressCount}>
                    {currentStep}/{totalSteps}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(currentStep / totalSteps) * 100}%` }
                    ]} 
                  />
                </View>
              </View>

              {/* Error Message */}
              {(error || networkError) && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                  <Text variant="body2" style={styles.errorText}>
                    {networkError || error}
                  </Text>
                </View>
              )}

              {/* Step 1: Account Info */}
              {currentStep === 1 && (
                <View style={styles.stepContainer}>
                  <Input
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(text) => updateFormData('email', text)}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    startIcon={<Ionicons name="mail-outline" size={20} color={NAVIGATION_THEME.colors.onSurfaceVariant} />}
                  />

                  <Input
                    label="Password"
                    value={formData.password}
                    onChangeText={(text) => updateFormData('password', text)}
                    placeholder="Create a password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    startIcon={<Ionicons name="lock-closed-outline" size={20} color={NAVIGATION_THEME.colors.onSurfaceVariant} />}
                    endIcon={
                      <Pressable onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color={NAVIGATION_THEME.colors.onSurfaceVariant}
                        />
                      </Pressable>
                    }
                    style={styles.input}
                  />

                  <Input
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => updateFormData('confirmPassword', text)}
                    placeholder="Confirm your password"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    startIcon={<Ionicons name="lock-closed-outline" size={20} color={NAVIGATION_THEME.colors.onSurfaceVariant} />}
                    endIcon={
                      <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons
                          name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color={NAVIGATION_THEME.colors.onSurfaceVariant}
                        />
                      </Pressable>
                    }
                    style={styles.input}
                  />

                  <Button
                    title="Continue"
                    onPress={goToNextStep}
                    style={styles.continueButton}
                    size="large"
                  />
                </View>
              )}

              {/* Step 2: Personal Info */}
              {currentStep === 2 && (
                <View style={styles.stepContainer}>
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChangeText={(text) => updateFormData('firstName', text)}
                    placeholder="Enter your first name"
                    startIcon={<Ionicons name="person-outline" size={20} color={NAVIGATION_THEME.colors.onSurfaceVariant} />}
                  />

                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChangeText={(text) => updateFormData('lastName', text)}
                    placeholder="Enter your last name"
                    startIcon={<Ionicons name="person-outline" size={20} color={NAVIGATION_THEME.colors.onSurfaceVariant} />}
                    style={styles.input}
                  />

                  <Input
                    label="Phone Number (Optional)"
                    value={formData.phoneNumber}
                    onChangeText={(text) => updateFormData('phoneNumber', text)}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    startIcon={<Ionicons name="call-outline" size={20} color={NAVIGATION_THEME.colors.onSurfaceVariant} />}
                    style={styles.input}
                  />

                  <Text variant="body" style={styles.roleLabel}>
                    Select your role
                  </Text>
                  
                  <RadioGroup
                    options={[
                      { label: 'Student', value: 'student' },
                      { label: 'Teacher', value: 'teacher' },
                      { label: 'Parent', value: 'parent' },
                    ]}
                    value={formData.role}
                    onChange={(value) => updateFormData('role', value)}
                    style={styles.roleSelector}
                  />

                  <View style={styles.buttonContainer}>
                    <Button
                      title="Back"
                      onPress={goToPreviousStep}
                      style={styles.backButtonNav}
                      variant="outlined"
                      size="large"
                    />
                    
                    <Button
                      title="Continue"
                      onPress={goToNextStep}
                      style={styles.continueButtonNav}
                      size="large"
                    />
                  </View>
                </View>
              )}

              {/* Step 3: Parent Info (Students) or Terms (Others) */}
              {currentStep === 3 && (
                <View style={styles.stepContainer}>
                  {formData.role === 'student' ? (
                    <>
                      <Text variant="h3" style={styles.sectionTitle}>
                        Parent Information
                      </Text>
                      
                      <Text variant="body" style={styles.infoText}>
                        If you'd like to connect your account with a parent's account, enter their email address here.
                      </Text>
                      
                      <Input
                        label="Parent's Email Address (Optional)"
                        value={formData.parentEmail}
                        onChangeText={(text) => updateFormData('parentEmail', text)}
                        placeholder="Enter parent's email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        startIcon={<Ionicons name="mail-outline" size={20} color={NAVIGATION_THEME.colors.onSurfaceVariant} />}
                        style={styles.input}
                      />
                    </>
                  ) : formData.role === 'parent' ? (
                    <>
                      <Text variant="h3" style={styles.sectionTitle}>
                        Student Information
                      </Text>
                      
                      <Text variant="body" style={styles.infoText}>
                        Enter your child's email address to connect your accounts.
                      </Text>
                      
                      <Input
                        label="Student's Email Address"
                        value={formData.studentEmail}
                        onChangeText={(text) => updateFormData('studentEmail', text)}
                        placeholder="Enter student's email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        startIcon={<Ionicons name="mail-outline" size={20} color={NAVIGATION_THEME.colors.onSurfaceVariant} />}
                        style={styles.input}
                      />
                      
                      <View style={styles.termsContainer}>
                        <Checkbox
                          checked={formData.acceptTerms}
                          onCheckedChange={(checked) => updateFormData('acceptTerms', checked)}
                          label="I accept the Terms of Service and Privacy Policy"
                        />
                      </View>
                    </>
                  ) : (
                    <>
                      <Text variant="h3" style={styles.sectionTitle}>
                        Terms & Conditions
                      </Text>
                      
                      <Text variant="body" style={styles.infoText}>
                        Please read and accept our terms of service and privacy policy to complete your registration.
                      </Text>
                      
                      <View style={styles.termsContainer}>
                        <Checkbox
                          checked={formData.acceptTerms}
                          onCheckedChange={(checked) => updateFormData('acceptTerms', checked)}
                          label="I accept the Terms of Service and Privacy Policy"
                        />
                      </View>
                    </>
                  )}

                  <View style={styles.buttonContainer}>
                    <Button
                      title="Back"
                      onPress={goToPreviousStep}
                      style={styles.backButtonNav}
                      variant="outlined"
                      size="large"
                    />
                    
                    {formData.role === 'student' ? (
                      <Button
                        title="Continue"
                        onPress={goToNextStep}
                        style={styles.continueButtonNav}
                        size="large"
                      />
                    ) : (
                      <Button
                        title={isLoading ? "" : "Sign Up"}
                        onPress={handleSignup}
                        style={styles.continueButtonNav}
                        size="large"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Ionicons name="reload" size={24} color={NAVIGATION_THEME.colors.background} />
                        ) : (
                          "Sign Up"
                        )}
                      </Button>
                    )}
                  </View>
                </View>
              )}

              {/* Step 4: Terms (Students) */}
              {currentStep === 4 && formData.role === 'student' && (
                <View style={styles.stepContainer}>
                  <Text variant="h3" style={styles.sectionTitle}>
                    Terms & Conditions
                  </Text>
                  
                  <Text variant="body" style={styles.infoText}>
                    Please read and accept our terms of service and privacy policy to complete your registration.
                  </Text>
                  
                  <View style={styles.termsContainer}>
                    <Checkbox
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => updateFormData('acceptTerms', checked)}
                      label="I accept the Terms of Service and Privacy Policy"
                    />
                  </View>

                  <View style={styles.buttonContainer}>
                    <Button
                      title="Back"
                      onPress={goToPreviousStep}
                      style={styles.backButtonNav}
                      variant="outlined"
                      size="large"
                    />
                    
                    <Button
                      title={isLoading ? "" : "Sign Up"}
                      onPress={handleSignup}
                      style={styles.continueButtonNav}
                      size="large"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Ionicons name="reload" size={24} color={NAVIGATION_THEME.colors.background} />
                      ) : (
                        "Sign Up"
                      )}
                    </Button>
                  </View>
                </View>
              )}

              {currentStep === 1 && (
                <Pressable 
                  style={styles.loginLink}
                  onPress={() => router.push('/login')}
                >
                  <Text variant="body2" style={styles.loginText}>
                    Already have an account? <Text style={styles.loginTextHighlight}>Sign In</Text>
                  </Text>
                </Pressable>
              )}
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: verticalScale(16),
  },
  content: {
    padding: scale(24),
    justifyContent: 'center',
  },
  backButton: {
    marginBottom: verticalScale(16),
  },
  header: {
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  iconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: NAVIGATION_THEME.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  title: {
    color: NAVIGATION_THEME.colors.onSurface,
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  subtitle: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  formCard: {
    padding: scale(24),
    borderRadius: scale(16),
  },
  progressContainer: {
    marginBottom: verticalScale(24),
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  progressLabel: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
  },
  progressCount: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
  },
  progressBar: {
    height: verticalScale(4),
    backgroundColor: NAVIGATION_THEME.colors.surfaceVariant,
    borderRadius: scale(2),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: NAVIGATION_THEME.colors.primary,
    borderRadius: scale(2),
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEEEE',
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: verticalScale(16),
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: scale(8),
    flex: 1,
  },
  stepContainer: {
    gap: verticalScale(16),
  },
  input: {
    marginTop: verticalScale(16),
  },
  roleLabel: {
    color: NAVIGATION_THEME.colors.onSurface,
    marginBottom: verticalScale(8),
  },
  roleSelector: {
    marginVertical: verticalScale(8),
  },
  termsContainer: {
    marginVertical: verticalScale(16),
  },
  sectionTitle: {
    color: NAVIGATION_THEME.colors.onSurface,
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  infoText: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(8),
  },
  backButtonNav: {
    flex: 1,
  },
  continueButtonNav: {
    flex: 2,
  },
  continueButton: {
    marginTop: verticalScale(8),
  },
  loginLink: {
    alignItems: 'center',
    marginTop: verticalScale(24),
  },
  loginText: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
  },
  loginTextHighlight: {
    color: NAVIGATION_THEME.colors.primary,
    fontWeight: '600',
  },
  successCard: {
    padding: scale(24),
    borderRadius: scale(16),
    alignItems: 'center',
  },
  successIconContainer: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  successTitle: {
    color: NAVIGATION_THEME.colors.onSurface,
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  successText: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  successTextMargin: {
    marginTop: verticalScale(8),
  },
  successButton: {
    marginTop: verticalScale(32),
    width: '100%',
  },
}); 