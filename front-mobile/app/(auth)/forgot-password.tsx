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
import { authService } from '../../services/auth';

type ResetStage = 'request' | 'verifyCode' | 'resetPassword' | 'success';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [stage, setStage] = useState<ResetStage>('request');
  const [networkError, setNetworkError] = useState('');
  
  const router = useRouter();
  const { isLoading, error, clearError, resetPassword } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestReset = async () => {
    try {
      clearError();
      setNetworkError('');

      if (!email.trim()) {
        setNetworkError('Email address is required');
        return;
      }
      
      if (!validateEmail(email)) {
        setNetworkError('Please enter a valid email address');
        return;
      }

      // Use authService to request password reset
      await resetPassword({ email });
      
      setStage('verifyCode');
    } catch (err) {
      console.error('Reset request error:', err);
      setNetworkError(err instanceof Error ? err.message : 'An error occurred during reset request');
    }
  };

  const handleVerifyCode = async () => {
    try {
      clearError();
      setNetworkError('');

      if (!verificationCode.trim()) {
        setNetworkError('Verification code is required');
        return;
      }
      
      if (verificationCode.length < 6) {
        setNetworkError('Please enter a valid verification code');
        return;
      }

      // Verification is handled by the backend, move to the next stage
      setStage('resetPassword');
    } catch (err) {
      console.error('Verification error:', err);
      setNetworkError(err instanceof Error ? err.message : 'An error occurred during verification');
    }
  };

  const handleResetPassword = async () => {
    try {
      clearError();
      setNetworkError('');

      if (!newPassword.trim()) {
        setNetworkError('New password is required');
        return;
      }
      
      if (newPassword.length < 6) {
        setNetworkError('Password must be at least 6 characters');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setNetworkError('Passwords do not match');
        return;
      }

      // Call the updatePassword function with the verification code and new password
      await authService.updatePassword({
        token: verificationCode,
        newPassword,
        confirmPassword
      });
      
      setStage('success');
    } catch (err) {
      console.error('Password reset error:', err);
      setNetworkError(err instanceof Error ? err.message : 'An error occurred during password reset');
    }
  };

  const handleValueChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    clearError();
    setNetworkError('');
  };

  const renderStageContent = () => {
    switch (stage) {
      case 'request':
        return (
          <>
            <Text variant="body" style={styles.description}>
              Enter your email address and we'll send you a verification code to reset your password.
            </Text>
            
            <Input
              label="Email Address"
              value={email}
              onChangeText={(text) => handleValueChange(setEmail, text)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              startIcon={<Ionicons name="mail-outline" size={20} color={NAVIGATION_THEME.colors.onSurfaceVariant} />}
              style={styles.input}
            />
            
            <Button
              title={isLoading ? "" : "Send Reset Instructions"}
              onPress={handleRequestReset}
              style={styles.actionButton}
              size="large"
              disabled={isLoading}
            >
              {isLoading ? (
                <Ionicons name="reload" size={24} color={NAVIGATION_THEME.colors.background} />
              ) : (
                "Send Reset Instructions"
              )}
            </Button>
          </>
        );
        
      case 'verifyCode':
        return (
          <>
            <Text variant="body" style={styles.description}>
              We've sent a verification code to <Text style={styles.highlightText}>{email}</Text>. 
              Please enter the code below to continue.
            </Text>
            
            <Input
              label="Verification Code"
              value={verificationCode}
              onChangeText={(text) => handleValueChange(setVerificationCode, text)}
              placeholder="Enter verification code"
              keyboardType="number-pad"
              autoCapitalize="none"
              startIcon={<Ionicons name="key-outline" size={20} color={NAVIGATION_THEME.colors.onSurfaceVariant} />}
              style={styles.input}
            />
            
            <Button
              title={isLoading ? "" : "Verify Code"}
              onPress={handleVerifyCode}
              style={styles.actionButton}
              size="large"
              disabled={isLoading}
            >
              {isLoading ? (
                <Ionicons name="reload" size={24} color={NAVIGATION_THEME.colors.background} />
              ) : (
                "Verify Code"
              )}
            </Button>
            
            <Pressable onPress={() => handleRequestReset()} style={styles.resendLink}>
              <Text variant="body2" style={styles.resendText}>
                Didn't receive the code? <Text style={styles.highlightText}>Resend</Text>
              </Text>
            </Pressable>
          </>
        );
        
      case 'resetPassword':
        return (
          <>
            <Text variant="body" style={styles.description}>
              Create a new password for your account.
            </Text>
            
            <Input
              label="New Password"
              value={newPassword}
              onChangeText={(text) => handleValueChange(setNewPassword, text)}
              placeholder="Enter new password"
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
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={(text) => handleValueChange(setConfirmPassword, text)}
              placeholder="Confirm new password"
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
              title={isLoading ? "" : "Reset Password"}
              onPress={handleResetPassword}
              style={styles.actionButton}
              size="large"
              disabled={isLoading}
            >
              {isLoading ? (
                <Ionicons name="reload" size={24} color={NAVIGATION_THEME.colors.background} />
              ) : (
                "Reset Password"
              )}
            </Button>
          </>
        );
        
      case 'success':
        return (
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
            </View>
            
            <Text variant="h2" style={styles.successTitle}>Password Reset Successful</Text>
            
            <Text variant="body" style={styles.successText}>
              Your password has been successfully reset. You can now log in with your new password.
            </Text>
            
            <Button
              title="Go to Login"
              onPress={() => router.push('/login')}
              style={styles.actionButton}
              size="large"
            />
          </View>
        );
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
                <Ionicons name="lock-open-outline" size={48} color={NAVIGATION_THEME.colors.onSurface} />
            </View>
              <Text variant="h1" style={styles.title}>Forgot Password</Text>
            <Text variant="body" style={styles.subtitle}>
                {stage === 'success' ? 
                  'Your password has been reset' : 
                  'Reset your password to regain access'}
            </Text>
          </View>

          <Card variant="elevated" style={styles.formCard}>
              {/* Progress Steps (not shown for success stage) */}
              {stage !== 'success' && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressSteps}>
                    <View style={[
                      styles.progressStep, 
                      styles.progressStepActive
                    ]} />
                    <View style={[
                      styles.progressConnector, 
                      (stage === 'verifyCode' || stage === 'resetPassword') ? styles.progressConnectorActive : {}
                    ]} />
                    <View style={[
                      styles.progressStep, 
                      (stage === 'verifyCode' || stage === 'resetPassword') ? styles.progressStepActive : {}
                    ]} />
                    <View style={[
                      styles.progressConnector, 
                      stage === 'resetPassword' ? styles.progressConnectorActive : {}
                    ]} />
                    <View style={[
                      styles.progressStep, 
                      stage === 'resetPassword' ? styles.progressStepActive : {}
                    ]} />
                  </View>
                  <View style={styles.progressLabels}>
                    <Text variant="caption" style={[
                      styles.progressLabel, 
                      styles.progressLabelActive
                    ]}>
                      Request
                    </Text>
                    <Text variant="caption" style={[
                      styles.progressLabel, 
                      (stage === 'verifyCode' || stage === 'resetPassword') ? styles.progressLabelActive : {}
                    ]}>
                      Verify
                    </Text>
                    <Text variant="caption" style={[
                      styles.progressLabel, 
                      stage === 'resetPassword' ? styles.progressLabelActive : {}
                    ]}>
                      Reset
                    </Text>
                  </View>
                </View>
              )}

              {/* Error Message */}
              {(error || networkError) && stage !== 'success' && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                  <Text variant="body2" style={styles.errorText}>
                    {networkError || error}
                  </Text>
                </View>
            )}

              {renderStageContent()}
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
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStep: {
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    backgroundColor: NAVIGATION_THEME.colors.surfaceVariant,
  },
  progressStepActive: {
    backgroundColor: NAVIGATION_THEME.colors.primary,
  },
  progressConnector: {
    height: verticalScale(2),
    width: scale(32),
    backgroundColor: NAVIGATION_THEME.colors.surfaceVariant,
  },
  progressConnectorActive: {
    backgroundColor: NAVIGATION_THEME.colors.primary,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(8),
    paddingHorizontal: scale(12),
  },
  progressLabel: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
    textAlign: 'center',
    flex: 1,
  },
  progressLabelActive: {
    color: NAVIGATION_THEME.colors.primary,
    fontWeight: '600',
  },
  description: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: verticalScale(24),
  },
  input: {
    marginBottom: verticalScale(16),
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
  actionButton: {
    marginTop: verticalScale(8),
  },
  resendLink: {
    alignItems: 'center',
    marginTop: verticalScale(16),
  },
  resendText: {
    color: NAVIGATION_THEME.colors.onSurfaceVariant,
  },
  highlightText: {
    color: NAVIGATION_THEME.colors.primary,
    fontWeight: '600',
  },
  successContainer: {
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
    marginBottom: verticalScale(24),
  },
});
