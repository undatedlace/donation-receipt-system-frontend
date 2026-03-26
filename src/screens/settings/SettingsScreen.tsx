import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Badge,
  Button,
  FieldGroup,
  InputField,
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
  const { user, logout, updateProfile } = useAuth();
  const { palette, shadows, mode, setMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('about');
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editConfirm, setEditConfirm] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const styles = useMemo(() => makeStyles(palette, shadows), [palette, shadows]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const startEditing = () => {
    const nameParts = (user?.name ?? '').split(' ');
    setEditFirstName(nameParts[0] ?? '');
    setEditLastName(nameParts.slice(1).join(' ') ?? '');
    setEditEmail(user?.email ?? '');
    setEditPassword('');
    setEditConfirm('');
    setShowNewPwd(false);
    setShowConfirmPwd(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!editFirstName.trim()) return Alert.alert('Validation', 'First name is required');
    if (!editLastName.trim()) return Alert.alert('Validation', 'Last name is required');
    if (!editEmail.trim()) return Alert.alert('Validation', 'Email is required');
    if (editPassword && editPassword.length < 6) return Alert.alert('Validation', 'Password must be at least 6 characters');
    if (editPassword && editPassword !== editConfirm) return Alert.alert('Validation', 'Passwords do not match');

    setSaveLoading(true);
    try {
      const data: any = { firstName: editFirstName.trim(), lastName: editLastName.trim(), email: editEmail.trim() };
      if (editPassword) data.password = editPassword;
      await updateProfile(data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
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
            <View style={styles.profileHeader}>
              <View style={styles.profileHeaderText}>
                <SectionHeading title="Profile" caption="Current signed-in account" />
              </View>
              {!isEditing && (
                <TouchableOpacity activeOpacity={0.88} onPress={startEditing} style={styles.editProfileBtn}>
                  <Text style={styles.editProfileBtnText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <>
                <FieldGroup label="First Name">
                  <InputField value={editFirstName} onChangeText={setEditFirstName} placeholder="First name" />
                </FieldGroup>
                <FieldGroup label="Last Name">
                  <InputField value={editLastName} onChangeText={setEditLastName} placeholder="Last name" />
                </FieldGroup>
                <FieldGroup label="Email">
                  <InputField value={editEmail} onChangeText={setEditEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
                </FieldGroup>
                <FieldGroup label="New Password" hint="Leave blank to keep current password">
                  <View style={styles.pwdRow}>
                    <InputField
                      value={editPassword}
                      onChangeText={setEditPassword}
                      placeholder="Min 6 characters"
                      secureTextEntry={!showNewPwd}
                      style={styles.pwdInput}
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.pwdToggle}
                      onPress={() => setShowNewPwd(v => !v)}>
                      <Text style={styles.pwdToggleText}>{showNewPwd ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                  </View>
                </FieldGroup>
                {editPassword.length > 0 && (
                  <FieldGroup label="Confirm Password">
                    <View style={styles.pwdRow}>
                      <InputField
                        value={editConfirm}
                        onChangeText={setEditConfirm}
                        placeholder="Repeat new password"
                        secureTextEntry={!showConfirmPwd}
                        style={styles.pwdInput}
                      />
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.pwdToggle}
                        onPress={() => setShowConfirmPwd(v => !v)}>
                        <Text style={styles.pwdToggleText}>{showConfirmPwd ? 'Hide' : 'Show'}</Text>
                      </TouchableOpacity>
                    </View>
                    {editConfirm.length > 0 && (
                      <Text style={editConfirm === editPassword ? styles.pwdMatchText : styles.pwdNoMatchText}>
                        {editConfirm === editPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </Text>
                    )}
                  </FieldGroup>
                )}
                <View style={styles.editActions}>
                  <Button label="Save Changes" loading={saveLoading} onPress={handleSaveProfile} style={styles.editActionBtn} />
                  <Button label="Cancel" variant="ghost" onPress={cancelEditing} style={styles.editActionBtn} />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.profileName}>{fullName}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <View style={styles.roleRow}>
                  {(user?.roles ?? ['user']).map((role: string) => (
                    <Badge key={role} label={role} tone="success" style={styles.roleBadge} />
                  ))}
                </View>
              </>
            )}
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
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    profileHeaderText: {
      flex: 1,
      marginRight: spacing.sm,
    },
    editProfileBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: p.primarySoft,
    },
    editProfileBtnText: {
      color: p.primaryDark,
      fontSize: fs(12),
      fontWeight: '700',
    },
    profileName: {
      color: p.text,
      fontSize: fs(22),
      fontWeight: '700',
      letterSpacing: -0.6,
      marginTop: spacing.sm,
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
    editActions: {
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    editActionBtn: {
      marginTop: 0,
    },
    logoutButton: {
      marginTop: spacing.lg,
    },
    pwdRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    pwdInput: {
      flex: 1,
    },
    pwdToggle: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: p.surfaceMuted,
      borderWidth: 1,
      borderColor: p.border,
    },
    pwdToggleText: {
      color: p.textMuted,
      fontSize: fs(12),
      fontWeight: '700',
    },
    pwdMatchText: {
      color: p.primary,
      fontSize: fs(12),
      fontWeight: '600',
      marginTop: spacing.xs,
    },
    pwdNoMatchText: {
      color: '#DC2626',
      fontSize: fs(12),
      fontWeight: '600',
      marginTop: spacing.xs,
    },
  });
}
