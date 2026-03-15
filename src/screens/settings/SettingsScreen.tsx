import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Button,
  PageHeader,
  PageScroll,
  SectionHeading,
  SurfaceCard,
} from '../../components/ui/primitives';
import { useAuth } from '../../hooks/useAuth';
import { palette, spacing } from '../../theme/theme';

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const fallbackName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
  const fullName = user?.name ?? (fallbackName || 'User account');

  return (
    <PageScroll>
      <PageHeader
        eyebrow="Settings"
        title="Manage profile details, delivery status, and export access."
        subtitle="This screen keeps operational info close without pulling you out of the app flow."
        trailing={<Badge label="Workspace" tone="primary" />}
      />

      <SurfaceCard style={styles.card}>
        <SectionHeading title="Profile" caption="Current signed-in account" />
        <Text style={styles.profileName}>{fullName}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <View style={styles.roleRow}>
          {(Array.isArray(user?.roles) ? user.roles : [user?.role ?? 'user']).map((role: string) => (
            <Badge key={role} label={role} tone="success" style={styles.roleBadge} />
          ))}
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.card}>
        <SectionHeading
          title="WhatsApp delivery"
          caption="Receipt delivery channel used after donation creation"
          action={<Badge label="Connected" tone="success" />}
        />
        <Text style={styles.copy}>
          Receipts are sent through the Meta Cloud API after submission. Make sure your backend has
          valid `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` values in its environment.
        </Text>
      </SurfaceCard>

      <SurfaceCard style={styles.card}>
        <SectionHeading title="Export endpoint" caption="Backend route for CSV exports" />
        <View style={styles.codeBlock}>
          <Text style={styles.codeText}>GET /api/donations/export/csv</Text>
          <Text style={styles.codeText}>Authorization: Bearer TOKEN</Text>
        </View>
      </SurfaceCard>

      <Button label="Logout" variant="danger" onPress={handleLogout} style={styles.logoutButton} />
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.lg,
  },
  profileName: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '800',
  },
  profileEmail: {
    color: palette.textMuted,
    fontSize: 14,
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
  copy: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  codeBlock: {
    backgroundColor: palette.surfaceMuted,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  codeText: {
    color: palette.text,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
});
