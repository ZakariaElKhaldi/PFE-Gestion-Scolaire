import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';
import { useAuth } from '../../components/auth/AuthProvider';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to handle navigation to edit profile screen (to be implemented)
  const handleEditProfile = () => {
    router.push('/(app)/edit-profile');
  };

  // Function to handle navigation to change password screen (to be implemented)
  const handleChangePassword = () => {
    router.push('/(app)/change-password');
  };

  // Function to handle navigation to settings screen (to be implemented)
  const handleSettings = () => {
    router.push('/(app)/settings');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'My Profile' }} />
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
        <Stack.Screen options={{ title: 'My Profile' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load profile. Please sign in again.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'My Profile' }} />
      <ScrollView style={styles.container}>
        {/* Profile Header with Avatar Placeholder */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>
              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
            </Text>
          </View>
          <Text style={styles.userName}>{`${user.firstName} ${user.lastName}`}</Text>
          <Text style={styles.userRole}>{user.role}</Text>
        </View>
        
        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{user.phoneNumber || 'Not provided'}</Text>
            </View>
            
            {user.role === 'student' && (user as any).studentId && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Student ID:</Text>
                <Text style={styles.value}>{(user as any).studentId}</Text>
              </View>
            )}
            
            {/* Add any role-specific info here */}
          </View>
        </View>
        
        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Management</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <Ionicons name="person-outline" size={24} color={COLORS.primary.main} style={styles.actionIcon} />
            <Text style={styles.actionText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.grey[500]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
            <Ionicons name="key-outline" size={24} color={COLORS.primary.main} style={styles.actionIcon} />
            <Text style={styles.actionText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.grey[500]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={24} color={COLORS.primary.main} style={styles.actionIcon} />
            <Text style={styles.actionText}>Preferences & Settings</Text>
            <Ionicons name="chevron-forward" size={24} color={COLORS.grey[500]} />
          </TouchableOpacity>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.primary.light,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.background.light,
  },
  userName: {
    fontSize: TYPOGRAPHY.h2.fontSize,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  userRole: {
    fontSize: TYPOGRAPHY.body1.fontSize,
    color: COLORS.grey[700],
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h3.fontSize,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginVertical: SPACING.md,
  },
  infoSection: {
    backgroundColor: COLORS.background.default,
    padding: SPACING.md,
    borderRadius: 8,
  },
  infoRow: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.body2.fontSize,
    color: COLORS.grey[600],
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: TYPOGRAPHY.body1.fontSize,
    color: COLORS.text.primary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.default,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  actionIcon: {
    marginRight: SPACING.md,
  },
  actionText: {
    flex: 1,
    fontSize: TYPOGRAPHY.body1.fontSize,
    color: COLORS.text.primary,
  },
}); 