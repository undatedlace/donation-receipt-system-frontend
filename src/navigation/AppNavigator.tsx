import React from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { radius } from '../theme/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_LABELS: Record<string, string> = {
  Dashboard: 'Home',
  Donate: 'Donate',
  History: 'History',
  Users: 'Team',
  Settings: 'About',
  Logout: 'Logout',
};

function HomeIcon({ color }: { color: string }) {
  return (
    <View style={styles.houseIcon}>
      <View style={[styles.houseRoof, { borderBottomColor: color }]} />
      <View style={[styles.houseBase, { borderColor: color }]} />
      <View style={[styles.houseDoor, { backgroundColor: color }]} />
    </View>
  );
}

function DonateIcon({ color }: { color: string }) {
  return (
    <View style={[styles.receiptIcon, { borderColor: color }]}>
      <View style={[styles.receiptFold, { borderLeftColor: color }]} />
      {[0, 1, 2].map(index => (
        <View
          key={index}
          style={[
            styles.receiptLine,
            { backgroundColor: color, top: 4 + index * 5 },
          ]}
        />
      ))}
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
            HISTORY_LINE_WIDTHS[index],
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
      <View style={[styles.userBodyPrimary, { borderColor: color }]} />
      <View style={[styles.userHeadSecondary, { borderColor: color }]} />
      <View style={[styles.userBodySecondary, { borderColor: color }]} />
    </View>
  );
}

function SettingsIcon({ color }: { color: string }) {
  return (
    <View style={[styles.infoCircle, { borderColor: color }]}>
      <View style={[styles.infoStem, { backgroundColor: color }]} />
      <View style={[styles.infoDot, { backgroundColor: color }]} />
    </View>
  );
}

function renderTabIcon(name: string, color: string) {
  switch (name) {
    case 'Dashboard':
      return <HomeIcon color={color} />;
    case 'Donate':
      return <DonateIcon color={color} />;
    case 'History':
      return <HistoryIcon color={color} />;
    case 'Users':
      return <UsersIcon color={color} />;
    case 'Settings':
      return <SettingsIcon color={color} />;
    case 'Logout':
      return <LogoutIcon color={color} />;
    default:
      return <HomeIcon color={color} />;
  }
}

function LogoutIcon({ color }: { color: string }) {
  return (
    <View style={styles.logoutIcon}>
      <View style={[styles.logoutArrow, { borderColor: color }]} />
      <View style={[styles.logoutLine, { backgroundColor: color }]} />
    </View>
  );
}

const createTabBarIcon =
  (routeName: string) =>
  ({ color }: { color: string }) =>
    renderTabIcon(routeName, color);

function MainTabs() {
  const { user, logout } = useAuth();
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const roles: string[] = Array.isArray(user?.roles) ? user.roles : ['user'];

  const isAdmin = roles.includes('admin');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: palette.background },
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.62)',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIconWrap,
        tabBarStyle: [styles.tabBar, { backgroundColor: palette.primary, shadowColor: palette.shadow, bottom: 14 + insets.bottom }],
        tabBarItemStyle: styles.tabBarItem,
        tabBarActiveBackgroundColor: 'rgba(255,255,255,0.15)',
        tabBarIcon: createTabBarIcon(route.name),
        tabBarLabel: TAB_LABELS[route.name] ?? route.name,
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Donate" component={DonationFormScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      {isAdmin && <Tab.Screen name="Users" component={UsersScreen} />}
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen
        name="Logout"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Logout',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...(props as any)}
              activeOpacity={0.75}
              onPress={handleLogout}
              style={[props.style as any, styles.tabBarItem]}>
              <LogoutIcon color="rgba(255,255,255,0.72)" />
              <Text style={[styles.tabLabel, { color: 'rgba(255,255,255,0.72)' }]}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading } = useAuth();
  const { navigationTheme, palette } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: palette.primary }]}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator color="#FFFFFF" size="large" style={styles.loaderSpinner} />
          <Image
            source={require('../assets/sdi_logo.png')}
            style={styles.loaderLogo}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ReceiptPreview" component={ReceiptPreviewScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderWrap: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderLogo: {
    width: 52,
    height: 52,
    position: 'absolute',
  },
  loaderSpinner: {
    width: 88,
    height: 88,
    transform: [{ scaleX: 2.4 }, { scaleY: 2.4 }],
  },
  tabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    height: Platform.OS === 'ios' ? 86 : 78,
    borderTopWidth: 0,
    borderRadius: 28,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 16 : 10,
    paddingHorizontal: 8,
    marginHorizontal: 8,
    elevation: 0,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  tabBarItem: {
    marginHorizontal: 2,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  tabIconWrap: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  houseIcon: {
    width: 22,
    height: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  houseRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: 1,
  },
  houseBase: {
    width: 15,
    height: 11,
    borderWidth: 1.8,
    borderTopWidth: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  houseDoor: {
    position: 'absolute',
    bottom: 1,
    width: 3,
    height: 6,
    borderRadius: 2,
  },
  receiptIcon: {
    width: 18,
    height: 20,
    borderWidth: 1.8,
    borderRadius: 4,
    position: 'relative',
  },
  receiptFold: {
    position: 'absolute',
    right: -1,
    top: -1,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
  },
  receiptLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 1.7,
    borderRadius: 999,
  },
  historyIcon: {
    width: 18,
    height: 16,
    position: 'relative',
  },
  historyLine: {
    position: 'absolute',
    left: 0,
    height: 2,
    borderRadius: 999,
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
  userHeadSecondary: {
    position: 'absolute',
    right: 1,
    top: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.4,
    opacity: 0.92,
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
    opacity: 0.92,
  },
  infoCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoStem: {
    width: 2.2,
    height: 7,
    borderRadius: 999,
    marginTop: 3,
  },
  infoDot: {
    position: 'absolute',
    top: 4,
    width: 2.2,
    height: 2.2,
    borderRadius: 999,
  },
  logoutIcon: {
    width: 20,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoutArrow: {
    width: 10,
    height: 10,
    borderTopWidth: 1.8,
    borderRightWidth: 1.8,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    right: 0,
  },
  logoutLine: {
    position: 'absolute',
    left: 0,
    width: 12,
    height: 1.8,
    borderRadius: 999,
  },
});

const HISTORY_LINE_WIDTHS = [styles.historyLineWide, styles.historyLineWide, styles.historyLineShort];
const HISTORY_LINE_OFFSETS = [styles.historyLineOffset0, styles.historyLineOffset1, styles.historyLineOffset2];
