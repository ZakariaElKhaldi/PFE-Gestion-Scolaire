import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

// Ignore specific LogBox warnings
LogBox.ignoreLogs([
  'Warning: Failed prop type',
  'Non-serializable values were found in the navigation state',
]);

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    // Add any app initialization logic here
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Add your screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
