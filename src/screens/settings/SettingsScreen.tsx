import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Badge,
  Button,
  PageHeader,
  PageScroll,
  SectionHeading,
  SurfaceCard,
} from '../../components/ui/primitives';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../theme/ThemeContext';
import { type ThemeMode } from '../../theme/ThemeContext';
import { fs, type Palette, radius, spacing } from '../../theme/theme';

type ShadowRecord = ReturnType<typeof import('../../theme/theme').createShadows>;
type TabKey = 'about' | 'account';

const THEME_OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'light', label: 'Light' },
  { mode: 'system', label: 'Auto' },
  { mode: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { palette, shadows, mode, setMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('about');

  const styles = useMemo(() => makeStyles(palette, shadows), [palette, shadows]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const fullName = user?.name ?? 'User account';

  return (
    <PageScroll
      header={
        <PageHeader
          title="Noori Donation"
          subtitle="About the app and your signed-in account."
        />
      }
      contentContainerStyle={styles.content}>

      {/* Theme toggle */}
      <SurfaceCard style={styles.themeCard}>
        <SectionHeading title="Appearance" caption="Choose your preferred theme" />
        <View style={styles.themePicker}>
          {THEME_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.mode}
              activeOpacity={0.88}
              style={[styles.themeOption, mode === opt.mode ? styles.themeOptionActive : null]}
              onPress={() => setMode(opt.mode)}>
              <Text style={[styles.themeOptionText, mode === opt.mode ? styles.themeOptionTextActive : null]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SurfaceCard>

      <View style={styles.tabRow}>
        <TouchableOpacity
          activeOpacity={0.88}
          style={[styles.tabButton, activeTab === 'about' ? styles.tabButtonActive : null]}
          onPress={() => setActiveTab('about')}>
          <Text style={[styles.tabText, activeTab === 'about' ? styles.tabTextActive : null]}>About</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.88}
          style={[styles.tabButton, activeTab === 'account' ? styles.tabButtonActive : null]}
          onPress={() => setActiveTab('account')}>
          <Text style={[styles.tabText, activeTab === 'account' ? styles.tabTextActive : null]}>Account</Text>
        </TouchableOpacity>
      </View>

      <SurfaceCard style={styles.heroCard}>
        <Text style={styles.heroTitle}>Noori Donation</Text>
      </SurfaceCard>

      {activeTab === 'about' ? (
        <>
          <SurfaceCard style={styles.card}>
            <SectionHeading title="About This App" caption="Receipt management workspace" />
            <Text style={styles.copy}>
              This donation desk app is built to keep collection records clean, fast, and easy to review.
              It helps teams register donations, generate receipts instantly, and reopen records without leaving
              the phone workflow.
            </Text>
            <Text style={styles.copy}>
              The interface is intentionally focused on calm greens, large cards, and simple steps so volunteers
              can move through busy collection sessions with less friction.
            </Text>
          </SurfaceCard>

          <SurfaceCard style={styles.card}>
            <SectionHeading title="What It Includes" caption="Core workflow" />
            <View style={styles.featureList}>
              <Badge label="Donation capture" tone="success" />
              <Badge label="Receipt preview" tone="primary" />
              <Badge label="WhatsApp sharing" tone="info" />
              <Badge label="User access control" tone="warning" />
            </View>
          </SurfaceCard>
        </>
      ) : (
        <>
          <SurfaceCard style={styles.card}>
            <SectionHeading title="Profile" caption="Current signed-in account" />
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>

            <View style={styles.roleRow}>
              {(user?.roles ?? ['user']).map((role: string) => (
                <Badge key={role} label={role} tone="success" style={styles.roleBadge} />
              ))}
            </View>
          </SurfaceCard>

          <SurfaceCard style={styles.card}>
            <SectionHeading title="Session" caption="Authentication and access" />
            <Text style={styles.copy}>
              Use logout when handing the device to another operator or when you need to switch roles safely.
            </Text>
            <Button label="Logout" variant="danger" onPress={handleLogout} style={styles.logoutButton} />
          </SurfaceCard>
        </>
      )}
    </PageScroll>
  );
}

function makeStyles(p: Palette, shadows: ShadowRecord) {
  return StyleSheet.create({
    content: {
      paddingTop: spacing.xs,
    },
    themeCard: {
      marginBottom: spacing.md,
    },
    themePicker: {
      flexDirection: 'row',
      backgroundColor: p.surfaceMuted,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: p.border,
      padding: 4,
    },
    themeOption: {
      flex: 1,
      minHeight: 36,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeOptionActive: {
      backgroundColor: p.primary,
    },
    themeOptionText: {
      color: p.textMuted,
      fontSize: fs(12),
      fontWeight: '700',
    },
    themeOptionTextActive: {
      color: '#FFFFFF',
    },
    tabRow: {
      flexDirection: 'row',
      backgroundColor: p.surface,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: p.border,
      padding: 4,
      ...shadows.sm,
    },
    tabButton: {
      flex: 1,
      minHeight: 38,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabButtonActive: {
      backgroundColor: p.primary,
    },
    tabText: {
      color: p.textMuted,
      fontSize: fs(12),
      fontWeight: '700',
    },
    tabTextActive: {
      color: '#FFFFFF',
    },
    heroCard: {
      marginTop: spacing.xl,
      backgroundColor: p.primary,
      borderColor: p.primary,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 118,
      ...shadows.md,
    },
    heroTitle: {
      color: '#FFFFFF',
      fontSize: fs(21),
      fontWeight: '700',
      letterSpacing: -0.6,
      textAlign: 'center',
    },
    card: {
      marginTop: spacing.xl,
    },
    copy: {
      color: p.textMuted,
      fontSize: fs(13),
      lineHeight: 22,
      marginTop: spacing.sm,
    },
    featureList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    profileName: {
      color: p.text,
      fontSize: fs(22),
      fontWeight: '700',
      letterSpacing: -0.6,
    },
    profileEmail: {
      color: p.textMuted,
      fontSize: fs(13),
      marginTop: spacing.xs,
    },
    roleRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    roleBadge: {
      marginRight: 0,
    },
    logoutButton: {
      marginTop: spacing.lg,
    },
  });
}
