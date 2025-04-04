import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Platform } from 'react-native';

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const COLORS = {
  primary: {
    light: '#E3F2FD',
    main: '#2196F3',
    dark: '#1976D2',
    contrastText: '#FFFFFF',
    DEFAULT: '#2196F3',
  },
  secondary: {
    light: '#F3E5F5',
    main: '#9C27B0',
    dark: '#7B1FA2',
    contrastText: '#FFFFFF',
    DEFAULT: '#9C27B0',
  },
  info: {
    light: '#E8F4FD',
    main: '#03A9F4',
    dark: '#0288D1',
    contrastText: '#FFFFFF',
    DEFAULT: '#03A9F4',
  },
  error: {
    light: '#FFEBEE',
    main: '#F44336',
    dark: '#D32F2F',
    contrastText: '#FFFFFF',
    DEFAULT: '#F44336',
  },
  warning: {
    light: '#FFF3E0',
    main: '#FF9800',
    dark: '#F57C00',
    contrastText: 'rgba(0, 0, 0, 0.87)',
    DEFAULT: '#FF9800',
  },
  success: {
    light: '#E8F5E9',
    main: '#4CAF50',
    dark: '#388E3C',
    contrastText: '#FFFFFF',
    DEFAULT: '#4CAF50',
  },
  danger: {
    light: '#FFEBEE',
    main: '#F44336',
    dark: '#D32F2F',
    contrastText: '#FFFFFF',
    DEFAULT: '#F44336',
  },
  surface: {
    light: '#FFFFFF',
    main: '#F5F5F5',
    dark: '#121212',
    DEFAULT: '#F5F5F5',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  background: {
    light: '#FFFFFF',
    default: '#F5F5F5',
    DEFAULT: '#F5F5F5',
    dark: '#121212',
    main: '#F5F5F5',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    tertiary: 'rgba(0, 0, 0, 0.45)',
    DEFAULT: 'rgba(0, 0, 0, 0.87)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: Platform.select({ ios: 34, android: 32 }),
    fontWeight: '700',
    lineHeight: Platform.select({ ios: 41, android: 40 }),
    letterSpacing: 0.25,
  },
  h2: {
    fontSize: Platform.select({ ios: 28, android: 26 }),
    fontWeight: '700',
    lineHeight: Platform.select({ ios: 34, android: 32 }),
    letterSpacing: 0,
  },
  h3: {
    fontSize: Platform.select({ ios: 24, android: 22 }),
    fontWeight: '600',
    lineHeight: Platform.select({ ios: 29, android: 28 }),
    letterSpacing: 0.15,
  },
  h4: {
    fontSize: Platform.select({ ios: 20, android: 18 }),
    fontWeight: '600',
    lineHeight: Platform.select({ ios: 24, android: 22 }),
    letterSpacing: 0.15,
  },
  h5: {
    fontSize: Platform.select({ ios: 18, android: 16 }),
    fontWeight: '500',
    lineHeight: Platform.select({ ios: 22, android: 20 }),
    letterSpacing: 0.15,
  },
  subtitle1: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.15,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 17,
    letterSpacing: 0.1,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 17,
    letterSpacing: 0.25,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 15,
    letterSpacing: 0.4,
  },
};

export const SHADOWS = {
  xs: Platform.select({
    ios: {
      shadowColor: COLORS.grey[900],
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1,
    },
    android: {
      elevation: 1,
    },
  }),
  sm: Platform.select({
    ios: {
      shadowColor: COLORS.grey[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: COLORS.grey[900],
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: COLORS.grey[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),
  xl: Platform.select({
    ios: {
      shadowColor: COLORS.grey[900],
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    android: {
      elevation: 12,
    },
  }),
};

export const BORDER_RADIUS = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const LAYOUT = {
  container: {
    paddingHorizontal: SPACING.lg,
  },
  maxWidth: 1200,
  tabletBreakpoint: 768,
  desktopBreakpoint: 1024,
};

export const ANIMATION = {
  scale: {
    pressed: 0.95,
    default: 1,
  },
  duration: {
    short: 150,
    medium: 250,
    long: 350,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
  },
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Navigation theme
export const navigationTheme = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: COLORS.primary.main,
      background: COLORS.background.light,
      card: COLORS.surface.light,
      text: COLORS.grey[900],
      border: COLORS.grey[200],
      notification: COLORS.error.main,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: COLORS.primary.main,
      background: COLORS.background.dark,
      card: COLORS.surface.dark,
      text: COLORS.grey[50],
      border: COLORS.grey[700],
      notification: COLORS.error.main,
    },
  },
}; 