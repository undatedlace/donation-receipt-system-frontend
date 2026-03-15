import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Button,
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

  const fullName = user?.name ?? 'User account';

  return (
    <PageScroll>
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
