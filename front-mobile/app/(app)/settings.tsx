import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';
import { useAuth } from '../../components/auth/AuthProvider';
import { Ionicons } from '@expo/vector-icons';

// Mock settings data structure
interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
}

export default function SettingsScreen() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  // Mock initial settings - in a real app, these would be fetched from an API
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    emailNotifications: true,
    pushNotifications: true,
    language: 'English',
  });
  
  // Simulate fetching settings
  useEffect(() => {
    // In a real app, you would fetch settings from your API here
    const mockFetchSettings = async () => {
      // This is where you'd make the API call
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
    };
    
    mockFetchSettings();
  }, []);
  
  // Toggle switch settings
  const toggleSetting = (setting: 'emailNotifications' | 'pushNotifications') => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };
  
  // Change theme option
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({
      ...prev,
      theme,
    }));
  };
  
  // Change language option
  const setLanguage = (language: string) => {
    setSettings(prev => ({
      ...prev,
      language,
    }));
  };
  
  // Save settings
  const saveSettings = async () => {
    setSubmitting(true);
    
    try {
      // This is where you'd call an API to save the settings
      await new Promise(resolve => setTimeout(resolve, 800));
      
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Settings' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.main} />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingGroup}>
            <Text style={styles.settingTitle}>Theme</Text>
            
            <View style={styles.themeOptions}>
              <TouchableOpacity 
                style={[
                  styles.themeOption, 
                  settings.theme === 'light' && styles.selectedThemeOption
                ]}
                onPress={() => setTheme('light')}
              >
                <Ionicons 
                  name="sunny-outline" 
                  size={24} 
                  color={settings.theme === 'light' ? COLORS.primary.main : COLORS.grey[600]} 
                />
                <Text 
                  style={[
                    styles.themeText, 
                    settings.theme === 'light' && styles.selectedThemeText
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.themeOption, 
                  settings.theme === 'dark' && styles.selectedThemeOption
                ]}
                onPress={() => setTheme('dark')}
              >
                <Ionicons 
                  name="moon-outline" 
                  size={24} 
                  color={settings.theme === 'dark' ? COLORS.primary.main : COLORS.grey[600]} 
                />
                <Text 
                  style={[
                    styles.themeText, 
                    settings.theme === 'dark' && styles.selectedThemeText
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.themeOption, 
                  settings.theme === 'system' && styles.selectedThemeOption
                ]}
                onPress={() => setTheme('system')}
              >
                <Ionicons 
                  name="phone-portrait-outline" 
                  size={24} 
                  color={settings.theme === 'system' ? COLORS.primary.main : COLORS.grey[600]} 
                />
                <Text 
                  style={[
                    styles.themeText, 
                    settings.theme === 'system' && styles.selectedThemeText
                  ]}
                >
                  System
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.settingGroup}>
            <Text style={styles.settingTitle}>Language</Text>
            <TouchableOpacity 
              style={styles.languageSelector}
              onPress={() => Alert.alert('Coming Soon', 'Language selection will be available in a future update.')}
            >
              <Text style={styles.languageText}>{settings.language}</Text>
              <Ionicons name="chevron-forward" size={24} color={COLORS.grey[500]} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications via email</Text>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => toggleSetting('emailNotifications')}
              trackColor={{ false: COLORS.grey[300], true: COLORS.primary.light }}
              thumbColor={settings.emailNotifications ? COLORS.primary.main : COLORS.grey[500]}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive push notifications on this device</Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => toggleSetting('pushNotifications')}
              trackColor={{ false: COLORS.grey[300], true: COLORS.primary.light }}
              thumbColor={settings.pushNotifications ? COLORS.primary.main : COLORS.grey[500]}
            />
          </View>
        </View>
        
        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, submitting && styles.disabledButton]}
          onPress={saveSettings}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Settings</Text>
          )}
        </TouchableOpacity>
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
  title: {
    fontSize: TYPOGRAPHY.h2.fontSize,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.background.default,
    borderRadius: 8,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h4.fontSize,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  settingGroup: {
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.body1.fontSize,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: TYPOGRAPHY.body2.fontSize,
    color: COLORS.grey[600],
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  themeOption: {
    flex: 1,
    padding: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    marginHorizontal: 4,
  },
  selectedThemeOption: {
    borderColor: COLORS.primary.main,
    backgroundColor: COLORS.primary.light + '20',
  },
  themeText: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.body2.fontSize,
    color: COLORS.grey[600],
  },
  selectedThemeText: {
    color: COLORS.primary.main,
    fontWeight: '500',
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
    borderRadius: 8,
  },
  languageText: {
    fontSize: TYPOGRAPHY.body1.fontSize,
    color: COLORS.text.primary,
  },
  saveButton: {
    backgroundColor: COLORS.primary.main,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
    height: 48,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: COLORS.background.light,
    fontSize: TYPOGRAPHY.subtitle2.fontSize,
    fontWeight: 'bold',
  },
}); 