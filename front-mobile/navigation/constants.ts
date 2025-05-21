import { Ionicons } from '@expo/vector-icons';
import { NavigationGroup, RoleType, NavigationRoute, AppRoutePath } from './types';
// Material Design 3 color system
export const MATERIAL_COLORS = {
  primary: {
    0: '#000000',
    10: '#001F24',
    20: '#003F4C',
    30: '#006073',
    40: '#00829B',
    50: '#00A4C4',
    60: '#2DC8ED',
    70: '#57DDFF',
    80: '#8CEBFF',
    90: '#C8F3FF',
    95: '#E4F8FF',
    99: '#F8FDFF',
    100: '#FFFFFF',
  },
  secondary: {
    0: '#000000',
    10: '#001D32',
    20: '#003351',
    30: '#004B73',
    40: '#006496',
    50: '#007EBB',
    60: '#0098E0',
    70: '#38B5FF',
    80: '#8CCDFF',
    90: '#D1E4FF',
    95: '#E9F1FF',
    99: '#FDFCFF',
    100: '#FFFFFF',
  },
  neutral: {
    0: '#000000',
    10: '#1A1C1E',
    20: '#2F3033',
    30: '#45474A',
    40: '#5D5E61',
    50: '#76777A',
    60: '#909094',
    70: '#AAABAE',
    80: '#C6C6C9',
    90: '#E2E2E5',
    95: '#F1F0F4',
    99: '#FCFCFF',
    100: '#FFFFFF',
  },
};

// Role-specific theme colors following Material Design 3
export const ROLE_COLORS: Record<RoleType, {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
}> = {
  admin: {
    primary: MATERIAL_COLORS.primary[40],
    onPrimary: MATERIAL_COLORS.primary[100],
    primaryContainer: MATERIAL_COLORS.primary[90],
    onPrimaryContainer: MATERIAL_COLORS.primary[10],
    secondary: MATERIAL_COLORS.secondary[40],
    onSecondary: MATERIAL_COLORS.secondary[100],
    secondaryContainer: MATERIAL_COLORS.secondary[90],
    onSecondaryContainer: MATERIAL_COLORS.secondary[10],
  },
  teacher: {
    primary: '#1B6C4A',
    onPrimary: '#FFFFFF',
    primaryContainer: '#A8F7C6',
    onPrimaryContainer: '#002111',
    secondary: '#4B6356',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#CDE8D8',
    onSecondaryContainer: '#082014',
  },
  student: {
    primary: '#8B4F00',
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFDCBB',
    onPrimaryContainer: '#2C1600',
    secondary: '#755944',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFDCC2',
    onSecondaryContainer: '#2B1708',
  },
  parent: {
    primary: '#6E1B6C',
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFD6F9',
    onPrimaryContainer: '#280025',
    secondary: '#6E5367',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F8D8EC',
    onSecondaryContainer: '#271624',
  },
};

// Enhanced navigation theme with Material Design 3
export const NAVIGATION_THEME = {
  colors: {
    primary: '#0066cc',
    background: '#f5f5f5',
    surface: '#ffffff',
    surfaceVariant: '#f0f0f0',
    text: '#333333',
    onSurface: '#333333',
    onSurfaceVariant: '#666666',
    border: '#e0e0e0',
    notification: '#ff3b30',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  shape: {
    none: 0,
    extraSmall: 4,
    small: 8,
    medium: 12,
    large: 16,
    extraLarge: 28,
    full: 9999,
  },
  typography: {
    scale: {
      small: 0.85,
      medium: 1,
      large: 1.15,
    },
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  animation: {
    scale: 1.0,
    durations: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
};

// Navigation groups
export const NAVIGATION_GROUPS: Record<RoleType, NavigationGroup[]> = {
  admin: [
    {
      name: 'Main',
      routes: [
        {
          name: 'Dashboard',
          path: 'dashboard',
          icon: 'pie-chart',
        },
        {
          name: 'Users',
          path: 'users',
          icon: 'people',
        },
        {
          name: 'Classes',
          path: 'classes',
          icon: 'list',
        },
        {
          name: 'Courses',
          path: 'courses',
          icon: 'book',
        },
        {
          name: 'Documents',
          path: 'documents',
          icon: 'document-text',
        },
        {
          name: 'Payments',
          path: 'payments',
          icon: 'card',
        },
      ],
    },
    {
      name: 'System',
      routes: [
        {
          name: 'Reports',
          path: 'reports',
          icon: 'stats-chart',
        },
        {
          name: 'Settings',
          path: 'settings',
          icon: 'settings',
        },
        {
          name: 'Logs',
          path: 'logs',
          icon: 'list',
        },
      ],
    },
  ],
  teacher: [
    {
      name: 'Main',
      routes: [
        {
          name: 'Dashboard',
          path: 'dashboard',
          icon: 'pie-chart',
        },
        {
          name: 'Classes',
          path: 'classes',
          icon: 'list',
        },
        {
          name: 'Students',
          path: 'students',
          icon: 'people',
        },
        {
          name: 'Assignments',
          path: 'assignments',
          icon: 'clipboard',
        },
        {
          name: 'Attendance', // Add Attendance route
          path: 'attendance',
          icon: 'calendar',
        },
        {
          name: 'Materials',
          path: 'materials',
          icon: 'book',
        },
        {
          name: 'Messages',
          path: 'messages',
          icon: 'chatbubbles',
        },
        {
          name: 'Documents',
          path: 'documents',
          icon: 'document-text',
        },
      ],
    },
  ],
  student: [
    {
      name: 'Main',
      routes: [
        {
          name: 'Dashboard',
          path: 'dashboard',
          icon: 'pie-chart',
        },
        {
          name: 'Courses',
          path: 'courses',
          icon: 'book',
        },
        {
          name: 'Assignments',
          path: 'assignments',
          icon: 'clipboard',
        },
        {
          name: 'Grades',
          path: 'grades',
          icon: 'school',
        },
        {
          name: 'Schedule',
          path: 'schedule',
          icon: 'calendar-number',
        },
        {
          name: 'Attendance',
          path: 'attendance',
          icon: 'calendar',
        },
        {
          name: 'Materials',
          path: 'materials',
          icon: 'folder',
        },
        {
          name: 'Library',
          path: 'library',
          icon: 'library',
        },
        {
          name: 'AI Assistant',
          path: 'ai-assistant',
          icon: 'sparkles',
        },
        {
          name: 'Messages',
          path: 'messages',
          icon: 'chatbubbles',
        },
        {
          name: 'Feedback',
          path: 'feedback',
          icon: 'megaphone-outline',
        },
        {
          name: 'Documents',
          path: 'documents',
          icon: 'document-text',
        },
        {
          name: 'Certificates',
          path: 'certificates',
          icon: 'ribbon',
        },
        {
          name: 'Payments',
          path: 'payments',
          icon: 'card',
        },
        {
          name: 'Notifications',
          path: 'notifications',
          icon: 'notifications',
        },
        {
          name: 'Support',
          path: 'support',
          icon: 'help-circle',
        },
      ],
    },
  ],
  parent: [
    {
      name: 'Main',
      routes: [
        {
          name: 'Dashboard',
          path: 'dashboard',
          icon: 'pie-chart',
        },
        {
          name: 'Children',
          path: 'children',
          icon: 'people',
        },
        {
          name: 'Messages',
          path: 'messages',
          icon: 'chatbubbles',
        },
        {
          name: 'Documents',
          path: 'documents',
          icon: 'document-text',
        },
        {
          name: 'Payments',
          path: 'payments',
          icon: 'card',
        },
      ],
    },
  ],
};