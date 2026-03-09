import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import DonationFormScreen from '../screens/donations/DonationFormScreen';
import ReceiptPreviewScreen from '../screens/donations/ReceiptPreviewScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLORS = { green: '#1B6B3A', gold: '#C8963E', grey: '#9E9E9E' };

const TabIcon = ({ name, color }: { name: string; color: string }) => {
  const icons: Record<string, string> = {
    Dashboard: '📊', 'New Donation': '💚', History: '📋', Settings: '⚙️',
  };
  return (
    <View>
      {/* Replace with react-native-vector-icons in production */}
    </View>
  );
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: COLORS.green,
        tabBarInactiveTintColor: COLORS.grey,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E0E0E0', paddingBottom: 6, height: 60 },
        headerStyle: { backgroundColor: COLORS.green },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="New Donation" component={DonationFormScreen} options={{ tabBarLabel: 'Donate' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1B6B3A' }}>
        <ActivityIndicator size="large" color="#C8963E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="ReceiptPreview"
              component={ReceiptPreviewScreen}
              options={{ headerShown: true, title: 'Receipt Preview', headerStyle: { backgroundColor: '#1B6B3A' }, headerTintColor: '#fff' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
