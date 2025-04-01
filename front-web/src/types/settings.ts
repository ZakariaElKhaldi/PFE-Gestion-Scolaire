export interface UserSettings {
  id?: number;
  userId: string;
  theme: 'light' | 'dark';
  language: 'english' | 'french' | 'arabic' | 'spanish';
  notifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  weekStartsOn: 'sunday' | 'monday';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  updatedAt?: string;
}

export interface SystemSettings {
  id?: number;
  schoolName: string;
  academicYear: string;
  timezone: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  logo?: string;
  enableParentPortal: boolean;
  enableStudentPortal: boolean;
  enableTeacherPortal: boolean;
  maintenanceMode: boolean;
  updatedBy: string;
  updatedAt?: string;
}

export interface SystemMonitoring {
  cpu: {
    usage: number
    cores: number
    temperature: number
  }
  memory: {
    total: number
    used: number
    free: number
  }
  storage: {
    total: number
    used: number
    free: number
  }
  uptime: number
  lastBackup: string
  activeUsers: number
}

export interface FeatureFlags {
  onlineExams: boolean
  virtualClassrooms: boolean
  parentPortal: boolean
  mobileApp: boolean
  apiAccess: boolean
  analytics: boolean
  autoGrading: boolean
  librarySystem: boolean
  attendanceTracking: boolean
  homeworkSubmission: boolean
}

export interface ResourceLimits {
  maxFileUploadSize: number
  maxStoragePerUser: number
  maxConcurrentUsers: number
  maxVideoLength: number
  maxBandwidthPerUser: number
  maxClassesPerTeacher: number
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  notifyOnNewStudent: boolean
  notifyOnAbsence: boolean
  notifyOnGrades: boolean
  notifyOnEvents: boolean
  dailyDigest: boolean
}

export interface SecuritySettings {
  id?: number;
  requireTwoFactor: boolean;
  passwordExpiryDays: number;
  sessionTimeout: number;
  allowedIpRanges: string;
  maxLoginAttempts: number;
  updatedBy: string;
  updatedAt?: string;
}

export interface AdminSettingsTabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export type SettingsSectionType = 'user' | 'system' | 'security';
