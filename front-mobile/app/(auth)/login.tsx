import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signIn, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    // Check if there's a message in the URL params
    if (params.message) {
      setSuccessMessage(params.message as string);
    }
  }, [params]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      clearError();
      setSuccessMessage('');
      return;
    }
    
    await signIn({ email, password });
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
            {successMessage ? (
              <View style={styles.successMessage}>
                <Text variant="body2" style={styles.successMessageText}>
                  {successMessage}
                </Text>
              </View>
            ) : null}

            <Input
              label="Email Address"
              value={email}
              onChangeText={text => {
                setEmail(text);
                clearError();
                setSuccessMessage('');
              }}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              startIcon={<Ionicons name="mail-outline" size={20} color={NAVIGATION_THEME.colors.onSurfaceVariant} />}
              error={error}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                clearError();
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
              error={error}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
              size="large"
            />

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
  content: {
    flex: 1,
    padding: scale(24),
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: verticalScale(32),
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
  passwordInput: {
    marginTop: verticalScale(16),
  },
  loginButton: {
    marginTop: verticalScale(24),
  },
  footer: {
    alignItems: 'center',
    marginTop: verticalScale(16),
  },
  forgotPassword: {
    color: NAVIGATION_THEME.colors.onSurface,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(24),
    marginBottom: verticalScale(24),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: NAVIGATION_THEME.colors.outlineVariant,
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
    color: NAVIGATION_THEME.colors.onSurface,
    fontWeight: '600',
  },
  successMessage: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: verticalScale(16),
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  successMessageText: {
    color: '#2E7D32',
  },
});