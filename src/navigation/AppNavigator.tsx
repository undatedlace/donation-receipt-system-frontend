import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import DonationFormScreen from '../screens/donations/DonationFormScreen';
import ReceiptPreviewScreen from '../screens/donations/ReceiptPreviewScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import UsersScreen from '../screens/users/UsersScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const G = '#1B6B3A';
const GOLD = '#C8963E';
const GREY = '#9E9E9E';

const TAB_ICONS: Record<string, string> = {
  Dashboard: '📊',
  Donate: '💚',
  History: '📋',
  Users: '👥',
  Settings: '⚙️',
};

function TabIcon({ name, color }: { name: string; color: string }) {
  return (
    <Text style={{ fontSize: 22, color, includeFontPadding: false }}>{TAB_ICONS[name] ?? '●'}</Text>
  );
}

function MainTabs() {
  const { user } = useAuth();
  const isAdmin = Array.isArray(user?.roles)
    ? user.roles.includes('admin')
    : user?.role === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: G,
        tabBarInactiveTintColor: GREY,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        headerStyle: { backgroundColor: G, elevation: 0, shadowOpacity: 0 },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerTitleAlign: 'center',
        headerRight: () => (
          <Text style={{ color: GOLD, fontSize: 17, marginRight: 14 }}>☪</Text>
        ),
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <TabIcon name="Dashboard" color={color} />,
          headerTitle: 'Noori Donation',
        }}
      />
      <Tab.Screen
        name="Donate"
        component={DonationFormScreen}
        options={{
          tabBarLabel: 'Donate',
          tabBarIcon: ({ color }) => <TabIcon name="Donate" color={color} />,
          headerTitle: 'New Donation',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => <TabIcon name="History" color={color} />,
          headerTitle: 'Donation History',
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Users"
          component={UsersScreen}
          options={{
            tabBarLabel: 'Users',
            tabBarIcon: ({ color }) => <TabIcon name="Users" color={color} />,
            headerTitle: 'User Management',
          }}
        />
      )}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon name="Settings" color={color} />,
          headerTitle: 'Settings',
        }}
      />
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
