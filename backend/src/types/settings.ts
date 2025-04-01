// Base user settings interface for all roles
export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  updatedAt?: string;
}

// Response type for user settings
export interface UserSettingsResponse extends UserSettings {
  userId: string;
}

// Admin-specific system settings
export interface SystemSettings {
  id?: number;
  schoolName: string;
  academicYear: string;
  timezone: string;
  emailNotifications: boolean;
  defaultLanguage: string;
  maintenanceMode: boolean;
  maxStudentsPerClass: number;
  gradingSystem: 'letter' | 'percentage' | 'points';
}

export interface SecuritySettings {
  id?: number;
  requireTwoFactor: boolean;
  passwordExpiryDays: number;
  sessionTimeout: number;
  allowedIpRanges: string[];
  maxLoginAttempts: number;
}

export interface ResourceLimits {
  maxFileUploadSize: number; // MB
  maxStoragePerUser: number; // MB
  maxConcurrentUsers: number;
  maxVideoLength: number; // minutes
  maxBandwidthPerUser: number; // Mbps
  maxClassesPerTeacher: number;
}

export interface FeatureFlags {
  onlineExams: boolean;
  virtualClassrooms: boolean;
  parentPortal: boolean;
  mobileApp: boolean;
  apiAccess: boolean;
  analytics: boolean;
  autoGrading: boolean;
  librarySystem: boolean;
  attendanceTracking: boolean;
  homeworkSubmission: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  notifyOnNewStudent: boolean;
  notifyOnAbsence: boolean;
  notifyOnGrades: boolean;
  notifyOnEvents: boolean;
  dailyDigest: boolean;
}

// Admin complete settings that include all setting categories
export interface AdminSettings {
  systemSettings: SystemSettings;
  securitySettings: SecuritySettings;
  resourceLimits: ResourceLimits;
  featureFlags: FeatureFlags;
  notificationSettings: NotificationSettings;
  userSettings: UserSettings;
} 