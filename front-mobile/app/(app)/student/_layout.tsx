import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContent } from '../../../components/navigation/DrawerContent';
import { NAVIGATION_GROUPS } from '../../../navigation/constants';
import { usePathname } from 'expo-router';
import { Platform, useWindowDimensions, View, StyleSheet, Text } from 'react-native';
import { HeaderBar } from '../../../components/navigation/HeaderBar';
import { COLORS, SPACING, SHADOWS } from '../../../theme';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import existing screen components that are kept
import Dashboard from './dashboard';
import Courses from './courses';
import Assignments from './assignments';
import Attendance from './attendance';
import Materials from './materials';
import Payments from './payments'; // Kept payments
import Documents from './documents';
import Support from './support';

// Import NEW screen components
import Grades from './grades';
import Schedule from './schedule';
import Certificates from './certificates';
import Library from './library';
import Feedback from './feedback';
import Notifications from './notifications';
import Messages from './messages';
import AIAssistant from './ai-assistant';

const Drawer = createDrawerNavigator();

// Screen component mapping
const SCREEN_COMPONENTS: Record<string, React.ComponentType<any>> = {
  dashboard: Dashboard,
  courses: Courses,
  assignments: Assignments,
  grades: Grades,
  schedule: Schedule,
  attendance: Attendance,
  materials: Materials,
  library: Library,
  messages: Messages,
  feedback: Feedback,
  documents: Documents,
  certificates: Certificates,
  payments: Payments,
  notifications: Notifications,
  support: Support,
  'ai-assistant': AIAssistant,
};

export default function StudentLayout() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const allRoutes = NAVIGATION_GROUPS.student[0].routes;
  
  // Determine if we should use permanent drawer based on screen width
  const isPermanentDrawer = width >= 1024;
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="auto" />
      <Drawer.Navigator
        id={undefined}
        screenOptions={({ route }) => ({
          header: () => {
            const routeConfig = allRoutes.find(r => r.path === route.name);
            return (
              <HeaderBar 
                title={routeConfig?.name || route.name} 
                showMenuButton={!isPermanentDrawer}
              />
            );
          },
          drawerType: isPermanentDrawer ? 'permanent' : 'slide',
          drawerStyle: {
            width: Math.min(width * 0.7, 300),
            backgroundColor: COLORS.background.light,
            borderRightColor: COLORS.grey[200],
            borderRightWidth: 1,
            ...(!isPermanentDrawer && SHADOWS.lg),
          },
          swipeEnabled: Platform.OS === 'ios',
          swipeEdgeWidth: 50,
          drawerItemStyle: {
            backgroundColor: 'transparent',
            borderRadius: 8,
            marginHorizontal: SPACING.xs,
          },
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          sceneContainerStyle: {
            backgroundColor: COLORS.background.light,
          },
        })}
        drawerContent={(props) => (
          <DrawerContent
            role="student"
            groups={NAVIGATION_GROUPS.student}
            activeRoute={pathname.split('/').pop() || ''}
            onClose={props.navigation.closeDrawer}
          />
        )}
      >
        {allRoutes.map((route) => (
          <Drawer.Screen
            key={route.path}
            name={route.path}
            component={SCREEN_COMPONENTS[route.path] || (() => <View><Text>Screen not found</Text></View>)}
            options={{
              title: route.name,
            }}
          />
        ))}
      </Drawer.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
});