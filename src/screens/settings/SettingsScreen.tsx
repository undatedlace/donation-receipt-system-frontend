import React, { useState } from 'react';
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
import { fs, palette, radius, shadows, spacing } from '../../theme/theme';

type TabKey = 'about' | 'account';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('about');

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

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xs,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
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
    backgroundColor: palette.primary,
  },
  tabText: {
    color: palette.textMuted,
    fontSize: fs(12),
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  heroCard: {
    marginTop: spacing.xl,
    backgroundColor: palette.primary,
    borderColor: palette.primary,
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
    color: palette.textMuted,
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
    color: palette.text,
    fontSize: fs(22),
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  profileEmail: {
    color: palette.textMuted,
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
