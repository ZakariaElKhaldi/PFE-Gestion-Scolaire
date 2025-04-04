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
import { UpdateProfileData } from '../../types/auth';

export default function EditProfileScreen() {
  const { user, isLoading, updateProfile, error, clearError } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  
  // Handle form field changes
  const handleChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'First name and last name are required.');
      return;
    }
    
    try {
      setSubmitting(true);
      await updateProfile(formData);
      
      // If successful, go back to profile screen
      Alert.alert('Success', 'Profile updated successfully', [
        { 
          text: 'OK', 
          onPress: () => router.back() 
        }
      ]);
    } catch (err) {
      console.error('Profile update error:', err);
      // Error state is handled by useAuth hook
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
        <Stack.Screen options={{ title: 'Edit Profile' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Edit Profile' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load profile. Please sign in again.</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Edit Profile' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Edit Profile</Text>
        
        {/* Display any error message */}
        {error && (
          <View style={styles.errorMessage}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.form}>
          {/* First Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
              placeholder="Enter your first name"
              placeholderTextColor={COLORS.grey[400]}
            />
          </View>
          
          {/* Last Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
              placeholder="Enter your last name"
              placeholderTextColor={COLORS.grey[400]}
            />
          </View>
          
          {/* Phone Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phoneNumber}
              onChangeText={(text) => handleChange('phoneNumber', text)}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.grey[400]}
              keyboardType="phone-pad"
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
                <Text style={styles.saveButtonText}>Save Changes</Text>
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