import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Badge,
  Button,
  EmptyState,
  FieldGroup,
  InputField,
  Page,
  PageHeader,
  SectionHeading,
  SurfaceCard,
} from '../../components/ui/primitives';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import { fs, palette, radius, shadows, spacing } from '../../theme/theme';

const ROLES = ['admin', 'user', 'internal-admin'];
const ROLE_TONES: Record<string, 'danger' | 'primary' | 'info'> = {
  admin: 'danger',
  user: 'primary',
  'internal-admin': 'info',
};

interface UserItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

const emptyAdd = { firstName: '', lastName: '', email: '', password: '', roles: [] as string[] };

function RoleSelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (roles: string[]) => void;
}) {
  const toggle = (role: string) =>
    onChange(selected.includes(role) ? selected.filter(value => value !== role) : [...selected, role]);

  return (
    <View style={styles.rolesRow}>
      {ROLES.map(role => {
        const active = selected.includes(role);

        return (
          <TouchableOpacity
            key={role}
            activeOpacity={0.88}
            style={[styles.roleChip, active ? styles.roleChipActive : null]}
            onPress={() => toggle(role)}>
            <Text style={[styles.roleChipText, active ? styles.roleChipTextActive : null]}>{role}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function UserSheet({
  visible,
  title,
  children,
  onClose,
}: {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.sheetTitle}>{title}</Text>
            {children}
            <View style={styles.sheetSpacer} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function UsersScreen() {
  const { user: authUser } = useAuth();
  const canWrite = authUser?.roles?.includes('admin') ?? false;
  const { users, loading, refreshing, fetchUsers, refresh, addUser, editUser, removeUser } = useUsers();

  const [addVisible, setAddVisible] = useState(false);
  const [addForm, setAddForm] = useState({ ...emptyAdd });
  const [addLoading, setAddLoading] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<UserItem | null>(null);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers]),
  );

  const handleAdd = async () => {
    const { firstName, lastName, email, password, roles } = addForm;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      return Alert.alert('Validation', 'All fields are required.');
    }

    if (roles.length === 0) {
      return Alert.alert('Validation', 'Select at least one role.');
    }

    setAddLoading(true);

    try {
      await addUser({ firstName, lastName, email, password, roles });
      setAddVisible(false);
      setAddForm({ ...emptyAdd });
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  };

  const openEdit = (user: UserItem) => {
    setEditTarget(user);
    setEditFirst(user.firstName);
    setEditLast(user.lastName);
    setEditRoles([...(user.roles ?? [])]);
    setEditVisible(true);
  };

  const handleEdit = async () => {
    if (!editTarget) {
      return;
    }

    if (editRoles.length === 0) {
      return Alert.alert('Validation', 'Select at least one role.');
    }

    setEditLoading(true);

    try {
      await editUser(editTarget._id, {
        firstName: editFirst.trim(),
        lastName: editLast.trim(),
        roles: editRoles,
      });
      setEditVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message ?? 'Failed to update user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (user: UserItem) => {
    Alert.alert(
      'Delete User',
      `Delete ${user.firstName} ${user.lastName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeUser(user._id);
            } catch (error: any) {
              Alert.alert('Error', error?.response?.data?.message ?? 'Failed to delete user');
            }
          },
        },
      ],
    );
  };

  const renderHeader = () => (
    <View style={styles.headerWrap}>
      <SurfaceCard style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Access Control</Text>
        <Text style={styles.heroTitle}>Team Members</Text>
        <Text style={styles.heroText}>
          Manage who can record donations, review receipts, and control internal operations.
        </Text>

        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>Members</Text>
            <Text style={styles.heroStatValue}>{users.length}</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatLabel}>Admin Access</Text>
            <Text style={styles.heroStatValue}>{canWrite ? 'Enabled' : 'View Only'}</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard style={styles.toolbarCard}>
        <SectionHeading
          title="Directory"
          caption="Role-based access across the donation workflow"
          action={canWrite ? <Badge label="Editable" tone="success" /> : <Badge label="Read only" />}
        />
        {canWrite ? <Button label="Add User" onPress={() => setAddVisible(true)} /> : null}
      </SurfaceCard>
    </View>
  );

  const renderUser = ({ item }: { item: UserItem }) => {
    const initials = `${item.firstName?.[0] ?? ''}${item.lastName?.[0] ?? ''}`.toUpperCase() || '?';

    return (
      <SurfaceCard style={styles.userCard}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.userBody}>
          <Text style={styles.userName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.userEmail}>{item.email}</Text>

          <View style={styles.badgesRow}>
            {(item.roles ?? []).map(role => (
              <Badge key={role} label={role} tone={ROLE_TONES[role] || 'primary'} />
            ))}
          </View>
        </View>

        {canWrite ? (
          <View style={styles.actionsColumn}>
            <Button label="Edit" variant="secondary" onPress={() => openEdit(item)} style={styles.inlineButton} />
            <Button label="Delete" variant="danger" onPress={() => handleDelete(item)} style={styles.inlineButton} />
          </View>
        ) : null}
      </SurfaceCard>
    );
  };

  if (loading && !users.length) {
    return (
      <Page header={<PageHeader title="Team Access" subtitle="Loading users" compact />}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      </Page>
    );
  }

  return (
    <Page
      header={
        <PageHeader
          title="Team Access"
          subtitle="Manage the people behind the receipt desk."
          trailing={<Badge label={`${users.length} users`} tone="success" />}
        />
      }>
      <FlatList
        data={users}
        keyExtractor={item => item._id}
        renderItem={renderUser}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="No users found"
            subtitle="Create the first account to start assigning access and responsibilities."
          />
        }
        contentContainerStyle={styles.listContent}
        onRefresh={() => refresh()}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
      />

      <UserSheet
        visible={addVisible}
        title="Add New User"
        onClose={() => {
          setAddVisible(false);
          setAddForm({ ...emptyAdd });
        }}>
        <FieldGroup label="First Name">
          <InputField
            value={addForm.firstName}
            onChangeText={value => setAddForm(form => ({ ...form, firstName: value }))}
            placeholder="First name"
          />
        </FieldGroup>

        <FieldGroup label="Last Name">
          <InputField
            value={addForm.lastName}
            onChangeText={value => setAddForm(form => ({ ...form, lastName: value }))}
            placeholder="Last name"
          />
        </FieldGroup>

        <FieldGroup label="Email">
          <InputField
            value={addForm.email}
            onChangeText={value => setAddForm(form => ({ ...form, email: value }))}
            placeholder="user@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </FieldGroup>

        <FieldGroup label="Password">
          <InputField
            value={addForm.password}
            onChangeText={value => setAddForm(form => ({ ...form, password: value }))}
            placeholder="Password"
            secureTextEntry
          />
        </FieldGroup>

        <FieldGroup label="Roles">
          <RoleSelector selected={addForm.roles} onChange={roles => setAddForm(form => ({ ...form, roles }))} />
        </FieldGroup>

        <Button label="Create User" loading={addLoading} onPress={handleAdd} style={styles.sheetButton} />
        <Button
          label="Cancel"
          variant="ghost"
          onPress={() => {
            setAddVisible(false);
            setAddForm({ ...emptyAdd });
          }}
          style={styles.sheetSecondaryButton}
        />
      </UserSheet>

      <UserSheet visible={editVisible} title="Edit User" onClose={() => setEditVisible(false)}>
        <FieldGroup label="First Name">
          <InputField value={editFirst} onChangeText={setEditFirst} placeholder="First name" />
        </FieldGroup>

        <FieldGroup label="Last Name">
          <InputField value={editLast} onChangeText={setEditLast} placeholder="Last name" />
        </FieldGroup>

        <FieldGroup label="Roles">
          <RoleSelector selected={editRoles} onChange={setEditRoles} />
        </FieldGroup>

        <Button label="Save Changes" loading={editLoading} onPress={handleEdit} style={styles.sheetButton} />
        <Button
          label="Cancel"
          variant="ghost"
          onPress={() => setEditVisible(false)}
          style={styles.sheetSecondaryButton}
        />
      </UserSheet>
    </Page>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: 126,
  },
  headerWrap: {
    marginBottom: spacing.lg,
  },
  heroCard: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
    ...shadows.md,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: fs(11),
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: fs(22),
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: spacing.sm,
  },
  heroText: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: fs(13),
    lineHeight: 19,
    marginTop: spacing.sm,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.16)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  heroStat: {
    flex: 1,
  },
  heroStatDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginHorizontal: spacing.md,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: fs(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: fs(16),
    fontWeight: '700',
    marginTop: 4,
  },
  toolbarCard: {
    marginTop: spacing.lg,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: palette.primaryDark,
    fontSize: fs(18),
    fontWeight: '700',
  },
  userBody: {
    flex: 1,
  },
  userName: {
    color: palette.text,
    fontSize: fs(15),
    fontWeight: '700',
  },
  userEmail: {
    color: palette.textMuted,
    fontSize: fs(12),
    marginTop: spacing.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionsColumn: {
    width: 92,
    gap: spacing.sm,
  },
  inlineButton: {
    minHeight: 40,
    borderRadius: radius.sm,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: palette.overlay,
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: palette.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.screen,
  },
  sheetHandle: {
    width: 46,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.borderStrong,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    color: palette.text,
    fontSize: fs(20),
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  sheetSpacer: {
    height: spacing.xl,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleChip: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  roleChipText: {
    color: palette.textMuted,
    fontSize: fs(12),
    fontWeight: '700',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
  },
  sheetButton: {
    marginTop: spacing.lg,
  },
  sheetSecondaryButton: {
    marginTop: spacing.sm,
  },
});
