import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContent } from '../../../components/navigation/DrawerContent';
import { NAVIGATION_GROUPS, NAVIGATION_THEME } from '../../../navigation/constants';
import { usePathname } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';
import { HeaderBar } from '../../../components/navigation/HeaderBar';
import { NavigationContainer } from '@react-navigation/native';

// Import screen components - Make sure they all exist
import Dashboard from './dashboard';
import Classes from './classes';
import Documents from './documents';
import Students from './students/index';
import Assignments from './assignments';
import Materials from './materials';
import Messages from './messages';
import Attendance from './attendance';
import Profile from './profile';

const Drawer = createDrawerNavigator();

// Screen component mapping - Make sure all components are imported and available
const SCREEN_COMPONENTS: Record<string, React.ComponentType<any>> = {
  dashboard: Dashboard,
  classes: Classes,
  documents: Documents,
  students: Students,
  assignments: Assignments,
  materials: Materials,
  messages: Messages,
  attendance: Attendance,
  profile: Profile,
};

export default function TeacherLayout() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const allRoutes = NAVIGATION_GROUPS.teacher[0].routes;
  
  // Determine if we should use permanent drawer based on screen width
  const isPermanentDrawer = width >= 1024;
  
  // Extract the active route from the pathname
  const activeRouteName = pathname.split('/').pop() || 'dashboard';
  
  return (
    // Use key to force recreate the navigator when active route changes
    // This helps sync Expo Router's location with React Navigation
    <Drawer.Navigator
      id={undefined}
      key={activeRouteName}
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
        drawerType: isPermanentDrawer ? 'permanent' : 'front',
        drawerStyle: {
          width: Math.min(width * 0.7, 300),
          backgroundColor: NAVIGATION_THEME.colors.surface,
          borderRightColor: NAVIGATION_THEME.colors.border,
          borderRightWidth: 1,
        },
        swipeEnabled: Platform.OS === 'ios',
        swipeEdgeWidth: 100,
        drawerItemStyle: {
          backgroundColor: 'transparent',
        },
      })}
      drawerContent={(props) => (
        <DrawerContent
          role="teacher"
          groups={NAVIGATION_GROUPS.teacher}
          activeRoute={activeRouteName}
          onClose={props.navigation.closeDrawer}
        />
      )}
      initialRouteName={activeRouteName}
    >
      {allRoutes.map((route) => {
        // Only add routes that have a matching component
        if (SCREEN_COMPONENTS[route.path]) {
          return (
            <Drawer.Screen
              key={route.path}
              name={route.path}
              component={SCREEN_COMPONENTS[route.path]}
              options={{
                title: route.name,
                drawerItemStyle: { display: 'none' },
              }}
            />
          );
        }
        return null;
      })}
    </Drawer.Navigator>
  );
}