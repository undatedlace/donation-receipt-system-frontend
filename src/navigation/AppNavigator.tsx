import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import DonationFormScreen from '../screens/donations/DonationFormScreen';
import ReceiptPreviewScreen from '../screens/donations/ReceiptPreviewScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import UsersScreen from '../screens/users/UsersScreen';
import { navigationTheme, palette, radius, shadows } from '../theme/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardIcon({ color }: { color: string }) {
  return (
    <View style={styles.gridIcon}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} style={[styles.gridCell, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

function DonateIcon({ color }: { color: string }) {
  return (
    <View style={[styles.plusCircle, { borderColor: color }]}>
      <View style={[styles.plusHorizontal, { backgroundColor: color }]} />
      <View style={[styles.plusVertical, { backgroundColor: color }]} />
    </View>
  );
}

function HistoryIcon({ color }: { color: string }) {
  return (
    <View style={styles.historyIcon}>
      {[0, 1, 2].map(index => (
        <View
          key={index}
          style={[
            styles.historyLine,
            HISTORY_LINE_STYLES[index],
            HISTORY_LINE_OFFSETS[index],
            { backgroundColor: color },
          ]}
        />
      ))}
    </View>
  );
}

function UsersIcon({ color }: { color: string }) {
  return (
    <View style={styles.usersIcon}>
      <View style={[styles.userHeadPrimary, { borderColor: color }]} />
      <View style={[styles.userHeadSecondary, { borderColor: color }]} />
      <View style={[styles.userBodyPrimary, { borderColor: color }]} />
      <View style={[styles.userBodySecondary, { borderColor: color }]} />
    </View>
  );
}

function SettingsIcon({ color }: { color: string }) {
  return (
    <View style={styles.settingsIcon}>
      {[0, 1, 2].map(index => (
        <View
          key={index}
          style={[
            styles.settingsTrack,
            SETTINGS_TRACK_STYLES[index],
            { backgroundColor: color },
          ]}>
          <View
            style={[
              styles.settingsKnob,
              SETTINGS_KNOB_STYLES[index],
              { backgroundColor: color },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

function renderTabIcon(name: string, color: string) {
  switch (name) {
    case 'Dashboard':
      return <DashboardIcon color={color} />;
    case 'Donate':
      return <DonateIcon color={color} />;
    case 'History':
      return <HistoryIcon color={color} />;
    case 'Users':
      return <UsersIcon color={color} />;
    case 'Settings':
      return <SettingsIcon color={color} />;
    default:
      return <View style={[styles.gridCell, { backgroundColor: color }]} />;
  }
}

const createTabBarIcon =
  (routeName: string) =>
  ({ color }: { color: string }) =>
    renderTabIcon(routeName, color);

function MainTabs() {
  const { user } = useAuth();
  const roles: string[] = Array.isArray(user?.roles) ? user.roles : ['user'];

  const isAdmin         = roles.includes('admin');
  const isInternalAdmin = roles.includes('internal-admin');
  const isUserOnly      = !isAdmin && !isInternalAdmin;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: palette.background },
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: palette.primaryDark,
        tabBarInactiveTintColor: palette.textSoft,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIconWrap,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIcon: createTabBarIcon(route.name),
      })}>
      {/* admin + internal-admin: see Dashboard */}
      {(isAdmin || isInternalAdmin) && (
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
      )}
      {/* admin + internal-admin: see Donate */}
      {(isAdmin || isInternalAdmin) && (
        <Tab.Screen name="Donate" component={DonationFormScreen} options={{ tabBarLabel: 'Donate' }} />
      )}
      {/* everyone: see History */}
      <Tab.Screen name="History" component={HistoryScreen} />
      {/* everyone: see Users (view-only for user role, admin-only writes handled by backend) */}
      <Tab.Screen name="Users" component={UsersScreen} />
      {/* everyone: see Settings (logout is available to all roles) */}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={palette.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }}>
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
              options={{
                headerShown: true,
                title: 'Receipt Preview',
                headerShadowVisible: false,
                headerTitleStyle: styles.stackTitle,
                headerStyle: { backgroundColor: palette.surface },
                headerTintColor: palette.text,
                contentStyle: { backgroundColor: palette.background },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '700',
  },
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 18 : 12,
    height: 74,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 8,
    ...shadows.md,
  },
  tabBarItem: {
    borderRadius: radius.md,
  },
  tabIconWrap: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  gridIcon: {
    width: 20,
    height: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridCell: {
    width: 8,
    height: 8,
    borderRadius: 3,
  },
  plusCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusHorizontal: {
    width: 10,
    height: 1.8,
    borderRadius: 999,
  },
  plusVertical: {
    position: 'absolute',
    width: 1.8,
    height: 10,
    borderRadius: 999,
  },
  historyIcon: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  historyLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 999,
    right: 0,
  },
  historyLineWide: {
    width: 16,
  },
  historyLineShort: {
    width: 12,
  },
  historyLineOffset0: {
    top: 0,
  },
  historyLineOffset1: {
    top: 6,
  },
  historyLineOffset2: {
    top: 12,
  },
  usersIcon: {
    width: 22,
    height: 18,
    position: 'relative',
  },
  userHeadPrimary: {
    position: 'absolute',
    left: 2,
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.6,
  },
  userHeadSecondary: {
    position: 'absolute',
    right: 1,
    top: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.4,
    opacity: 0.9,
  },
  userBodyPrimary: {
    position: 'absolute',
    left: 0,
    bottom: 1,
    width: 12,
    height: 6,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1.6,
    borderBottomWidth: 0,
  },
  userBodySecondary: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 9,
    height: 5,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderWidth: 1.4,
    borderBottomWidth: 0,
    opacity: 0.9,
  },
  settingsIcon: {
    width: 18,
    height: 18,
    position: 'relative',
  },
  settingsTrack: {
    position: 'absolute',
    left: 0,
    width: 18,
    height: 2,
    borderRadius: 999,
  },
  settingsTrackOffset0: {
    top: 0,
  },
  settingsTrackOffset1: {
    top: 6,
  },
  settingsTrackOffset2: {
    top: 12,
  },
  settingsKnob: {
    position: 'absolute',
    top: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  knobLeftPrimary: {
    left: 4,
  },
  knobLeftSecondary: {
    left: 9,
  },
  knobLeftTertiary: {
    left: 2,
  },
});

const HISTORY_LINE_STYLES = [styles.historyLineWide, styles.historyLineWide, styles.historyLineShort];
const HISTORY_LINE_OFFSETS = [styles.historyLineOffset0, styles.historyLineOffset1, styles.historyLineOffset2];
const SETTINGS_TRACK_STYLES = [
  styles.settingsTrackOffset0,
  styles.settingsTrackOffset1,
  styles.settingsTrackOffset2,
];
const SETTINGS_KNOB_STYLES = [
  styles.knobLeftPrimary,
  styles.knobLeftSecondary,
  styles.knobLeftTertiary,
];
