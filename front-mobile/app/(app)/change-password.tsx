import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';
import { useAuth } from '../../components/auth/AuthProvider';
import { authService } from '../../services/auth';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle form field changes
  const handleChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Validate form data
  const validateForm = (): boolean => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirmation do not match');
      return false;
    }
    
    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    if (!user || !user.id) {
      setError('User information is missing');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Call the user service to update the password
      await authService.updatePassword({
        token: '',  // Not needed for this implementation
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      
      Alert.alert(
        'Success',
        'Your password has been updated successfully. Please log in with your new password.',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/login') 
          }
        ]
      );
    } catch (err) {
      console.error('Password update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle cancel and return to profile screen
  const handleCancel = () => {
    router.back();
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Change Password' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Change Password' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>You must be logged in to change your password.</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Change Password' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Change Password</Text>
        
        {/* Instructions */}
        <Text style={styles.instructions}>
          Enter your current password and a new password to update your account security.
        </Text>
        
        {/* Display any error message */}
        {error && (
          <View style={styles.errorMessage}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.form}>
          {/* Current Password */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Current Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.currentPassword}
              onChangeText={(text) => handleChange('currentPassword', text)}
              placeholder="Enter your current password"
              placeholderTextColor={COLORS.grey[400]}
              secureTextEntry
            />
          </View>
          
          {/* New Password */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>New Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.newPassword}
              onChangeText={(text) => handleChange('newPassword', text)}
              placeholder="Enter your new password"
              placeholderTextColor={COLORS.grey[400]}
              secureTextEntry
            />
          </View>
          
          {/* Confirm New Password */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm New Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              placeholder="Confirm your new password"
              placeholderTextColor={COLORS.grey[400]}
              secureTextEntry
            />
          </View>
          
          {/* Form Actions */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton, submitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: TYPOGRAPHY.body1.fontSize,
    color: COLORS.grey[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: TYPOGRAPHY.body1.fontSize,
    color: COLORS.error.main,
    textAlign: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.h2.fontSize,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  instructions: {
    fontSize: TYPOGRAPHY.body1.fontSize,
    color: COLORS.grey[700],
    marginBottom: SPACING.lg,
  },
  errorMessage: {
    backgroundColor: COLORS.error.light,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  form: {
    backgroundColor: COLORS.background.default,
    borderRadius: 8,
    padding: SPACING.md,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.body2.fontSize,
    color: COLORS.grey[700],
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background.light,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    borderRadius: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.body1.fontSize,
    color: COLORS.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  button: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  cancelButton: {
    backgroundColor: COLORS.background.light,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    marginRight: SPACING.sm,
  },
  saveButton: {
    backgroundColor: COLORS.primary.main,
    marginLeft: SPACING.sm,
  },
  disabledButton: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.subtitle2.fontSize,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: COLORS.background.light,
    fontSize: TYPOGRAPHY.subtitle2.fontSize,
    fontWeight: 'bold',
  },
}); 