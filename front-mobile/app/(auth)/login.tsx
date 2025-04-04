import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { scale, verticalScale } from '../../utils/responsive';
import { NAVIGATION_THEME } from '../../navigation/constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../components/auth/AuthProvider';
import { Checkbox } from '../../components/ui/Checkbox';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [networkError, setNetworkError] = useState('');
  const totalSteps = 2;
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signIn, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    // Check if there's a message in the URL params
    if (params.message) {
      setSuccessMessage(params.message as string);
    }
  }, [params]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const goToNextStep = () => {
    if (currentStep === 1) {
      // Validate email and password fields
      if (!email.trim()) {
        clearError();
        setNetworkError('Email address is required');
        return;
      }
      
      if (!validateEmail(email)) {
        clearError();
        setNetworkError('Please enter a valid email address');
        return;
      }
      
      if (!password.trim()) {
        clearError();
        setNetworkError('Password is required');
        return;
      }
      
      if (password.length < 6) {
        clearError();
        setNetworkError('Password must be at least 6 characters');
        return;
      }
      
      // Clear any errors and proceed to next step
      clearError();
      setNetworkError('');
      setCurrentStep(2);
    }
  };
  
  const goToPreviousStep = () => {
    clearError();
    setNetworkError('');
    setCurrentStep(1);
  };

  const handleLogin = async () => {
    try {
      clearError();
      setNetworkError('');
      setSuccessMessage('');
      
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
      
      await signIn({ email, password, rememberMe });
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <LinearGradient
      colors={[NAVIGATION_THEME.colors.surface, NAVIGATION_THEME.colors.surfaceVariant]}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="school-outline" size={48} color={NAVIGATION_THEME.colors.onSurface} />
              </View>
              <Text variant="h1" style={styles.title}>Welcome Back</Text>
              <Text variant="body" style={styles.subtitle}>
                Sign in to continue to your account
              </Text>
            </View>

            <Card variant="elevated" style={styles.formCard}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressLabelContainer}>
                  <Text variant="caption" style={styles.progressLabel}>
                    {currentStep === 1 ? 'Enter Credentials' : 'Confirm Details'}
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

              {/* Success Message */}
              {successMessage ? (
                <View style={styles.successMessage}>
                  <Ionicons name="checkmark-circle" size={20} color={NAVIGATION_THEME.colors.primary} />
                  <Text variant="body2" style={styles.successMessageText}>
                    {successMessage}
                  </Text>
                </View>
              ) : null}

              {/* Step 1: Enter Credentials */}
              {currentStep === 1 && (
                <View style={styles.stepContainer}>
                  <Input
                    label="Email Address"
                    value={email}
                    onChangeText={text => {
                      setEmail(text);
                      clearError();
                      setNetworkError('');
                      setSuccessMessage('');
                    }}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    startIcon={<Ionicons name="mail-outline" size={20} color={NAVIGATION_THEME.colors.onSurfaceVariant} />}
                  />

                  <Input
                    label="Password"
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      clearError();
                      setNetworkError('');
                      setSuccessMessage('');
                    }}
                    placeholder="Enter your password"
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
                    style={styles.passwordInput}
                  />

                  <Button
                    title="Continue"
                    onPress={goToNextStep}
                    style={styles.continueButton}
                    size="large"
                  />
                </View>
              )}

              {/* Step 2: Confirm Details */}
              {currentStep === 2 && (
                <View style={styles.stepContainer}>
                  <View style={styles.confirmationContainer}>
                    <Text variant="h3" style={styles.confirmationTitle}>
                      Sign In Details
                    </Text>
                    
                    <View style={styles.confirmationItem}>
                      <Text variant="body" style={styles.confirmationLabel}>Email:</Text>
                      <Text variant="body2" style={styles.confirmationValue}>{email}</Text>
                    </View>
                    
                    <View style={styles.confirmationItem}>
                      <Text variant="body" style={styles.confirmationLabel}>Password:</Text>
                      <Text variant="body2" style={styles.confirmationValue}>••••••••</Text>
                    </View>
                  </View>

                  <View style={styles.checkboxContainer}>
                    <Checkbox
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                      label="Remember Me"
                    />
                  </View>

                  <View style={styles.buttonContainer}>
                    <Button
                      title="Back"
                      onPress={goToPreviousStep}
                      style={styles.backButton}
                      variant="outlined"
                      size="large"
                    />
                    
                    <Button
                      title={isLoading ? "" : "Sign In"}
                      onPress={handleLogin}
                      style={styles.loginButton}
                      size="large"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color={NAVIGATION_THEME.colors.background} />
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </View>
                </View>
              )}

              <View style={styles.footer}>
                <Pressable onPress={() => router.push('/forgot-password')}>
                  <Text variant="body2" style={styles.forgotPassword}>
                    Forgot Password?
                  </Text>
                </Pressable>
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text variant="body2" style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable 
                style={styles.createAccount}
                onPress={() => router.push('/signup')}
              >
                <Text variant="body2" style={styles.createAccountText}>
                  Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text>
                </Text>
              </Pressable>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: scale(24),
    justifyContent: 'center',
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
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F2EA',
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: verticalScale(16),
  },
  successMessageText: {
    color: NAVIGATION_THEME.colors.primary,
    marginLeft: scale(8),
    flex: 1,
  },
  stepContainer: {
    gap: verticalScale(16),
  },
  passwordInput: {
    marginTop: 0,
  },
  continueButton: {
    marginTop: verticalScale(8),
  },
  confirmationContainer: {
    backgroundColor: NAVIGATION_THEME.colors.surfaceVariant,
    padding: scale(16),
    borderRadius: scale(8),
    marginBottom: verticalScale(8),
  },
  confirmationTitle: {
    color: NAVIGATION_THEME.colors.onSurface,
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  confirmationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
    paddingBottom: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: NAVIGATION_THEME.colors.outline,
  },
  confirmationLabel: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
  },
  confirmationValue: {
    color: NAVIGATION_THEME.colors.onSurface,
    fontWeight: '500',
  },
  checkboxContainer: {
    marginBottom: verticalScale(16),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(12),
  },
  backButton: {
    flex: 1,
  },
  loginButton: {
    flex: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: verticalScale(24),
  },
  forgotPassword: {
    color: NAVIGATION_THEME.colors.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(24),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: NAVIGATION_THEME.colors.outline,
  },
  dividerText: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
    marginHorizontal: scale(16),
  },
  createAccount: {
    alignItems: 'center',
  },
  createAccountText: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
  },
  signUpLink: {
    color: NAVIGATION_THEME.colors.primary,
    fontWeight: '600',
  },
});