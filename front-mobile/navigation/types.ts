import { LucideIcon } from 'lucide-react-native';

export type AppRoutePath =
  | 'dashboard'
  | 'users'
  | 'classes'
  | 'courses'
  | 'reports'
  | 'settings'
  | 'logs'
  | 'documents'
  | 'payments'
  | 'attendance'
  | 'support'
  | 'children'
  | 'students'
  | 'assignments'
  | 'materials'
  | 'grades'
  | 'schedule'
  | 'certificates'
  | 'library'
  | 'feedback'
  | 'notifications'
  | 'messages'
  | 'ai-assistant';

export type RoleType = 'admin' | 'teacher' | 'student' | 'parent';

export interface NavigationRoute {
  name: string;
  path: AppRoutePath;
  icon: string;
}

export interface NavigationGroup {
  name: string;
  routes: NavigationRoute[];
}

export type NavigationGroups = Record<RoleType, NavigationGroup[]>; 